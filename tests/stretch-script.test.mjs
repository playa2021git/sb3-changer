import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  findFixtureBlocks,
  normalizeBlockShape,
  readProjectJsonFromSb3
} from "../tools/fixture-graph.mjs";

// ブラウザ用のグローバルをNodeテストで再現します。
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
globalThis.window = globalThis;
const require = createRequire(import.meta.url);

// index.htmlと同じ順番でスクリプトを読み込みます。
[
  "blocks/blockRegistry.js",
  "blocks/extensionBlocks.js",
  "blocks/coreBlocks.js",
  "blocks/ml2scratch.js",
  "blocks/posenet2scratch.js",
  "blocks/microbitMore.js",
  "blocks/tm2scratch.js",
  "blocks/tmpose2scratch.js",
  "blocks/speech2scratch.js",
  "blocks/imageClassifier2scratch.js",
  "blocks/cameraSelector.js",
  "blocks/penBlocks.js",
  "blocks/musicBlocks.js",
  "blocks/textToSpeechBlocks.js",
  "blocks/translateBlocks.js",
  "script.js"
].forEach((filePath) => {
  require(path.join(rootDir, filePath));
});

const app = globalThis.StretchScriptApp;

function convert(source) {
  const result = app.convertSourceForTest(source);
  assert.deepEqual(result.integrity, []);
  return result;
}

function opcodes(result) {
  return Object.values(result.project.targets[1].blocks).map((block) => block.opcode);
}

function spriteBlocks(result) {
  return result.project.targets[1].blocks;
}

// 複数スプライトテストで、名前からtargetを安全に取り出します。
function targetByName(result, name) {
  const target = result.project.targets.find((item) => item.name === name);
  assert.ok(target, `${name} target が見つかりません。`);
  return target;
}

// 対象スプライトだけのopcode一覧を確認します。
function targetOpcodes(result, name) {
  return Object.values(targetByName(result, name).blocks).map((block) => block.opcode);
}

// 自動生成SVGのassetIdが実際のMD5と一致しているか確認します。
function assertGeneratedCostumeAssetMatches(result, targetName) {
  const target = targetByName(result, targetName);
  const costume = target.costumes[0];
  const content = result.project.__assetFiles[costume.md5ext];
  assert.equal(costume.md5ext, `${costume.assetId}.svg`);
  assert.ok(content, `${costume.md5ext} がZIP素材にありません。`);
  assert.equal(createHash("md5").update(content).digest("hex"), costume.assetId);
}

function conversionError(source) {
  try {
    app.convertSourceForTest(source);
  } catch (error) {
    return error;
  }
  assert.fail("変換が失敗するはずでした。");
}

// 公式sample内の前後ブロックを除き、対象ブロックと入力shadowの保存形を比較します。
function assertBlockMatchesOfficialFixture(result, fixturePath, selectorOrOpcode) {
  const selector = typeof selectorOrOpcode === "string"
    ? { opcode: selectorOrOpcode }
    : selectorOrOpcode;
  const officialProject = readProjectJsonFromSb3(path.join(rootDir, fixturePath));
  const officialMatch = findFixtureBlocks(officialProject, selector)[0];
  const generatedMatch = findFixtureBlocks(result.project, selector)[0];
  assert.ok(officialMatch, `${fixturePath} に ${selector.opcode} がありません。`);
  assert.ok(generatedMatch, `生成projectに ${selector.opcode} がありません。`);
  assert.deepEqual(
    normalizeBlockShape(generatedMatch.target, generatedMatch.blockId),
    normalizeBlockShape(officialMatch.target, officialMatch.blockId)
  );
}

test("回帰: Pen拡張で四角を描くサンプルを壊さない", () => {
  const result = convert(app.samples[1].code);
  assert.deepEqual(result.project.extensions, ["pen"]);
  assert.equal(result.project.extensionURLs, undefined);
  assert.deepEqual(result.lists, []);
  assert.deepEqual(result.variables, []);
  assert.ok(opcodes(result).includes("pen_clear"));
  assert.ok(opcodes(result).includes("pen_penDown"));
  assert.ok(opcodes(result).includes("control_repeat"));
  assert.ok(opcodes(result).includes("motion_movesteps"));
  assert.ok(opcodes(result).includes("motion_turnright"));
  assert.ok(opcodes(result).includes("pen_penUp"));
});

test("回帰: リスト作成サンプルを壊さない", () => {
  const result = convert(app.samples[5].code);
  assert.deepEqual(result.project.extensions, []);
  assert.deepEqual(result.lists, ["宝くじ全部"]);
  assert.deepEqual(result.variables, []);
  assert.ok(opcodes(result).includes("data_deletealloflist"));
  assert.ok(opcodes(result).includes("data_addtolist"));
  assert.ok(opcodes(result).includes("operator_random"));
  assert.ok(opcodes(result).includes("data_lengthoflist"));
  assert.ok(opcodes(result).includes("looks_sayforsecs"));
});

