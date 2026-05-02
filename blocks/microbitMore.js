/* Microbit Moreは実物.sb3保存形確認まで変換を止めます。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/microbit-more/mbit-more-v2/blob/master/src/vm/extensions/block/index.js";

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
      reason: "Microbit Moreの実装ソースでは id: microbitMore を確認済みですが、対象ブロックの正確なopcode/inputs/project.json保存形が未確認です。",
      nextStep: "Stretch3本家またはMicrobit More環境で最小 .sb3 を作り、拡張ブロック解析モードで確認してください。"
    });
  });
})();
