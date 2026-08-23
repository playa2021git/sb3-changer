import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildFunctionDictionary, buildFunctionNameList } from "../tools/function-dictionary.mjs";

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

test("カスタム指示欄用の全文も最新である", () => {
  const committed = readFileSync(path.join(rootDir, "prompt", "gem-instruction-with-names.txt"), "utf8");
  const instruction = readFileSync(path.join(rootDir, "prompt", "gem-instruction.txt"), "utf8");
  const expected = `${instruction.trimEnd()}\n\n${buildFunctionNameList(rootDir)}`;
  assert.equal(
    committed,
    expected,
    "指示文かブロックを変えたら node scripts/build-function-dictionary.mjs で作り直してください。"
  );
});

test("名前一覧には実在する関数名だけが並ぶ", () => {
  const R = globalThis.StretchScriptBlocks;
  const nameList = buildFunctionNameList(rootDir);
  const section = nameList.split("【micro:bitのメニューで使える値】")[0];
  const names = section
    .split("\n")
    .filter((line) => line.includes("、") && !line.startsWith("■") && !line.includes("。"))
    .flatMap((line) => line.split("、"))
    .map((name) => name.trim())
    .filter(Boolean);

  assert.ok(names.length > 100);
  names.forEach((functionName) => {
    assert.equal(R.has(functionName), true, `${functionName} は登録されていません。`);
  });
});
