/* Scratch公式の翻訳拡張を使うための定義です。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const ext = "translate";

  R.registerMany([
    {
      functionName: "translate",
      opcode: "translate_getTranslate",
      category: "翻訳",
      extensionId: ext,
      blockType: "reporter",
      arguments: [
        { name: "words", scratchName: "WORDS", type: "stringOrReporter", role: "input", defaultValue: "Hello" },
        { name: "language", scratchName: "LANGUAGE", type: "menu", role: "field", defaultValue: "ja" }
      ],
      label: (args) => `${args[0]}を${args[1]}に翻訳`,
      sample: "say(translate(\"Hello\", \"ja\"), 2);"
    },
    {
      functionName: "viewerLanguage",
      opcode: "translate_getViewerLanguage",
      category: "翻訳",
      extensionId: ext,
      blockType: "reporter",
      arguments: [],
      label: () => "見る人の言語",
      sample: "say(viewerLanguage(), 1);"
    }
  ]);
})();
