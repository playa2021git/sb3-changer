/* CameraSelectorは公式fixtureで確認した1ブロックだけを有効化します。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/tfabworks/xcx-cameraselector/blob/8ada859f8d6b2e978a3c1bd5cebc5f1af8ce2088/src/vm/extensions/block/index.js";
  const extensionURL = "https://tfabworks.github.io/xcx-cameraselector/dist/cameraselector.mjs";
  const defaultCamera = "\u200b標準カメラ\u200b";

  R.registerMany([
    {
      functionName: "selectCamera",
      extensionId: "cameraselector",
      extensionURL,
      extensionNote: window.StretchScriptExtensionNotes.cameraselector,
      opcode: "cameraselector_selectCamera",
      category: "カメラセレクター",
      blockType: "stack",
      arguments: [
        {
          name: "camera",
          scratchName: "LIST",
          type: "menuInput",
          role: "input",
          defaultValue: defaultCamera,
          menuOpcode: "cameraselector_menu_videoDevicesMenu",
          menuField: "videoDevicesMenu"
        }
      ],
      sample: `selectCamera("${defaultCamera}");`,
      description: "カメラ名を動的メニューshadowとして保存する。保存形は公式fixtureで確認済み。",
      source
    }
  ]);

  R.registerUnsupported({
    functionName: "cameraName",
    category: "カメラセレクター",
    source,
    reason: "固定した公式getInfo()に cameraName ブロックは存在しません。",
    nextStep: "必要ならselectCameraの動的メニュー値を使い、独自ヘルパーとしては別途仕様化してください。"
  });
})();
