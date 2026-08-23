import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildFunctionDictionary } from "../tools/function-dictionary.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dictionaryPath = path.join(rootDir, "prompt", "function-dictionary.md");
const generated = buildFunctionDictionary(rootDir);

test("prompt/function-dictionary.md はブロック定義と一致している", () => {
  const committed = readFileSync(dictionaryPath, "utf8");
  assert.equal(
    committed,
    generated,
    "ブロックを追加・変更したら node scripts/build-function-dictionary.mjs で辞書を作り直してください。"
  );
});

test("辞書には実在する関数名だけが載っている", () => {
  globalThis.window = globalThis;
  const R = globalThis.StretchScriptBlocks;
  const listed = Array.from(generated.matchAll(/^- `([A-Za-z0-9_]+)\(/gm)).map((match) => match[1]);
  const unsupportedNames = new Set(R.unsupportedAll().map((entry) => entry.functionName));

  listed.forEach((functionName) => {
    if (unsupportedNames.has(functionName)) return;
    assert.equal(R.has(functionName), true, `${functionName} は登録されていません。`);
  });
  assert.equal(listed.length >= R.all().length, true);
});

test("辞書には別名を載せない", () => {
  const R = globalThis.StretchScriptBlocks;
  R.aliases().forEach(([aliasName]) => {
    assert.equal(
      generated.includes(`\`${aliasName}(`),
      false,
      `${aliasName} は別名なので辞書に載せてはいけません。`
    );
  });
});

test("メニューの選択肢が辞書に書き出されている", () => {
  assert.match(generated, /whenMicrobitButtonPressed\(button, \(\) => \{ \}\)` … いちばん外側に置く \/ button: "A" \/ "B"/);
  assert.match(generated, /microbitSetAnalogOut\(pin, level\)` … pin: "0" \/ "1" \/ "2" \/ "8"/);
});
