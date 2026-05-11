/*
 * Microbit More は fixture で project.json 保存形を確認できるまで安全停止を維持します。
 * - verified: registerBlock 可能な確認済み定義（現時点は空）
 * - unverified: 未確認のため registerUnsupported に固定する定義
 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/microbit-more/mbit-more-v2";

  // 実物 .sb3 fixture で opcode / inputs / fields / menu値 / shadow型 を確認できた後にのみ追加する。
  const verified = [];

  R.registerMany(verified);

  [
    "microbitButtonPressed",
    "ifMicrobitButtonPressed",
    "microbitTiltAngle",
    "microbitDisplayText"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "Microbit More",
      source,
      reason: "Microbit Moreの対象ブロックは project.json 保存形（opcode/inputs/fields/menu値/hat構造）が fixture 未確認です。",
      nextStep: "Stretch3本家またはMicrobit More環境で最小 .sb3 fixture を作成し、保存形を確認してください。"
    });
  });
})();
