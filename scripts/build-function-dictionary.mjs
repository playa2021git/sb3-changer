/*
 * ブロック定義から、Gemに渡す「使える関数の辞書」を書き出します。
 * 使い方: node scripts/build-function-dictionary.mjs
 * 出力  : prompt/function-dictionary.md
 *
 * 手で書き足さないでください。ブロック定義が唯一の出どころです。
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildFunctionDictionary } from "../tools/function-dictionary.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(rootDir, "prompt", "function-dictionary.md");

writeFileSync(outputPath, buildFunctionDictionary(rootDir), "utf8");
console.log(`updated prompt/function-dictionary.md`);
