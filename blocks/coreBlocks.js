/* Scratch 3.0の基本カテゴリをStretchScriptから呼べるようにする定義です。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;

  const N = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "number",
    defaultValue,
    role: "input",
    ...extra
  });
  const PI = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "positiveInteger",
    defaultValue,
    role: "input",
    ...extra
  });
  const S = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "stringOrReporter",
    defaultValue,
    role: "input",
    ...extra
  });
  const IDX = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "listIndex",
    defaultValue,
    role: "input",
    ...extra
  });
  const F = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "menu",
    defaultValue,
    role: "field",
    ...extra
  });
  const M = (name, scratchName, defaultValue, menuOpcode, menuField = scratchName, extra = {}) => ({
    name,
    scratchName,
    type: "menuInput",
    defaultValue,
    role: "input",
    menuOpcode,
    menuField,
    ...extra
  });
  const B = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "boolean",
    defaultValue,
    role: "input",
    ...extra
  });
  const SUB = (scratchName = "SUBSTACK") => ({
    name: "body",
    scratchName,
    type: "substack",
    role: "substack"
  });

  R.registerMany([
    {
      functionName: "whenGreenFlagClicked",
      opcode: "event_whenflagclicked",
      category: "イベント",
      blockType: "hat",
      arguments: [SUB()],
      label: () => "緑の旗が押されたとき",
      sample: "whenGreenFlagClicked(() => { move(10); });"
    },
    {
      functionName: "whenKeyPressed",
      opcode: "event_whenkeypressed",
      category: "イベント",
      blockType: "hat",
      arguments: [F("key", "KEY_OPTION", "space"), SUB()],
      label: (args) => `${args[0]}キーが押されたとき`,
      sample: "whenKeyPressed(\"space\", () => { move(10); });"
    },
    {
      functionName: "whenSpriteClicked",
      opcode: "event_whenthisspriteclicked",
      category: "イベント",
      blockType: "hat",
      arguments: [SUB()],
      label: () => "このスプライトが押されたとき",
      sample: "whenSpriteClicked(() => { say(\"やあ\", 1); });"
    },
    {
      functionName: "whenThisSpriteClicked",
      opcode: "event_whenthisspriteclicked",
      category: "イベント",
      blockType: "hat",
      arguments: [SUB()],
      label: () => "このスプライトが押されたとき",
      sample: "whenThisSpriteClicked(() => { say(\"やあ\", 1); });"
    },
    {
      functionName: "whenBackdropSwitchesTo",
      opcode: "event_whenbackdropswitchesto",
      category: "イベント",
      blockType: "hat",
      arguments: [F("backdrop", "BACKDROP", "backdrop1"), SUB()],
      label: (args) => `背景が${args[0]}になったとき`,
      sample: "whenBackdropSwitchesTo(\"backdrop1\", () => { show(); });"
    },
    {
      functionName: "whenGreaterThan",
      opcode: "event_whengreaterthan",
      category: "イベント",
      blockType: "hat",
      arguments: [F("sensor", "WHENGREATERTHANMENU", "LOUDNESS"), N("value", "VALUE", 10), SUB()],
      label: (args) => `${args[0]}が${args[1]}より大きいとき`,
      sample: "whenGreaterThan(\"LOUDNESS\", 10, () => { say(\"大きい\", 1); });"
    },
    {
      functionName: "whenIReceive",
      opcode: "event_whenbroadcastreceived",
      category: "メッセージ",
      blockType: "hat",
      arguments: [{ name: "message", scratchName: "BROADCAST_OPTION", type: "broadcast", role: "field", defaultValue: "message1" }, SUB()],
      label: (args) => `${args[0]}を受け取ったとき`,
      sample: "whenIReceive(\"スタート\", () => { move(10); });"
    },
    {
      functionName: "broadcast",
      opcode: "event_broadcast",
      category: "メッセージ",
      blockType: "stack",
      arguments: [{ name: "message", scratchName: "BROADCAST_INPUT", type: "broadcastInput", role: "input", defaultValue: "message1" }],
      label: (args) => `${args[0]}を送る`,
      sample: "broadcast(\"スタート\");"
    },
    {
      functionName: "broadcastAndWait",
      opcode: "event_broadcastandwait",
      category: "メッセージ",
      blockType: "stack",
      arguments: [{ name: "message", scratchName: "BROADCAST_INPUT", type: "broadcastInput", role: "input", defaultValue: "message1" }],
      label: (args) => `${args[0]}を送って待つ`,
      sample: "broadcastAndWait(\"スタート\");"
    },

    {
      functionName: "move",
      opcode: "motion_movesteps",
      category: "動き",
      blockType: "stack",
      arguments: [N("steps", "STEPS", 10)],
      label: (args) => `${args[0]}歩動かす`,
      sample: "move(10);"
    },
    {
      functionName: "turnRight",
      opcode: "motion_turnright",
      category: "動き",
      blockType: "stack",
      arguments: [N("degrees", "DEGREES", 15)],
      label: (args) => `右に${args[0]}度回す`,
      sample: "turnRight(15);"
    },
    {
      functionName: "turnLeft",
      opcode: "motion_turnleft",
      category: "動き",
      blockType: "stack",
      arguments: [N("degrees", "DEGREES", 15)],
      label: (args) => `左に${args[0]}度回す`,
      sample: "turnLeft(15);"
    },
    {
      functionName: "goTo",
      opcode: "motion_goto",
      category: "動き",
      blockType: "stack",
      arguments: [M("target", "TO", "_random_", "motion_goto_menu")],
      label: (args) => `${args[0]}へ行く`,
      sample: "goTo(\"_random_\");"
    },
    {
      functionName: "goToXY",
      opcode: "motion_gotoxy",
      category: "動き",
      blockType: "stack",
      arguments: [N("x", "X", 0), N("y", "Y", 0)],
      label: (args) => `x座標を${args[0]}、y座標を${args[1]}にする`,
      sample: "goToXY(0, 0);"
    },
    {
      functionName: "glideTo",
      opcode: "motion_glideto",
      category: "動き",
      blockType: "stack",
      arguments: [N("seconds", "SECS", 1), M("target", "TO", "_random_", "motion_glideto_menu")],
      label: (args) => `${args[0]}秒で${args[1]}へ行く`,
      sample: "glideTo(1, \"_random_\");"
    },
    {
      functionName: "glideToXY",
      opcode: "motion_glidesecstoxy",
      category: "動き",
      blockType: "stack",
      arguments: [N("seconds", "SECS", 1), N("x", "X", 0), N("y", "Y", 0)],
      label: (args) => `${args[0]}秒でx:${args[1]} y:${args[2]}へ行く`,
      sample: "glideToXY(1, 100, 0);"
    },
    {
      functionName: "pointInDirection",
      opcode: "motion_pointindirection",
      category: "動き",
      blockType: "stack",
      arguments: [N("direction", "DIRECTION", 90)],
      label: (args) => `${args[0]}度に向ける`,
      sample: "pointInDirection(90);"
    },
    {
      functionName: "pointTowards",
      opcode: "motion_pointtowards",
      category: "動き",
      blockType: "stack",
      arguments: [M("target", "TOWARDS", "_mouse_", "motion_pointtowards_menu")],
      label: (args) => `${args[0]}へ向ける`,
      sample: "pointTowards(\"_mouse_\");"
    },
    {
      functionName: "changeX",
      opcode: "motion_changexby",
      category: "動き",
      blockType: "stack",
      arguments: [N("amount", "DX", 10)],
      label: (args) => `x座標を${args[0]}ずつ変える`,
      sample: "changeX(10);"
    },
    {
      functionName: "setX",
      opcode: "motion_setx",
      category: "動き",
      blockType: "stack",
      arguments: [N("x", "X", 0)],
      label: (args) => `x座標を${args[0]}にする`,
      sample: "setX(0);"
    },
    {
      functionName: "changeY",
      opcode: "motion_changeyby",
      category: "動き",
      blockType: "stack",
      arguments: [N("amount", "DY", 10)],
      label: (args) => `y座標を${args[0]}ずつ変える`,
      sample: "changeY(10);"
    },
    {
      functionName: "setY",
      opcode: "motion_sety",
      category: "動き",
      blockType: "stack",
      arguments: [N("y", "Y", 0)],
      label: (args) => `y座標を${args[0]}にする`,
      sample: "setY(0);"
    },
    {
      functionName: "ifOnEdgeBounce",
      opcode: "motion_ifonedgebounce",
      category: "動き",
      blockType: "stack",
      arguments: [],
      label: () => "もし端についたら跳ね返る",
      sample: "ifOnEdgeBounce();"
    },
    {
      functionName: "setRotationStyle",
      opcode: "motion_setrotationstyle",
      category: "動き",
      blockType: "stack",
      arguments: [F("style", "STYLE", "left-right")],
      label: (args) => `回転方法を${args[0]}にする`,
      sample: "setRotationStyle(\"left-right\");"
    },
    {
      functionName: "xPosition",
      opcode: "motion_xposition",
      category: "動き",
      blockType: "reporter",
      arguments: [],
      label: () => "x座標",
      sample: "say(xPosition(), 1);"
    },
    {
      functionName: "yPosition",
      opcode: "motion_yposition",
      category: "動き",
      blockType: "reporter",
      arguments: [],
      label: () => "y座標",
      sample: "say(yPosition(), 1);"
    },
    {
      functionName: "direction",
      opcode: "motion_direction",
      category: "動き",
      blockType: "reporter",
      arguments: [],
      label: () => "向き",
      sample: "say(direction(), 1);"
    },

    {
      functionName: "say",
      opcode: "looks_sayforsecs",
      category: "見た目",
      blockType: "stack",
      arguments: [S("message", "MESSAGE", "こんにちは"), N("seconds", "SECS", 2, { optional: true })],
      label: (args) => args.length > 1 ? `${args[0]} と${args[1]}秒言う` : `${args[0]} と言う`,
      sample: "say(\"こんにちは\", 2);",
      customOpcodeByArgs: (args) => args.length > 1 ? "looks_sayforsecs" : "looks_say"
    },
    {
      functionName: "sayNow",
      opcode: "looks_say",
      category: "見た目",
      blockType: "stack",
      arguments: [S("message", "MESSAGE", "こんにちは")],
      label: (args) => `${args[0]} と言う`,
      sample: "sayNow(\"こんにちは\");"
    },
    {
      functionName: "think",
      opcode: "looks_thinkforsecs",
      category: "見た目",
      blockType: "stack",
      arguments: [S("message", "MESSAGE", "うーん"), N("seconds", "SECS", 2, { optional: true })],
      label: (args) => args.length > 1 ? `${args[0]} と${args[1]}秒考える` : `${args[0]} と考える`,
      sample: "think(\"うーん\", 2);",
      customOpcodeByArgs: (args) => args.length > 1 ? "looks_thinkforsecs" : "looks_think"
    },
    {
      functionName: "thinkNow",
      opcode: "looks_think",
      category: "見た目",
      blockType: "stack",
      arguments: [S("message", "MESSAGE", "うーん")],
      label: (args) => `${args[0]} と考える`,
      sample: "thinkNow(\"うーん\");"
    },
    {
      functionName: "show",
      opcode: "looks_show",
      category: "見た目",
      blockType: "stack",
      arguments: [],
      label: () => "表示する",
      sample: "show();"
    },
    {
      functionName: "hide",
      opcode: "looks_hide",
      category: "見た目",
      blockType: "stack",
      arguments: [],
      label: () => "隠す",
      sample: "hide();"
    },
    {
      functionName: "switchCostume",
      opcode: "looks_switchcostumeto",
      category: "コスチューム",
      blockType: "stack",
      arguments: [M("costume", "COSTUME", "costume1", "looks_costume")],
      label: (args) => `コスチュームを${args[0]}にする`,
      sample: "switchCostume(\"costume1\");"
    },
    {
      functionName: "nextCostume",
      opcode: "looks_nextcostume",
      category: "コスチューム",
      blockType: "stack",
      arguments: [],
      label: () => "次のコスチュームにする",
      sample: "nextCostume();"
    },
    {
      functionName: "switchBackdrop",
      opcode: "looks_switchbackdropto",
      category: "背景",
      blockType: "stack",
      arguments: [M("backdrop", "BACKDROP", "backdrop1", "looks_backdrops")],
      label: (args) => `背景を${args[0]}にする`,
      sample: "switchBackdrop(\"backdrop1\");"
    },
    {
      functionName: "nextBackdrop",
      opcode: "looks_nextbackdrop",
      category: "背景",
      blockType: "stack",
      arguments: [],
      label: () => "次の背景にする",
      sample: "nextBackdrop();"
    },
    {
      functionName: "changeSize",
      opcode: "looks_changesizeby",
      category: "見た目",
      blockType: "stack",
      arguments: [N("amount", "CHANGE", 10)],
      label: (args) => `大きさを${args[0]}ずつ変える`,
      sample: "changeSize(10);"
    },
    {
      functionName: "setSize",
      opcode: "looks_setsizeto",
      category: "見た目",
      blockType: "stack",
      arguments: [N("size", "SIZE", 100)],
      label: (args) => `大きさを${args[0]}%にする`,
      sample: "setSize(100);"
    },
    {
      functionName: "changeEffect",
      opcode: "looks_changeeffectby",
      category: "見た目",
      blockType: "stack",
      arguments: [F("effect", "EFFECT", "COLOR"), N("amount", "CHANGE", 25)],
      label: (args) => `${args[0]}の効果を${args[1]}ずつ変える`,
      sample: "changeEffect(\"COLOR\", 25);"
    },
    {
      functionName: "setEffect",
      opcode: "looks_seteffectto",
      category: "見た目",
      blockType: "stack",
      arguments: [F("effect", "EFFECT", "COLOR"), N("value", "VALUE", 0)],
      label: (args) => `${args[0]}の効果を${args[1]}にする`,
      sample: "setEffect(\"COLOR\", 0);"
    },
    {
      functionName: "clearGraphicEffects",
      opcode: "looks_cleargraphiceffects",
      category: "見た目",
      blockType: "stack",
      arguments: [],
      label: () => "画像効果をなくす",
      sample: "clearGraphicEffects();"
    },
    {
      functionName: "goToFront",
      opcode: "looks_gotofrontback",
      category: "見た目",
      blockType: "stack",
      arguments: [F("frontBack", "FRONT_BACK", "front")],
      label: (args) => `${args[0]}へ移動する`,
      sample: "goToFront(\"front\");"
    },
    {
      functionName: "goToFrontLayer",
      opcode: "looks_gotofrontback",
      category: "見た目",
      blockType: "stack",
      arguments: [],
      fixedFields: { FRONT_BACK: "front" },
      label: () => "最前面へ移動する",
      sample: "goToFrontLayer();"
    },
    {
      functionName: "goToBackLayer",
      opcode: "looks_gotofrontback",
      category: "見た目",
      blockType: "stack",
      arguments: [],
      fixedFields: { FRONT_BACK: "back" },
      label: () => "最背面へ移動する",
      sample: "goToBackLayer();"
    },
    {
      functionName: "goForwardLayers",
      opcode: "looks_goforwardbackwardlayers",
      category: "見た目",
      blockType: "stack",
      arguments: [F("forwardBackward", "FORWARD_BACKWARD", "forward", { optional: true }), N("layers", "NUM", 1)],
      fixedFields: { FORWARD_BACKWARD: "forward" },
      label: (args) => args.length === 1 ? `前へ${args[0]}層動かす` : `${args[0]}へ${args[1]}層動かす`,
      sample: "goForwardLayers(1);\ngoForwardLayers(\"forward\", 1);"
    },
    {
      functionName: "goBackwardLayers",
      opcode: "looks_goforwardbackwardlayers",
      category: "見た目",
      blockType: "stack",
      arguments: [N("layers", "NUM", 1)],
      fixedFields: { FORWARD_BACKWARD: "backward" },
      label: (args) => `後ろへ${args[0]}層動かす`,
      sample: "goBackwardLayers(1);"
    },
    {
      functionName: "costumeNumber",
      opcode: "looks_costumenumbername",
      category: "コスチューム",
      blockType: "reporter",
      arguments: [F("numberName", "NUMBER_NAME", "number", { optional: true })],
      fixedFields: { NUMBER_NAME: "number" },
      label: () => "コスチューム番号",
      sample: "say(costumeNumber(), 1);"
    },
    {
      functionName: "backdropNumber",
      opcode: "looks_backdropnumbername",
      category: "背景",
      blockType: "reporter",
      arguments: [F("numberName", "NUMBER_NAME", "number", { optional: true })],
      fixedFields: { NUMBER_NAME: "number" },
      label: () => "背景番号",
      sample: "say(backdropNumber(), 1);"
    },
    {
      functionName: "size",
      opcode: "looks_size",
      category: "見た目",
      blockType: "reporter",
      arguments: [],
      label: () => "大きさ",
      sample: "say(size(), 1);"
    },

    {
      functionName: "playSoundUntilDone",
      opcode: "sound_playuntildone",
      category: "音",
      blockType: "stack",
      arguments: [M("sound", "SOUND_MENU", "pop", "sound_sounds_menu")],
      label: (args) => `${args[0]}の音を終わるまで鳴らす`,
      sample: "playSoundUntilDone(\"pop\");"
    },
    {
      functionName: "startSound",
      opcode: "sound_play",
      category: "音",
      blockType: "stack",
      arguments: [M("sound", "SOUND_MENU", "pop", "sound_sounds_menu")],
      label: (args) => `${args[0]}の音を鳴らす`,
      sample: "startSound(\"pop\");"
    },
    {
      functionName: "stopAllSounds",
      opcode: "sound_stopallsounds",
      category: "音",
      blockType: "stack",
      arguments: [],
      label: () => "すべての音を止める",
      sample: "stopAllSounds();"
    },
    {
      functionName: "changeSoundEffect",
      opcode: "sound_changeeffectby",
      category: "音",
      blockType: "stack",
      arguments: [F("effect", "EFFECT", "PITCH"), N("amount", "VALUE", 10)],
      label: (args) => `音の${args[0]}効果を${args[1]}ずつ変える`,
      sample: "changeSoundEffect(\"PITCH\", 10);"
    },
    {
      functionName: "setSoundEffect",
      opcode: "sound_seteffectto",
      category: "音",
      blockType: "stack",
      arguments: [F("effect", "EFFECT", "PITCH"), N("value", "VALUE", 100)],
      label: (args) => `音の${args[0]}効果を${args[1]}にする`,
      sample: "setSoundEffect(\"PITCH\", 100);"
    },
    {
      functionName: "clearSoundEffects",
      opcode: "sound_cleareffects",
      category: "音",
      blockType: "stack",
      arguments: [],
      label: () => "音の効果をなくす",
      sample: "clearSoundEffects();"
    },
    {
      functionName: "changeVolume",
      opcode: "sound_changevolumeby",
      category: "音",
      blockType: "stack",
      arguments: [N("amount", "VOLUME", -10)],
      label: (args) => `音量を${args[0]}ずつ変える`,
      sample: "changeVolume(-10);"
    },
    {
      functionName: "setVolume",
      opcode: "sound_setvolumeto",
      category: "音",
      blockType: "stack",
      arguments: [N("volume", "VOLUME", 100)],
      label: (args) => `音量を${args[0]}%にする`,
      sample: "setVolume(100);"
    },
    {
      functionName: "volume",
      opcode: "sound_volume",
      category: "音",
      blockType: "reporter",
      arguments: [],
      label: () => "音量",
      sample: "say(volume(), 1);"
    },

    {
      functionName: "wait",
      opcode: "control_wait",
      category: "制御",
      blockType: "stack",
      arguments: [N("seconds", "DURATION", 1)],
      label: (args) => `${args[0]}秒待つ`,
      sample: "wait(1);"
    },
    {
      functionName: "repeat",
      opcode: "control_repeat",
      category: "制御",
      blockType: "control",
      arguments: [PI("times", "TIMES", 10), SUB()],
      label: (args) => `${args[0]}回繰り返す`,
      sample: "repeat(10, () => { move(10); });"
    },
    {
      functionName: "forever",
      opcode: "control_forever",
      category: "制御",
      blockType: "control",
      arguments: [SUB()],
      label: () => "ずっと",
      sample: "forever(() => { move(10); });"
    },
    {
      functionName: "ifThen",
      opcode: "control_if",
      category: "制御",
      blockType: "control",
      arguments: [B("condition", "CONDITION", false), SUB()],
      label: (args) => `もし ${args[0]} なら`,
      sample: "ifThen(keyPressed(\"space\"), () => { move(10); });"
    },
    {
      functionName: "ifBlock",
      opcode: "control_if",
      category: "制御",
      blockType: "control",
      arguments: [B("condition", "CONDITION", false), SUB()],
      label: (args) => `もし ${args[0]} なら`,
      sample: "ifBlock(keyPressed(\"space\"), () => { move(10); });"
    },
    {
      functionName: "ifElse",
      opcode: "control_if_else",
      category: "制御",
      blockType: "control",
      arguments: [B("condition", "CONDITION", false), SUB("SUBSTACK"), SUB("SUBSTACK2")],
      label: (args) => `もし ${args[0]} なら／でなければ`,
      sample: "ifElse(mouseDown(), () => { show(); }, () => { hide(); });"
    },
    {
      functionName: "waitUntil",
      opcode: "control_wait_until",
      category: "制御",
      blockType: "stack",
      arguments: [B("condition", "CONDITION", false)],
      label: (args) => `${args[0]}まで待つ`,
      sample: "waitUntil(mouseDown());"
    },
    {
      functionName: "repeatUntil",
      opcode: "control_repeat_until",
      category: "制御",
      blockType: "control",
      arguments: [B("condition", "CONDITION", false), SUB()],
      label: (args) => `${args[0]}まで繰り返す`,
      sample: "repeatUntil(mouseDown(), () => { move(10); });"
    },
    {
      functionName: "stopAll",
      opcode: "control_stop",
      category: "制御",
      blockType: "stack",
      arguments: [],
      fixedFields: { STOP_OPTION: "all" },
      mutation: { tagName: "mutation", children: [], hasnext: "false" },
      label: () => "すべてを止める",
      sample: "stopAll();"
    },
    {
      functionName: "stopThisScript",
      opcode: "control_stop",
      category: "制御",
      blockType: "stack",
      arguments: [],
      fixedFields: { STOP_OPTION: "this script" },
      mutation: { tagName: "mutation", children: [], hasnext: "false" },
      label: () => "このスクリプトを止める",
      sample: "stopThisScript();"
    },
    {
      functionName: "stopOtherScripts",
      opcode: "control_stop",
      category: "制御",
      blockType: "stack",
      arguments: [],
      fixedFields: { STOP_OPTION: "other scripts in sprite" },
      mutation: { tagName: "mutation", children: [], hasnext: "true" },
      label: () => "スプライトの他のスクリプトを止める",
      sample: "stopOtherScripts();"
    },
    {
      functionName: "whenIStartAsClone",
      opcode: "control_start_as_clone",
      category: "クローン",
      blockType: "hat",
      arguments: [SUB()],
      label: () => "クローンされたとき",
      sample: "whenIStartAsClone(() => { move(10); });"
    },
    {
      functionName: "whenCloned",
      opcode: "control_start_as_clone",
      category: "クローン",
      blockType: "hat",
      arguments: [SUB()],
      label: () => "クローンされたとき",
      sample: "whenCloned(() => { move(10); });"
    },
    {
      functionName: "createClone",
      opcode: "control_create_clone_of",
      category: "クローン",
      blockType: "stack",
      arguments: [M("target", "CLONE_OPTION", "_myself_", "control_create_clone_of_menu")],
      label: (args) => `${args[0]}のクローンを作る`,
      sample: "createClone(\"_myself_\");"
    },
    {
      functionName: "deleteThisClone",
      opcode: "control_delete_this_clone",
      category: "クローン",
      blockType: "stack",
      arguments: [],
      label: () => "このクローンを削除する",
      sample: "deleteThisClone();"
    },

    {
      functionName: "touchingObject",
      opcode: "sensing_touchingobject",
      category: "調べる",
      blockType: "boolean",
      arguments: [M("object", "TOUCHINGOBJECTMENU", "_edge_", "sensing_touchingobjectmenu")],
      label: (args) => `${args[0]}に触れた`,
      sample: "ifThen(touchingObject(\"_edge_\"), () => { move(-10); });"
    },
    {
      functionName: "touchingColor",
      opcode: "sensing_touchingcolor",
      category: "調べる",
      blockType: "boolean",
      arguments: [{ name: "color", scratchName: "COLOR", type: "color", role: "input", defaultValue: "#ff0000" }],
      label: (args) => `${args[0]}色に触れた`,
      sample: "ifThen(touchingColor(\"#ff0000\"), () => { say(\"赤\", 1); });"
    },
    {
      functionName: "colorTouchingColor",
      opcode: "sensing_coloristouchingcolor",
      category: "調べる",
      blockType: "boolean",
      arguments: [
        { name: "color", scratchName: "COLOR", type: "color", role: "input", defaultValue: "#ff0000" },
        { name: "touchingColor", scratchName: "COLOR2", type: "color", role: "input", defaultValue: "#0000ff" }
      ],
      label: (args) => `${args[0]}色が${args[1]}色に触れた`,
      sample: "ifThen(colorTouchingColor(\"#ff0000\", \"#0000ff\"), () => { say(\"当たり\", 1); });"
    },
    {
      functionName: "distanceTo",
      opcode: "sensing_distanceto",
      category: "調べる",
      blockType: "reporter",
      arguments: [M("target", "DISTANCETOMENU", "_mouse_", "sensing_distancetomenu")],
      label: (args) => `${args[0]}までの距離`,
      sample: "say(distanceTo(\"_mouse_\"), 1);"
    },
    {
      functionName: "askAndWait",
      opcode: "sensing_askandwait",
      category: "調べる",
      blockType: "stack",
      arguments: [S("question", "QUESTION", "名前は？")],
      label: (args) => `${args[0]}と聞いて待つ`,
      sample: "askAndWait(\"名前は？\");"
    },
    {
      functionName: "ask",
      opcode: "sensing_askandwait",
      category: "調べる",
      blockType: "stack",
      arguments: [S("question", "QUESTION", "名前は？")],
      label: (args) => `${args[0]}と聞いて待つ`,
      sample: "ask(\"名前は？\");"
    },
    {
      functionName: "answer",
      opcode: "sensing_answer",
      category: "調べる",
      blockType: "reporter",
      arguments: [],
      label: () => "答え",
      sample: "say(answer(), 1);"
    },
    {
      functionName: "keyPressed",
      opcode: "sensing_keypressed",
      category: "調べる",
      blockType: "boolean",
      arguments: [M("key", "KEY_OPTION", "space", "sensing_keyoptions")],
      label: (args) => `${args[0]}キーが押された`,
      sample: "ifThen(keyPressed(\"space\"), () => { move(10); });"
    },
    {
      functionName: "mouseDown",
      opcode: "sensing_mousedown",
      category: "調べる",
      blockType: "boolean",
      arguments: [],
      label: () => "マウスが押された",
      sample: "ifThen(mouseDown(), () => { say(\"クリック\", 1); });"
    },
    {
      functionName: "mouseX",
      opcode: "sensing_mousex",
      category: "調べる",
      blockType: "reporter",
      arguments: [],
      label: () => "マウスのx座標",
      sample: "setX(mouseX());"
    },
    {
      functionName: "mouseY",
      opcode: "sensing_mousey",
      category: "調べる",
      blockType: "reporter",
      arguments: [],
      label: () => "マウスのy座標",
      sample: "setY(mouseY());"
    },
    {
      functionName: "setDragMode",
      opcode: "sensing_setdragmode",
      category: "調べる",
      blockType: "stack",
      arguments: [F("mode", "DRAG_MODE", "draggable")],
      label: (args) => `ドラッグを${args[0]}にする`,
      sample: "setDragMode(\"draggable\");"
    },
    {
      functionName: "loudness",
      opcode: "sensing_loudness",
      category: "調べる",
      blockType: "reporter",
      arguments: [],
      label: () => "音の大きさ",
      sample: "say(loudness(), 1);"
    },
    {
      functionName: "timer",
      opcode: "sensing_timer",
      category: "調べる",
      blockType: "reporter",
      arguments: [],
      label: () => "タイマー",
      sample: "say(timer(), 1);"
    },
    {
      functionName: "resetTimer",
      opcode: "sensing_resettimer",
      category: "調べる",
      blockType: "stack",
      arguments: [],
      label: () => "タイマーをリセット",
      sample: "resetTimer();"
    },
    {
      functionName: "of",
      opcode: "sensing_of",
      category: "調べる",
      blockType: "reporter",
      arguments: [F("property", "PROPERTY", "x position"), M("object", "OBJECT", "_stage_", "sensing_of_object_menu")],
      label: (args) => `${args[1]}の${args[0]}`,
      sample: "say(of(\"x position\", \"Sprite1\"), 1);"
    },
    {
      functionName: "current",
      opcode: "sensing_current",
      category: "調べる",
      blockType: "reporter",
      arguments: [F("currentMenu", "CURRENTMENU", "YEAR")],
      label: (args) => `現在の${args[0]}`,
      sample: "say(current(\"YEAR\"), 1);"
    },
    {
      functionName: "daysSince2000",
      opcode: "sensing_dayssince2000",
      category: "調べる",
      blockType: "reporter",
      arguments: [],
      label: () => "2000年からの日数",
      sample: "say(daysSince2000(), 1);"
    },
    {
      functionName: "username",
      opcode: "sensing_username",
      category: "調べる",
      blockType: "reporter",
      arguments: [],
      label: () => "ユーザー名",
      sample: "say(username(), 1);"
    },

    {
      functionName: "add",
      opcode: "operator_add",
      category: "演算",
      blockType: "reporter",
      arguments: [N("a", "NUM1", 1), N("b", "NUM2", 1)],
      label: (args) => `${args[0]} + ${args[1]}`,
      sample: "say(add(1, 2), 1);"
    },
    {
      functionName: "subtract",
      opcode: "operator_subtract",
      category: "演算",
      blockType: "reporter",
      arguments: [N("a", "NUM1", 1), N("b", "NUM2", 1)],
      label: (args) => `${args[0]} - ${args[1]}`,
      sample: "say(subtract(5, 2), 1);"
    },
    {
      functionName: "multiply",
      opcode: "operator_multiply",
      category: "演算",
      blockType: "reporter",
      arguments: [N("a", "NUM1", 2), N("b", "NUM2", 3)],
      label: (args) => `${args[0]} * ${args[1]}`,
      sample: "say(multiply(2, 3), 1);"
    },
    {
      functionName: "divide",
      opcode: "operator_divide",
      category: "演算",
      blockType: "reporter",
      arguments: [N("a", "NUM1", 10), N("b", "NUM2", 2)],
      label: (args) => `${args[0]} / ${args[1]}`,
      sample: "say(divide(10, 2), 1);"
    },
    {
      functionName: "random",
      opcode: "operator_random",
      category: "演算",
      blockType: "reporter",
      arguments: [N("from", "FROM", 1), N("to", "TO", 10)],
      label: (args) => `${args[0]}から${args[1]}までの乱数`,
      sample: "move(random(1, 10));"
    },
    {
      functionName: "gt",
      opcode: "operator_gt",
      category: "演算",
      blockType: "boolean",
      arguments: [S("a", "OPERAND1", ""), S("b", "OPERAND2", "")],
      label: (args) => `${args[0]} > ${args[1]}`,
      sample: "ifThen(gt(xPosition(), 100), () => { say(\"右\", 1); });"
    },
    {
      functionName: "greaterThan",
      opcode: "operator_gt",
      category: "演算",
      blockType: "boolean",
      arguments: [S("a", "OPERAND1", ""), S("b", "OPERAND2", "")],
      label: (args) => `${args[0]} > ${args[1]}`,
      sample: "ifBlock(greaterThan(xPosition(), 100), () => { say(\"右\", 1); });"
    },
    {
      functionName: "lt",
      opcode: "operator_lt",
      category: "演算",
      blockType: "boolean",
      arguments: [S("a", "OPERAND1", ""), S("b", "OPERAND2", "")],
      label: (args) => `${args[0]} < ${args[1]}`,
      sample: "ifThen(lt(xPosition(), -100), () => { say(\"左\", 1); });"
    },
    {
      functionName: "lessThan",
      opcode: "operator_lt",
      category: "演算",
      blockType: "boolean",
      arguments: [S("a", "OPERAND1", ""), S("b", "OPERAND2", "")],
      label: (args) => `${args[0]} < ${args[1]}`,
      sample: "ifBlock(lessThan(xPosition(), -100), () => { say(\"左\", 1); });"
    },
    {
      functionName: "equals",
      opcode: "operator_equals",
      category: "演算",
      blockType: "boolean",
      arguments: [S("a", "OPERAND1", ""), S("b", "OPERAND2", "")],
      label: (args) => `${args[0]} = ${args[1]}`,
      sample: "ifThen(equals(answer(), \"はい\"), () => { say(\"OK\", 1); });"
    },
    {
      functionName: "and",
      opcode: "operator_and",
      category: "演算",
      blockType: "boolean",
      arguments: [B("a", "OPERAND1", false), B("b", "OPERAND2", false)],
      label: (args) => `${args[0]} かつ ${args[1]}`,
      sample: "ifThen(and(mouseDown(), keyPressed(\"space\")), () => { move(10); });"
    },
    {
      functionName: "or",
      opcode: "operator_or",
      category: "演算",
      blockType: "boolean",
      arguments: [B("a", "OPERAND1", false), B("b", "OPERAND2", false)],
      label: (args) => `${args[0]} または ${args[1]}`,
      sample: "ifThen(or(mouseDown(), keyPressed(\"space\")), () => { move(10); });"
    },
    {
      functionName: "not",
      opcode: "operator_not",
      category: "演算",
      blockType: "boolean",
      arguments: [B("condition", "OPERAND", false)],
      label: (args) => `${args[0]}ではない`,
      sample: "ifThen(not(mouseDown()), () => { say(\"はなした\", 1); });"
    },
    {
      functionName: "join",
      opcode: "operator_join",
      category: "演算",
      blockType: "reporter",
      arguments: [S("a", "STRING1", "hello"), S("b", "STRING2", "world")],
      label: (args) => `${args[0]} と ${args[1]} をつなぐ`,
      sample: "say(join(\"こんにちは\", \"！\"), 1);"
    },
    {
      functionName: "letterOf",
      opcode: "operator_letter_of",
      category: "演算",
      blockType: "reporter",
      arguments: [N("index", "LETTER", 1), S("text", "STRING", "world")],
      label: (args) => `${args[1]}の${args[0]}番目の文字`,
      sample: "say(letterOf(1, \"ABC\"), 1);"
    },
    {
      functionName: "lengthOf",
      opcode: "operator_length",
      category: "演算",
      blockType: "reporter",
      arguments: [S("text", "STRING", "world")],
      label: (args) => `${args[0]}の長さ`,
      sample: "say(lengthOf(\"こんにちは\"), 1);"
    },
    {
      functionName: "contains",
      opcode: "operator_contains",
      category: "演算",
      blockType: "boolean",
      arguments: [S("text", "STRING1", "apple"), S("part", "STRING2", "a")],
      label: (args) => `${args[0]}に${args[1]}が含まれる`,
      sample: "ifThen(contains(\"apple\", \"a\"), () => { say(\"ある\", 1); });"
    },
    {
      functionName: "mod",
      opcode: "operator_mod",
      category: "演算",
      blockType: "reporter",
      arguments: [N("a", "NUM1", 10), N("b", "NUM2", 3)],
      label: (args) => `${args[0]}を${args[1]}で割った余り`,
      sample: "say(mod(10, 3), 1);"
    },
    {
      functionName: "round",
      opcode: "operator_round",
      category: "演算",
      blockType: "reporter",
      arguments: [N("value", "NUM", 3.14)],
      label: (args) => `${args[0]}を四捨五入`,
      sample: "say(round(3.14), 1);"
    },
    {
      functionName: "mathOp",
      opcode: "operator_mathop",
      category: "演算",
      blockType: "reporter",
      arguments: [F("operator", "OPERATOR", "sqrt"), N("value", "NUM", 9)],
      label: (args) => `${args[0]}(${args[1]})`,
      sample: "say(mathOp(\"sqrt\", 9), 1);"
    },

    {
      functionName: "setVariable",
      opcode: "data_setvariableto",
      category: "変数",
      blockType: "stack",
      arguments: [{ name: "variable", scratchName: "VARIABLE", type: "variable", role: "field", defaultValue: "score" }, S("value", "VALUE", 0)],
      label: (args) => `変数${args[0]}を${args[1]}にする`,
      sample: "setVariable(\"score\", 0);"
    },
    {
      functionName: "changeVariable",
      opcode: "data_changevariableby",
      category: "変数",
      blockType: "stack",
      arguments: [{ name: "variable", scratchName: "VARIABLE", type: "variable", role: "field", defaultValue: "score" }, N("value", "VALUE", 1)],
      label: (args) => `変数${args[0]}を${args[1]}ずつ変える`,
      sample: "changeVariable(\"score\", 1);"
    },
    {
      functionName: "showVariable",
      opcode: "data_showvariable",
      category: "変数",
      blockType: "stack",
      arguments: [{ name: "variable", scratchName: "VARIABLE", type: "variable", role: "field", defaultValue: "score" }],
      label: (args) => `変数${args[0]}を表示する`,
      sample: "showVariable(\"score\");"
    },
    {
      functionName: "hideVariable",
      opcode: "data_hidevariable",
      category: "変数",
      blockType: "stack",
      arguments: [{ name: "variable", scratchName: "VARIABLE", type: "variable", role: "field", defaultValue: "score" }],
      label: (args) => `変数${args[0]}を隠す`,
      sample: "hideVariable(\"score\");"
    },
    {
      functionName: "variable",
      opcode: "data_variable",
      category: "変数",
      blockType: "reporter",
      arguments: [{ name: "variable", scratchName: "VARIABLE", type: "variable", role: "field", defaultValue: "score" }],
      label: (args) => `変数${args[0]}`,
      sample: "say(variable(\"score\"), 1);"
    },
    {
      functionName: "getVariable",
      opcode: "data_variable",
      category: "変数",
      blockType: "reporter",
      arguments: [{ name: "variable", scratchName: "VARIABLE", type: "variable", role: "field", defaultValue: "score" }],
      label: (args) => `変数${args[0]}`,
      sample: "say(getVariable(\"score\"), 1);"
    },
    {
      functionName: "addToList",
      opcode: "data_addtolist",
      category: "リスト",
      blockType: "stack",
      arguments: [S("item", "ITEM", "thing"), { name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `${args[0]}をリスト${args[1]}に追加する`,
      sample: "addToList(\"りんご\", \"items\");"
    },
    {
      functionName: "deleteOfList",
      opcode: "data_deleteoflist",
      category: "リスト",
      blockType: "stack",
      arguments: [IDX("index", "INDEX", 1), { name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[1]}の${args[0]}番目を削除する`,
      sample: "deleteOfList(1, \"items\");"
    },
    {
      functionName: "deleteAllOfList",
      opcode: "data_deletealloflist",
      category: "リスト",
      blockType: "stack",
      arguments: [{ name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[0]}をすべて削除する`,
      sample: "deleteAllOfList(\"items\");"
    },
    {
      functionName: "insertAtList",
      opcode: "data_insertatlist",
      category: "リスト",
      blockType: "stack",
      arguments: [IDX("index", "INDEX", 1), S("item", "ITEM", "thing"), { name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `${args[1]}をリスト${args[2]}の${args[0]}番目に入れる`,
      sample: "insertAtList(1, \"りんご\", \"items\");"
    },
    {
      functionName: "replaceItemOfList",
      opcode: "data_replaceitemoflist",
      category: "リスト",
      blockType: "stack",
      arguments: [IDX("index", "INDEX", 1), S("item", "ITEM", "thing"), { name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[2]}の${args[0]}番目を${args[1]}で置き換える`,
      sample: "replaceItemOfList(1, \"みかん\", \"items\");"
    },
    {
      functionName: "itemOfList",
      opcode: "data_itemoflist",
      category: "リスト",
      blockType: "reporter",
      arguments: [IDX("index", "INDEX", 1), { name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[1]}の${args[0]}番目`,
      sample: "say(itemOfList(1, \"items\"), 1);"
    },
    {
      functionName: "itemNumOfList",
      opcode: "data_itemnumoflist",
      category: "リスト",
      blockType: "reporter",
      arguments: [S("item", "ITEM", "thing"), { name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[1]}で${args[0]}が何番目か`,
      sample: "say(itemNumOfList(\"りんご\", \"items\"), 1);"
    },
    {
      functionName: "lengthOfList",
      opcode: "data_lengthoflist",
      category: "リスト",
      blockType: "reporter",
      arguments: [{ name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[0]}の長さ`,
      sample: "say(lengthOfList(\"items\"), 1);"
    },
    {
      functionName: "listContains",
      opcode: "data_listcontainsitem",
      category: "リスト",
      blockType: "boolean",
      arguments: [{ name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }, S("item", "ITEM", "thing")],
      label: (args) => `リスト${args[0]}に${args[1]}が含まれる`,
      sample: "ifThen(listContains(\"items\", \"りんご\"), () => { say(\"ある\", 1); });"
    },
    {
      functionName: "showList",
      opcode: "data_showlist",
      category: "リスト",
      blockType: "stack",
      arguments: [{ name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[0]}を表示する`,
      sample: "showList(\"items\");"
    },
    {
      functionName: "hideList",
      opcode: "data_hidelist",
      category: "リスト",
      blockType: "stack",
      arguments: [{ name: "list", scratchName: "LIST", type: "list", role: "field", defaultValue: "items" }],
      label: (args) => `リスト${args[0]}を隠す`,
      sample: "hideList(\"items\");"
    }
  ]);

  /* 独自ブロックはmutationとプロトタイプの保存形式が複雑なため、確認できるまで安全に停止します。 */
  [
    "defineProcedure",
    "callProcedure",
    "argumentStringNumber",
    "argumentBoolean"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "独自ブロック",
      reason: "procedures_definition / procedures_prototype / procedures_call のmutation構造を実物.sb3で確認してから対応します。",
      nextStep: "Stretch3本家で最小の独自ブロック.sb3を作り、解析モードでproject.jsonを確認してください。"
    });
  });

  /* 変数スライダーはmonitor保存形式を正確に確認できるまで生成しません。 */
  R.registerUnsupported({
    functionName: "showVariableSlider",
    category: "変数モニター",
    reason: "Scratch/Stretch3のmonitors配列とsliderMin/sliderMax保存形式を実物.sb3で確認するまで、推測生成しません。",
    nextStep: "Stretch3本家で変数スライダーを表示した最小.sb3を作り、解析モードでmonitorsを確認してください。"
  });

})();
