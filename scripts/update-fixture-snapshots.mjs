import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  normalizeProjectGraph,
  readProjectJsonFromSb3,
  stableStringify
} from "../tools/fixture-graph.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const definitionsDir = path.join(rootDir, "definitions");
const fixturePairs = new Map();

for (const fileName of readdirSync(definitionsDir).filter((name) => name.endsWith(".json") && name !== "schema.json")) {
  const definition = JSON.parse(readFileSync(path.join(definitionsDir, fileName), "utf8"));
  for (const fixture of definition.fixtures || []) {
    fixturePairs.set(fixture.sb3Path, fixture.graphPath);
  }
}

for (const [sb3Path, graphPath] of fixturePairs) {
  const project = readProjectJsonFromSb3(path.join(rootDir, sb3Path));
  const graph = normalizeProjectGraph(project);
  writeFileSync(path.join(rootDir, graphPath), stableStringify(graph));
  console.log(`updated ${graphPath}`);
}
