/* Posenet2Scratchは実物.sb3保存形確認まで変換を止めます。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/champierre/posenet2scratch/blob/master/scratch-vm/src/extensions/scratch3_posenet2scratch/index.js";

  [
    "poseX",
    "poseY",
    "poseScore"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "Posenet2Scratch",
      source,
      reason: "Posenet2Scratchの実装ソースでは id: posenet2scratch / getX / getY などを確認済みですが、このStretchScript関数とのproject.json保存形対応が未確認です。",
      nextStep: "Stretch3本家でPosenet2Scratchの最小 .sb3 を作り、拡張ブロック解析モードで確認してください。"
    });
  });
})();