test("宝くじサンプルB/C/Dを標準ブロックだけで変換できる", () => {
  [6, 7, 8].forEach((index) => {
    const result = convert(app.samples[index].code);
    assert.deepEqual(result.project.extensions, []);
    assert.deepEqual(result.lists, ["宝くじ全部"]);
    assert.ok(result.variables.includes("引いた場所"));
    assert.ok(result.variables.includes("引いた番号"));
  });
});

test("addToListは value,listName と listName,value の両方を受け付ける", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  deleteAllOfList("宝くじ全部");
  addToList("宝くじ全部", random(1, 100));
  addToList(random(1, 100), "宝くじ全部");
});`);
  const addBlocks = Object.values(result.project.targets[1].blocks)
    .filter((block) => block.opcode === "data_addtolist");
  assert.equal(addBlocks.length, 2);
  addBlocks.forEach((block) => {
    assert.deepEqual(block.fields.LIST, ["宝くじ全部", "list_3"]);
  });
});

test("未確認外部拡張は安全に停止する", () => {
  assert.throws(
    () => app.convertSourceForTest(app.samples[4].code),
    /未確認または未対応/
  );
});

test("優先A: メッセージ、クローン、停止、条件系を正しい参照で生成する", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  broadcast("スタート");
  broadcastAndWait("終わり");
  createClone("_myself_");
  stopOtherScripts();
  sayNow("続く");
});

whenIReceive("スタート", () => {
  ifElse(equals(answer(), "はい"), () => {
    sayNow("受け取り");
  }, () => {
    waitUntil(keyPressed("space"));
  });
});

whenCloned(() => {
  deleteThisClone();
});`);

  assert.deepEqual(result.broadcasts, ["スタート", "終わり"]);
  assert.deepEqual(Object.values(result.project.targets[0].broadcasts), ["スタート", "終わり"]);
  assert.ok(opcodes(result).includes("event_broadcast"));
  assert.ok(opcodes(result).includes("event_broadcastandwait"));
  assert.ok(opcodes(result).includes("event_whenbroadcastreceived"));
  assert.ok(opcodes(result).includes("control_create_clone_of"));
  assert.ok(opcodes(result).includes("control_start_as_clone"));
  assert.ok(opcodes(result).includes("control_delete_this_clone"));
  assert.ok(opcodes(result).includes("control_if_else"));
  assert.ok(opcodes(result).includes("control_wait_until"));

  const stopOther = Object.values(spriteBlocks(result))
    .find((block) => block.opcode === "control_stop" && block.fields.STOP_OPTION?.[0] === "other scripts in sprite");
  assert.equal(stopOther.mutation.hasnext, "true");
  assert.notEqual(stopOther.next, null);
});

test("AIが出しやすい自分自身の別名を正しいクローン値へ補正する", () => {
  for (const alias of ["*myself*", "myself", "自分自身"]) {
    const result = convert(`whenGreenFlagClicked(() => {
  createClone("${alias}");
});`);
    const blocks = spriteBlocks(result);
    const cloneBlock = Object.values(blocks).find((block) => block.opcode === "control_create_clone_of");
    const menuBlock = blocks[cloneBlock.inputs.CLONE_OPTION[1]];

    assert.equal(menuBlock.opcode, "control_create_clone_of_menu");
    assert.equal(menuBlock.fields.CLONE_OPTION[0], "_myself_");
  }
});

test("Gemが混ぜたMarkdownコード枠を行番号を保って自動除去する", () => {
  const result = convert(`\`\`\`js
whenGreenFlagClicked(() => {
  \`\`\`
  move(10);
  \`\`\`
});
\`\`\``);

  assert.ok(opcodes(result).includes("motion_movesteps"));
  assert.equal(result.sourceCorrections.length, 1);
  assert.match(result.sourceCorrections[0], /4行を自動で無視/);
  assert.ok(result.warnings.some((warning) => /Markdownのコード枠/.test(warning)));
});

test("コード枠を除去しても後続エラーの元の行番号を保つ", () => {
  const error = conversionError(`\`\`\`js
whenGreenFlagClicked(() => {
  move(10);
  \`\`\`
  unknownGemCommand();
});
\`\`\``);

  assert.equal(error.line, 5);
  assert.match(error.message, /unknownGemCommand は未対応関数/);
});

test("実行中の位置・大きさ・向き初期設定を安全なScratch命令へ補正する", () => {
  const result = convert(`sprite("車", () => {
  setSpriteText("車");
  whenGreenFlagClicked(() => {
    setSpritePosition(10, 20);
    setSpriteSize(60);
    setSpriteDirection(180);
  });
});`);
  const codes = targetOpcodes(result, "車");

  assert.ok(codes.includes("motion_gotoxy"));
  assert.ok(codes.includes("looks_setsizeto"));
  assert.ok(codes.includes("motion_pointindirection"));
  assert.equal(result.warnings.filter((warning) => /自動補正しました/.test(warning)).length, 3);
});

