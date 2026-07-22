/* 実物fixtureは確認済みです。変換処理を実装するまでは安全に停止します。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/tfabworks/xcx-cameraselector/blob/8ada859f8d6b2e978a3c1bd5cebc5f1af8ce2088/src/vm/extensions/block/index.js";

  R.registerUnsupported({
    functionName: "selectCamera",
    category: "カメラセレクター",
    source,
    reason: "公式fixtureで保存形は確認済みですが、sb3-changerの生成処理は未実装です。",
    nextStep: "definitions/camera-selector.json と実物fixtureに一致する変換処理を実装してください。"
  });

  R.registerUnsupported({
    functionName: "cameraName",
    category: "カメラセレクター",
    source,
    reason: "固定した公式getInfo()に cameraName ブロックは存在しません。",
    nextStep: "必要ならselectCameraの動的メニュー値を使い、独自ヘルパーとしては別途仕様化してください。"
  });
})();
