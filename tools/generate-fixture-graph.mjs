import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  normalizeProjectGraph,
  readProjectJsonFromSb3,
  stableStringify
} from "./fixture-graph.mjs";

const [sb3Path, graphPath] = process.argv.slice(2);

if (!sb3Path || !graphPath) {
  console.error("使い方: node tools/generate-fixture-graph.mjs fixture.sb3 graph.json");
  process.exitCode = 1;
} else {
  const project = readProjectJsonFromSb3(sb3Path);
  const graph = normalizeProjectGraph(project);
  mkdirSync(path.dirname(graphPath), { recursive: true });
  writeFileSync(graphPath, stableStringify(graph), "utf8");
  console.log(`${sb3Path} -> ${graphPath}`);
}