test("実行中の文字初期設定には用途別の修正方法を示す", () => {
  const textError = conversionError(`sprite("信号", () => {
  whenGreenFlagClicked(() => { setSpriteText("青信号"); });
});`);
  assert.match(textError.message, /スプライト直下だけ/);
  assert.match(textError.fix, /sayNow/);
});

test("実行中の固定色変更を自動生成コスチュームへ変換する", () => {
  const result = convert(`sprite("信号", () => {
  setSpriteText("南北信号");
  setSpriteColor("#00ff00");
  whenGreenFlagClicked(() => {
    setSpriteColor("#00FF00");
    setSpriteColor("#FFFF00");
    setSpriteColor("#FF0000");
    setSpriteColor("#ff0000");
  });
});`);
  const target = targetByName(result, "信号");
  const switchBlocks = Object.values(target.blocks).filter((block) => block.opcode === "looks_switchcostumeto");
  const menuValues = switchBlocks.map((block) => target.blocks[block.inputs.COSTUME[1]].fields.COSTUME[0]);

  assert.deepEqual(target.costumes.map((costume) => costume.name), [
    "信号 costume",
    "auto-color-FFFF00",
    "auto-color-FF0000"
  ]);
  assert.deepEqual(menuValues, [
    "信号 costume",
    "auto-color-FFFF00",
    "auto-color-FF0000",
    "auto-color-FF0000"
  ]);
  assert.equal(new Set(target.costumes.map((costume) => costume.assetId)).size, 3);
  target.costumes.forEach((costume) => {
    assert.ok(result.project.__assetFiles[costume.md5ext], `${costume.name} のSVGがZIP素材に必要です。`);
  });
  assert.match(result.project.__assetFiles[target.costumes[1].md5ext], /#FFFF00/);
  assert.match(result.project.__assetFiles[target.costumes[2].md5ext], /#FF0000/);
  assert.equal(result.warnings.filter((warning) => /setSpriteColor.*switchCostume/.test(warning)).length, 4);
});

test("実行時色が固定カラーコードでない場合は推測せず停止する", () => {
  const colorError = conversionError(`sprite("信号", () => {
  setSpriteText("信号");
  whenGreenFlagClicked(() => { setSpriteColor(getVariable("現在色")); });
});`);

  assert.match(colorError.message, /固定カラーコード/);
  assert.match(colorError.fix, /6けたの色を直接/);
});

test("既定のScratchキャラクターは文字画像へ勝手に置換しない", () => {
  const error = conversionError(`whenGreenFlagClicked(() => {
  setSpriteColor("#ff0000");
});`);

  assert.match(error.message, /既定スプライトの色画像は自動生成できません/);
  assert.match(error.fix, /setEffect/);
});

test("クローン共有変数と同名スプライト接触を動作警告する", () => {
  const result = convert(`sprite("車", () => {
  setSpriteText("車");
  whenGreenFlagClicked(() => { createClone("_myself_"); });
  whenIStartAsClone(() => {
    setVariable("車速度", random(3, 6));
    ifBlock(touchingObject("車"), () => { wait(0.1); });
  });
});`);

  assert.ok(result.semanticWarnings.some((warning) => /車速度.*すべてのクローンで共有/.test(warning)));
  assert.ok(result.semanticWarnings.some((warning) => /同じスプライトのクローン同士/.test(warning)));
  assert.ok(result.warnings.some((warning) => /車速度/.test(warning)));
});

test("クローン対象として指定したスプライト名は書き換えない", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  createClone("ボール");
});`);
  const blocks = spriteBlocks(result);
  const cloneBlock = Object.values(blocks).find((block) => block.opcode === "control_create_clone_of");
  const menuBlock = blocks[cloneBlock.inputs.CLONE_OPTION[1]];

  assert.equal(menuBlock.fields.CLONE_OPTION[0], "ボール");
});

test("優先B: costume/backdrop/size/layer/touching/current系を生成する", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  goToXY(10, 20);
  setX(1);
  changeY(2);
  pointInDirection(90);
  switchCostume("costume1");
  nextCostume();
  switchBackdrop("backdrop1");
  nextBackdrop();
  setSize(80);
  changeSize(10);
  goToFrontLayer();
  goForwardLayers(2);
  goBackwardLayers(1);
  ifBlock(touchingObject("_edge_"), () => {
    sayNow(distanceTo("_mouse_"));
  });
  ifBlock(colorTouchingColor("#ff0000", "#00ff00"), () => {
    sayNow(current("YEAR"));
  });
  sayNow(username());
});`);

  [
    "motion_gotoxy",
    "motion_setx",
    "motion_changeyby",
    "motion_pointindirection",
    "looks_switchcostumeto",
    "looks_nextcostume",
    "looks_switchbackdropto",
    "looks_nextbackdrop",
    "looks_setsizeto",
    "looks_changesizeby",
    "looks_gotofrontback",
    "looks_goforwardbackwardlayers",
    "sensing_touchingobject",
    "sensing_coloristouchingcolor",
    "sensing_distanceto",
    "sensing_current",
    "sensing_username"
  ].forEach((opcode) => assert.ok(opcodes(result).includes(opcode), opcode));

  const layerBlocks = Object.values(spriteBlocks(result))
    .filter((block) => block.opcode === "looks_goforwardbackwardlayers");
  assert.equal(layerBlocks.length, 2);
  assert.ok(layerBlocks.some((block) => block.fields.FORWARD_BACKWARD?.[0] === "forward"));
  assert.ok(layerBlocks.some((block) => block.fields.FORWARD_BACKWARD?.[0] === "backward"));
});

