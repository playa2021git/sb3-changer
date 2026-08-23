/*
 * ブロック定義から辞書の本文を組み立てます。
 * scripts/build-function-dictionary.mjs（書き出し）と
 * tests/function-dictionary.test.mjs（ずれの検出）の両方から使います。
 */
import path from "node:path";
import { createRequire } from "node:module";

const BLOCK_FILES = [
  "blocks/blockRegistry.js",
  "blocks/extensionBlocks.js",
  "blocks/coreBlocks.js",
  "blocks/ml2scratch.js",
  "blocks/posenet2scratch.js",
  "blocks/microbitMore.js",
  "blocks/tm2scratch.js",
  "blocks/tmpose2scratch.js",
  "blocks/speech2scratch.js",
  "blocks/imageClassifier2scratch.js",
  "blocks/cameraSelector.js",
  "blocks/penBlocks.js",
  "blocks/musicBlocks.js",
  "blocks/textToSpeechBlocks.js",
  "blocks/translateBlocks.js"
];

/* 引数の種類を、日本語の短い言い方にします。 */
const TYPE_LABELS = {
  number: "数値",
  positiveInteger: "1以上の整数",
  string: "文字列",
  stringOrReporter: "文字列",
  boolean: "条件",
  color: "色（#RRGGBB）",
  variable: "変数名",
  list: "リスト名",
  listIndex: "番号",
  matrix: "5行5列の0と1",
  broadcast: "メッセージ名",
  broadcastInput: "メッセージ名",
  menu: "えらぶ",
  menuInput: "えらぶ"
};

const BLOCK_TYPE_NOTES = {
  hat: "いちばん外側に置く",
  reporter: "値を返す",
  boolean: "条件として使う",
  control: "中にコードを入れる"
};

/* ブロック定義を読み込んで、登録済みの一覧を取り出します。 */
function loadRegistry(rootDir) {
  globalThis.window = globalThis;
  const require = createRequire(import.meta.url);
  BLOCK_FILES.forEach((file) => require(path.join(rootDir, file)));
  return globalThis.StretchScriptBlocks;
}

/* microbitSetAnalogOut(pin, level) のような見出しを作ります。 */
function signature(definition) {
  const parts = definition.arguments.map((argument) => {
    if (argument.type === "substack") return "() => { }";
    return argument.optional ? `${argument.name}?` : argument.name;
  });
  return `${definition.functionName}(${parts.join(", ")})`;
}

/* 引数ごとの説明を1行にまとめます。 */
function argumentNotes(definition) {
  return definition.arguments
    .filter((argument) => argument.type !== "substack")
    .map((argument) => {
      const suffix = argument.optional ? `（省略可・既定値 ${JSON.stringify(argument.defaultValue)}）` : "";
      if (Array.isArray(argument.allowedValues) && argument.allowedValues.length) {
        return `${argument.name}: ${argument.allowedValues.map((value) => `"${value}"`).join(" / ")}${suffix}`;
      }
      return `${argument.name}: ${TYPE_LABELS[argument.type] || argument.type}${suffix}`;
    })
    .join("、");
}

/*
 * カスタム指示欄に貼る、名前だけの一覧を作ります。
 * 添付ファイルは読まれない場合があるため、名前だけは指示文へ直接埋め込みます。
 */
export function buildFunctionNameList(rootDir) {
  const R = loadRegistry(rootDir);
  const definitions = R.all();
  const byCategory = new Map();
  definitions.forEach((definition) => {
    if (!byCategory.has(definition.category)) byCategory.set(definition.category, []);
    byCategory.get(definition.category).push(definition);
  });

  const lines = [];
  lines.push("【使える関数名の全一覧】");
  lines.push("この一覧に無い名前は、絶対に書いてはいけません。");
  lines.push("似た名前を作る、単語を足す、単語の順番を変える、いずれも禁止です。");
  lines.push("引数の書き方とメニューの値は function-dictionary.md で確認します。");
  lines.push("");

  Array.from(byCategory.entries()).forEach(([category, group]) => {
    const names = group
      .map((definition) => definition.functionName)
      .sort((a, b) => a.localeCompare(b));
    lines.push(`■${category}`);
    lines.push(names.join("、"));
    lines.push("");
  });

  const menuNotes = definitions
    .filter((definition) => definition.extensionId === "microbitMore")
    .flatMap((definition) =>
      definition.arguments
        .filter((argument) => Array.isArray(argument.allowedValues) && argument.allowedValues.length)
        .map((argument) => `${definition.functionName} の ${argument.name}: ${argument.allowedValues.map((value) => `"${value}"`).join(" / ")}`)
    );

  if (menuNotes.length) {
    lines.push("【micro:bitのメニューで使える値】");
    lines.push("ここに無い値を書いてはいけません。無い値を頼まれたら、無いと伝えます。");
    lines.push(...menuNotes);
    lines.push("");
  }

  return `${lines.join("\n")}`;
}

export function buildFunctionDictionary(rootDir) {
  const R = loadRegistry(rootDir);
  const definitions = R.all();
  const byCategory = new Map();
  definitions.forEach((definition) => {
    if (!byCategory.has(definition.category)) byCategory.set(definition.category, []);
    byCategory.get(definition.category).push(definition);
  });

  const lines = [];
  lines.push("# 使える関数の辞書");
  lines.push("");
  lines.push("このファイルは Sb3-Changer のブロック定義から自動で書き出しています。");
  lines.push("**ここに載っていない関数名を書いてはいけません。似た名前を作ることも禁止です。**");
  lines.push("");
  lines.push("読み方");
  lines.push("");
  lines.push("- 見出しが関数の書き方です。引数の名前は説明用なので、そのまま書くのではなく値を入れます。");
  lines.push('- 「えらぶ」と書いてある引数は、並んでいる値のどれかを ""で囲んで書きます。それ以外の値は使えません。');
  lines.push("- 「いちばん外側に置く」ものは、他の関数の中に入れてはいけません。");
  lines.push("- 引数名のうしろに ? が付いているものは省略できます。省略すると既定値が使われます。");
  lines.push("");
  lines.push(`関数の数: ${definitions.length}`);
  lines.push("");

  Array.from(byCategory.entries()).forEach(([category, group]) => {
    lines.push(`## ${category}`);
    lines.push("");
    group
      .slice()
      .sort((a, b) => a.functionName.localeCompare(b.functionName))
      .forEach((definition) => {
        const notes = [];
        const blockNote = BLOCK_TYPE_NOTES[definition.blockType];
        if (blockNote) notes.push(blockNote);
        const args = argumentNotes(definition);
        if (args) notes.push(args);
        lines.push(`- \`${signature(definition)}\`${notes.length ? ` … ${notes.join(" / ")}` : ""}`);
        if (definition.sample) lines.push(`  - 例: \`${definition.sample}\``);
      });
    lines.push("");
  });

  const unsupported = R.unsupportedAll();
  if (unsupported.length) {
    lines.push("## 使えないもの");
    lines.push("");
    lines.push("次の機能はまだ対応していません。頼まれても書かず、対応していないと伝えてください。");
    lines.push("");
    unsupported
      .slice()
      .sort((a, b) => a.functionName.localeCompare(b.functionName))
      .forEach((entry) => {
        lines.push(`- \`${entry.functionName}\` … ${entry.category}`);
      });
    lines.push("");
  }

  return `${lines.join("\n")}`;
}
