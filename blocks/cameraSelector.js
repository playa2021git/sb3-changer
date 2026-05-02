/* カメラセレクターは実物.sb3保存形確認まで変換を止めます。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;

  [
    "selectCamera",
    "cameraName"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "カメラセレクター",
      reason: "カメラセレクターのopcode/project.json保存形が未確認です。",
      nextStep: "Stretch3本家でカメラセレクターの最小 .sb3 を作り、拡張ブロック解析モードで確認してください。"
    });
  });
})();
