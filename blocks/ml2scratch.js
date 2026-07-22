/* ML2Scratchは公式fixtureで保存形を確認できた6ブロックだけを有効化します。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "definitions/ml2scratch.json (公式commit 1747c6a + 公式1or2.sb3 fixture)";
  const extensionURL = "https://champierre.github.io/ml2scratch/ml2scratch.mjs";

  const F = (name, scratchName, defaultValue, allowedValues) => ({
    name,
    scratchName,
    type: "menu",
    defaultValue,
    allowedValues,
    role: "field"
  });

  const SUB = () => ({
    name: "body",
    scratchName: "SUBSTACK",
    type: "substack",
    role: "substack"
  });

  const common = {
    extensionId: "ml2scratch",
    extensionURL,
    extensionNote: window.StretchScriptExtensionNotes.ml2scratch,
    category: "ML2Scratch",
    source
  };

  R.registerMany([
    {
      ...common,
      functionName: "mlAddExample1",
      opcode: "ml2scratch_addExample1",
      blockType: "stack",
      arguments: [],
      sample: "mlAddExample1();",
      description: "現在の画像をラベル1の学習例として追加する。"
    },
    {
      ...common,
      functionName: "mlAddExample2",
      opcode: "ml2scratch_addExample2",
      blockType: "stack",
      arguments: [],
      sample: "mlAddExample2();",
      description: "現在の画像をラベル2の学習例として追加する。"
    },
    {
      ...common,
      functionName: "mlAddExample3",
      opcode: "ml2scratch_addExample3",
      blockType: "stack",
      arguments: [],
      sample: "mlAddExample3();",
      description: "現在の画像をラベル3の学習例として追加する。"
    },
    {
      ...common,
      functionName: "whenMlLabelReceived",
      opcode: "ml2scratch_whenReceived",
      blockType: "hat",
      arguments: [
        F("label", "LABEL", "1", ["1", "2"]),
        SUB()
      ],
      sample: "whenMlLabelReceived(\"1\", () => { sayNow(\"1\"); });",
      description: "認識ラベル1または2を受け取ったときに実行する。fixture確認値だけを許可。"
    },
    {
      ...common,
      functionName: "mlSetVideo",
      opcode: "ml2scratch_videoToggle",
      blockType: "stack",
      arguments: [F("state", "VIDEO_STATE", "off", ["off"])],
      sample: "mlSetVideo(\"off\");",
      description: "ビデオ表示を切る。公式fixtureで確認できたoffだけを許可。"
    },
    {
      ...common,
      functionName: "mlSetInput",
      opcode: "ml2scratch_setInput",
      blockType: "stack",
      arguments: [F("input", "INPUT", "stage", ["stage"])],
      sample: "mlSetInput(\"stage\");",
      description: "学習入力をステージ画像にする。公式fixtureで確認できたstageだけを許可。"
    }
  ]);

  const unsupportedBlocks = [
    ["mlTrain", "ml2scratch_train"],
    ["mlTrainLabel", "ml2scratch_trainAny"],
    ["mlLabel", "ml2scratch_getLabel"],
    ["whenMlCustomLabelReceived", "ml2scratch_whenReceivedAny"],
    ["mlExampleCount1", "ml2scratch_getCountByLabel1"],
    ["mlExampleCount2", "ml2scratch_getCountByLabel2"],
    ["mlExampleCount3", "ml2scratch_getCountByLabel3"],
    ["mlExampleCount4", "ml2scratch_getCountByLabel4"],
    ["mlExampleCount5", "ml2scratch_getCountByLabel5"],
    ["mlExampleCount6", "ml2scratch_getCountByLabel6"],
    ["mlExampleCount7", "ml2scratch_getCountByLabel7"],
    ["mlExampleCount8", "ml2scratch_getCountByLabel8"],
    ["mlExampleCount9", "ml2scratch_getCountByLabel9"],
    ["mlExampleCount10", "ml2scratch_getCountByLabel10"],
    ["mlExampleCountForLabel", "ml2scratch_getCountByLabel"],
    ["mlReset", "ml2scratch_reset"],
    ["mlResetLabel", "ml2scratch_resetAny"],
    ["mlDownloadLearningData", "ml2scratch_download"],
    ["mlUploadLearningData", "ml2scratch_upload"],
    ["mlSetClassification", "ml2scratch_toggleClassification"],
    ["mlSetClassificationInterval", "ml2scratch_setClassificationInterval"],
    ["mlSetVideoTransparency", "ml2scratch_setVideoTransparency"],
    ["mlSwitchCamera", "ml2scratch_switchCamera"]
  ];

  unsupportedBlocks.forEach(([functionName, opcode]) => {
    R.registerUnsupported({
      functionName,
      opcode,
      category: "ML2Scratch",
      source,
      reason: "公式getInfo()にはありますが、収録fixtureにこのブロックの実物保存形がありません。",
      nextStep: "definitions/ml2scratch.jsonでfixtureStatusがverifiedになるまで安全停止します。"
    });
  });

  ["mlConfidence", "mlIsDetected"].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "ML2Scratch",
      source,
      reason: "固定した公式getInfo()に対応する同名ブロックが存在しません。",
      nextStep: "mlLabel()など公式台帳にある関数を、fixture確認後に使用してください。"
    });
  });
})();
