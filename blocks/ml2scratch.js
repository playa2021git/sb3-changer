/* ML2Scratchは実装ソース確認済みですが、実物.sb3保存形確認まで変換を止めます。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/champierre/ml2scratch/blob/master/scratch-vm/src/extensions/scratch3_ml2scratch/index.js";

  [
    "mlLabel",
    "mlConfidence",
    "mlIsDetected"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "ML2Scratch",
      source,
      reason: "ML2ScratchのgetInfo()は確認済みですが、このStretchScript関数とのproject.json保存形対応が未確認です。",
      nextStep: "Stretch3本家でML2Scratchの最小 .sb3 を作り、拡張ブロック解析モードでopcode/inputs/fieldsを確認してください。"
    });
  });
})();
