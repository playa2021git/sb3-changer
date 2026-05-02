/* Scratch公式の音声合成拡張を使うための定義です。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const ext = "text2speech";

  R.registerMany([
    {
      functionName: "speak",
      opcode: "text2speech_speakAndWait",
      category: "音声合成",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "words", scratchName: "WORDS", type: "stringOrReporter", role: "input", defaultValue: "こんにちは" }],
      label: (args) => `${args[0]} としゃべる`,
      sample: "speak(\"こんにちは\");"
    },
    {
      functionName: "setVoice",
      opcode: "text2speech_setVoice",
      category: "音声合成",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "voice", scratchName: "VOICE", type: "menu", role: "field", defaultValue: "alto" }],
      label: (args) => `声を${args[0]}にする`,
      sample: "setVoice(\"alto\");"
    },
    {
      functionName: "setSpeechLanguage",
      opcode: "text2speech_setLanguage",
      category: "音声合成",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "language", scratchName: "LANGUAGE", type: "menu", role: "field", defaultValue: "ja" }],
      label: (args) => `しゃべる言語を${args[0]}にする`,
      sample: "setSpeechLanguage(\"ja\");"
    }
  ]);
})();
