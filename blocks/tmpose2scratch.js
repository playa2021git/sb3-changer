/* TMPose2Scratchは実物.sb3保存形確認まで変換を止めます。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/champierre/tmpose2scratch/blob/master/scratch-vm/src/extensions/scratch3_tmpose2scratch/index.js";

  [
    "tmPoseLabel",
    "tmPoseConfidence",
    "tmPoseIs"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "TMPose2Scratch",
      source,
      reason: "TMPose2Scratchの実装ソースでは id: tmpose2scratch / isPoseLabelDetected などを確認済みですが、このStretchScript関数とのproject.json保存形対応が未確認です。",
      nextStep: "Stretch3本家でTMPose2Scratchの最小 .sb3 を作り、拡張ブロック解析モードで確認してください。"
    });
  });
})();
