import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

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
const R = globalThis.StretchScriptBlocks;

function convert(source) {
  const result = app.convertSourceForTest(source);
  assert.deepEqual(result.integrity, []);
  return result;
}

// 別名で書いたコードと正式名で書いたコードのblocksを比べます。
function blocksOf(result) {
  return result.project.targets[1].blocks;
}

const ALIAS_CASES = [
  ["microbitServo", "microbitSetServo", '("1", 90)'],
  ["microbitDigitalOut", "microbitSetDigitalOut", '("0", "true")'],
  ["microbitAnalogOut", "microbitSetAnalogOut", '("0", 512)'],
  ["microbitPullMode", "microbitSetPullMode", '("0", "UP")']
];

ALIAS_CASES.forEach(([aliasName, canonicalName, args]) => {
  test(`別名 ${aliasName} は ${canonicalName} と同じブロックを作る`, () => {
    const aliasResult = convert(`whenGreenFlagClicked(() => {\n  ${aliasName}${args};\n});`);
    const canonicalResult = convert(`whenGreenFlagClicked(() => {\n  ${canonicalName}${args};\n});`);

    assert.deepEqual(blocksOf(aliasResult), blocksOf(canonicalResult));
    assert.deepEqual(
      aliasResult.project.targets[1].blocks,
      canonicalResult.project.targets[1].blocks
    );
  });
});

test("別名を使うと警告欄に正式名が出る", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  microbitServo("1", 90);
});`);

  assert.equal(
    result.warnings.filter((warning) => /microbitServo\(\.\.\.\) は microbitSetServo/.test(warning)).length,
    1
  );
});

test("正式名で書いた場合は別名の警告を出さない", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  microbitSetServo("1", 90);
});`);

  assert.equal(result.warnings.filter((warning) => /正しい名前は/.test(warning)).length, 0);
});

test("別名を使った行ごとに1回ずつ警告する", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  microbitServo("1", 90);
  microbitServo("1", 0);
});`);

  const notices = result.warnings.filter((warning) => /正しい名前は microbitSetServo/.test(warning));
  assert.equal(notices.length, 2);
  assert.ok(notices.some((warning) => /2行目/.test(warning)));
  assert.ok(notices.some((warning) => /3行目/.test(warning)));
});

test("ピン番号を数値で書いても別名経由で変換できる", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  microbitServo(1, 90);
});`);

  const blocks = Object.values(blocksOf(result));
  assert.ok(blocks.some((block) => block.opcode === "microbitMore_setServo"));
});

test("別名は正式名を上書きしない", () => {
  R.aliases().forEach(([aliasName, canonicalName]) => {
    assert.equal(R.has(aliasName), false, `${aliasName} が正式名としても登録されています。`);
    assert.equal(R.has(canonicalName), true, `${canonicalName} が正式名として見つかりません。`);
    assert.equal(R.resolveFunctionName(aliasName), canonicalName);
    assert.equal(R.resolveFunctionName(canonicalName), canonicalName);
  });
});

test("実際の教室エラー例（温度でサーボを動かす）が変換できる", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  forever(() => {
    ifElse(greaterThan(microbitTemperature(), 29), () => {
      microbitServo("1", 90);
    }, () => {
      microbitServo("1", 0);
    });
  });
});`);

  const opcodes = Object.values(blocksOf(result)).map((block) => block.opcode);
  assert.equal(opcodes.filter((opcode) => opcode === "microbitMore_setServo").length, 2);
});

test("綴り違いには近い命令を候補として出す", () => {
  assert.throws(
    () => app.convertSourceForTest(`whenGreenFlagClicked(() => {\n  microbitSetSrevo("1", 90);\n});`),
    (error) => {
      assert.match(error.message, /未対応関数/);
      assert.match(error.suggestion, /microbitSetServo/);
      assert.match(error.fix, /microbitSetServo/);
      return true;
    }
  );
});

test("大文字小文字だけ違う名前も候補として出す", () => {
  assert.throws(
    () => app.convertSourceForTest(`whenGreenFlagClicked(() => {\n  MicrobitTemperature();\n});`),
    (error) => {
      assert.match(error.suggestion, /microbitTemperature/);
      return true;
    }
  );
});

test("似ていない名前には候補を出さず、生徒向けの直し方を示す", () => {
  assert.throws(
    () => app.convertSourceForTest(`whenGreenFlagClicked(() => {\n  zzzzzzzzz();\n});`),
    (error) => {
      assert.equal(error.suggestion, null);
      assert.match(error.fix, /使える命令一覧/);
      assert.doesNotMatch(error.fix, /blocks\//);
      return true;
    }
  );
});

test("候補の距離しきい値は短い名前ほど厳しくする", () => {
  assert.deepEqual(R.suggestFunctionNames("microbitSetServo"), ["microbitSetServo"]);
  assert.ok(R.suggestFunctionNames("microbitSetServoo").includes("microbitSetServo"));
  assert.deepEqual(R.suggestFunctionNames("xyz"), []);
});

test("既存の個別ヘルプは候補表示より優先する", () => {
  assert.throws(
    () => app.convertSourceForTest(`whenGreenFlagClicked(() => {\n  parseInt("1");\n});`),
    (error) => {
      assert.match(error.cause, /JavaScriptの関数/);
      return true;
    }
  );
});

test("プレビューには別名ではなく正式名を表示する", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  microbitServo("1", 90);
});`);

  const texts = result.preview.map((line) => line.text).join("\n");
  assert.match(texts, /microbitSetServo/);
  assert.doesNotMatch(texts, /(^|[^S])microbitServo/);
});

test("実際にGemが書いた microbitServoTurn も変換できる", () => {
  const result = convert(`whenGreenFlagClicked(() => {
  forever(() => {
    ifElse(greaterThan(microbitTemperature(), 29), () => {
      microbitServoTurn("1", 90);
    }, () => {
      microbitServoTurn("1", 0);
    });
  });
});`);

  const opcodes = Object.values(blocksOf(result)).map((block) => block.opcode);
  assert.equal(opcodes.filter((opcode) => opcode === "microbitMore_setServo").length, 2);
  assert.ok(result.warnings.some((warning) => /正しい名前は microbitSetServo/.test(warning)));
});

test("単語の並べ替えや語尾違いも候補として拾う", () => {
  assert.ok(R.suggestFunctionNames("microbitTurnServo").includes("microbitSetServo"));
  assert.ok(R.suggestFunctionNames("microbitServoAngle").includes("microbitSetServo"));
  assert.ok(R.suggestFunctionNames("microbitPlay").includes("microbitPlayTone"));
  assert.ok(R.suggestFunctionNames("microbitShowText").includes("microbitDisplayText"));
});

test("単語がほとんど重ならない名前は候補にしない", () => {
  const suggestions = R.suggestFunctionNames("microbitServoTurn");
  assert.equal(suggestions.includes("microbitTemperature"), false);
  assert.equal(suggestions.includes("microbitPlayTone"), false);
  assert.deepEqual(R.suggestFunctionNames("zzzzzzzzz"), []);
});