test("独自ブロックは未確認として安全に停止する", () => {
  assert.throws(
    () => app.convertSourceForTest(`whenGreenFlagClicked(() => {
  callProcedure("my block");
});`),
    /未確認または未対応/
  );
});

test("回帰: 四則演算ドリルを標準ブロックだけで変換できる", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  setVariable("a", random(1, 10));
  setVariable("b", random(1, 10));
  ask(join(join(getVariable("a"), " + "), getVariable("b")));
  ifElse(equals(answer(), add(getVariable("a"), getVariable("b"))), () => {
    say("正解！", 2);
  }, () => {
    say(join("答えは", add(getVariable("a"), getVariable("b"))), 2);
  });
});`);

  assert.deepEqual(result.project.extensions, []);
  assert.ok(result.variables.includes("a"));
  assert.ok(result.variables.includes("b"));
  assert.ok(opcodes(result).includes("sensing_askandwait"));
  assert.ok(opcodes(result).includes("sensing_answer"));
  assert.ok(opcodes(result).includes("operator_add"));
  assert.ok(opcodes(result).includes("control_if_else"));
});

test("回帰: シェルピンスキー基本のペン描画ルートを壊さない", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  penClear();
  penDown();
  repeat(3, () => {
    repeat(3, () => {
      move(80);
      turnRight(120);
    });
    move(80);
    turnRight(120);
  });
  penUp();
});`);

  assert.deepEqual(result.project.extensions, ["pen"]);
  assert.ok(opcodes(result).includes("pen_clear"));
  assert.ok(opcodes(result).includes("control_repeat"));
  assert.ok(opcodes(result).includes("motion_movesteps"));
  assert.ok(opcodes(result).includes("motion_turnright"));
});

test("回帰: 正多角形のペン描画ルートを壊さない", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  penClear();
  penDown();
  repeat(6, () => {
    move(80);
    turnRight(60);
  });
  penUp();
});`);

  assert.deepEqual(result.project.extensions, ["pen"]);
  assert.ok(opcodes(result).includes("pen_clear"));
  assert.ok(opcodes(result).includes("control_repeat"));
  assert.ok(opcodes(result).includes("motion_movesteps"));
  assert.ok(opcodes(result).includes("motion_turnright"));
  assert.ok(opcodes(result).includes("pen_penUp"));
});

test("goTo(x, y)は式入力つきでmotion_gotoxyへ変換する", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  setVariable("px", 0);
  setVariable("py", 0);
  goTo(getVariable("px"), getVariable("py"));
  goTo(random(-100, 100), random(-100, 100));
});`);

  const gotoBlocks = Object.values(spriteBlocks(result))
    .filter((block) => block.opcode === "motion_gotoxy");
  assert.equal(gotoBlocks.length, 2);
  gotoBlocks.forEach((block) => {
    assert.ok(block.inputs.X);
    assert.ok(block.inputs.Y);
    assert.equal(block.inputs.X[0], 3);
    assert.equal(block.inputs.Y[0], 3);
  });
});

test("goTo(target)はmotion_gotoのまま変換する", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  goTo("_random_");
  goTo("_mouse_");
  goTo("Sprite1");
});`);

  const gotoBlocks = Object.values(spriteBlocks(result))
    .filter((block) => block.opcode === "motion_goto");
  assert.equal(gotoBlocks.length, 3);
});

test("sayの後にstopAllがあっても変換できる", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  say("クリア！", 3);
  stopAll();
});`);

  assert.ok(opcodes(result).includes("looks_sayforsecs"));
  assert.ok(opcodes(result).includes("control_stop"));
  assert.deepEqual(result.warnings, []);
});

