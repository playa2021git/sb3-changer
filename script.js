/* 画面操作、StretchScript解析、project.json生成、.sb3作成を担当します。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;

  /* 動作確認用サンプルです。 */
  const SAMPLES = [
    {
      name: "サンプル1：動く",
      code: `whenGreenFlagClicked(() => {
  forever(() => {
    move(10);
    ifOnEdgeBounce();
    say("こんにちは", 2);
  });
});`
    },
    {
      name: "サンプル2：ペンで四角",
      code: `whenGreenFlagClicked(() => {
  penClear();
  penDown();
  repeat(4, () => {
    move(100);
    turnRight(90);
  });
  penUp();
});`
    },
    {
      name: "サンプル3：翻訳と音声",
      code: `whenGreenFlagClicked(() => {
  say(translate("Hello", "ja"), 2);
  speak("こんにちは");
});`
    },
    {
      name: "サンプル4：micro:bit（未確認拡張）",
      code: `whenGreenFlagClicked(() => {
  forever(() => {
    ifMicrobitButtonPressed("A", () => {
      say("Aボタンが押された", 1);
    });
  });
});`
    },
    {
      name: "サンプル5：画像分類（未確認拡張）",
      code: `whenGreenFlagClicked(() => {
  forever(() => {
    ifImageClassifiedAs("cat", () => {
      say("ねこを見つけた", 2);
    });
  });
});`
    },
    {
      name: "サンプルA：リスト作成",
      code: `whenGreenFlagClicked(() => {
  deleteAllOfList("宝くじ全部");

  repeat(10, () => {
    addToList(random(1, 100), "宝くじ全部");
  });

  say(join("リストの長さは", lengthOfList("宝くじ全部")), 2);
});`
    },
    {
      name: "サンプルB：ランダム取得",
      code: `whenGreenFlagClicked(() => {
  deleteAllOfList("宝くじ全部");

  repeat(10, () => {
    addToList(random(1, 100), "宝くじ全部");
  });

  setVariable("引いた場所", random(1, lengthOfList("宝くじ全部")));
  setVariable("引いた番号", itemOfList(getVariable("引いた場所"), "宝くじ全部"));

  say(join("引いた番号は", getVariable("引いた番号")), 2);
});`
    },
    {
      name: "サンプルC：取得して削除",
      code: `whenGreenFlagClicked(() => {
  deleteAllOfList("宝くじ全部");

  repeat(10, () => {
    addToList(random(1, 100), "宝くじ全部");
  });

  setVariable("引いた場所", random(1, lengthOfList("宝くじ全部")));
  setVariable("引いた番号", itemOfList(getVariable("引いた場所"), "宝くじ全部"));

  deleteOfList(getVariable("引いた場所"), "宝くじ全部");

  say(join("残り枚数は", lengthOfList("宝くじ全部")), 2);
});`
    },
    {
      name: "サンプルD：条件分岐つき宝くじ",
      code: `whenGreenFlagClicked(() => {
  deleteAllOfList("宝くじ全部");
  setVariable("当選金合計金額", 0);

  repeat(100, () => {
    addToList(random(1, 1000), "宝くじ全部");
  });

  repeat(5, () => {
    setVariable("引いた場所", random(1, lengthOfList("宝くじ全部")));
    setVariable("引いた番号", itemOfList(getVariable("引いた場所"), "宝くじ全部"));

    ifElse(lessThan(getVariable("引いた番号"), 10), () => {
      say("1等！5000円！", 2);
      changeVariable("当選金合計金額", 5000);
    }, () => {
      ifElse(lessThan(getVariable("引いた番号"), 100), () => {
        say("2等！1000円！", 2);
        changeVariable("当選金合計金額", 1000);
      }, () => {
        say("はずれ", 1);
      });
    });

    deleteOfList(getVariable("引いた場所"), "宝くじ全部");
  });

  say(join("合計当選金額は", getVariable("当選金合計金額")), 3);
});`
    }
  ];

  /* Geminiへ貼るための固定プロンプトです。 */
  const GEMINI_PROMPT = `あなたはStretch3用のStretchScriptを書くAIです。
ユーザーの指示を、必ずStretchScriptだけで出力してください。
説明文、Markdown、コードブロック記号は出さないでください。
対応していない命令を勝手に作ってはいけません。
.sb3やproject.jsonを直接出力してはいけません。
StretchScriptの仕様に従ってください。`;

  /* Scratchが読み込むための簡単なスプライトSVGです。 */
  const SPRITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="140" viewBox="0 0 160 140">
