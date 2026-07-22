/* Speech2Scratchは公式fixtureで確認した2ブロックだけを有効化します。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/champierre/speech2scratch/blob/b6d0f4ed9d349d620c0ccba74acf75e90505d09b/scratch-vm/src/extensions/scratch3_speech2scratch/index.js";
  const extensionURL = "https://champierre.github.io/speech2scratch/speech2scratch.mjs";

  R.registerMany([
    {
      functionName: "startSpeechRecognition",
      extensionId: "speech2scratch",
      extensionURL,
      extensionNote: window.StretchScriptExtensionNotes.speech2scratch,
      opcode: "speech2scratch_startRecognition",
      category: "Speech2Scratch",
      blockType: "stack",
      arguments: [],
      sample: "startSpeechRecognition();",
      description: "音声認識を開始する。保存形は公式fixtureで確認済み。",
      source
    },
    {
      functionName: "speechText",
      extensionId: "speech2scratch",
      extensionURL,
      extensionNote: window.StretchScriptExtensionNotes.speech2scratch,
      opcode: "speech2scratch_getSpeech",
      category: "Speech2Scratch",
      blockType: "reporter",
      arguments: [],
      sample: "sayNow(speechText());",
      description: "認識した音声を文字列として返す。保存形は公式fixtureで確認済み。",
      source
    }
  ]);

  R.registerUnsupported({
    functionName: "speechContains",
    category: "Speech2Scratch",
    source,
    reason: "固定した公式getInfo()に speechContains ブロックは存在しません。",
    nextStep: "speechText()と標準の文字列演算ブロックを組み合わせてください。"
  });
})();