test("sayNowの直後にstopAllがある場合は警告する", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  sayNow("クリア！");
  stopAll();
});`);

  assert.ok(opcodes(result).includes("looks_say"));
  assert.ok(opcodes(result).includes("control_stop"));
  assert.ok(result.warnings.some((warning) => warning.includes("結果表示の直後に stopAll()")));
});

test("謎関数communitiesは安全停止し、and/orの案内を出す", () => {
  const error = conversionError(`whenGreenFlagClicked(() => {
  communities(equals(1, 1), equals(2, 2));
});`);

  assert.match(error.message, /communities は未対応関数/);
  assert.match(error.cause, /and\(\).*or\(\)/);
  assert.match(error.fix, /ifBlock/);
});

test("じゃんけん判定用の分割ifBlockを変換できる", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  setVariable("プレイヤーの手", "グー");
  setVariable("CPの手", "チョキ");
  setVariable("結果", "負け");

  ifBlock(and(equals(getVariable("プレイヤーの手"), "グー"), equals(getVariable("CPの手"), "チョキ")), () => {
    setVariable("結果", "勝ち");
  });

  say(getVariable("結果"), 2);
});`);

  assert.deepEqual(result.project.extensions, []);
  assert.ok(result.variables.includes("プレイヤーの手"));
  assert.ok(result.variables.includes("CPの手"));
  assert.ok(result.variables.includes("結果"));
  assert.ok(opcodes(result).includes("operator_and"));
  assert.ok(opcodes(result).includes("operator_equals"));
  assert.ok(opcodes(result).includes("control_if"));
});

test("showVariableSliderはmonitors保存形式確認まで安全停止する", () => {
  const error = conversionError(`whenGreenFlagClicked(() => {
  showVariableSlider("速さ", 0, 100, 50);
});`);

  assert.match(error.message, /未確認または未対応/);
  assert.match(error.cause, /monitors/);
});

test("複数スプライト最小: AさんとBさんを別targetとして生成する", () => {
  const result = convert(`sprite("Aさん", () => {
  setSpritePosition(-100, 0);
  setSpriteText("A");

  whenGreenFlagClicked(() => {
    say("Aさん", 2);
  });
});

sprite("Bさん", () => {
  setSpritePosition(100, 0);
  setSpriteText("B");

  whenGreenFlagClicked(() => {
    say("Bさん", 2);
  });
});`);

  assert.deepEqual(result.targetNames, ["Stage", "Aさん", "Bさん"]);
  assert.equal(targetByName(result, "Aさん").x, -100);
  assert.equal(targetByName(result, "Bさん").x, 100);
  assert.ok(targetOpcodes(result, "Aさん").includes("event_whenflagclicked"));
  assert.ok(targetOpcodes(result, "Aさん").includes("looks_sayforsecs"));
  assert.ok(targetOpcodes(result, "Bさん").includes("event_whenflagclicked"));
  assert.ok(targetOpcodes(result, "Bさん").includes("looks_sayforsecs"));
  assertGeneratedCostumeAssetMatches(result, "Aさん");
  assertGeneratedCostumeAssetMatches(result, "Bさん");
});

test("複数スプライト: 別スプライトでペン描画ブロックを持てる", () => {
  const result = convert(`sprite("Aさんのグラフ", () => {
  setSpritePosition(-200, -150);
  setSpriteText("A");

  whenGreenFlagClicked(() => {
    setPenColor("#ff0000");
    setPenSize(2);
    penDown();
    repeat(20, () => {
      changeX(10);
      changeY(5);
    });
    penUp();
  });
});

sprite("Bさんのグラフ", () => {
  setSpritePosition(-200, -150);
  setSpriteText("B");

  whenGreenFlagClicked(() => {
    setPenColor("#0000ff");
    setPenSize(2);
    penDown();
    repeat(20, () => {
      changeX(10);
      changeY(15);
    });
    penUp();
  });
});`);

  assert.deepEqual(result.project.extensions, ["pen"]);
  ["Aさんのグラフ", "Bさんのグラフ"].forEach((name) => {
    const codes = targetOpcodes(result, name);
    assert.ok(codes.includes("event_whenflagclicked"));
    assert.ok(codes.includes("pen_setPenColorToColor"));
    assert.ok(codes.includes("pen_setPenSizeTo"));
    assert.ok(codes.includes("pen_penDown"));
    assert.ok(codes.includes("control_repeat"));
    assert.ok(codes.includes("motion_changexby"));
    assert.ok(codes.includes("motion_changeyby"));
    assert.ok(codes.includes("pen_penUp"));
  });
});

