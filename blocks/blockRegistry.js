/* ブロック定義を集めるための小さなレジストリです。 */
(function () {
  "use strict";

  const registry = {
    definitions: new Map(),
    unsupported: new Map(),
    categories: new Map(),
    extensionInfo: new Map()
  };

  const VERIFIED_EXTENSION_IDS = new Set(["pen", "music", "translate", "text2speech"]);

  /* 画面表示とproject.json生成の両方で同じ定義を使うための登録関数です。 */
  function registerBlock(definition) {
    if (!definition || !definition.functionName || !definition.opcode) {
      throw new Error("ブロック定義にはfunctionNameとopcodeが必要です。");
    }

    const normalized = {
      category: "その他",
      extensionId: null,
      blockType: "stack",
      arguments: [],
      shadowBuilder: "typeBasedShadowValue",
      verified: definition.extensionId ? VERIFIED_EXTENSION_IDS.has(definition.extensionId) : true,
      sample: "",
      description: "",
      ...definition
    };

    registry.definitions.set(normalized.functionName, normalized);

    if (!registry.categories.has(normalized.category)) {
      registry.categories.set(normalized.category, []);
    }
    registry.categories.get(normalized.category).push(normalized.functionName);

    if (normalized.extensionId) {
      registry.extensionInfo.set(normalized.extensionId, {
        extensionId: normalized.extensionId,
        category: normalized.category,
        note: normalized.extensionNote || "Stretch3側で同じ拡張機能を追加すると実行できます。"
      });
    }
  }

  /* 複数ファイルから安全にまとめて登録するための関数です。 */
  function registerMany(definitions) {
    definitions.forEach(registerBlock);
  }

  /* 未確認の外部拡張は、偽opcodeを持つブロックとして登録せず、変換前に止めます。 */
  function registerUnsupported(definition) {
    if (!definition || !definition.functionName) {
      throw new Error("未対応定義にはfunctionNameが必要です。");
    }
    registry.unsupported.set(definition.functionName, {
      category: "未確認拡張",
      reason: "内部opcodeとproject.json保存形が未確認です。",
      nextStep: "Stretch3本家で同じブロックを手作業で作った .sb3 を解析してください。",
      ...definition
    });
  }

  /* 未対応命令のとき、どのファイルへ追加すればよいかを案内します。 */
  function guessDefinitionFile(functionName) {
    const lower = String(functionName).toLowerCase();
    const rules = [
      ["microbit", "blocks/microbitMore.js"],
      ["pose", "blocks/posenet2scratch.js または blocks/tmpose2scratch.js"],
      ["tm", "blocks/tm2scratch.js"],
      ["speech", "blocks/speech2scratch.js"],
      ["image", "blocks/imageClassifier2scratch.js"],
      ["camera", "blocks/cameraSelector.js"],
      ["pen", "blocks/penBlocks.js"],
      ["music", "blocks/musicBlocks.js"],
      ["speak", "blocks/textToSpeechBlocks.js"],
      ["voice", "blocks/textToSpeechBlocks.js"],
      ["translate", "blocks/translateBlocks.js"],
      ["ml", "blocks/ml2scratch.js"]
    ];

    const matched = rules.find(([keyword]) => lower.includes(keyword));
    return matched ? matched[1] : "blocks/coreBlocks.js または対応する blocks/*.js";
  }

  /* 型名を中学生にも読める説明へ変換します。 */
  function typeLabel(type) {
    const labels = {
      number: "数値",
      integer: "整数",
      positiveNumber: "0より大きい数値",
      positiveInteger: "1以上の整数",
      string: "文字列",
      stringOrReporter: "文字列または値ブロック",
      boolean: "真偽ブロック",
      color: "色",
      menu: "選択肢",
      menuInput: "選択肢",
      variable: "変数名",
      list: "リスト名",
      listIndex: "リストの場所",
      broadcast: "メッセージ名",
      broadcastInput: "メッセージ名",
      substack: "中に入れるブロック",
      any: "値"
    };
    return labels[type] || type;
  }

  /* Scratchの入力配列でよく使う影ブロック値を作ります。 */
  function makeShadowValue(type, value) {
    if (type === "color") {
      return [9, String(value || "#ff6680")];
    }
    if (type === "string" || type === "stringOrReporter" || type === "any") {
      return [10, value == null ? "" : String(value)];
    }
    if (type === "positiveInteger") {
      return [6, value == null ? "1" : String(value)];
    }
    if (type === "listIndex") {
      const text = value == null ? "1" : String(value);
      return /^-?\d+(\.\d+)?$/.test(text) ? [7, text] : [10, text];
    }
    if (type === "integer") {
      return [7, value == null ? "0" : String(value)];
    }
    if (type === "angle") {
      return [8, value == null ? "90" : String(value)];
    }
    if (type === "positiveNumber") {
      return [5, value == null ? "1" : String(value)];
    }
    return [4, value == null ? "0" : String(value)];
  }

  window.StretchScriptBlocks = {
    registerBlock,
    registerMany,
    registerUnsupported,
    get(functionName) {
      return registry.definitions.get(functionName);
    },
    getUnsupported(functionName) {
      return registry.unsupported.get(functionName);
    },
    has(functionName) {
      return registry.definitions.has(functionName);
    },
    all() {
      return Array.from(registry.definitions.values());
    },
    unsupportedAll() {
      return Array.from(registry.unsupported.values());
    },
    categories() {
      return Array.from(registry.categories.entries());
    },
    extensionInfo() {
      return Array.from(registry.extensionInfo.values());
    },
    guessDefinitionFile,
    typeLabel,
    makeShadowValue
  };
})();
