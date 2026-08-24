/* ブロック定義を集めるための小さなレジストリです。 */
(function () {
  "use strict";

  const registry = {
    definitions: new Map(),
    aliases: new Map(),
    unsupported: new Map(),
    categories: new Map(),
    extensionInfo: new Map()
  };

  const VERIFIED_EXTENSION_IDS = new Set([
    "pen",
    "music",
    "translate",
    "text2speech",
    "microbitMore",
    "posenet2scratch",
    "ml2scratch",
    "cameraselector",
    "speech2scratch"
  ]);

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
        extensionURL: normalized.extensionURL || null,
        note: normalized.extensionNote || "Stretch3側で同じ拡張機能を追加すると実行できます。"
      });
    }
  }

  /* 複数ファイルから安全にまとめて登録するための関数です。 */
  function registerMany(definitions) {
    definitions.forEach(registerBlock);
  }

  /*
   * Gemが書きがちな別名を、正式なfunctionNameへ寄せるための登録です。
   * 別名は入口だけの仕組みで、opcodeやproject.jsonの中身は正式名の定義をそのまま使います。
   */
  function registerAlias(aliasName, functionName) {
    if (!aliasName || !functionName) {
      throw new Error("別名の登録には別名と正式名の両方が必要です。");
    }
    if (aliasName === functionName) {
      throw new Error(`別名と正式名が同じです: ${aliasName}`);
    }
    const existing = registry.aliases.get(aliasName);
    if (existing && existing !== functionName) {
      throw new Error(`別名 ${aliasName} は ${existing} として既に登録されています。`);
    }
    registry.aliases.set(aliasName, functionName);
  }

  /* まとめて別名を登録します。{ 別名: 正式名 } の形で渡します。 */
  function registerAliases(map) {
    Object.entries(map || {}).forEach(([aliasName, functionName]) => registerAlias(aliasName, functionName));
  }

  /*
   * 別名の解決先を返します。
   * 正式名として登録済みの名前は、別名表より常に優先します（別名が本物を上書きしない）。
   */
  function aliasTarget(name) {
    if (!name || registry.definitions.has(name)) return null;
    const target = registry.aliases.get(name);
    return target && registry.definitions.has(target) ? target : null;
  }

  /* 別名なら正式名へ、そうでなければそのままの名前を返します。 */
  function resolveFunctionName(name) {
    return aliasTarget(name) || name;
  }

  /* 2つの文字列の違いの大きさ（レーベンシュタイン距離）を数えます。 */
  function editDistance(a, b) {
    const source = String(a);
    const target = String(b);
    if (source === target) return 0;
    if (!source.length) return target.length;
    if (!target.length) return source.length;

    let previous = Array.from({ length: target.length + 1 }, (_, index) => index);
    for (let i = 1; i <= source.length; i += 1) {
      const current = [i];
      for (let j = 1; j <= target.length; j += 1) {
        const cost = source[i - 1] === target[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      }
      previous = current;
    }
    return previous[target.length];
  }

  /* microbitSetServo を [microbit, set, servo] のように、単語へ分けます。 */
  function nameTokens(name) {
    return String(name || "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_\-]+/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
  }

  /* どの名前にも出てくる単語は、近さの判断材料になりません。 */
  const WEAK_TOKENS = new Set(["microbit", "more", "set", "get", "is", "when", "if", "do"]);

  /*
   * 単語の重なり具合を0〜1で返します。
   * 少ないほうの単語数で割ります（包含率）。こうすると
   * microbitDisplayShowNumber のように余計な単語が足された名前でも、
   * microbitDisplayText との近さを見失いません。
   * ただし microbit や set のような弱い単語しか合っていない場合は、近いと見なしません。
   */
  function tokenSimilarity(a, b) {
    const left = new Set(nameTokens(a));
    const right = new Set(nameTokens(b));
    if (!left.size || !right.size) return 0;
    let shared = 0;
    let strongShared = 0;
    left.forEach((token) => {
      if (!right.has(token)) return;
      shared += 1;
      if (!WEAK_TOKENS.has(token)) strongShared += 1;
    });
    if (!strongShared) return 0;
    if (shared < 2 && Math.max(left.size, right.size) > 2) return 0;
    return shared / Math.min(left.size, right.size);
  }

  /*
   * 未登録の名前に対して、近い正式名を最大limit件返します。
   * 2つの見方を併用します。
   *   1. 文字の違いの数 … microbitSetSrevo のような打ち間違いを拾う
   *   2. 単語の重なり   … microbitServoTurn のような言い換えを拾う
   */
  function suggestFunctionNames(name, limit = 3) {
    const input = String(name || "").toLowerCase();
    if (!input) return [];

    const allowed = Math.min(3, Math.max(1, Math.floor(input.length / 3)));
    const best = new Map();

    const consider = (candidate) => {
      const canonical = resolveFunctionName(candidate);
      if (!registry.definitions.has(canonical)) return;
      const distance = editDistance(input, String(candidate).toLowerCase());
      const similarity = tokenSimilarity(name, candidate);
      if (distance > allowed && similarity < 0.6) return;
      const score = [1 - similarity, distance];
      const known = best.get(canonical);
      if (!known || score[0] < known[0] || (score[0] === known[0] && score[1] < known[1])) {
        best.set(canonical, score);
      }
    };

    registry.definitions.forEach((definition, functionName) => consider(functionName));
    registry.aliases.forEach((functionName, aliasName) => consider(aliasName));

    return Array.from(best.entries())
      .sort((a, b) => (a[1][0] - b[1][0]) || (a[1][1] - b[1][1]) || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([functionName]) => functionName);
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
      matrix: "5×5 LEDパターン",
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
    registerAlias,
    registerAliases,
    registerUnsupported,
    aliasTarget,
    resolveFunctionName,
    suggestFunctionNames,
    aliases() {
      return Array.from(registry.aliases.entries());
    },
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