test("複数スプライト: クリックイベントを生成する", () => {
  const result = convert(`sprite("グーボタン", () => {
  setSpritePosition(-100, -100);
  setSpriteText("グー");

  whenThisSpriteClicked(() => {
    setVariable("プレイヤーの手", "グー");
    say("グーを選んだよ", 2);
  });
});`);

  assert.deepEqual(result.targetNames, ["Stage", "グーボタン"]);
  assert.ok(targetOpcodes(result, "グーボタン").includes("event_whenthisspriteclicked"));
  assert.ok(targetOpcodes(result, "グーボタン").includes("data_setvariableto"));
  assert.ok(targetOpcodes(result, "グーボタン").includes("looks_sayforsecs"));
  assert.ok(result.variables.includes("プレイヤーの手"));
  assert.ok(Object.values(result.project.targets[0].variables).some(([name]) => name === "プレイヤーの手"));
});

test("複数スプライト: 同名スプライトは安全停止する", () => {
  const error = conversionError(`sprite("Aさん", () => {
  whenGreenFlagClicked(() => {
    say("A", 1);
  });
});

sprite("Aさん", () => {
  whenGreenFlagClicked(() => {
    say("B", 1);
  });
});`);

  assert.match(error.message, /同じ名前のスプライト/);
  assert.match(error.cause, /重複/);
});
test("CameraSelector: selectCameraを公式fixtureのmenu shadow保存形で変換できる", () => {
  const definition = JSON.parse(readFileSync(path.join(rootDir, "definitions/camera-selector.json"), "utf8"));
  const defaultCamera = "\u200b標準カメラ\u200b";
  const result = convert(`whenGreenFlagClicked(() => {
  selectCamera("${defaultCamera}");
});`);

  assert.deepEqual(result.project.extensions, ["cameraselector"]);
  assert.deepEqual(result.project.extensionURLs, [
    [definition.extensionId, definition.extensionURL]
  ]);
  assertBlockMatchesOfficialFixture(
    result,
    "fixtures/camera-selector/official-example.sb3",
    "cameraselector_selectCamera"
  );
});

test("Speech2Scratch: 開始commandと認識結果reporterを公式fixture保存形で変換できる", () => {
  const definition = JSON.parse(readFileSync(path.join(rootDir, "definitions/speech2scratch.json"), "utf8"));
  const result = convert(`whenGreenFlagClicked(() => {
  startSpeechRecognition();
  sayNow(speechText());
});`);

  assert.deepEqual(result.project.extensions, ["speech2scratch"]);
  assert.deepEqual(result.project.extensionURLs, [
    [definition.extensionId, definition.extensionURL]
  ]);
  assertBlockMatchesOfficialFixture(
    result,
    "fixtures/speech2scratch/official-sample.sb3",
    "speech2scratch_startRecognition"
  );
  assertBlockMatchesOfficialFixture(
    result,
    "fixtures/speech2scratch/official-sample.sb3",
    "speech2scratch_getSpeech"
  );
});

test("CameraSelector/Speech2Scratch: 公式にない互換候補は引き続き安全停止する", () => {
  assert.match(
    conversionError("whenGreenFlagClicked(() => { sayNow(cameraName()); });").message,
    /未確認または未対応/
  );
  assert.match(
    conversionError("whenGreenFlagClicked(() => { sayNow(speechContains()); });").message,
    /未確認または未対応/
  );
});

test("ML2Scratch: 公式1or2 fixtureで確認した6ブロックを変換できる", () => {
  const definition = JSON.parse(readFileSync(path.join(rootDir, "definitions/ml2scratch.json"), "utf8"));
  const result = convert(`whenGreenFlagClicked(() => {
  mlSetInput("stage");
  mlSetVideo("off");
});

whenKeyPressed("1", () => {
  mlAddExample1();
});

whenKeyPressed("2", () => {
  mlAddExample2();
});

whenKeyPressed("3", () => {
  mlAddExample3();
});

whenMlLabelReceived("1", () => {
  sayNow("1");
});

whenMlLabelReceived("2", () => {
  sayNow("2");
});`);

  assert.deepEqual(result.project.extensions, ["ml2scratch"]);
  assert.deepEqual(result.project.extensionURLs, [
    [definition.extensionId, definition.extensionURL]
  ]);

  const fixturePath = "fixtures/ml2scratch/official-1or2.sb3";
  [
    "ml2scratch_addExample1",
    "ml2scratch_addExample2",
    "ml2scratch_addExample3"
  ].forEach((opcode) => assertBlockMatchesOfficialFixture(result, fixturePath, opcode));
  assertBlockMatchesOfficialFixture(result, fixturePath, {
    opcode: "ml2scratch_whenReceived",
    fields: { LABEL: "1" }
  });
  assertBlockMatchesOfficialFixture(result, fixturePath, {
    opcode: "ml2scratch_videoToggle",
    fields: { VIDEO_STATE: "off" }
  });
  assertBlockMatchesOfficialFixture(result, fixturePath, {
    opcode: "ml2scratch_setInput",
    fields: { INPUT: "stage" }
  });
});

