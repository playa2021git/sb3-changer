/* ImageClassifier2Scratchは実装ソース確認済みですが、実物.sb3保存形確認まで変換を止めます。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/champierre/ic2scratch/blob/master/scratch-vm/src/extensions/scratch3_ic2scratch/index.js";

  [
    "imageClassifiedAs",
    "ifImageClassifiedAs",
    "classifiedLabel"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "ImageClassifier2Scratch",
      source,
      reason: "ImageClassifier2Scratchの実装ソースでは id: ic2scratch / getResult1 などを確認済みですが、このStretchScript関数を安全なproject.jsonへ変換する保存形が未確認です。",
      nextStep: "Stretch3本家で同じブロックを手作業で作った .sb3 を解析してから対応します。"
    });
  });
})();
