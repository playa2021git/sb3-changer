import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  findFixtureBlocks,
  normalizeProjectGraph,
  readProjectJsonFromSb3
} from "../tools/fixture-graph.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const definitionsDir = path.join(rootDir, "definitions");
const compatibilityTarget = JSON.parse(
  readFileSync(path.join(rootDir, "compatibility/target.json"), "utf8")
);
const requiredBlockKeys = [
  "functionName",
  "extensionId",
  "opcode",
  "blockType",
  "inputs",
  "fields",
  "menuValues",
  "shadow",
  "fixture",
  "fixtureStatus",
  "supportStatus",
  "deviceVerificationStatus",
  "officialSource"
];

const definitionFiles = readdirSync(definitionsDir)
  .filter((fileName) => fileName.endsWith(".json") && fileName !== "schema.json")
  .sort();

const definitions = definitionFiles.map((fileName) => ({
  fileName,
  value: JSON.parse(readFileSync(path.join(definitionsDir, fileName), "utf8"))
}));

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function expectedFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([name, descriptor]) => [
      name,
      [descriptor.value, descriptor.id ?? null]
    ])
  );
}

function targetEntry(extensionId) {
  return compatibilityTarget.scope.customExtensions.find((entry) => entry.id === extensionId);
}

test("グラフ正規化はブロックIDと座標を無視し、接続構造は保持する", () => {
  const makeProject = (rootId, childId, x, y, connected = true) => ({
    extensions: [],
    extensionURLs: [],
    targets: [
      {
        isStage: false,
        blocks: {
          [rootId]: {
            opcode: "event_whenflagclicked",
            next: connected ? childId : null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x,
            y
          },
          [childId]: {
            opcode: "looks_say",
            next: null,
            parent: connected ? rootId : null,
            inputs: {
              MESSAGE: [1, [10, "hello"]]
            },
            fields: {},
            shadow: false,
            topLevel: !connected,
            x: x + 100,
            y: y + 100
          }
        }
      }
    ]
  });

  const first = normalizeProjectGraph(makeProject("block-a", "block-b", 10, 20));
  const renamed = normalizeProjectGraph(makeProject("random-1", "random-2", 900, -300));
  const disconnected = normalizeProjectGraph(makeProject("block-a", "block-b", 10, 20, false));

  assert.deepEqual(first, renamed);
  assert.notDeepEqual(first, disconnected);
});

test("台帳JSONは必須項目を持ち、compatibility targetの固定コミットと一致する", () => {
  assert.ok(definitions.length > 0, "definitions/*.json がありません。");

  for (const { fileName, value: definition } of definitions) {
    assert.equal(definition.schemaVersion, 1, fileName);
    assert.ok(definition.slug, fileName);
    assert.ok(definition.extensionName, fileName);
    assert.ok(definition.extensionId, fileName);
    assert.ok(Array.isArray(definition.fixtures), fileName);
    assert.ok(Array.isArray(definition.blocks), fileName);

    const target = targetEntry(definition.extensionId);
    assert.ok(target, `${definition.extensionId} が compatibility/target.json にありません。`);
    assert.equal(definition.officialSource.repository, target.repository, fileName);
    assert.equal(definition.officialSource.commit, target.commit, fileName);
    assert.equal(definition.officialSource.sourcePath, target.sourcePath, fileName);
    assert.equal(
      definition.blocks.length,
      target.declaredBlockCount,
      `${fileName} は公式getInfo()の全ブロックを列挙する必要があります。`
    );

    const functionNames = new Set();
    const opcodes = new Set();
    for (const block of definition.blocks) {
      for (const key of requiredBlockKeys) {
        assert.ok(Object.hasOwn(block, key), `${fileName}: ${block.opcode || "unknown"}.${key} がありません。`);
      }
      assert.equal(block.extensionId, definition.extensionId, block.opcode);
      assert.deepEqual(block.officialSource, definition.officialSource, block.opcode);
      assert.ok(!functionNames.has(block.functionName), `${fileName}: functionNameが重複しています。`);
      assert.ok(!opcodes.has(block.opcode), `${fileName}: opcodeが重複しています。`);
      functionNames.add(block.functionName);
      opcodes.add(block.opcode);
    }
  }
});