<ellipse cx="80" cy="74" rx="58" ry="48" fill="#32a891"/>
<circle cx="58" cy="62" r="9" fill="#ffffff"/>
<circle cx="102" cy="62" r="9" fill="#ffffff"/>
<circle cx="58" cy="62" r="4" fill="#172026"/>
<circle cx="102" cy="62" r="4" fill="#172026"/>
<path d="M55 92 Q80 112 105 92" fill="none" stroke="#172026" stroke-width="8" stroke-linecap="round"/>
<path d="M30 28 L52 45 L35 57 Z" fill="#32a891"/>
<path d="M130 28 L108 45 L125 57 Z" fill="#32a891"/>
</svg>`;

  /* ステージ用の無地背景SVGです。 */
  const BACKDROP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
<rect width="480" height="360" fill="#ffffff"/>
<path d="M0 300 H480" stroke="#d7dde4" stroke-width="4"/>
</svg>`;

  /* Scratch/Stretch3の読み込み処理に合わせ、assetIdはSVG内容のMD5にしています。 */
  const SPRITE_ASSET_ID = "ec63c5f5f2e431c7e08234014aee081f";
  const BACKDROP_ASSET_ID = "6787a882d25fddec75e75d9739a85a8c";
  const DEFAULT_SPRITE_COLOR = "#32a891";

  let currentProject = null;
  let currentWarnings = [];
  let currentSb3Blob = null;
  let currentInspection = null;

  /* 使いやすいエラー表示にするため、原因や直し方を一緒に持ちます。 */
  class StretchScriptError extends Error {
    constructor({ message, line = 1, column = 1, cause, fix, example }) {
      super(message);
      this.name = "StretchScriptError";
      this.line = line;
      this.column = column;
      this.cause = cause || message;
      this.fix = fix || "入力を見直してください。";
      this.example = example || "whenGreenFlagClicked(() => { move(10); });";
    }
  }

  /* SVG内に表示する文字をXMLとして安全な形にします。 */
  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* スプライト名やsetSpriteTextから、簡単な文字入りSVGを作ります。 */
  function makeTextSpriteSvg(text, color = DEFAULT_SPRITE_COLOR) {
    const label = String(text || "?").slice(0, 12);
    const fontSize = label.length <= 2 ? 54 : label.length <= 4 ? 38 : 26;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="140" viewBox="0 0 160 140">
<rect x="12" y="12" width="136" height="116" rx="18" fill="${color}"/>
<rect x="18" y="18" width="124" height="104" rx="14" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.65"/>
<text x="80" y="74" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${escapeXml(label)}</text>
</svg>`;
  }

  /* TextEncoderが使えない環境でもMD5計算できるよう、文字列をUTF-8バイト列にします。 */
  function utf8Bytes(text) {
    if (typeof TextEncoder !== "undefined") {
      return Array.from(new TextEncoder().encode(String(text)));
    }
    const bytes = [];
    for (let index = 0; index < String(text).length; index += 1) {
      let code = String(text).charCodeAt(index);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code >= 0xd800 && code <= 0xdbff) {
        index += 1;
        const next = String(text).charCodeAt(index);
        code = 0x10000 + (((code & 0x3ff) << 10) | (next & 0x3ff));
        bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  /* ScratchのassetIdに使うため、SVG内容のMD5を同期的に計算します。 */
  function md5Hex(text) {
    const bytes = utf8Bytes(text);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    const bitLengthLow = bitLength >>> 0;
    const bitLengthHigh = Math.floor(bitLength / 2 ** 32) >>> 0;
    for (let index = 0; index < 4; index += 1) {
      bytes.push((bitLengthLow >>> (8 * index)) & 0xff);
    }
    for (let index = 0; index < 4; index += 1) {
      bytes.push((bitLengthHigh >>> (8 * index)) & 0xff);
    }

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;
    const shifts = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    const constants = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) >>> 0);
    const add32 = (a, b) => (a + b) >>> 0;
    const rotateLeft = (value, shift) => ((value << shift) | (value >>> (32 - shift))) >>> 0;

    for (let chunk = 0; chunk < bytes.length; chunk += 64) {
      const words = [];
      for (let index = 0; index < 16; index += 1) {
        const offset = chunk + index * 4;
        words[index] = (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
      }

      let a = a0;
      let b = b0;
      let c = c0;
      let d = d0;

      for (let index = 0; index < 64; index += 1) {
        let f;
        let g;
        if (index < 16) {
          f = (b & c) | (~b & d);
          g = index;
        } else if (index < 32) {
          f = (d & b) | (~d & c);
          g = (5 * index + 1) % 16;
        } else if (index < 48) {
          f = b ^ c ^ d;
          g = (3 * index + 5) % 16;
        } else {
          f = c ^ (b | ~d);
          g = (7 * index) % 16;
        }
        const nextD = d;
        d = c;
        c = b;
        b = add32(b, rotateLeft(add32(add32(a, f >>> 0), add32(constants[index], words[g])), shifts[index]));
        a = nextD;
      }

      a0 = add32(a0, a);
      b0 = add32(b0, b);
      c0 = add32(c0, c);
      d0 = add32(d0, d);
    }

    return [a0, b0, c0, d0].map((word) => {
      let hex = "";
      for (let index = 0; index < 4; index += 1) {
        hex += ((word >>> (index * 8)) & 0xff).toString(16).padStart(2, "0");
      }
      return hex;
    }).join("");
  }

  /* 画面の部品を初期化します。 */
  function init() {
    const sourceInput = document.getElementById("sourceInput");
    const sampleSelect = document.getElementById("sampleSelect");
    const geminiPrompt = document.getElementById("geminiPrompt");

    setupSampleSelect(sampleSelect);
    sourceInput.value = SAMPLES[0].code;
    setupSourceEditor(sourceInput);
    if (geminiPrompt) {
      geminiPrompt.value = GEMINI_PROMPT;
    }

    sampleSelect.addEventListener("change", () => {
      if (sampleSelect.value === "custom") return;
      sourceInput.value = SAMPLES[Number(sampleSelect.value)].code;
      resetResult();
    });
    sourceInput.addEventListener("input", () => {
      syncSampleSelect(sourceInput, sampleSelect);
      resetResult();
    });

    document.getElementById("convertButton").addEventListener("click", convertFromInput);
    document.getElementById("clearButton").addEventListener("click", () => {
      sourceInput.value = "";
      resetResult();
      sourceInput.focus();
    });
    document.getElementById("downloadButton").addEventListener("click", downloadSb3);
    const copyPromptButton = document.getElementById("copyPromptButton");
    if (copyPromptButton) {
      copyPromptButton.addEventListener("click", copyGeminiPrompt);
    }
    const sb3AnalyzeInput = document.getElementById("sb3AnalyzeInput");
    if (sb3AnalyzeInput) {
      sb3AnalyzeInput.addEventListener("change", analyzeSelectedSb3);
    }

    resetResult();
  }

  /* サンプル名と入力欄がずれないよう、プルダウンはJavaScript側で作ります。 */
  function setupSampleSelect(sampleSelect) {
    sampleSelect.textContent = "";
    SAMPLES.forEach((sample, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = sample.name;
      sampleSelect.appendChild(option);
    });
    const custom = document.createElement("option");
    custom.value = "custom";
    custom.textContent = "自分のコード";
    sampleSelect.appendChild(custom);
    sampleSelect.value = "0";
  }

  /* 入力内容がサンプルと一致するか調べ、選択状態を同期します。 */
  function syncSampleSelect(sourceInput, sampleSelect) {
    const normalizedSource = normalizeSampleText(sourceInput.value);
    const index = SAMPLES.findIndex((sample) => normalizeSampleText(sample.code) === normalizedSource);
    sampleSelect.value = index >= 0 ? String(index) : "custom";
  }

  /* 空白差だけでサンプル判定が外れないようにします。 */
  function normalizeSampleText(text) {
    return String(text || "").replace(/\s+/g, "");
  }

  /* 入力欄に行番号を付け、スクロールもtextareaとそろえます。 */
  function setupSourceEditor(sourceInput) {
    updateLineNumbers();
    sourceInput.addEventListener("scroll", syncLineNumberScroll);
  }

  /* 入力内容に合わせて左側の行番号を作り直します。 */
  function updateLineNumbers(errorLine = null) {
    const sourceInput = document.getElementById("sourceInput");
    const lineNumbers = document.getElementById("lineNumbers");
    if (!sourceInput || !lineNumbers) return;

    const lineCount = Math.max(1, sourceInput.value.split(/\r\n|\r|\n/).length);
    const fragment = document.createDocumentFragment();
    for (let line = 1; line <= lineCount; line += 1) {
      const item = document.createElement("span");
      item.textContent = String(line);
      if (line === errorLine) {
        item.className = "error-line-number";
      }
      fragment.appendChild(item);
    }
    lineNumbers.textContent = "";
    lineNumbers.appendChild(fragment);
    syncLineNumberScroll();
  }

  /* textareaのスクロール位置に行番号を合わせます。 */
  function syncLineNumberScroll() {
    const sourceInput = document.getElementById("sourceInput");
    const lineNumbers = document.getElementById("lineNumbers");
    if (sourceInput && lineNumbers) {
      lineNumbers.scrollTop = sourceInput.scrollTop;
    }
  }

  /* エラー行の赤い表示を消します。 */
  function clearErrorHighlight() {
    const editor = document.getElementById("sourceEditor");
    if (editor) {
      editor.classList.remove("has-error");
    }
    updateLineNumbers();
  }

  /* エラーが起きた行を入力欄側でも赤く示します。 */
  function markErrorLine(error) {
    const line = Number.isFinite(error.line) ? Math.max(1, error.line) : 1;
    const editor = document.getElementById("sourceEditor");
    if (editor) {
      editor.classList.add("has-error");
    }
    updateLineNumbers(line);
  }

  /* 変換前の画面状態に戻します。 */
  function resetResult() {
    currentProject = null;
    currentWarnings = [];
    currentSb3Blob = null;
    currentInspection = null;
    document.getElementById("downloadButton").disabled = true;
    document.getElementById("statusOutput").className = "status-box idle";
    document.getElementById("statusOutput").textContent = "準備できています。";
    document.getElementById("warningOutput").hidden = true;
    document.getElementById("warningOutput").textContent = "";
    document.getElementById("errorOutput").hidden = true;
    document.getElementById("errorOutput").textContent = "";
    clearErrorHighlight();
    document.getElementById("previewOutput").textContent = "まだ変換していません。左のコードを確認して「1. 変換して確認」を押してください。";
    setOptionalText("validationOutput", "まだ検査していません。");
    setOptionalText("extensionAnalysisOutput", "まだ解析していません。実物の .sb3 を選ぶと、project.json内のblocksを表示します。");
    setOptionalText("jsonOutput", "まだproject.jsonはありません。");
  }

  /* 入力欄からStretchScriptを読み、ZIP検査まで通ったときだけ成功にします。 */
  async function convertFromInput() {
    const source = document.getElementById("sourceInput").value;
    try {
      document.getElementById("downloadButton").disabled = true;
      currentProject = null;
      currentSb3Blob = null;
      currentInspection = null;

      if (!source.trim()) {
        throw new StretchScriptError({
          message: "入力が空です。",
          cause: "変換するStretchScriptがありません。",
          fix: "Geminiが作ったコードを貼り付けるか、サンプルを選んでください。",
          example: SAMPLES[0].code
        });
      }

      const ast = parseStretchScript(source);
      const knownNames = collectKnownNames(ast);
      const previewLines = buildPreview(ast, knownNames);
      const builder = new ScratchProjectBuilder(knownNames, [...ast.sourceCorrections, ...ast.semanticWarnings]);
      currentProject = builder.build(ast);
      currentWarnings = builder.makeWarnings();

      const projectJsonText = JSON.stringify(currentProject, null, 2);
      const projectReport = validateProjectJson(projectJsonText, expectedSb3FileNames(currentProject));
      if (projectReport.errors.length > 0) {
        currentInspection = projectReport;
        throw new StretchScriptError({
          message: "project.jsonの整合性チェックで問題が見つかりました。",
          cause: projectReport.errors.join("\n"),
          fix: "表示された問題のブロック定義を確認してください。",
          example: "blocks/*.js の opcode、inputs、fields を確認します。"
        });
      }

      currentSb3Blob = await createSb3Blob(currentProject);
      currentInspection = await inspectSb3Blob(currentSb3Blob);
      if (currentInspection.errors.length > 0) {
        throw new StretchScriptError({
          message: ".sb3 ZIPの検査で問題が見つかりました。",
          cause: currentInspection.errors.join("\n"),
          fix: "ZIP内のproject.json、md5ext、素材ファイル名を確認してください。",
          example: "costumes[].md5ext とZIP内ファイル名は完全一致が必要です。"
        });
      }

      renderPreview(previewLines);
      renderSuccess(builder, currentInspection);
      renderValidationReport(currentInspection);
      setOptionalText("jsonOutput", projectJsonText);
      document.getElementById("downloadButton").disabled = false;
    } catch (error) {
      currentProject = null;
      currentSb3Blob = null;
      document.getElementById("downloadButton").disabled = true;
      renderError(normalizeError(error));
    }
  }

  /* 成功時の表示です。 */
  function renderSuccess(builder, inspection) {
    const status = document.getElementById("statusOutput");
    status.className = "status-box";
    status.textContent = [
      "変換できました。",
      "右側にブロック風プレビューが表示されています。",
      "問題なければ「2. .sb3をダウンロード」を押してください。"
    ].join("\n");

    const warning = document.getElementById("warningOutput");
    if (currentWarnings.length > 0) {
      warning.hidden = false;
      warning.textContent = currentWarnings.join("\n");
    } else {
      warning.hidden = true;
      warning.textContent = "";
    }

    const errorBox = document.getElementById("errorOutput");
    errorBox.hidden = true;
    errorBox.textContent = "";
    clearErrorHighlight();
  }

  /* エラー時の表示です。 */
  function renderError(error) {
    markErrorLine(error);
    document.getElementById("statusOutput").className = "status-box idle";
    document.getElementById("statusOutput").textContent = "変換できませんでした。下のエラーを見て直してください。";
    document.getElementById("warningOutput").hidden = true;
    document.getElementById("previewOutput").textContent = "変換に失敗しました。エラーを直すと、ここにブロックが表示されます。";
    setOptionalText("validationOutput", currentInspection ? formatInspectionReport(currentInspection) : "検査は完了していません。");
    setOptionalText("jsonOutput", "変換に失敗したため、project.jsonは更新されませんでした。");

    const errorBox = document.getElementById("errorOutput");
    errorBox.hidden = false;
    renderFriendlyErrorBox(errorBox, error);
  }

  /* エラー欄へ、行番号・原因・赤い位置表示を分けて描画します。 */
  function renderFriendlyErrorBox(errorBox, error) {
    const line = Number.isFinite(error.line) ? Math.max(1, error.line) : 1;
    const column = Number.isFinite(error.column) ? Math.max(1, error.column) : 1;
    errorBox.textContent = "";

    const title = document.createElement("p");
    title.className = "error-title";
    title.textContent = "ここを直してください";
    errorBox.appendChild(title);

    const location = document.createElement("p");
    location.className = "error-location";
    location.textContent = `${line}行目の${column}文字目あたりがエラーです。`;
    errorBox.appendChild(location);

    const snippet = buildErrorSnippet(line, column);
    if (snippet) {
      errorBox.appendChild(snippet);
    }

    appendErrorDetail(errorBox, "原因", error.cause);
    appendErrorDetail(errorBox, "直し方", error.fix);
    appendErrorDetail(errorBox, "例", error.example);
  }

  /* エラー行のコードと、赤い▲印を作ります。 */
  function buildErrorSnippet(line, column) {
    const sourceInput = document.getElementById("sourceInput");
    if (!sourceInput) return null;
    const lines = sourceInput.value.split(/\r\n|\r|\n/);
    const codeLine = lines[line - 1];
    if (typeof codeLine !== "string") return null;

    const wrapper = document.createElement("pre");
    wrapper.className = "error-snippet";

    const prefix = `${line} | `;
    const code = document.createElement("span");
    code.className = "error-code-line";
    code.textContent = `${prefix}${codeLine || " "}`;
    wrapper.appendChild(code);

    const caret = document.createElement("span");
    caret.className = "error-caret-line";
    const caretOffset = prefix.length + Math.max(0, column - 1);
    caret.textContent = `${" ".repeat(caretOffset)}▲ ここ`;
    wrapper.appendChild(caret);

    return wrapper;
  }

  /* 原因・直し方・例を読みやすく並べます。 */
  function appendErrorDetail(errorBox, label, text) {
    const item = document.createElement("p");
    item.className = "error-detail";
    item.textContent = `${label}: ${text || "なし"}`;
    errorBox.appendChild(item);
  }

  /* ふつうのErrorも画面用のエラーに変換します。 */
  function normalizeError(error) {
    if (error instanceof StretchScriptError) {
      return error;
    }
    return new StretchScriptError({
      message: error.message || "予期しないエラーです。",
      cause: error.message || "内部処理で問題が起きました。",
      fix: "コードを少し短くして、どこで失敗するか確認してください。",
      example: SAMPLES[0].code
    });
  }

  /* 生徒向け画面では開発者用の表示を外せるため、要素があるときだけ書き込みます。 */
  function setOptionalText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  /* .sb3に入れる予定のルート直下ファイル名です。 */
  function expectedSb3FileNames(project = null) {
    const assetFiles = project && project.__assetFiles ? Object.keys(project.__assetFiles) : [
      `${SPRITE_ASSET_ID}.svg`,
      `${BACKDROP_ASSET_ID}.svg`
    ];
    return [
      "project.json",
      ...assetFiles
    ];
  }

  /* JSZipで.sb3 ZIPを実際に生成します。 */
  async function createSb3Blob(project) {
    if (!window.JSZip) {
      throw new StretchScriptError({
        message: "JSZipを読み込めませんでした。",
        cause: "インターネット接続、またはCDNの読み込みに問題があります。",
        fix: "ネットワークにつながっているか確認して、ページを読み込み直してください。",
        example: "JSZipは .sb3 を作るために必要です。"
      });
    }

    const zip = new JSZip();
    zip.file("project.json", JSON.stringify(project, null, 2));
    const assetFiles = project && project.__assetFiles ? project.__assetFiles : {
      [`${SPRITE_ASSET_ID}.svg`]: SPRITE_SVG,
      [`${BACKDROP_ASSET_ID}.svg`]: BACKDROP_SVG
    };
    Object.entries(assetFiles).forEach(([fileName, content]) => {
      zip.file(fileName, content);
    });
    return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  }

  /* 生成したZIPを読み戻して、実ファイル名とproject.jsonの対応を検査します。 */
  async function inspectSb3Blob(blob) {
    if (!window.JSZip) {
      throw new StretchScriptError({
        message: "JSZipを読み込めませんでした。",
        cause: "ZIP検査にJSZipが必要です。",
        fix: "ネットワークにつながっているか確認して、ページを読み込み直してください。",
        example: "JSZipを読み込めると、ZIP内のproject.jsonと素材ファイルを検査できます。"
      });
    }

    const zip = await JSZip.loadAsync(blob);
    const zipFiles = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
    let projectJsonText = "";
    if (zip.files["project.json"]) {
      projectJsonText = await zip.files["project.json"].async("string");
    }
    const report = validateProjectJson(projectJsonText, zipFiles);
    report.zipFiles = zipFiles;
    return report;
  }

  /* 検査結果を先生・開発者向け欄へ表示します。 */
  function renderValidationReport(report) {
    setOptionalText("validationOutput", formatInspectionReport(report));
  }

  /* 検査結果を読みやすいテキストにします。 */
  function formatInspectionReport(report) {
    const ok = (value) => value ? "あり / OK" : "なし / NG";
    return [
      `project.json: ${ok(report.projectJsonExists)}`,
      `costumeファイル: ${ok(report.costumeFilesAllPresent)}`,
      `md5ext一致: ${ok(report.md5extAllMatch)}`,
      `extensions: ${report.extensions.length ? report.extensions.join(", ") : "なし"}`,
      `target数: ${report.targetCount}`,
      `block数: ${report.blockCount}`,
      `topLevel数: ${report.topLevelCount}`,
      `使用カテゴリ候補: ${report.categories.length ? report.categories.join("、") : "なし"}`,
      `作成変数: ${report.variables.length ? report.variables.join("、") : "なし"}`,
      `作成リスト: ${report.lists.length ? report.lists.join("、") : "なし"}`,
      `作成メッセージ: ${report.broadcasts.length ? report.broadcasts.join("、") : "なし"}`,
      `next / parent参照: ${report.nextParentOk ? "OK" : "NG"}`,
      `inputs参照: ${report.inputReferenceOk ? "OK" : "NG"}`,
      `孤立ブロック検出: ${report.orphanBlocks.length ? report.orphanBlocks.join(", ") : "なし"}`,
      `存在しないblock ID参照: ${report.missingReferences.length ? report.missingReferences.join(" / ") : "なし"}`,
      `ZIP内ファイル: ${report.zipFiles && report.zipFiles.length ? report.zipFiles.join(", ") : "未生成"}`,
      "エラー一覧:",
      report.errors.length ? report.errors.map((item) => `- ${item}`).join("\n") : "- なし"
    ].join("\n");
  }

  /* Scratch 3.0として最低限読めるproject.jsonか検査します。 */
  function validateProjectJson(projectJsonText, zipFileNames) {
    const report = {
      projectJsonExists: Boolean(projectJsonText),
      costumeFilesAllPresent: false,
      md5extAllMatch: false,
      extensions: [],
      targetCount: 0,
      blockCount: 0,
      topLevelCount: 0,
      categories: [],
      variables: [],
      lists: [],
      broadcasts: [],
      missingReferences: [],
      orphanBlocks: [],
      nextParentOk: true,
      inputReferenceOk: true,
      zipFiles: zipFileNames || [],
      errors: []
    };

    if (!projectJsonText) {
      report.errors.push("project.jsonがZIPルート直下にありません。");
      return report;
    }

    let project;
    try {
      project = JSON.parse(projectJsonText);
    } catch (error) {
      report.errors.push(`project.jsonをJSONとしてparseできません: ${error.message}`);
      return report;
    }

    if (!Array.isArray(project.targets)) {
      report.errors.push("targetsが配列ではありません。");
      return report;
    }

    report.targetCount = project.targets.length;
    report.extensions = Array.isArray(project.extensions) ? project.extensions : [];

    if (!Array.isArray(project.monitors)) {
      report.errors.push("monitorsが配列ではありません。");
    }
    if (!Array.isArray(project.extensions)) {
      report.errors.push("extensionsが配列ではありません。");
    }
    validateExtensionURLs(project, report);
    if (!project.meta || typeof project.meta !== "object") {
      report.errors.push("metaがありません。");
    } else {
      if (project.meta.semver !== "3.0.0") {
        report.errors.push('meta.semverが"3.0.0"ではありません。');
      }
      if (!/^\d+\.\d+\.\d+/.test(String(project.meta.vm || ""))) {
        report.errors.push("meta.vmがバージョン文字列ではありません。");
      }
    }

    const stage = project.targets[0];
    validateStageTarget(stage, report);
    if (project.targets.length < 2) {
      report.errors.push("Sprite targetが1つもありません。");
    }
    project.targets.slice(1).forEach((sprite, index) => validateSpriteTarget(sprite, report, index + 1));
    collectProjectNames(project.targets, report);
    validateBlocks(project.targets, report);
    validateAssets(project.targets, zipFileNames || [], report);
    validateUsedExtensions(project.targets, report);

    return report;
  }

  /* Xcratch系カスタム拡張の読み込みURLが拡張IDと対応しているか確認します。 */
  function validateExtensionURLs(project, report) {
    if (project.extensionURLs !== undefined && !Array.isArray(project.extensionURLs)) {
      report.errors.push("extensionURLsが配列ではありません。");
      return;
    }

    const extensions = Array.isArray(project.extensions) ? project.extensions : [];
    const entries = Array.isArray(project.extensionURLs) ? project.extensionURLs : [];
    const seen = new Set();
    entries.forEach((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== "string") {
        report.errors.push("extensionURLsの各要素は [extensionId, URL] 形式にしてください。");
        return;
      }
      const [extensionId, extensionURL] = entry;
      if (seen.has(extensionId)) report.errors.push(`extensionURLsに${extensionId}が重複しています。`);
      seen.add(extensionId);
      if (!extensions.includes(extensionId)) {
        report.errors.push(`extensionURLsの${extensionId}がextensionsにありません。`);
      }
      if (extensionURL !== null && typeof extensionURL !== "string") {
        report.errors.push(`extensionURLsの${extensionId}のURLが文字列またはnullではありません。`);
      }
    });

    R.extensionInfo().forEach((info) => {
      if (!info.extensionURL || !extensions.includes(info.extensionId)) return;
      if (!entries.some((entry) =>
        Array.isArray(entry) && entry[0] === info.extensionId && entry[1] === info.extensionURL
      )) {
        report.errors.push(`${info.extensionId}のextensionURLがありません。`);
      }
    });
  }

  /* stage targetの必須構造を検査します。 */
  function validateStageTarget(stage, report) {
    if (!stage) {
      report.errors.push("targets[0] のStageが存在しません。");
      return;
    }
    const required = ["variables", "lists", "broadcasts", "blocks", "comments"];
    if (stage.isStage !== true) report.errors.push("targets[0].isStage が true ではありません。");
    if (stage.name !== "Stage") report.errors.push('targets[0].name が "Stage" ではありません。');
    required.forEach((key) => {
      if (!stage[key] || Array.isArray(stage[key]) || typeof stage[key] !== "object") {
        report.errors.push(`Stageの${key}が空オブジェクト形式ではありません。`);
      }
    });
    if (stage.currentCostume !== 0) report.errors.push("StageのcurrentCostumeが0ではありません。");
    if (!Array.isArray(stage.costumes) || stage.costumes.length < 1) report.errors.push("Stageに背景costumeがありません。");
    if (!Array.isArray(stage.sounds)) report.errors.push("Stageのsoundsが配列ではありません。");
  }

  /* sprite targetの必須構造を検査します。 */
  function validateSpriteTarget(sprite, report, targetIndex = 1) {
    if (!sprite) {
      report.errors.push(`targets[${targetIndex}] のSpriteが存在しません。`);
      return;
    }
    const required = ["variables", "lists", "broadcasts", "blocks", "comments"];
    if (sprite.isStage !== false) report.errors.push(`targets[${targetIndex}].isStage が false ではありません。`);
    if (!sprite.name || typeof sprite.name !== "string") report.errors.push(`targets[${targetIndex}].name が文字列ではありません。`);
    required.forEach((key) => {
      if (!sprite[key] || Array.isArray(sprite[key]) || typeof sprite[key] !== "object") {
        report.errors.push(`${sprite.name || `targets[${targetIndex}]`}の${key}が空オブジェクト形式ではありません。`);
      }
    });
    if (sprite.currentCostume !== 0) report.errors.push(`${sprite.name}: currentCostumeが0ではありません。`);
    if (!Array.isArray(sprite.costumes) || sprite.costumes.length < 1) report.errors.push(`${sprite.name}: SVG costumeがありません。`);
    if (!Array.isArray(sprite.sounds)) report.errors.push(`${sprite.name}: soundsが配列ではありません。`);
    if (sprite.volume !== 100) report.errors.push(`${sprite.name}: volumeが100ではありません。`);
    if (sprite.visible !== true) report.errors.push(`${sprite.name}: visibleがtrueではありません。`);
    ["x", "y", "size", "direction"].forEach((key) => {
      if (typeof sprite[key] !== "number" || Number.isNaN(sprite[key])) report.errors.push(`${sprite.name}: ${key}が数値ではありません。`);
    });
    if (sprite.draggable !== false) report.errors.push(`${sprite.name}: draggableがfalseではありません。`);
    if (sprite.rotationStyle !== "all around") report.errors.push(`${sprite.name}: rotationStyleが"all around"ではありません。`);
  }

  /* 生成された変数・リスト・メッセージ名を診断用に集めます。 */
  function collectProjectNames(targets, report) {
    const variables = new Set();
    const lists = new Set();
    const broadcasts = new Set();

    (targets || []).forEach((target) => {
      Object.values(target.variables || {}).forEach((value) => {
        if (Array.isArray(value) && value[0]) variables.add(String(value[0]));
      });
      Object.values(target.lists || {}).forEach((value) => {
        if (Array.isArray(value) && value[0]) lists.add(String(value[0]));
      });
      Object.values(target.broadcasts || {}).forEach((value) => {
        if (Array.isArray(value) && value[0]) {
          broadcasts.add(String(value[0]));
        } else if (value) {
          broadcasts.add(String(value));
        }
      });
    });

    report.variables = Array.from(variables);
    report.lists = Array.from(lists);
    report.broadcasts = Array.from(broadcasts);
  }

  /* block ID、next、parent、SUBSTACK、topLevelを検査します。 */
  function validateBlocks(targets, report) {
    const globalBlockIds = new Set();
    const corePrefixes = new Set(["argument", "colour", "control", "data", "event", "looks", "math", "matrix", "motion", "operator", "procedures", "sensing", "sound"]);
    const categories = new Set(report.categories);

    targets.forEach((target) => {
      const blocks = target.blocks || {};
      const ids = Object.keys(blocks);
      report.blockCount += ids.length;
      const idSet = new Set(ids);
      const reachable = new Set();

      ids.forEach((id) => {
        if (globalBlockIds.has(id)) {
          report.errors.push(`block IDが重複しています: ${id}`);
        }
        globalBlockIds.add(id);

        const block = blocks[id];
        if (block.topLevel && block.parent !== null) {
          report.errors.push(`${id}: topLevelブロックのparentがnullではありません。`);
        }
        if (block.topLevel) {
          report.topLevelCount += 1;
        }
        if (block.next && !idSet.has(block.next)) {
          addMissingReference(report, `${id}: next参照先 ${block.next} が存在しません。`, "nextParent");
        }
        if (block.next && idSet.has(block.next) && blocks[block.next].parent !== id) {
          report.nextParentOk = false;
          report.errors.push(`${id}: next参照先 ${block.next} のparentが ${id} ではありません。`);
        }
        if (block.parent && !idSet.has(block.parent)) {
          addMissingReference(report, `${id}: parent参照先 ${block.parent} が存在しません。`, "nextParent");
        }
        if (block.parent && idSet.has(block.parent) && !parentReferencesChild(blocks[block.parent], id)) {
          report.nextParentOk = false;
          report.errors.push(`${id}: parent ${block.parent} からこのブロックへの参照がありません。`);
        }
        Object.entries(block.inputs || {}).forEach(([inputName, inputValue]) => {
          if (!Array.isArray(inputValue)) {
            report.inputReferenceOk = false;
            report.errors.push(`${id}: ${inputName} がScratch入力配列ではありません。`);
            return;
          }
          [inputValue[1], inputValue[2]].forEach((candidate) => {
            if (typeof candidate === "string" && candidate && !idSet.has(candidate)) {
              addMissingReference(report, `${id}: ${inputName} の参照先 ${candidate} が存在しません。`, "input");
            }
          });
          if (inputName.includes("SUBSTACK") && inputValue[1] && !idSet.has(inputValue[1])) {
            addMissingReference(report, `${id}: ${inputName} の参照先 ${inputValue[1]} が存在しません。`, "input");
          }
        });

        const prefix = String(block.opcode || "").split("_")[0];
        categories.add(categoryFromOpcode(block.opcode));
        if (prefix && !corePrefixes.has(prefix) && !report.extensions.includes(prefix)) {
          report.errors.push(`${id}: 拡張opcode ${block.opcode} を使っていますが extensions に ${prefix} がありません。`);
        }
      });

      if (ids.length > 0 && !ids.some((id) => blocks[id].topLevel)) {
        report.errors.push(`${target.name}: topLevelブロックがありません。`);
      }

      ids.filter((id) => blocks[id].topLevel).forEach((id) => visitReachableBlock(id, blocks, idSet, reachable));
      ids.forEach((id) => {
        if (!reachable.has(id)) {
          report.orphanBlocks.push(`${target.name}:${id}`);
          report.errors.push(`${target.name}: 孤立ブロック ${id} が見つかりました。`);
        }
      });
    });

    report.categories = Array.from(categories).filter(Boolean);
  }

  /* 参照先が存在しないときに、種類別の診断も同時に更新します。 */
  function addMissingReference(report, message, kind) {
    report.missingReferences.push(message);
    if (kind === "input") {
      report.inputReferenceOk = false;
    } else {
      report.nextParentOk = false;
    }
    report.errors.push(message);
  }

  /* parentが子ブロックをnextまたはinputsで本当に参照しているか調べます。 */
  function parentReferencesChild(parentBlock, childId) {
    if (!parentBlock) return false;
    if (parentBlock.next === childId) return true;
    return Object.values(parentBlock.inputs || {}).some((inputValue) => (
      Array.isArray(inputValue) && (inputValue[1] === childId || inputValue[2] === childId)
    ));
  }

  /* topLevelからnextとinputsをたどって到達できるブロックを記録します。 */
  function visitReachableBlock(id, blocks, idSet, reachable) {
    if (!id || !idSet.has(id) || reachable.has(id)) return;
    reachable.add(id);
    const block = blocks[id];
    if (!block) return;
    visitReachableBlock(block.next, blocks, idSet, reachable);
    Object.values(block.inputs || {}).forEach((inputValue) => {
      if (!Array.isArray(inputValue)) return;
      [inputValue[1], inputValue[2]].forEach((candidate) => {
        if (typeof candidate === "string") visitReachableBlock(candidate, blocks, idSet, reachable);
      });
    });
  }

  /* opcodeから先生向けのカテゴリ候補を出します。 */
  function categoryFromOpcode(opcode) {
    const prefix = String(opcode || "").split("_")[0];
    const categoryMap = {
      event: "イベント/メッセージ",
      motion: "動き",
      looks: "見た目",
      sound: "音",
      control: "制御/クローン",
      sensing: "調べる",
      operator: "演算",
      data: "変数/リスト",
      procedures: "独自ブロック",
      argument: "独自ブロック"
    };
    return categoryMap[prefix] || prefix;
  }

  /* costume / sound のmd5extとZIP内ファイル名を検査します。 */
  function validateAssets(targets, zipFileNames, report) {
    const zipSet = new Set(zipFileNames);
    let costumeCount = 0;
    let costumeFileOk = true;
    let md5extOk = true;

    targets.forEach((target) => {
      (target.costumes || []).forEach((costume) => {
        costumeCount += 1;
        const expectedMd5ext = `${costume.assetId}.${costume.dataFormat}`;
        if (costume.dataFormat !== "svg") {
          report.errors.push(`${target.name}: costume ${costume.name} のdataFormatがsvgではありません。`);
          md5extOk = false;
        }
        if (!costume.assetId || costume.md5ext !== expectedMd5ext) {
          report.errors.push(`${target.name}: costume ${costume.name} のassetIdとmd5extが一致しません。`);
          md5extOk = false;
        }
        if (!/^[0-9a-f]{32}$/i.test(costume.assetId || "")) {
          report.errors.push(`${target.name}: costume ${costume.name} のassetIdがMD5形式ではありません。`);
          md5extOk = false;
        }
        if (typeof costume.rotationCenterX !== "number" || typeof costume.rotationCenterY !== "number") {
          report.errors.push(`${target.name}: costume ${costume.name} にrotationCenterX/Yがありません。`);
          md5extOk = false;
        }
        if (zipFileNames.length > 0 && !zipSet.has(costume.md5ext)) {
          report.errors.push(`${target.name}: costumeファイル ${costume.md5ext} がZIP内にありません。`);
          costumeFileOk = false;
        }
      });

      (target.sounds || []).forEach((sound) => {
        const expectedMd5ext = `${sound.assetId}.${sound.dataFormat}`;
        if (!sound.assetId || sound.md5ext !== expectedMd5ext) {
          report.errors.push(`${target.name}: sound ${sound.name} のassetIdとmd5extが一致しません。`);
        }
        if (zipFileNames.length > 0 && !zipSet.has(sound.md5ext)) {
          report.errors.push(`${target.name}: soundファイル ${sound.md5ext} がZIP内にありません。`);
        }
      });
    });

    report.costumeFilesAllPresent = costumeCount > 0 && costumeFileOk;
    report.md5extAllMatch = costumeCount > 0 && md5extOk;
  }

  /* ブロックで使った拡張がextensionsに入っているか検査します。 */
  function validateUsedExtensions(targets, report) {
    const corePrefixes = new Set(["argument", "colour", "control", "data", "event", "looks", "math", "matrix", "motion", "operator", "procedures", "sensing", "sound"]);
    const used = new Set();
    targets.forEach((target) => {
      Object.values(target.blocks || {}).forEach((block) => {
        const prefix = String(block.opcode || "").split("_")[0];
        if (prefix && !corePrefixes.has(prefix)) used.add(prefix);
      });
    });
    used.forEach((extensionId) => {
      if (!report.extensions.includes(extensionId)) {
        report.errors.push(`使用拡張 ${extensionId} がextensionsに入っていません。`);
      }
    });
  }

  /* .sb3を作ってブラウザからダウンロードします。 */
  async function downloadSb3() {
    try {
      if (!currentProject || !currentSb3Blob || !currentInspection) {
        throw new StretchScriptError({
          message: "まだ変換されていません。",
          cause: ".sb3 ZIPの生成と検査が完了していません。",
          fix: "先に「1. 変換して確認」を押してください。",
          example: "変換に成功すると、ダウンロードボタンが押せるようになります。"
        });
      }
      const latestInspection = await inspectSb3Blob(currentSb3Blob);
      if (latestInspection.errors.length > 0) {
        throw new StretchScriptError({
          message: "ダウンロード直前の.sb3検査で問題が見つかりました。",
          cause: latestInspection.errors.join("\n"),
          fix: "再度「1. 変換して確認」を押して、検査結果を確認してください。",
          example: "project.jsonあり、costumeファイルあり、md5ext一致がすべてOKになる必要があります。"
        });
      }

      const fileName = normalizeSb3FileName(document.getElementById("fileNameInput").value);
      const url = URL.createObjectURL(currentSb3Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      document.getElementById("statusOutput").textContent += "\n.sb3をダウンロードしました。";
    } catch (error) {
      renderError(normalizeError(error));
    }
  }

  /* ファイル名の最後が必ず.sb3になるようにします。 */
  function normalizeSb3FileName(name) {
    const trimmed = String(name || "").trim() || "stretchscript_project.sb3";
    return trimmed.toLowerCase().endsWith(".sb3") ? trimmed : `${trimmed}.sb3`;
  }

  /* Gemini用プロンプトをコピーします。file://でも動くように古い方法も用意します。 */
  async function copyGeminiPrompt() {
    const promptElement = document.getElementById("geminiPrompt");
    if (!promptElement) return;
    const prompt = promptElement.value;
    const copyStatus = document.getElementById("copyStatus");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prompt);
      } else {
        const temp = document.createElement("textarea");
        temp.value = prompt;
        temp.style.position = "fixed";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      copyStatus.textContent = "コピーしました。Geminiに貼り付けて使えます。";
    } catch (error) {
      copyStatus.textContent = "コピーできませんでした。欄の文字を選んでコピーしてください。";
    }
  }

  /* Stretch3で作った実物.sb3から拡張ブロック定義の手がかりを取り出します。 */
  async function analyzeSelectedSb3(event) {
    const file = event.target.files && event.target.files[0];
    const output = document.getElementById("extensionAnalysisOutput");
    if (!file) return;

    try {
      if (!window.JSZip) {
        throw new Error("JSZipを読み込めていないため、.sb3を展開できません。");
      }
      output.textContent = "解析中です...";
      const report = await analyzeSb3File(file);
      output.textContent = formatExtensionAnalysis(report);
    } catch (error) {
      output.textContent = [
        "解析に失敗しました。",
        `原因: ${error.message}`,
        "確認: Stretch3本家で保存した .sb3 ファイルを選んでください。"
      ].join("\n");
    } finally {
      event.target.value = "";
    }
  }

  /* .sb3ファイルをZIP展開し、project.json内のblocksを解析します。 */
  async function analyzeSb3File(file) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const zipFiles = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
    const projectEntry = zip.files["project.json"];
    if (!projectEntry) {
      throw new Error("ZIPルート直下にproject.jsonがありません。");
    }
    const project = JSON.parse(await projectEntry.async("string"));
    const extensions = Array.isArray(project.extensions) ? project.extensions : [];
    const rows = [];

    (project.targets || []).forEach((target, targetIndex) => {
      Object.entries(target.blocks || {}).forEach(([blockId, block]) => {
        rows.push({
          targetIndex,
          targetName: target.name || `target${targetIndex}`,
          blockId,
          extensionId: inferExtensionId(block.opcode, extensions),
          opcode: block.opcode,
          blockType: inferBlockType(block),
          registered: findRegisteredDefinition(block.opcode),
          inputs: block.inputs || {},
          fields: block.fields || {},
          shadow: Boolean(block.shadow),
          topLevel: Boolean(block.topLevel),
          parent: block.parent,
          next: block.next
        });
      });
    });

    return {
      zipFiles,
      extensions,
      targetCount: Array.isArray(project.targets) ? project.targets.length : 0,
      blockCount: rows.length,
      rows
    };
  }

  /* opcodeから拡張IDらしきものを推定します。 */
  function inferExtensionId(opcode, projectExtensions) {
    const prefix = String(opcode || "").split("_")[0];
    const corePrefixes = new Set(["event", "motion", "looks", "sound", "control", "sensing", "operator", "data", "procedures", "argument", "matrix"]);
    if (!prefix || corePrefixes.has(prefix)) return "Scratch基本";
    const matched = projectExtensions.find((extensionId) => opcode === extensionId || opcode.startsWith(`${extensionId}_`));
    return matched || prefix;
  }

  /* Scratch VMが持つblockTypeはproject.jsonに直接ないため、形から推定します。 */
  function inferBlockType(block) {
    const opcode = String(block.opcode || "");
    const inputs = block.inputs || {};
    if (block.topLevel && opcode.startsWith("event_")) return "hat推定";
    if (opcode === "control_if" || opcode === "control_if_else" || Object.keys(inputs).some((name) => name.includes("SUBSTACK"))) {
      return "C型/制御推定";
    }
    if (opcode.startsWith("operator_") || opcode.includes("equals") || opcode.includes("pressed") || opcode.includes("touching")) {
      return "reporter/boolean推定";
    }
    if (block.shadow) return "shadow/menu推定";
    if (block.next !== undefined) return "stack推定";
    return "不明";
  }

  /* 解析したopcodeが現在の変換器に登録済みか調べます。 */
  function findRegisteredDefinition(opcode) {
    const matched = R.all().find((definition) => definition.opcode === opcode);
    if (!matched) {
      return { status: "未登録", functionName: "", verified: false };
    }
    return {
      status: matched.verified === false ? "登録済みだが未確認" : "登録済み",
      functionName: matched.functionName,
      verified: matched.verified !== false
    };
  }

  /* 解析結果を先生が定義追加に使いやすい形へ整えます。 */
  function formatExtensionAnalysis(report) {
    const lines = [
      `target数: ${report.targetCount}`,
      `block数: ${report.blockCount}`,
      `project.json extensions: ${report.extensions.length ? report.extensions.join(", ") : "なし"}`,
      `ZIP内ファイル: ${report.zipFiles.join(", ")}`,
      "",
      "blocks一覧:"
    ];

    report.rows.forEach((row) => {
      lines.push(
        "",
        `target: ${row.targetName}`,
        `blockId: ${row.blockId}`,
        `extension ID: ${row.extensionId}`,
        `opcode: ${row.opcode}`,
        `変換器に登録済みか: ${row.registered.status}${row.registered.functionName ? ` (${row.registered.functionName})` : ""}`,
        `blockType推定: ${row.blockType}`,
        `topLevel: ${row.topLevel}`,
        `shadow: ${row.shadow}`,
        `parent: ${row.parent === null ? "null" : row.parent}`,
        `next: ${row.next === null ? "null" : row.next}`,
        `inputs: ${JSON.stringify(row.inputs, null, 2)}`,
        `fields: ${JSON.stringify(row.fields, null, 2)}`
      );
    });

    return lines.join("\n");
  }

  /* StretchScriptをトークンへ分解します。 */
  function tokenize(source) {
    const tokens = [];
    let index = 0;
    let line = 1;
    let column = 1;

    const current = () => source[index];
    const next = () => source[index + 1];
    const add = (type, value, startLine, startColumn) => {
      tokens.push({ type, value, line: startLine, column: startColumn });
    };
    const advance = () => {
      const char = source[index++];
      if (char === "\n") {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }
      return char;
    };

    while (index < source.length) {
      const char = current();
      const startLine = line;
      const startColumn = column;

      if (/\s/.test(char)) {
        advance();
        continue;
      }

      if (char === "/" && next() === "/") {
        while (index < source.length && current() !== "\n") advance();
        continue;
      }

      if (char === "/" && next() === "*") {
        advance();
        advance();
        while (index < source.length && !(current() === "*" && next() === "/")) advance();
        if (index >= source.length) {
          throw new StretchScriptError({
            message: "コメントが閉じていません。",
            line: startLine,
            column: startColumn,
            cause: "/* で始まったコメントに */ がありません。",
            fix: "コメントの最後に */ を付けてください。",
            example: "/* メモ */"
          });
        }
        advance();
        advance();
        continue;
      }

      if (char === "'") {
        throw new StretchScriptError({
          message: "文字列の囲み方が違います。",
          line: startLine,
          column: startColumn,
          cause: "文字列は \" \" で囲んでください。",
          fix: "シングルクォートではなく、ダブルクォートを使います。",
          example: "say(\"こんにちは\", 2);"
        });
      }

      if (char === "\"") {
        advance();
        let value = "";
        while (index < source.length && current() !== "\"") {
          if (current() === "\n") {
            throw new StretchScriptError({
              message: "文字列が途中で終わっています。",
              line: startLine,
              column: startColumn,
              cause: "文字列を閉じる \" がありません。",
              fix: "文字列の最後に \" を付けてください。",
              example: "say(\"こんにちは\", 2);"
            });
          }
          if (current() === "\\") {
            advance();
            const escaped = advance();
            value += escaped === "n" ? "\n" : escaped;
          } else {
            value += advance();
          }
        }
        if (current() !== "\"") {
          throw new StretchScriptError({
            message: "文字列が閉じていません。",
            line: startLine,
            column: startColumn,
            cause: "文字列を閉じる \" がありません。",
            fix: "文字列の最後に \" を付けてください。",
            example: "say(\"こんにちは\", 2);"
          });
        }
        advance();
        add("string", value, startLine, startColumn);
        continue;
      }

      if ((char === "-" && /\d/.test(next())) || /\d/.test(char)) {
        let value = "";
        if (char === "-") value += advance();
        while (index < source.length && /\d/.test(current())) value += advance();
        if (current() === ".") {
          value += advance();
          while (index < source.length && /\d/.test(current())) value += advance();
        }
        add("number", Number(value), startLine, startColumn);
        continue;
      }

      if (/[A-Za-z_$]/.test(char)) {
        let value = "";
        while (index < source.length && /[A-Za-z0-9_$]/.test(current())) value += advance();
        add("identifier", value, startLine, startColumn);
        continue;
      }

      if (char === "=" && next() === ">") {
        advance();
        advance();
        add("arrow", "=>", startLine, startColumn);
        continue;
      }

      if ("(){};,.".includes(char)) {
        add("punct", advance(), startLine, startColumn);
        continue;
      }

      throw new StretchScriptError({
        message: "読めない文字があります。",
        line: startLine,
        column: startColumn,
        cause: `${char} はStretchScriptの命令として読めません。`,
        fix: "命令名、数字、\" \"で囲んだ文字列、かっこを使ってください。",
        example: "move(10);"
      });
    }

    tokens.push({ type: "eof", value: "", line, column });
    return tokens;
  }

  /* トークン列をASTへ変換する小さなパーサです。 */
  class Parser {
    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
    }

    current() {
      return this.tokens[this.position];
    }

    peek(offset) {
      return this.tokens[this.position + offset] || this.tokens[this.tokens.length - 1];
    }

    match(type, value) {
      const token = this.current();
      if (token.type !== type) return false;
      if (value !== undefined && token.value !== value) return false;
      this.position += 1;
      return token;
    }

    expect(type, value, message, fix, example) {
      const token = this.current();
      if (token.type === type && (value === undefined || token.value === value)) {
        this.position += 1;
        return token;
      }
      throw new StretchScriptError({
        message,
        line: token.line,
        column: token.column,
        cause: value ? `${value} が必要ですが、${token.value || "入力の終わり"} が見つかりました。` : message,
        fix,
        example
      });
    }

    parseProgram(stopAtBrace = false) {
      const body = [];
      while (this.current().type !== "eof") {
        if (stopAtBrace && this.current().type === "punct" && this.current().value === "}") break;
        body.push(this.parseStatement());
      }
      return { type: "Program", body };
    }

    parseStatement() {
      const call = this.parseCall();
      this.expect(
        "punct",
        ";",
        "命令の最後に ; がありません。",
        "命令の最後に ; を付けてください。",
        "move(10);"
      );
      return call;
    }

    parseCall() {
      const nameToken = this.expect(
        "identifier",
        undefined,
        "命令名が必要です。",
        "move や say のような命令名を書いてください。",
        "move(10);"
      );
      this.expect(
        "punct",
        "(",
        "かっこが足りません。",
        "命令名のあとに ( を付けます。",
        "move(10);"
      );

      const args = [];
      if (!(this.current().type === "punct" && this.current().value === ")")) {
        while (true) {
          args.push(this.parseExpression());
          if (this.match("punct", ",")) continue;
          break;
        }
      }

      this.expect(
        "punct",
        ")",
        "かっこが足りません。",
        "命令の最後に ) を付けます。",
        "say(\"こんにちは\", 2);"
      );

      return {
        type: "Call",
        name: nameToken.value,
        args,
        line: nameToken.line,
        column: nameToken.column
      };
    }

    parseExpression() {
      if (this.isClosureStart()) {
        return this.parseClosure();
      }

      const token = this.current();
      if (token.type === "string") {
        this.position += 1;
        return { type: "StringLiteral", value: token.value, line: token.line, column: token.column };
      }
      if (token.type === "number") {
        this.position += 1;
        return { type: "NumberLiteral", value: token.value, line: token.line, column: token.column };
      }
      if (token.type === "identifier" && (token.value === "true" || token.value === "false")) {
        this.position += 1;
        return { type: "BooleanLiteral", value: token.value === "true", line: token.line, column: token.column };
      }
      if (token.type === "identifier" && this.peek(1).type === "punct" && this.peek(1).value === "(") {
        return this.parseCall();
      }

      throw new StretchScriptError({
        message: "引数の形が読めません。",
        line: token.line,
        column: token.column,
        cause: "引数には数字、\" \"で囲んだ文字列、または値を返す命令を書きます。",
        fix: "文字列は \" \" で囲み、命令は move(10) のようにかっこを付けてください。",
        example: "say(\"こんにちは\", 2);"
      });
    }

    isClosureStart() {
      return this.current().type === "punct" &&
        this.current().value === "(" &&
        this.peek(1).type === "punct" &&
        this.peek(1).value === ")" &&
        this.peek(2).type === "arrow";
    }

    parseClosure() {
      const start = this.current();
      this.expect("punct", "(", "中に入れるブロックの形が違います。", "() => { } の形で書いてください。", "() => { move(10); }");
      this.expect("punct", ")", "中に入れるブロックの形が違います。", "() => { } の形で書いてください。", "() => { move(10); }");
      this.expect("arrow", "=>", "=> がありません。", "中に入れるブロックは () => { } の形で書きます。", "forever(() => { move(10); });");
      this.expect("punct", "{", "{ がありません。", "=> のあとに { を付けます。", "forever(() => { move(10); });");
      const program = this.parseProgram(true);
      this.expect("punct", "}", "} がありません。", "中に入れたブロックの最後に } を付けます。", "forever(() => { move(10); });");
      return { type: "Closure", body: program.body, line: start.line, column: start.column };
    }
  }

  /* Geminiが混ぜたMarkdownコード枠を、行番号を保ったまま空行として扱います。 */
  function sanitizeStretchScriptSource(source) {
    const corrections = [];
    let markdownFenceCount = 0;
    const sanitizedSource = String(source || "")
      .split(/\r\n|\r|\n/)
      .map((line) => {
        if (/^\s*```(?:js|javascript|ts|typescript|stretchscript)?\s*$/i.test(line)) {
          markdownFenceCount += 1;
          return "";
        }
        return line;
      })
      .join("\n");

    if (markdownFenceCount > 0) {
      corrections.push(`Markdownのコード枠（\`\`\`）${markdownFenceCount}行を自動で無視しました。`);
    }
    return { source: sanitizedSource, corrections };
  }

  /* 文字列からASTを作る入口です。 */
  function parseStretchScript(source) {
    const sanitized = sanitizeStretchScriptSource(source);
    const tokens = tokenize(sanitized.source);
    const parser = new Parser(tokens);
    const ast = parser.parseProgram(false);
    ast.sourceCorrections = sanitized.corrections;
    ast.semanticWarnings = collectSemanticWarnings(ast);
    return ast;
  }

  /* 変換はできてもScratch上で意図と違いやすいAI生成パターンを警告します。 */
  function collectSemanticWarnings(ast) {
    const warnings = [];

    const visitCloneBody = (statements, spriteName) => {
      statements.forEach((call) => {
        if (call.name === "setVariable" && isLiteralString(call.args[0])) {
          warnings.push(`クローン内の変数「${call.args[0].value}」は現在すべてのクローンで共有されます。新しいクローンによる上書きに注意してください（${call.line}行目）。`);
        }
        if (call.name === "touchingObject" && isLiteralString(call.args[0]) && String(call.args[0].value) === spriteName) {
          warnings.push(`スプライト「${spriteName}」が同名の touchingObject を使っています。同じスプライトのクローン同士も接触判定の対象になります（${call.line}行目）。`);
        }
        call.args.filter((arg) => arg.type === "Closure").forEach((closure) => visitCloneBody(closure.body, spriteName));
        call.args.filter((arg) => arg.type === "Call").forEach((child) => visitCloneBody([child], spriteName));
      });
    };

    ast.body.filter(isSpriteDefinitionCall).forEach((spriteCall) => {
      const spriteName = spriteCall.args[0] && spriteCall.args[0].type === "StringLiteral"
        ? String(spriteCall.args[0].value)
        : "";
      const spriteBody = spriteCall.args.find((arg) => arg.type === "Closure");
      if (!spriteBody) return;
      spriteBody.body
        .filter((call) => ["whenIStartAsClone", "whenCloned"].includes(call.name))
        .forEach((cloneHat) => {
          const cloneBody = cloneHat.args.find((arg) => arg.type === "Closure");
          if (cloneBody) visitCloneBody(cloneBody.body, spriteName);
        });
    });

    return Array.from(new Set(warnings));
  }

  /* 変数名とリスト名を先に集め、引数順の自動判別に使います。 */
  function collectKnownNames(ast) {
    const known = {
      variables: new Set(),
      lists: new Set()
    };

    const visitValue = (value) => {
      if (!value) return;
      if (value.type === "Call") {
        visitCall(value);
      } else if (value.type === "Closure") {
        value.body.forEach(visitCall);
      }
    };

    const visitCall = (call) => {
      collectNamesFromCall(call, known);
      call.args.forEach(visitValue);
    };

    ast.body.forEach(visitCall);
    return known;
  }

  /* 各命令のどの引数が名前かを見て、作成予定の変数・リストを記録します。 */
  function collectNamesFromCall(call, known) {
    const first = call.args[0];
    const second = call.args[1];
    const third = call.args[2];

    if (["setVariable", "changeVariable", "getVariable", "variable", "showVariable", "hideVariable"].includes(call.name)) {
      addLiteralName(known.variables, first);
    }

    if (["deleteAllOfList", "lengthOfList", "showList", "hideList"].includes(call.name)) {
      addLiteralName(known.lists, first);
    }
    if (["deleteOfList", "itemOfList", "itemNumOfList"].includes(call.name)) {
      addLiteralName(known.lists, second);
    }
    if (call.name === "listContains") {
      addLiteralName(known.lists, first);
    }
    if (call.name === "addToList") {
      if (isLiteralString(first) && isLiteralString(second)) {
        const firstName = String(first.value);
        const secondName = String(second.value);
        if (known.lists.has(firstName) && !known.lists.has(secondName)) return;
        addLiteralName(known.lists, second);
        return;
      }
      if (isLiteralString(second)) addLiteralName(known.lists, second);
      if (isLiteralString(first)) addLiteralName(known.lists, first);
    }
    if (call.name === "insertAtList" || call.name === "replaceItemOfList") {
      addLiteralName(known.lists, third);
      if (!isLiteralString(third)) addLiteralName(known.lists, second);
    }
  }

  /* 文字列リテラルだけを名前として採用します。 */
  function addLiteralName(set, arg) {
    if (isLiteralString(arg)) set.add(String(arg.value));
  }

  /* リスト名・変数名として使える文字列かを判定します。 */
  function isLiteralString(arg) {
    return arg && arg.type === "StringLiteral";
  }

  /* addToListは value,listName と listName,value の両方を受け付けます。 */
  function normalizeCallForDefinition(def, call, knownNames) {
    if (!def || call.name !== "addToList") return call;
    const args = call.args;
    if (args.length !== 2) return call;

    const first = args[0];
    const second = args[1];
    const knownLists = knownNames && knownNames.lists ? knownNames.lists : new Set();
    const firstIsKnownList = isLiteralString(first) && knownLists.has(String(first.value));
    const secondIsKnownList = isLiteralString(second) && knownLists.has(String(second.value));

    if (firstIsKnownList && secondIsKnownList) {
      throw ambiguousAddToListError(call);
    }
    if (firstIsKnownList) return { ...call, args: [second, first] };
    if (secondIsKnownList) return call;
    if (isLiteralString(first) && !isLiteralString(second)) return { ...call, args: [second, first] };
    if (!isLiteralString(first) && isLiteralString(second)) return call;
    if (isLiteralString(first) && isLiteralString(second)) return call;
    throw ambiguousAddToListError(call);
  }

  /* リスト名の位置が分からないときの親切なエラーです。 */
  function ambiguousAddToListError(call) {
    return new StretchScriptError({
      message: "addToList の引数が判別できません。",
      line: call.line,
      column: call.column,
      cause: "どちらがリスト名で、どちらが追加する値なのか分かりません。",
      fix: "リスト名は \" \" で囲んで書いてください。",
      example: "addToList(\"宝くじ全部\", random(1, 100));\naddToList(random(1, 100), \"宝くじ全部\");"
    });
  }

  /* Geminiが自然に書きやすい互換構文を、確認済みのScratchブロックへ寄せます。 */
  function resolveCallVariant(call) {
    if (!call) return call;
    if (call.name === "goTo" && call.args.length === 2) {
      return { ...call, name: "goToXY" };
    }
    if (call.name === "setSpritePosition" && call.args.length === 2) {
      return { ...call, name: "goToXY" };
    }
    if (call.name === "setSpriteSize" && call.args.length === 1) {
      return { ...call, name: "setSize" };
    }
    if (call.name === "setSpriteDirection" && call.args.length === 1) {
      return { ...call, name: "pointInDirection" };
    }
    return call;
  }

  /* 未登録関数に対して、よくあるGeminiの書き間違いを案内します。 */
  function unknownFunctionHelp(functionName) {
    const help = {
      communities: {
        cause: "communities はStretchScriptの命令ではありません。and() や or() の書き間違いの可能性があります。",
        fix: "複雑な条件式は and() / or() / not() を使うか、結果用の変数を作って複数の ifBlock に分けてください。",
        example: "ifBlock(and(equals(1, 1), equals(2, 2)), () => { say(\"OK\", 1); });"
      },
      choose: {
        cause: "choose はStretchScriptの命令ではありません。乱数なら random()、リストから取り出すなら itemOfList() を使います。",
        fix: "選ぶ処理は random(1, lengthOfList(\"リスト名\")) と itemOfList(...) に分けてください。",
        example: "setVariable(\"番号\", itemOfList(random(1, lengthOfList(\"候補\")), \"候補\"));"
      },
      detectCat: {
        cause: "detectCat はStretchScriptの命令ではありません。画像認識系の外部拡張はopcode未確認のため安全停止します。",
        fix: "Stretch3本家で同じブロックを手作業で作った .sb3 を解析してから対応します。",
        example: "いまはScratch標準ブロックだけで作れる処理にしてください。"
      },
      drawCircle: {
        cause: "drawCircle は未対応です。Scratch標準には円を直接描く1命令はありません。",
        fix: "円を描く場合は、対応済みの move() と turnRight() を repeat() の中で使ってください。",
        example: "repeat(360, () => { move(1); turnRight(1); });"
      },
      parseInt: {
        cause: "parseInt はJavaScriptの関数で、StretchScriptの命令ではありません。",
        fix: "数値は最初から数値として書き、四捨五入したい場合は round() を使ってください。",
        example: "setVariable(\"答え\", round(divide(10, 3)));"
      },
      Number: {
        cause: "Number はJavaScriptの関数で、StretchScriptの命令ではありません。",
        fix: "数値は 10 のようにそのまま書き、計算は add() / subtract() / multiply() / divide() を使ってください。",
        example: "setVariable(\"答え\", add(1, 2));"
      },
      toString: {
        cause: "toString はJavaScriptの関数で、StretchScriptの命令ではありません。",
        fix: "文字としてつなげたい場合は join() を使ってください。",
        example: "say(join(\"答えは\", getVariable(\"答え\")), 2);"
      },
      includes: {
        cause: "includes はJavaScriptの関数で、StretchScriptの命令ではありません。",
        fix: "文字列に含まれるか調べるなら contains()、リストに含まれるか調べるなら listContains() を使ってください。",
        example: "ifBlock(contains(answer(), \"はい\"), () => { say(\"OK\", 1); });"
      },
      push: {
        cause: "push はJavaScriptの配列命令で、StretchScriptの命令ではありません。",
        fix: "リストへ追加する場合は addToList(value, listName) または addToList(listName, value) を使ってください。",
        example: "addToList(\"宝くじ全部\", random(1, 100));"
      },
      array: {
        cause: "array はStretchScriptの命令ではありません。Scratchではリストを使います。",
        fix: "deleteAllOfList() で空にしてから addToList() で値を追加してください。",
        example: "deleteAllOfList(\"候補\");\naddToList(\"候補\", \"グー\");"
      },
      listAdd: {
        cause: "listAdd はStretchScriptの命令ではありません。",
        fix: "リストへ追加する場合は addToList(value, listName) または addToList(listName, value) を使ってください。",
        example: "addToList(\"候補\", \"グー\");"
      }
    };
    return help[functionName] || null;
  }

  /* project.jsonを組み立てるクラスです。 */
  class ScratchProjectBuilder {
    constructor(knownNames = null, inputCorrections = []) {
      this.idCounter = 0;
      this.variables = new Map();
      this.lists = new Map();
      this.broadcasts = new Map();
      this.usedExtensions = new Set();
      this.usedExtensionURLs = new Map();
      this.usedCategories = new Set();
      this.inputCorrections = Array.isArray(inputCorrections) ? [...inputCorrections] : [];
      this.runtimeCorrections = [];
      this.knownNames = knownNames || { variables: new Set(), lists: new Set() };
      this.scriptX = 40;
      this.scriptY = 40;
      this.assetFiles = new Map([
        [`${BACKDROP_ASSET_ID}.svg`, BACKDROP_SVG]
      ]);
      this.spriteContexts = [];
      this.usesMultipleSprites = false;
      this.defaultSprite = this.createSpriteContext("Sprite1", { useDefaultCostume: true });
      this.activeSprite = this.defaultSprite;
      this.blocks = this.defaultSprite.blocks;
    }

    /* 初期設定風の命令を実行中に使った場合、安全に同じ意味のScratch命令へ寄せます。 */
    resolveRuntimeCall(call) {
      let resolved;
      if (call && call.name === "setSpriteColor") {
        const costumeName = this.ensureRuntimeColorCostume(call);
        resolved = {
          ...call,
          name: "switchCostume",
          args: [{ ...call.args[0], value: costumeName }]
        };
      } else {
        resolved = resolveCallVariant(call);
      }
      if (resolved && call && resolved.name !== call.name && call.name.startsWith("setSprite")) {
        this.runtimeCorrections.push(`${call.name}(...) を実行時命令 ${resolved.name}(...) へ自動補正しました（${call.line}行目）。`);
      }
      return resolved;
    }

    /* 実行中の固定色変更用コスチュームを作り、その名前を返します。 */
    ensureRuntimeColorCostume(call) {
      const arg = call.args[0];
      if (call.args.length !== 1 || !arg || arg.type !== "StringLiteral") {
        throw new StretchScriptError({
          message: "実行中の色は固定カラーコードで指定してください。",
          line: (arg || call).line,
          column: (arg || call).column,
          cause: "setSpriteColorを自動変換するには、変換時に色が確定している必要があります。",
          fix: "#ff0000 のような6けたの色を直接書いてください。",
          example: "setSpriteColor(\"#ff0000\");"
        });
      }
      const color = String(arg.value).toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(color)) {
        throw new StretchScriptError({
          message: "色の書き方が違います。",
          line: arg.line,
          column: arg.column,
          cause: "実行中の色も #ff0000 のような6けたのカラーコードで指定します。",
          fix: "# から始まる6けたの英数字にしてください。",
          example: "setSpriteColor(\"#ff0000\");"
        });
      }
      const context = this.activeSprite;
      if (context.useDefaultCostume) {
        throw new StretchScriptError({
          message: "既定スプライトの色画像は自動生成できません。",
          line: call.line,
          column: call.column,
          cause: "元のScratchキャラクター画像を保ったまま、指定色へ正確に塗り替える保存形がありません。",
          fix: "spriteとsetSpriteTextで文字スプライトを作るか、setEffect(\"COLOR\", 数値)を使ってください。",
          example: "sprite(\"信号\", () => { setSpriteText(\"信号\"); setSpriteColor(\"#00ff00\"); });"
        });
      }

      const initialColor = String(context.color || DEFAULT_SPRITE_COLOR).toUpperCase();
      if (color === initialColor) return `${context.name} costume`;
      if (context.runtimeColorCostumes.has(color)) return context.runtimeColorCostumes.get(color).name;

      const costume = this.makeTextCostume(
        `auto-color-${color.slice(1)}`,
        context.text || context.name,
        color
      );
      context.runtimeColorCostumes.set(color, costume);
      return costume.name;
    }

    /* スプライトごとのblocksと初期値をまとめて管理します。 */
    createSpriteContext(name, options = {}) {
      return {
        name,
        blocks: {},
        scriptCount: 0,
        x: 0,
        y: 0,
        size: 100,
        direction: 90,
        text: name,
        color: DEFAULT_SPRITE_COLOR,
        useDefaultCostume: Boolean(options.useDefaultCostume),
        costume: null,
        runtimeColorCostumes: new Map()
      };
    }

    /* 現在ブロックを生成しているスプライトを切り替えます。 */
    useSpriteContext(context) {
      this.activeSprite = context;
      this.blocks = context.blocks;
    }

    /* 既存コード互換のSprite1を必要なときだけtargetsへ入れます。 */
    ensureDefaultSpriteIncluded(call) {
      if (!this.spriteContexts.includes(this.defaultSprite)) {
        this.ensureSpriteNameAvailable(this.defaultSprite.name, call);
        this.spriteContexts.push(this.defaultSprite);
      }
    }

    /* 同名スプライトはScratch上で混乱するため安全に止めます。 */
    ensureSpriteNameAvailable(name, call) {
      if (this.spriteContexts.some((context) => context.name === name)) {
        throw new StretchScriptError({
          message: "同じ名前のスプライトがあります。",
          line: call.line,
          column: call.column,
          cause: `スプライト名「${name}」が重複しています。`,
          fix: "sprite(\"名前\", ...) の名前を別々にしてください。",
          example: "sprite(\"Aさん\", () => { ... });\nsprite(\"Bさん\", () => { ... });"
        });
      }
    }

    /* sprite("名前", () => {...}) から新しいSprite targetを作ります。 */
    buildSpriteDefinition(call) {
      if (call.args.length !== 2 || call.args[0].type !== "StringLiteral" || call.args[1].type !== "Closure") {
        throw new StretchScriptError({
          message: "spriteの書き方が違います。",
          line: call.line,
          column: call.column,
          cause: "spriteにはスプライト名と () => { } が必要です。",
          fix: "sprite(\"Aさん\", () => { ... }); の形で書いてください。",
          example: "sprite(\"Aさん\", () => { whenGreenFlagClicked(() => { say(\"A\", 1); }); });"
        });
      }

      const name = String(call.args[0].value);
      this.ensureSpriteNameAvailable(name, call);
      const context = this.createSpriteContext(name);
      this.spriteContexts.push(context);

      const statements = call.args[1].body;
      // 初期設定がイベントより後ろに書かれても、実行用コスチュームへ正しく反映します。
      statements.filter((statement) => this.isSpriteMetaCall(statement))
        .forEach((statement) => this.applySpriteMeta(context, statement));
      statements.filter((statement) => !this.isSpriteMetaCall(statement))
        .forEach((statement) => this.buildTopLevelScript(statement, context));
    }

    /* sprite内だけで使える初期設定命令を判定します。 */
    isSpriteMetaCall(call) {
      return [
        "setSpritePosition",
        "setSpriteSize",
        "setSpriteDirection",
        "setSpriteText",
        "setSpriteColor"
      ].includes(call.name);
    }

    /* メタ命令はScratchブロックにせず、target直下の初期値へ反映します。 */
    applySpriteMeta(context, call) {
      const numberArg = (index, name) => {
        const arg = call.args[index];
        if (!arg || arg.type !== "NumberLiteral") {
          throw new StretchScriptError({
            message: "スプライト初期設定には数値が必要です。",
            line: (arg || call).line,
            column: (arg || call).column,
            cause: `${call.name} の ${name} には数値リテラルが必要です。`,
            fix: "setSpritePosition(-100, 0) のように数字で書いてください。",
            example: "setSpritePosition(-100, 0);"
          });
        }
        return arg.value;
      };
      const stringArg = (index, name) => {
        const arg = call.args[index];
        if (!arg || arg.type !== "StringLiteral") {
          throw new StretchScriptError({
            message: "スプライト初期設定には文字列が必要です。",
            line: (arg || call).line,
            column: (arg || call).column,
            cause: `${call.name} の ${name} は \" \" で囲んでください。`,
            fix: "setSpriteText(\"A\") のように書いてください。",
            example: "setSpriteText(\"A\");"
          });
        }
        return String(arg.value);
      };

      if (call.name === "setSpritePosition") {
        if (call.args.length !== 2) this.throwMetaArgumentCount(call, "setSpritePosition(x, y)");
        context.x = numberArg(0, "x");
        context.y = numberArg(1, "y");
        return;
      }
      if (call.name === "setSpriteSize") {
        if (call.args.length !== 1) this.throwMetaArgumentCount(call, "setSpriteSize(100)");
        context.size = numberArg(0, "size");
        return;
      }
      if (call.name === "setSpriteDirection") {
        if (call.args.length !== 1) this.throwMetaArgumentCount(call, "setSpriteDirection(90)");
        context.direction = numberArg(0, "direction");
        return;
      }
      if (call.name === "setSpriteText") {
        if (call.args.length !== 1) this.throwMetaArgumentCount(call, "setSpriteText(\"A\")");
        context.text = stringArg(0, "text");
        return;
      }
      if (call.name === "setSpriteColor") {
        if (call.args.length !== 1) this.throwMetaArgumentCount(call, "setSpriteColor(\"#ff0000\")");
        const color = stringArg(0, "color");
        if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
          throw new StretchScriptError({
            message: "色の書き方が違います。",
            line: call.args[0].line,
            column: call.args[0].column,
            cause: "setSpriteColorには #ff0000 のような6けたのカラーコードが必要です。",
            fix: "# から始まる6けたの英数字にしてください。",
            example: "setSpriteColor(\"#ff0000\");"
          });
        }
        context.color = color;
      }
    }

    /* メタ命令の引数数が違うときの共通エラーです。 */
    throwMetaArgumentCount(call, example) {
      throw new StretchScriptError({
        message: "スプライト初期設定の引数が違います。",
        line: call.line,
        column: call.column,
        cause: `${call.name} の引数の数が違います。`,
        fix: `${example}; の形で書いてください。`,
        example: `${example};`
      });
    }

    /* AST全体をScratch 3.0互換のproject.jsonへ変換します。 */
    build(ast) {
      if (!ast.body.length) {
        throw new StretchScriptError({
          message: "命令がありません。",
          cause: "StretchScriptの中に変換できる命令がありません。",
          fix: "緑の旗ブロックから始まるコードを書いてください。",
          example: SAMPLES[0].code
        });
      }

      const collected = collectKnownNames(ast);
      collected.variables.forEach((name) => this.knownNames.variables.add(name));
      collected.lists.forEach((name) => this.knownNames.lists.add(name));

      this.usesMultipleSprites = ast.body.some((call) => call.name === "sprite");
      ast.body.forEach((call) => {
        if (call.name === "sprite") {
          this.buildSpriteDefinition(call);
        } else {
          this.ensureDefaultSpriteIncluded(call);
          this.buildTopLevelScript(call, this.defaultSprite);
        }
      });

      const project = {
        targets: [
          this.makeStageTarget(),
          ...this.spriteContexts.map((context, index) => this.makeSpriteTarget(context, index + 1))
        ],
        monitors: [],
        extensions: Array.from(this.usedExtensions),
        meta: {
          semver: "3.0.0",
          vm: "0.2.0",
          agent: "StretchScript to SB3 Converter"
        }
      };
      if (this.usedExtensionURLs.size > 0) {
        project.extensionURLs = Array.from(this.usedExtensionURLs.entries());
      }
      Object.defineProperty(project, "__assetFiles", {
        value: Object.fromEntries(this.assetFiles.entries()),
        enumerable: false
      });
      return project;
    }

    /* トップレベルはイベント系のhatブロックにします。 */
    buildTopLevelScript(call, context = this.defaultSprite) {
      this.useSpriteContext(context);
      const def = this.requireDefinition(call);
      if (def.blockType !== "hat") {
        throw new StretchScriptError({
          message: "最初の命令はイベントにしてください。",
          line: call.line,
          column: call.column,
          cause: `${call.name} は一番上に置くイベントブロックではありません。`,
          fix: "whenGreenFlagClicked(() => { ... }); の中に命令を入れてください。",
          example: SAMPLES[0].code
        });
      }

      const id = this.nextId("hat");
      const block = this.makeBlock(def, id, null);
      block.topLevel = true;
      block.x = this.scriptX;
      block.y = this.scriptY + context.scriptCount * 180;
      context.scriptCount += 1;
      this.blocks[id] = block;
      this.applyArguments(def, call, id, block, { skipSubstackInputs: true });

      const bodyArg = this.findFirstClosure(call);
      if (!bodyArg) {
        throw new StretchScriptError({
          message: "イベントの中身がありません。",
          line: call.line,
          column: call.column,
          cause: `${call.name} には () => { } が必要です。`,
          fix: "イベントの中に実行したい命令を書いてください。",
          example: "whenGreenFlagClicked(() => { move(10); });"
        });
      }

      const stack = this.buildStackSequence(bodyArg.body, id);
      block.next = stack.firstId;
    }

    /* 命令の連なりをnextとparentでつなげます。 */
    buildStackSequence(statements, parentId) {
      let firstId = null;
      let previousOuterId = null;

      statements.forEach((statement) => {
        const made = this.createStackBlock(statement, previousOuterId || parentId);
        if (!firstId) firstId = made.id;

        if (previousOuterId) {
          const previousBlock = this.blocks[previousOuterId];
          if (this.isTerminalBlock(previousBlock)) {
            throw new StretchScriptError({
              message: "このブロックの下には命令をつなげません。",
              line: statement.line,
              column: statement.column,
              cause: "ずっと、止める、このクローンを削除する、などの後ろに命令があります。",
              fix: "その命令を前に移動するか、ずっとの中に入れてください。",
              example: "forever(() => { move(10); });"
            });
          }
          previousBlock.next = made.id;
          this.blocks[made.id].parent = previousOuterId;
        }

        previousOuterId = made.outerId;
      });

      return { firstId, lastId: previousOuterId };
    }

    /* 1つの命令をScratchブロックにします。 */
    createStackBlock(call, parentId) {
      const resolvedCall = this.resolveRuntimeCall(call);
      const def = this.requireDefinition(resolvedCall);

      if (def.blockType === "conditional") {
        return this.createConditionalBlock(def, resolvedCall, parentId);
      }

      if (!["stack", "control"].includes(def.blockType)) {
        throw new StretchScriptError({
          message: "ここには命令ブロックが必要です。",
          line: resolvedCall.line,
          column: resolvedCall.column,
          cause: `${resolvedCall.name} は値を返すブロックなので、単独では置けません。`,
          fix: "say(...) や ifThen(...) の中で使ってください。",
          example: "say(xPosition(), 1);"
        });
      }

      const id = this.nextId("block");
      const block = this.makeBlock(def, id, parentId);
      this.blocks[id] = block;
      this.applyArguments(def, resolvedCall, id, block);
      return { id, outerId: id };
    }

    /* 拡張の判定をifブロックとして使う便利命令です。 */
    createConditionalBlock(def, call, parentId) {
      const normalizedCall = normalizeCallForDefinition(def, call, this.knownNames);
      this.addExtension(def.extensionId, def.extensionURL);
      this.usedCategories.add("制御");
      this.usedCategories.add(def.category);
      const id = this.nextId("if");
      const block = {
        opcode: "control_if",
        next: null,
        parent: parentId,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false
      };
      this.blocks[id] = block;

      const mapped = this.mapArguments(def, normalizedCall);
      const substack = mapped.find((item) => item.defArg.role === "substack");
      const conditionArgs = mapped.filter((item) => item.defArg.role !== "substack").map((item) => item.arg);
      const conditionCall = {
        type: "Call",
        name: def.conditionDefinition,
        args: conditionArgs,
        line: normalizedCall.line,
        column: normalizedCall.column
      };
      const conditionId = this.createReporterBlock(conditionCall, id, "boolean");
      block.inputs.CONDITION = [2, conditionId];

      if (!substack || !substack.arg || substack.arg.type !== "Closure") {
        throw new StretchScriptError({
          message: "中に入れるブロックがありません。",
          line: call.line,
          column: call.column,
          cause: `${call.name} には () => { } が必要です。`,
          fix: "条件が本当のときに動かす命令を { } の中に書いてください。",
          example: def.sample
        });
      }
      const stack = this.buildStackSequence(substack.arg.body, id);
      block.inputs.SUBSTACK = [2, stack.firstId];
      return { id, outerId: id };
    }

    /* 値ブロックや真偽ブロックを作ります。 */
    createReporterBlock(call, parentId, expectedType) {
      const resolvedCall = this.resolveRuntimeCall(call);
      const def = this.requireDefinition(resolvedCall);
      if (!["reporter", "boolean"].includes(def.blockType)) {
        throw new StretchScriptError({
          message: "値を入れる場所に命令ブロックがあります。",
          line: resolvedCall.line,
          column: resolvedCall.column,
          cause: `${resolvedCall.name} は値を返すブロックではありません。`,
          fix: "数値や文字列、または値を返すブロックを入れてください。",
          example: "say(add(1, 2), 1);"
        });
      }
      if (expectedType === "boolean" && def.blockType !== "boolean") {
        throw new StretchScriptError({
          message: "条件を入れる場所に値ブロックがあります。",
          line: resolvedCall.line,
          column: resolvedCall.column,
          cause: `${resolvedCall.name} は「はい/いいえ」を返す条件ブロックではありません。`,
          fix: "keyPressed(\"space\") や mouseDown() のような条件ブロックを入れてください。",
          example: "ifThen(keyPressed(\"space\"), () => { move(10); });"
        });
      }

      const id = this.nextId("value");
      const block = this.makeBlock(def, id, parentId);
      this.blocks[id] = block;
      this.applyArguments(def, resolvedCall, id, block);
      return id;
    }

    /* ブロックの基本形を作ります。 */
    makeBlock(def, id, parentId) {
      this.addExtension(def.extensionId, def.extensionURL);
      this.usedCategories.add(def.category);
      const block = {
        opcode: this.resolveOpcode(def),
        next: null,
        parent: parentId,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false
      };
      if (def.fixedFields) {
        Object.entries(def.fixedFields).forEach(([name, value]) => {
          block.fields[name] = [String(value), null];
        });
      }
      if (def.mutation) {
        block.mutation = typeof def.mutation === "function" ? def.mutation(block) : { ...def.mutation };
      }
      return block;
    }

    /* say("文字")のような簡易形ではopcodeを切り替えます。 */
    resolveOpcode(def, call) {
      if (def.customOpcodeByArgs && call) {
        return def.customOpcodeByArgs(call.args);
      }
      return def.opcode;
    }

    /* 定義に従ってinputsとfieldsを埋めます。 */
    applyArguments(def, call, blockId, block, options = {}) {
      const normalizedCall = normalizeCallForDefinition(def, call, this.knownNames);
      block.opcode = this.resolveOpcode(def, normalizedCall);
      const mapped = this.mapArguments(def, normalizedCall);

      mapped.forEach(({ defArg, arg, omitted }) => {
        if (defArg.role === "substack") {
          if (options.skipSubstackInputs) return;
          if (!arg || arg.type !== "Closure") {
            throw new StretchScriptError({
              message: "中に入れるブロックがありません。",
              line: call.line,
              column: call.column,
              cause: `${call.name} には () => { } が必要です。`,
              fix: "繰り返しやもしブロックの中身を { } に書いてください。",
              example: def.sample
            });
          }
          const stack = this.buildStackSequence(arg.body, blockId);
          block.inputs[defArg.scratchName] = [2, stack.firstId];
          return;
        }

        if (omitted) return;

        if (defArg.role === "field") {
          block.fields[defArg.scratchName] = this.makeFieldValue(defArg, arg, call);
          return;
        }

        block.inputs[defArg.scratchName] = this.makeInputValue(defArg, arg, blockId, call);
      });
    }

    /* 省略可能な引数を考慮して、定義と実引数を対応させます。 */
    mapArguments(def, call) {
      const mapped = [];
      let argIndex = 0;

      for (let index = 0; index < def.arguments.length; index += 1) {
        const defArg = def.arguments[index];
        const remainingRequired = def.arguments.slice(index + 1).filter((arg) => !arg.optional).length;

        if (argIndex >= call.args.length) {
          if (defArg.optional) {
            mapped.push({ defArg, arg: null, omitted: true });
            continue;
          }
          throw new StretchScriptError({
            message: "引数が足りません。",
            line: call.line,
            column: call.column,
            cause: `${call.name} には ${R.typeLabel(defArg.type)} が必要です。`,
            fix: `足りない引数 ${defArg.name} を追加してください。`,
            example: def.sample
          });
        }

        if (defArg.optional && call.args.length - argIndex <= remainingRequired) {
          mapped.push({ defArg, arg: null, omitted: true });
          continue;
        }

        mapped.push({ defArg, arg: call.args[argIndex], omitted: false });
        argIndex += 1;
      }

      if (argIndex < call.args.length) {
        const extra = call.args[argIndex];
        throw new StretchScriptError({
          message: "引数が多すぎます。",
          line: extra.line || call.line,
          column: extra.column || call.column,
          cause: `${call.name} に使える引数の数を超えています。`,
          fix: "余分な引数を削除してください。",
          example: def.sample
        });
      }

      return mapped;
    }

    /* Scratchのfield値を作ります。 */
    makeFieldValue(defArg, arg, call) {
      const value = this.primitiveValue(defArg, arg, call);
      if (defArg.type === "variable") {
        const id = this.getNamedId(this.variables, value, "var");
        return [value, id];
      }
      if (defArg.type === "list") {
        const id = this.getNamedId(this.lists, value, "list");
        return [value, id];
      }
      if (defArg.type === "broadcast") {
        const id = this.getNamedId(this.broadcasts, value, "broadcast");
        return [value, id];
      }
      return [String(value), null];
    }

    /* Scratchのinput値を作ります。 */
    makeInputValue(defArg, arg, parentBlockId, call) {
      if (defArg.type === "matrix") {
        const value = this.primitiveValue(defArg, arg, call);
        const matrixId = this.nextId("matrix");
        this.blocks[matrixId] = {
          opcode: defArg.shadowOpcode || "matrix",
          next: null,
          parent: parentBlockId,
          inputs: {},
          fields: { [defArg.shadowField || defArg.scratchName]: [value, null] },
          shadow: true,
          topLevel: false
        };
        return [1, matrixId];
      }

      if (defArg.type === "menuInput") {
        const value = this.primitiveValue({ ...defArg, type: "menu" }, arg, call);
        const menuId = this.nextId("menu");
        this.blocks[menuId] = {
          opcode: defArg.menuOpcode,
          next: null,
          parent: parentBlockId,
          inputs: {},
          fields: { [defArg.menuField || defArg.scratchName]: [value, null] },
          shadow: true,
          topLevel: false
        };
        return [1, menuId];
      }

      if (defArg.type === "broadcastInput") {
        const value = this.primitiveValue({ ...defArg, type: "broadcast" }, arg, call);
        const broadcastId = this.getNamedId(this.broadcasts, value, "broadcast");
        const menuId = this.nextId("broadcastMenu");
        this.blocks[menuId] = {
          opcode: "event_broadcast_menu",
          next: null,
          parent: parentBlockId,
          inputs: {},
          fields: { BROADCAST_OPTION: [value, broadcastId] },
          shadow: true,
          topLevel: false
        };
        return [1, menuId];
      }

      if (defArg.type === "boolean") {
        if (arg.type !== "Call") {
          throw new StretchScriptError({
            message: "条件ブロックが必要です。",
            line: arg.line,
            column: arg.column,
            cause: "ここには「押された？」「大きい？」のような条件を入れます。",
            fix: "keyPressed(\"space\") や gt(xPosition(), 0) を使ってください。",
            example: "ifThen(keyPressed(\"space\"), () => { move(10); });"
          });
        }
        return [2, this.createReporterBlock(arg, parentBlockId, "boolean")];
      }

      if (arg.type === "Call") {
        const valueId = this.createReporterBlock(arg, parentBlockId, defArg.type);
        return [3, valueId, R.makeShadowValue(defArg.type, defArg.defaultValue)];
      }

      const value = this.primitiveValue(defArg, arg, call);
      return [1, R.makeShadowValue(defArg.type, value)];
    }

    /* 引数の型をチェックしながら通常値を取り出します。 */
    primitiveValue(defArg, arg, call) {
      if (!arg) return defArg.defaultValue;

      if (defArg.type === "matrix") {
        if (arg.type !== "StringLiteral") {
          throw new StretchScriptError({
            message: "LEDパターンは文字列で指定してください。",
            line: arg.line,
            column: arg.column,
            cause: `${call.name} には、0と1を25個並べた文字列が必要です。`,
            fix: "点灯を1、消灯を0として、5行分を上から順につなげてください。",
            example: 'microbitDisplayMatrix("0101011111111110111000100");'
          });
        }
        const value = String(arg.value);
        if (!/^[01]{25}$/.test(value)) {
          throw new StretchScriptError({
            message: "LEDパターンの形が違います。",
            line: arg.line,
            column: arg.column,
            cause: "5×5 LEDには、0または1だけを合計25個指定します。",
            fix: "5文字を1行として5行分、空白を入れずにつなげてください。",
            example: 'microbitDisplayMatrix("0101011111111110111000100");'
          });
        }
        return value;
      }

      if (["number", "integer", "positiveNumber", "positiveInteger", "angle"].includes(defArg.type)) {
        if (arg.type !== "NumberLiteral") {
          throw new StretchScriptError({
            message: "数値を入れる場所に文字が入っています。",
            line: arg.line,
            column: arg.column,
            cause: `${call.name} の ${defArg.name} には数値が必要です。`,
            fix: "\" \" を外して、数字だけを書いてください。",
            example: "move(10);"
          });
        }
        if (defArg.type === "integer" && !Number.isInteger(arg.value)) {
          throw new StretchScriptError({
            message: "整数が必要です。",
            line: arg.line,
            column: arg.column,
            cause: `${arg.value} は小数です。`,
            fix: "小数点のない数字にしてください。",
            example: "repeat(4, () => { move(10); });"
          });
        }
        if (defArg.type === "positiveInteger" && (!Number.isInteger(arg.value) || arg.value < 1)) {
          throw new StretchScriptError({
            message: "1以上の整数が必要です。",
            line: arg.line,
            column: arg.column,
            cause: `${arg.value} は繰り返し回数として使えません。`,
            fix: "1、2、4 のような小数点のない数字にしてください。",
            example: "repeat(4, () => { move(10); });"
          });
        }
        if (defArg.type === "positiveNumber" && arg.value <= 0) {
          throw new StretchScriptError({
            message: "0より大きい数値が必要です。",
            line: arg.line,
            column: arg.column,
            cause: `${arg.value} は使えません。`,
            fix: "1以上の数値にしてください。",
            example: "setPenSize(3);"
          });
        }
        return arg.value;
      }

      if (defArg.type === "listIndex") {
        if (!["StringLiteral", "NumberLiteral"].includes(arg.type)) {
          throw new StretchScriptError({
            message: "リストの場所の書き方が違います。",
            line: arg.line,
            column: arg.column,
            cause: `${call.name} の ${defArg.name} には番号、または \"last\" などの文字が必要です。`,
            fix: "1 のような番号か、\"last\" のような文字で書いてください。",
            example: "itemOfList(1, \"items\");"
          });
        }
        return arg.value;
      }

      if (["string", "menu", "variable", "list", "broadcast"].includes(defArg.type)) {
        if (!["StringLiteral", "NumberLiteral"].includes(arg.type)) {
          throw new StretchScriptError({
            message: "文字列は \" \" で囲んでください。",
            line: arg.line,
            column: arg.column,
            cause: `${call.name} の ${defArg.name} は文字として読む場所です。`,
            fix: "\"A\" や \"cat\" のように書いてください。",
            example: "say(\"こんにちは\", 2);"
          });
        }
        const rawValue = String(arg.value);
        const value = defArg.valueAliases?.[rawValue] ?? rawValue;
        if (defArg.type === "menu" && Array.isArray(defArg.allowedValues) && !defArg.allowedValues.includes(value)) {
          throw new StretchScriptError({
            message: "未確認のメニュー値です。",
            line: arg.line,
            column: arg.column,
            cause: `${call.name} の ${defArg.name} には ${defArg.allowedValues.join("/")} だけを使えます。`,
            fix: `確認済みの値（${defArg.allowedValues.join(" または ")}）に変更してください。`,
            example: `${call.name}(\"${defArg.allowedValues[0]}\", ...);`
          });
        }
        return value;
      }

      if (defArg.type === "color") {
        const value = this.primitiveValue({ ...defArg, type: "string" }, arg, call);
        if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
          throw new StretchScriptError({
            message: "色の書き方が違います。",
            line: arg.line,
            column: arg.column,
            cause: "色は #ff0000 のような6けたのカラーコードで書きます。",
            fix: "# から始まる6けたの英数字にしてください。",
            example: "setPenColor(\"#ff0000\");"
          });
        }
        return value;
      }

      if (defArg.type === "stringOrReporter" || defArg.type === "any") {
        if (!["StringLiteral", "NumberLiteral", "BooleanLiteral"].includes(arg.type)) {
          throw new StretchScriptError({
            message: "値の形が違います。",
            line: arg.line,
            column: arg.column,
            cause: `${call.name} の ${defArg.name} に入れる値が読めません。`,
            fix: "文字列、数値、または値を返す命令を入れてください。",
            example: "say(join(\"A\", \"B\"), 1);"
          });
        }
        return arg.value;
      }

      return arg.value;
    }

    /* 未登録の命令なら、追加先ファイルまで示して止めます。 */
    requireDefinition(call) {
      if (isSpriteMetaCallName(call.name)) {
        const help = {
          setSpriteText: {
            cause: "setSpriteText はスプライトの初期画像を作る設定で、イベントや繰り返しの中では実行できません。",
            fix: "実行中に文字を表示する場合は sayNow(...) または say(..., 秒数) を使ってください。",
            example: "sayNow(\"青信号\");"
          },
          setSpriteColor: {
            cause: "setSpriteColor はスプライトの初期色を決める設定で、イベントや繰り返しの中では実行できません。",
            fix: "状態ごとに色違いのスプライトを用意し、show() と hide() で切り替えてください。",
            example: "ifBlock(equals(getVariable(\"信号\"), \"赤\"), () => { show(); });"
          }
        }[call.name];
        throw new StretchScriptError({
          message: `${call.name} はスプライト直下だけで使える初期設定です。`,
          line: call.line,
          column: call.column,
          cause: help ? help.cause : `${call.name} はイベント内のScratchブロックには変換できません。`,
          fix: help ? help.fix : "sprite(\"名前\", () => { ... }); の直下へ移動してください。",
          example: help ? help.example : `${call.name}(...);`
        });
      }
      const unsupported = R.getUnsupported(call.name);
      if (unsupported) {
        throw new StretchScriptError({
          message: "未確認または未対応のブロックです。",
          line: call.line,
          column: call.column,
          cause: `${unsupported.category}の内部opcodeまたはproject.json保存形が未確認のため、まだ .sb3 に変換できません。${unsupported.reason}`,
          fix: unsupported.nextStep,
          example: unsupported.source ? `確認ソース: ${unsupported.source}` : "Stretch3本家で作った最小 .sb3 を解析してください。"
        });
      }
      const def = R.get(call.name);
      if (!def) {
        const file = R.guessDefinitionFile(call.name);
        const help = unknownFunctionHelp(call.name);
        throw new StretchScriptError({
          message: `${call.name} は未対応関数です。`,
          line: call.line,
          column: call.column,
          cause: help ? help.cause : `${call.name} はまだ登録されていません。`,
          fix: help ? help.fix : `${file} にブロック定義を追加してください。`,
          example: help ? help.example : "move(10);"
        });
      }
      if (def.verified === false) {
        throw new StretchScriptError({
          message: "未確認または未対応のブロックです。",
          line: call.line,
          column: call.column,
          cause: `${def.category} の内部ブロック名、opcode、inputs形式が未確認のため、まだ .sb3 に変換できません。`,
          fix: "先にStretch3本家で同等ブロックを手作業で作った .sb3 を保存し、このページの「拡張ブロック解析モード」でproject.jsonを解析してください。",
          example: "ImageClassifier2Scratchの場合は、分類結果reporterの正確なopcodeとinputs名を実物.sb3から確認してから blocks/imageClassifier2scratch.js に定義します。"
        });
      }
      return def;
    }

    /* 最初に見つかったクロージャをイベントの中身として使います。 */
    findFirstClosure(call) {
      return call.args.find((arg) => arg.type === "Closure");
    }

    /* 拡張機能をproject.jsonのextensionsへ入れるために記録します。 */
    addExtension(extensionId, extensionURL = null) {
      if (!extensionId) return;
      this.usedExtensions.add(extensionId);
      if (extensionURL) this.usedExtensionURLs.set(extensionId, extensionURL);
    }

    /* 変数、リスト、メッセージのIDを安定して作ります。 */
    getNamedId(map, name, prefix) {
      if (!map.has(name)) map.set(name, this.nextId(prefix));
      return map.get(name);
    }

    /* block IDを作ります。 */
    nextId(prefix) {
      this.idCounter += 1;
      return `${prefix}_${this.idCounter}`;
    }

    /* 下にブロックをつなげない種類を判定します。 */
    isTerminalBlock(block) {
      if (!block) return false;
      if (block.opcode === "control_stop") {
        const option = block.fields && block.fields.STOP_OPTION ? block.fields.STOP_OPTION[0] : "all";
        return option !== "other scripts in sprite";
      }
      return ["control_forever", "control_delete_this_clone"].includes(block.opcode);
    }

    /* ステージtargetを作ります。 */
    makeStageTarget() {
      return {
        isStage: true,
        name: "Stage",
        variables: this.usesMultipleSprites ? Object.fromEntries(Array.from(this.variables.entries()).map(([name, id]) => [id, [name, 0]])) : {},
        lists: this.usesMultipleSprites ? Object.fromEntries(Array.from(this.lists.entries()).map(([name, id]) => [id, [name, []]])) : {},
        broadcasts: Object.fromEntries(Array.from(this.broadcasts.entries()).map(([name, id]) => [id, name])),
        blocks: {},
        comments: {},
        currentCostume: 0,
        costumes: [
          {
            name: "backdrop1",
            bitmapResolution: 1,
            dataFormat: "svg",
            assetId: BACKDROP_ASSET_ID,
            md5ext: `${BACKDROP_ASSET_ID}.svg`,
            rotationCenterX: 240,
            rotationCenterY: 180
          }
        ],
        sounds: [],
        volume: 100,
        layerOrder: 0,
        tempo: 60,
        videoTransparency: 50,
        videoState: "on",
        textToSpeechLanguage: null
      };
    }

    /* スプライトのcostumeを作り、ZIPへ入れる素材として登録します。 */
    makeTextCostume(name, text, color) {
      const svg = makeTextSpriteSvg(text, color);
      const assetId = md5Hex(svg);
      this.assetFiles.set(`${assetId}.svg`, svg);
      return {
        name,
        bitmapResolution: 1,
        dataFormat: "svg",
        assetId,
        md5ext: `${assetId}.svg`,
        rotationCenterX: 80,
        rotationCenterY: 70
      };
    }

    /* スプライトの初期costumeを作り、ZIPへ入れる素材として登録します。 */
    makeSpriteCostume(context) {
      if (context.costume) return context.costume;
      if (context.useDefaultCostume) {
        this.assetFiles.set(`${SPRITE_ASSET_ID}.svg`, SPRITE_SVG);
        context.costume = {
          name: "StretchScript Sprite",
          bitmapResolution: 1,
          dataFormat: "svg",
          assetId: SPRITE_ASSET_ID,
          md5ext: `${SPRITE_ASSET_ID}.svg`,
          rotationCenterX: 80,
          rotationCenterY: 70
        };
        return context.costume;
      }

      context.costume = this.makeTextCostume(
        `${context.name} costume`,
        context.text || context.name,
        context.color
      );
      return context.costume;
    }

    /* スプライトtargetを作ります。 */
    makeSpriteTarget(context = this.defaultSprite, layerOrder = 1) {
      const costume = this.makeSpriteCostume(context);
      const costumes = [costume, ...context.runtimeColorCostumes.values()];
      const useLocalData = !this.usesMultipleSprites && context === this.defaultSprite;
      return {
        isStage: false,
        name: context.name,
        variables: useLocalData ? Object.fromEntries(Array.from(this.variables.entries()).map(([name, id]) => [id, [name, 0]])) : {},
        lists: useLocalData ? Object.fromEntries(Array.from(this.lists.entries()).map(([name, id]) => [id, [name, []]])) : {},
        broadcasts: {},
        blocks: context.blocks,
        comments: {},
        currentCostume: 0,
        costumes,
        sounds: [],
        volume: 100,
        layerOrder,
        visible: true,
        x: context.x,
        y: context.y,
        size: context.size,
        direction: context.direction,
        draggable: false,
        rotationStyle: "all around"
      };
    }

    /* すべてのスプライトに入ったブロックを診断用にまとめます。 */
    allBlocks() {
      const contexts = this.spriteContexts.length ? this.spriteContexts : [this.defaultSprite];
      return contexts.flatMap((context) => Object.values(context.blocks));
    }

    /* UI表示やテストで使う総ブロック数です。 */
    blockCount() {
      return this.allBlocks().length;
    }

    /* 拡張機能を使ったときの注意を作ります。 */
    makeWarnings() {
      const warnings = [...this.inputCorrections, ...this.runtimeCorrections];
      warnings.push(...Array.from(this.usedExtensions).map((extensionId) => {
        const info = R.extensionInfo().find((item) => item.extensionId === extensionId);
        const category = info ? info.category : extensionId;
        const note = info ? info.note : "Stretch3側で同じ拡張機能を追加してください。";
        return `この拡張ブロックを使うにはStretch3側で拡張機能を追加してください: ${category} (${extensionId})。${note}`;
      }));

      this.spriteContexts.forEach((context) => {
        Object.values(context.blocks).forEach((block) => {
          const nextBlock = block.next ? context.blocks[block.next] : null;
          const nextIsStopAll = nextBlock
            && nextBlock.opcode === "control_stop"
            && nextBlock.fields
            && nextBlock.fields.STOP_OPTION
            && nextBlock.fields.STOP_OPTION[0] === "all";
          if (block.opcode === "looks_say" && nextIsStopAll) {
            warnings.push("結果表示の直後に stopAll() があるため、表示がすぐ消える可能性があります。say(\"文字\", 2) を使うと見やすくなります。");
          }
        });
      });

      return Array.from(new Set(warnings));
    }
  }

  /* project.jsonの参照関係を確認します。 */
  function validateProjectIntegrity(project) {
    return validateProjectJson(JSON.stringify(project, null, 2), expectedSb3FileNames(project)).errors;
  }

  /* ASTから人間が読めるプレビュー行を作ります。 */
  function buildPreview(ast, knownNames = null) {
    return ast.body.flatMap((call) => previewCall(call, 0, knownNames || collectKnownNames(ast)));
  }

  /* スプライトtargetを作るメタ構文かどうかを見ます。 */
  function isSpriteDefinitionCall(call) {
    return call && call.type === "Call" && call.name === "sprite";
  }

  /* sprite内の初期設定メタ命令かどうかを見ます。 */
  function isSpriteMetaCallName(name) {
    return [
      "setSpritePosition",
      "setSpriteSize",
      "setSpriteDirection",
      "setSpriteText",
      "setSpriteColor"
    ].includes(name);
  }

  /* スプライト初期設定をプレビュー用の短い説明にします。 */
  function previewSpriteMeta(call, knownNames) {
    const args = call.args.map((arg) => previewArgument(arg, knownNames));
    const labels = {
      setSpritePosition: () => `スプライトの場所を x:${args[0]} y:${args[1]} にする`,
      setSpriteSize: () => `スプライトの大きさを ${args[0]}% にする`,
      setSpriteDirection: () => `スプライトの向きを ${args[0]}度にする`,
      setSpriteText: () => `スプライトに「${args[0]}」と表示する`,
      setSpriteColor: () => `スプライトの色を ${args[0]} にする`
    };
    return labels[call.name] ? labels[call.name]() : call.name;
  }

  /* 1つの命令をプレビュー行にします。 */
  function previewCall(call, depth, knownNames) {
    if (isSpriteDefinitionCall(call)) {
      const spriteName = call.args[0] && call.args[0].type === "StringLiteral" ? call.args[0].value : "名前未設定";
      const lines = [{
        depth,
        category: "見た目",
        text: `スプライト「${spriteName}」を作る`
      }];
      const bodyArg = call.args.find((arg) => arg.type === "Closure");
      if (bodyArg) {
        bodyArg.body.forEach((child) => lines.push(...previewCall(child, depth + 1, knownNames)));
      }
      return lines;
    }

    if (isSpriteMetaCallName(call.name)) {
      return [{
        depth,
        category: "見た目",
        text: previewSpriteMeta(call, knownNames)
      }];
    }

    const resolvedCall = resolveCallVariant(call);
    const def = R.get(resolvedCall.name);
    const unsupported = R.getUnsupported(resolvedCall.name) || R.getUnsupported(call.name);
    if (unsupported) {
      return [{
        depth,
        category: unsupported.category,
        text: `未確認: ${call.name}（${unsupported.category}、.sb3解析が必要）`
      }];
    }
    if (!def) {
      return [{
        depth,
        category: "その他",
        text: `未対応の命令: ${call.name}（${R.guessDefinitionFile(call.name)}に追加）`
      }];
    }

    const displayCall = normalizeCallForDefinition(def, resolvedCall, knownNames);
    const argLabels = displayCall.args.filter((arg) => arg.type !== "Closure").map((arg) => previewArgument(arg, knownNames));
    const text = def.label ? def.label(argLabels) : call.name;
    const lines = [{ depth, category: def.category, text }];

    displayCall.args.filter((arg) => arg.type === "Closure").forEach((closure) => {
      closure.body.forEach((child) => lines.push(...previewCall(child, depth + 1, knownNames)));
    });

    return lines;
  }

  /* 引数を短く読みやすい文字へ変換します。 */
  function previewArgument(arg, knownNames) {
    if (!arg) return "";
    if (arg.type === "StringLiteral") return arg.value;
    if (arg.type === "NumberLiteral") return String(arg.value);
    if (arg.type === "BooleanLiteral") return arg.value ? "はい" : "いいえ";
    if (arg.type === "Call") {
      const resolvedCall = resolveCallVariant(arg);
      const def = R.get(resolvedCall.name);
      const displayCall = def ? normalizeCallForDefinition(def, resolvedCall, knownNames) : resolvedCall;
      const labels = displayCall.args.filter((child) => child.type !== "Closure").map((child) => previewArgument(child, knownNames));
      return def && def.label ? def.label(labels) : `${arg.name}(...)`;
    }
    return "";
  }

  /* プレビューをHTMLへ描画します。 */
  function renderPreview(lines) {
    const output = document.getElementById("previewOutput");
    output.textContent = "";
    const wrapper = document.createElement("div");
    wrapper.className = "script-preview";
    lines.forEach((line) => {
      const item = document.createElement("div");
      item.className = `preview-line ${previewClass(line.category)}`;
      item.style.marginLeft = `${line.depth * 26}px`;
      item.textContent = line.text;
      wrapper.appendChild(item);
    });
    output.appendChild(wrapper);
  }

  /* カテゴリごとの色を選びます。 */
  function previewClass(category) {
    if (category === "イベント" || category === "メッセージ") return "preview-event";
    if (category === "制御" || category === "クローン") return "preview-control";
    if (category === "動き") return "preview-motion";
    if (category === "見た目" || category === "背景" || category === "コスチューム") return "preview-look";
    if (!["音", "調べる", "演算", "変数", "リスト"].includes(category)) return "preview-extension";
    return "preview-basic";
  }

  /* 手動確認や簡単な自動テストで使える最小APIです。 */
  window.StretchScriptApp = {
    samples: SAMPLES,
    parseStretchScript,
    validateProjectIntegrity,
    convertSourceForTest(source) {
      const ast = parseStretchScript(source);
      const knownNames = collectKnownNames(ast);
      const builder = new ScratchProjectBuilder(knownNames, [...ast.sourceCorrections, ...ast.semanticWarnings]);
      const project = builder.build(ast);
      return {
        ast,
        project,
        preview: buildPreview(ast, knownNames),
        warnings: builder.makeWarnings(),
        sourceCorrections: [...ast.sourceCorrections],
        semanticWarnings: [...ast.semanticWarnings],
        integrity: validateProjectIntegrity(project),
        categories: Array.from(builder.usedCategories),
        variables: Array.from(builder.variables.keys()),
        lists: Array.from(builder.lists.keys()),
        broadcasts: Array.from(builder.broadcasts.keys()),
        targetNames: project.targets.map((target) => target.name),
        assetFiles: project.__assetFiles ? Object.keys(project.__assetFiles) : [],
        validationReport: validateProjectJson(JSON.stringify(project, null, 2), expectedSb3FileNames(project))
      };
    }
  };

  if (typeof document !== "undefined" && document.getElementById("sourceInput")) {
    init();
  }
})();
