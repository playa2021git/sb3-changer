/* Speech2Scratchは実装ソース確認済みですが、実物.sb3保存形確認まで変換を止めます。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "https://github.com/champierre/speech2scratch/blob/master/scratch-vm/src/extensions/scratch3_speech2scratch/index.js";

  [
    "speechText",
    "speechContains",
    "startSpeechRecognition"
  ].forEach((functionName) => {
    R.registerUnsupported({
      functionName,
      category: "Speech2Scratch",
      source,
      reason: "Speech2ScratchのgetInfo()は確認済みですが、このStretchScript関数とのproject.json保存形対応が未確認です。",
      nextStep: "Stretch3本家でSpeech2Scratchの最小 .sb3 を作り、拡張ブロック解析モードで確認してください。"
    });
  });
})();