test("ML2Scratch: fixtureにない値とブロックは安全停止する", () => {
  const labelError = conversionError(`whenMlLabelReceived("3", () => {
  sayNow("3");
});`);
  assert.match(labelError.message, /未確認のメニュー値/);

  const videoError = conversionError(`whenGreenFlagClicked(() => {
  mlSetVideo("on");
});`);
  assert.match(videoError.message, /未確認のメニュー値/);

  const reporterError = conversionError(`whenGreenFlagClicked(() => {
  sayNow(mlLabel());
});`);
  assert.match(reporterError.message, /未確認または未対応/);
});

test("Microbit More: A/Bボタン + displayText を fixture保存形で変換できる", () => {
  const result = convert(`whenMicrobitButtonPressed("A", () => {
  microbitDisplayText("2", 120);
});

whenMicrobitButtonPressed("B", () => {
  microbitDisplayText("3", 120);
});`);

  assert.ok(result.project.extensions.includes("microbitMore"));
  const blocks = Object.values(spriteBlocks(result));
  const hats = blocks.filter((block) => block.opcode === "microbitMore_whenButtonEvent");
  const textBlocks = blocks.filter((block) => block.opcode === "microbitMore_displayText");

  assert.equal(hats.length, 2);
  assert.equal(textBlocks.length, 2);

  const names = hats.map((block) => block.fields.NAME?.[0]).sort();
  assert.deepEqual(names, ["A", "B"]);
  hats.forEach((block) => {
    assert.deepEqual(block.inputs, {});
    assert.equal(block.topLevel, true);
    assert.equal(block.parent, null);
    assert.deepEqual(block.fields.EVENT, ["DOWN", null]);
  });

  textBlocks.forEach((block) => {
    assert.deepEqual(block.fields, {});
    assert.deepEqual(block.inputs.TEXT, [1, [10, block.inputs.TEXT[1][1]]]);
    assert.deepEqual(block.inputs.DELAY, [1, [4, "120"]]);
    assert.equal(block.topLevel, false);
  });
});

test("Microbit More: ifMicrobitButtonPressed alias も A/B ボタンhatとして変換できる", () => {
  const result = convert(`ifMicrobitButtonPressed("A", () => {
  microbitDisplayText("OK", 120);
});`);

  assert.ok(result.project.extensions.includes("microbitMore"));
  const blocks = Object.values(spriteBlocks(result));
  const hat = blocks.find((block) => block.opcode === "microbitMore_whenButtonEvent");
  assert.ok(hat);
  assert.deepEqual(hat.fields.EVENT, ["DOWN", null]);
  assert.deepEqual(hat.fields.NAME, ["A", null]);
});

test("Microbit More: buttonが未確認値(C)なら安全停止する", () => {
  const error = conversionError(`whenMicrobitButtonPressed("C", () => {
  microbitDisplayText("C", 120);
});`);
  assert.match(error.message, /未確認または未対応|引数|未確認のメニュー値/);
});

test("Microbit More: gestureは未対応として安全停止する", () => {
  const error = conversionError(`whenMicrobitGesture("TILT_LEFT", () => {
  microbitDisplayText("L", 120);
});`);
  assert.match(error.message, /未確認または未対応|未確認のメニュー値/);
});


test("Microbit More: SHAKE + playTone + stopTone を fixture保存形で変換できる", () => {
  const result = convert(`whenMicrobitShaken(() => {
  microbitPlayTone(440, 100);
  wait(1);
  microbitStopTone();
});`);

  assert.ok(result.project.extensions.includes("microbitMore"));
  const blocks = Object.values(spriteBlocks(result));
  const shake = blocks.find((block) => block.opcode === "microbitMore_whenGesture");
  const tone = blocks.find((block) => block.opcode === "microbitMore_playTone");
  const stop = blocks.find((block) => block.opcode === "microbitMore_stopTone");

  assert.ok(shake);
  assert.ok(tone);
  assert.ok(stop);
  assert.deepEqual(shake.fields.GESTURE, ["SHAKE", null]);
  assert.deepEqual(shake.inputs, {});
  assert.deepEqual(tone.inputs.FREQ, [1, [4, "440"]]);
  assert.deepEqual(tone.inputs.VOL, [1, [4, "100"]]);
});

test("Microbit More: 接続・切断hatを公式fixtureの保存形で変換できる", () => {
  const result = convert(`whenMicrobitConnectionChanged("connected", () => {
  sayNow("接続");
});

whenMicrobitConnectionChanged("disconnected", () => {
  sayNow("切断");
});`);

  const fixturePath = "fixtures/microbit-more/official-connection.sb3";
  assertBlockMatchesOfficialFixture(result, fixturePath, {
    opcode: "microbitMore_whenConnectionChanged",
    fields: { STATE: "connected" }
  });
  assertBlockMatchesOfficialFixture(result, fixturePath, {
    opcode: "microbitMore_whenConnectionChanged",
    fields: { STATE: "disconnected" }
  });
});

