/* Scratch公式のペン拡張を使うための定義です。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const ext = "pen";

  R.registerMany([
    {
      functionName: "penClear",
      opcode: "pen_clear",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [],
      label: () => "ペンを全部消す",
      sample: "penClear();"
    },
    {
      functionName: "penStamp",
      opcode: "pen_stamp",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [],
      label: () => "スタンプする",
      sample: "penStamp();"
    },
    {
      functionName: "penDown",
      opcode: "pen_penDown",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [],
      label: () => "ペンを下ろす",
      sample: "penDown();"
    },
    {
      functionName: "penUp",
      opcode: "pen_penUp",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [],
      label: () => "ペンを上げる",
      sample: "penUp();"
    },
    {
      functionName: "setPenColor",
      opcode: "pen_setPenColorToColor",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "color", scratchName: "COLOR", type: "color", role: "input", defaultValue: "#ff0000" }],
      label: (args) => `ペンの色を${args[0]}にする`,
      sample: "setPenColor(\"#ff0000\");"
    },
    {
      functionName: "changePenSize",
      opcode: "pen_changePenSizeBy",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "size", scratchName: "SIZE", type: "number", role: "input", defaultValue: 1 }],
      label: (args) => `ペンの太さを${args[0]}ずつ変える`,
      sample: "changePenSize(1);"
    },
    {
      functionName: "setPenSize",
      opcode: "pen_setPenSizeTo",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "size", scratchName: "SIZE", type: "number", role: "input", defaultValue: 1 }],
      label: (args) => `ペンの太さを${args[0]}にする`,
      sample: "setPenSize(3);"
    },
    {
      functionName: "changePenColorParam",
      opcode: "pen_changePenColorParamBy",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [
        { name: "param", scratchName: "COLOR_PARAM", type: "menu", role: "field", defaultValue: "color" },
        { name: "value", scratchName: "VALUE", type: "number", role: "input", defaultValue: 10 }
      ],
      label: (args) => `ペンの${args[0]}を${args[1]}ずつ変える`,
      sample: "changePenColorParam(\"color\", 10);"
    },
    {
      functionName: "setPenColorParam",
      opcode: "pen_setPenColorParamTo",
      category: "ペン",
      extensionId: ext,
      blockType: "stack",
      arguments: [
        { name: "param", scratchName: "COLOR_PARAM", type: "menu", role: "field", defaultValue: "color" },
        { name: "value", scratchName: "VALUE", type: "number", role: "input", defaultValue: 50 }
      ],
      label: (args) => `ペンの${args[0]}を${args[1]}にする`,
      sample: "setPenColorParam(\"color\", 50);"
    }
  ]);
})();
