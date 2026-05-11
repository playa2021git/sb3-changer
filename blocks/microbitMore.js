/*
<<<<<<< codex/output-git-diff-and-changes-for-commit-c8bd693
 * Microbit More は fixture で project.json 保存形を確認できたものだけを有効化します。
=======
 * Microbit More は fixture で project.json 保存形を確認できるまで安全停止を維持します。
 * - verified: registerBlock 可能な確認済み定義（現時点は空）
 * - unverified: 未確認のため registerUnsupported に固定する定義
>>>>>>> main
 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
<<<<<<< codex/output-git-diff-and-changes-for-commit-c8bd693
  const source = "Mirobitmoretest.sb3 + 揺さぶられたとき音を鳴らす.sb3 (project.json実測)";

  const F = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "menu",
    defaultValue,
    role: "field",
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
  const N = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "number",
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
      functionName: "whenMicrobitButtonPressed",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenButtonEvent",
      category: "Microbit More",
      blockType: "hat",
      fixedFields: { EVENT: "DOWN" },
      arguments: [
        F("button", "NAME", "A", { allowedValues: ["A", "B"] }),
        SUB()
      ],
      sample: "whenMicrobitButtonPressed(\"A\", () => { microbitDisplayText(\"2\", 120); });",
      description: "A/Bボタン押下（DOWN）で実行。fixture確認済み値のみ許可。",
      source
    },
    {
      functionName: "ifMicrobitButtonPressed",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenButtonEvent",
      category: "Microbit More",
      blockType: "hat",
      fixedFields: { EVENT: "DOWN" },
      arguments: [
        F("button", "NAME", "A", { allowedValues: ["A", "B"] }),
        SUB()
      ],
      sample: "ifMicrobitButtonPressed(\"A\", () => { microbitDisplayText(\"2\", 120); });",
      description: "互換エイリアス（推奨: whenMicrobitButtonPressed）。",
      source
    },
    {
      functionName: "microbitDisplayText",
      extensionId: "microbitMore",
      opcode: "microbitMore_displayText",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        S("text", "TEXT", "Hello!"),
        N("delay", "DELAY", 120)
      ],
      sample: "microbitDisplayText(\"Hello!\", 120);",
      description: "micro:bitに文字を表示する。delay省略時の既定値は120。",
      source
    },
    {
      functionName: "whenMicrobitShaken",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenGesture",
      category: "Microbit More",
      blockType: "hat",
      fixedFields: { GESTURE: "SHAKE" },
      arguments: [SUB()],
      sample: "whenMicrobitShaken(() => { microbitPlayTone(440, 100); wait(1); microbitStopTone(); });",
      description: "ゆさぶられたとき（SHAKE）のみ対応。",
      source
    },
    {
      functionName: "whenMicrobitGesture",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenGesture",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        F("gesture", "GESTURE", "SHAKE", { allowedValues: ["SHAKE"] }),
        SUB()
      ],
      sample: "whenMicrobitGesture(\"SHAKE\", () => { microbitPlayTone(440, 100); });",
      description: "互換用。現時点では SHAKE のみ許可。",
      source
    },
    {
      functionName: "microbitPlayTone",
      extensionId: "microbitMore",
      opcode: "microbitMore_playTone",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        N("freq", "FREQ", 440),
        N("volume", "VOL", 100, { optional: true })
      ],
      sample: "microbitPlayTone(440, 100);",
      description: "指定周波数で音を鳴らす。volume省略時は100。",
      source
    },
    {
      functionName: "microbitStopTone",
      extensionId: "microbitMore",
      opcode: "microbitMore_stopTone",
      category: "Microbit More",
      blockType: "stack",
      arguments: [],
      sample: "microbitStopTone();",
      description: "鳴らしている音を停止する。",
      source
    }
  ]);
=======
  const source = "https://github.com/microbit-more/mbit-more-v2";

  // 実物 .sb3 fixture で opcode / inputs / fields / menu値 / shadow型 を確認できた後にのみ追加する。
  const verified = [];

  R.registerMany(verified);
>>>>>>> main

  [
    "microbitButtonPressed",
    "microbitTiltAngle",
    "microbitDisplayMatrix",
    "microbitSetServo"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "Microbit More",
      source,
<<<<<<< codex/output-git-diff-and-changes-for-commit-c8bd693
      reason: "今回の対応範囲外です（servo/matrix/未確認値は最小実装対象外）。",
      nextStep: "実機での再現性と fixture を揃えてから、1〜2ブロック単位で有効化してください。"
=======
      reason: "Microbit Moreの対象ブロックは project.json 保存形（opcode/inputs/fields/menu値/hat構造）が fixture 未確認です。",
      nextStep: "Stretch3本家またはMicrobit More環境で最小 .sb3 fixture を作成し、保存形を確認してください。"
>>>>>>> main
    });
  });
})();
