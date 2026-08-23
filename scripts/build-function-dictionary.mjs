/*
 * ブロック定義から、Gemに渡す「使える関数の辞書」を書き出します。
 * 使い方: node scripts/build-function-dictionary.mjs
 * 出力  : prompt/function-dictionary.md（添付用の辞書）
 *          prompt/gem-instruction-with-names.txt（カスタム指示欄へ貼る全文）
 *
 * 手で書き足さないでください。ブロック定義が唯一の出どころです。
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { buildFunctionDictionary, buildFunctionNameList } from "../tools/function-dictionary.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
writeFileSync(
  path.join(rootDir, "prompt", "function-dictionary.md"),
  buildFunctionDictionary(rootDir),
  "utf8"
);
console.log("updated prompt/function-dictionary.md");

const instruction = readFileSync(path.join(rootDir, "prompt", "gem-instruction.txt"), "utf8");
writeFileSync(
  path.join(rootDir, "prompt", "gem-instruction-with-names.txt"),
  `${instruction.trimEnd()}\n\n${buildFunctionNameList(rootDir)}`,
  "utf8"
);
console.log("updated prompt/gem-instruction-with-names.txt");