for (const { fileName, value: definition } of definitions) {
  test(`${fileName}: 公式sb3と正規化グラフsnapshotが一致する`, () => {
    const fixturesById = new Map();

    for (const fixture of definition.fixtures) {
      const sb3Path = path.join(rootDir, fixture.sb3Path);
      const graphPath = path.join(rootDir, fixture.graphPath);
      assert.ok(existsSync(sb3Path), `${fixture.sb3Path} がありません。`);
      assert.ok(existsSync(graphPath), `${fixture.graphPath} がありません。`);
      assert.equal(sha256(sb3Path), fixture.sha256, `${fixture.sb3Path} のSHA-256が変わっています。`);
      assert.equal(fixture.source.repository, definition.officialSource.repository);
      assert.equal(fixture.source.commit, definition.officialSource.commit);

      const project = readProjectJsonFromSb3(sb3Path);
      assert.ok(project.extensions.includes(definition.extensionId));
      if (definition.extensionURL) {
        assert.ok(
          (project.extensionURLs || []).some(([extensionId, extensionURL]) =>
            extensionId === definition.extensionId && extensionURL === definition.extensionURL
          ),
          `${fixture.sb3Path} のextensionURLが台帳と一致しません。`
        );
      }
      const fixtureOpcodes = new Set(
        (project.targets || []).flatMap((target) =>
          Object.values(target.blocks || {}).map((block) => block.opcode)
        )
      );
      for (const legacyOpcode of fixture.knownLegacyOpcodes || []) {
        assert.ok(fixtureOpcodes.has(legacyOpcode), `${fixture.sb3Path} に ${legacyOpcode} がありません。`);
        assert.ok(
          !definition.blocks.some((block) => block.opcode === legacyOpcode),
          `${legacyOpcode} は現行getInfo()のブロックとして登録できません。`
        );
      }
      const actualGraph = normalizeProjectGraph(project);
      const expectedGraph = JSON.parse(readFileSync(graphPath, "utf8"));
      assert.deepEqual(actualGraph, expectedGraph);
      fixturesById.set(fixture.id, { fixture, project });
    }

    for (const blockDefinition of definition.blocks) {
      if (blockDefinition.fixtureStatus !== "verified") {
        assert.equal(
          blockDefinition.fixture,
          null,
          `${blockDefinition.opcode}: verifiedでないブロックはfixtureを推測で関連付けません。`
        );
        continue;
      }

      assert.ok(blockDefinition.fixture, `${blockDefinition.opcode}: verifiedなのにfixtureがありません。`);
      const fixtureRecord = fixturesById.get(blockDefinition.fixture.fixtureId);
      assert.ok(fixtureRecord, `${blockDefinition.opcode}: fixtureIdが見つかりません。`);
      assert.equal(blockDefinition.fixture.selector.opcode, blockDefinition.opcode);

      const matches = findFixtureBlocks(fixtureRecord.project, blockDefinition.fixture.selector);
      const occurrence = blockDefinition.fixture.selector.occurrence ?? 0;
      assert.ok(matches[occurrence], `${blockDefinition.opcode} が実物fixtureにありません。`);
      const { target, block } = matches[occurrence];

      assert.equal(block.opcode, blockDefinition.opcode);
      assert.equal(Boolean(block.shadow), blockDefinition.shadow);
      assert.deepEqual(Object.keys(block.inputs || {}).sort(), Object.keys(blockDefinition.inputs).sort());
      assert.deepEqual(block.fields || {}, expectedFields(blockDefinition.fields));

      for (const [fieldName, menu] of Object.entries(blockDefinition.menuValues)) {
        if (!block.fields?.[fieldName]) continue;
        const actualMenuValue = block.fields[fieldName][0];
        assert.ok(menu.values.includes(actualMenuValue), `${blockDefinition.opcode}.${fieldName} が公式menu値にありません。`);
        assert.ok(
          menu.fixtureValues.includes(actualMenuValue),
          `${blockDefinition.opcode}.${fieldName} がfixtureのmenu値にありません。`
        );
      }

      for (const [inputName, inputDefinition] of Object.entries(blockDefinition.inputs)) {
        const rawInput = block.inputs[inputName];
        assert.equal(rawInput[0], inputDefinition.inputMode, `${blockDefinition.opcode}.${inputName}`);

        if (inputDefinition.shadowOpcode) {
          const referencedBlocks = rawInput
            .slice(1)
            .filter((value) => typeof value === "string")
            .map((blockId) => target.blocks[blockId])
            .filter(Boolean);
          const shadowBlock = referencedBlocks.find((candidate) => candidate.opcode === inputDefinition.shadowOpcode);
          assert.ok(shadowBlock, `${blockDefinition.opcode}.${inputName} のshadowが見つかりません。`);
          assert.equal(shadowBlock.shadow, true);

          const menu = blockDefinition.menuValues[inputName];
          if (menu) {
            const actualMenuValue = shadowBlock.fields?.[inputDefinition.shadowField]?.[0];
            assert.ok(
              menu.fixtureValues.includes(actualMenuValue),
              `${blockDefinition.opcode}.${inputName} のmenu値が台帳にありません。`
            );
          }
        }
      }
    }
  });
}