test("Microbit More: 5×5 LED模様をmatrix shadow付きで生成する", () => {
  const pattern = "0101010101100010101000100";
  const result = convert(`whenGreenFlagClicked(() => {
  microbitDisplayMatrix("${pattern}");
});`);

  assertBlockMatchesOfficialFixture(
    result,
    "fixtures/microbit-more/official-connection.sb3",
    "microbitMore_displayMatrix"
  );

  const blocks = Object.values(spriteBlocks(result));
  const matrix = blocks.find((block) => block.opcode === "matrix");
  assert.ok(matrix);
  assert.equal(matrix.shadow, true);
  assert.deepEqual(matrix.fields.MATRIX, [pattern, null]);
});

test("Microbit More: 明るさ・roll reporterを公式fixtureの保存形で変換できる", () => {
  const lightResult = convert(`whenGreenFlagClicked(() => {
  sayNow(microbitLightLevel());
});`);
  assertBlockMatchesOfficialFixture(
    lightResult,
    "fixtures/microbit-more/official-light-level.sb3",
    "microbitMore_getLightLevel"
  );

  const rollResult = convert(`whenGreenFlagClicked(() => {
  sayNow(microbitRoll());
});`);
  assertBlockMatchesOfficialFixture(
    rollResult,
    "fixtures/microbit-more/official-platform-game-controller.sb3",
    "microbitMore_getRoll"
  );
});

test("Microbit More: 未確認の接続状態と不正なLED模様は安全停止する", () => {
  const stateError = conversionError(`whenMicrobitConnectionChanged("reconnecting", () => {
  sayNow("待機");
});`);
  assert.match(stateError.message, /未確認のメニュー値/);

  const shortMatrixError = conversionError(`whenGreenFlagClicked(() => {
  microbitDisplayMatrix("01010");
});`);
  assert.match(shortMatrixError.message, /LEDパターンの形/);

  const invalidMatrixError = conversionError(`whenGreenFlagClicked(() => {
  microbitDisplayMatrix("010101010110001010100010X");
});`);
  assert.match(invalidMatrixError.message, /LEDパターンの形/);
});

test("Microbit More: TILT_LEFT は安全停止する", () => {
  const error = conversionError(`whenMicrobitGesture("TILT_LEFT", () => {
  microbitPlayTone(440, 100);
});`);
  assert.match(error.message, /未確認または未対応|未確認のメニュー値/);
});

test("Microbit More: TILT_RIGHT は安全停止する", () => {
  const error = conversionError(`whenMicrobitGesture("TILT_RIGHT", () => {
  microbitPlayTone(440, 100);
});`);
  assert.match(error.message, /未確認または未対応|未確認のメニュー値/);
});

test("Microbit More: 未確認gesture値(JUMP)は安全停止する", () => {
  const error = conversionError(`whenMicrobitGesture("JUMP", () => {
  microbitPlayTone(440, 100);
});`);
  assert.match(error.message, /未確認または未対応|未確認のメニュー値/);
});

test("Microbit More: 公式getInfo上の未検証ブロックは個別に安全停止登録する", () => {
  const unsupportedNames = [
    "whenMicrobitButtonEvent",
    "microbitButtonPressed",
    "whenMicrobitTouchEvent",
    "microbitPinTouched",
    "microbitClearDisplay",
    "microbitTemperature",
    "microbitCompassHeading",
    "microbitPitch",
    "microbitSoundLevel",
    "microbitMagneticForce",
    "microbitAcceleration",
    "microbitAnalogValue",
    "microbitSetPullMode",
    "microbitPinHigh",
    "microbitSetDigitalOut",
    "microbitSetAnalogOut",
    "microbitSetServo",
    "microbitListenPinEventType",
    "whenMicrobitPinEvent",
    "microbitPinEventValue",
    "whenMicrobitDataReceived",
    "microbitDataLabeled",
    "microbitSendData",
    "microbitTiltAngle"
  ];

  unsupportedNames.forEach((functionName) => {
    const unsupported = globalThis.StretchScriptBlocks.getUnsupported(functionName);
    assert.ok(unsupported, `${functionName} should be registered as unsupported`);
    assert.equal(unsupported.category, "Microbit More");
  });
});

test("Microbit More: 未検証ブロック名を使うとMicrobit More理由で安全停止する", () => {
  const error = conversionError("microbitSendData();");
  assert.match(error.message, /未確認または未対応/);
  assert.match(error.cause, /Microbit More/);
  assert.match(error.cause, /project.json保存形/);
});

test("Microbit More: servoは未対応として安全停止する", () => {
  const error = conversionError('microbitSetServo("P0", 90);');
  assert.match(error.message, /未確認または未対応/);
});
