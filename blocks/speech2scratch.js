/* 実物fixtureは確認済みです。変換処理を実装するまでは安全に停止します。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/champierre/speech2scratch/blob/b6d0f4ed9d349d620c0ccba74acf75e90505d09b/scratch-vm/src/extensions/scratch3_speech2scratch/index.js";

  [
    "speechText",
    "startSpeechRecognition"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "Speech2Scratch",
      source,
      reason: "公式fixtureで保存形は確認済みですが、sb3-changerの生成処理は未実装です。",
      nextStep: "definitions/speech2scratch.json と実物fixtureに一致する変換処理を実装してください。"
    });
  });

  R.registerUnsupported({
    functionName: "speechContains",
    category: "Speech2Scratch",
    source,
    reason: "固定した公式getInfo()に speechContains ブロックは存在しません。",
    nextStep: "speechText()と標準の文字列演算ブロックを組み合わせてください。"
  });
})();
