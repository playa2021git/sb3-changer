import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_DIRECTORY_ENTRY = 0x02014b50;
const LOCAL_FILE_HEADER = 0x04034b50;

function findEndOfCentralDirectory(archive) {
  const minimumOffset = Math.max(0, archive.length - 65_557);
  for (let offset = archive.length - 22; offset >= minimumOffset; offset -= 1) {
    if (archive.readUInt32LE(offset) === END_OF_CENTRAL_DIRECTORY) {
      return offset;
    }
  }
  throw new Error("ZIPのEnd of Central Directoryが見つかりません。");
}

/**
 * Read one file from a small, non-ZIP64 archive without adding a package dependency.
 * Scratch .sb3 files use this ordinary ZIP layout.
 */
export function readZipEntry(archivePath, entryName) {
  const archive = readFileSync(archivePath);
  const endOffset = findEndOfCentralDirectory(archive);
  const entryCount = archive.readUInt16LE(endOffset + 10);
  let offset = archive.readUInt32LE(endOffset + 16);

  for (let index = 0; index < entryCount; index += 1) {
    if (archive.readUInt32LE(offset) !== CENTRAL_DIRECTORY_ENTRY) {
      throw new Error(`ZIPのCentral Directory entry ${index} が壊れています。`);
    }

    const compressionMethod = archive.readUInt16LE(offset + 10);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const fileNameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localHeaderOffset = archive.readUInt32LE(offset + 42);
    const fileName = archive.subarray(offset + 46, offset + 46 + fileNameLength).toString("utf8");

    if (fileName === entryName) {
      if (archive.readUInt32LE(localHeaderOffset) !== LOCAL_FILE_HEADER) {
        throw new Error(`${entryName} のLocal File Headerが壊れています。`);
      }
      const localNameLength = archive.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = archive.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = archive.subarray(dataOffset, dataOffset + compressedSize);

      if (compressionMethod === 0) return Buffer.from(compressed);
      if (compressionMethod === 8) return inflateRawSync(compressed);
      throw new Error(`${entryName} のZIP圧縮方式 ${compressionMethod} は未対応です。`);
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error(`${archivePath} に ${entryName} がありません。`);
}

export function readProjectJsonFromSb3(archivePath) {
  const source = readZipEntry(archivePath, "project.json").toString("utf8");
  return JSON.parse(source);
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortObject(value[key])])
  );
}

function normalizeTarget(target) {
  const blocks = target.blocks || {};
  const covered = new Set();

  const normalizeBlock = (blockId, ancestors = new Set()) => {
    const block = blocks[blockId];
    if (!block) throw new Error(`参照先ブロック ${blockId} がありません。`);
    if (ancestors.has(blockId)) throw new Error(`ブロックグラフに循環参照があります: ${blockId}`);

    covered.add(blockId);
    const nextAncestors = new Set(ancestors);
    nextAncestors.add(blockId);

    const inputs = Object.fromEntries(
      Object.keys(block.inputs || {})
        .sort()
        .map((name) => {
          const rawInput = block.inputs[name];
          const normalizedInput = rawInput.map((item, index) => {
            if (index > 0 && typeof item === "string" && blocks[item]) {
              return { block: normalizeBlock(item, nextAncestors) };
            }
            return sortObject(item);
          });
          return [name, normalizedInput];
        })
    );

    const normalized = {
      opcode: block.opcode,
      shadow: Boolean(block.shadow),
      topLevel: Boolean(block.topLevel),
      inputs,
      fields: sortObject(block.fields || {}),
      next: block.next ? normalizeBlock(block.next, nextAncestors) : null
    };

    if (block.mutation) normalized.mutation = sortObject(block.mutation);
    return normalized;
  };

  const rootIds = Object.keys(blocks).filter((blockId) => {
    const block = blocks[blockId];
    return block.topLevel === true || block.parent === null;
  });
  const stacks = rootIds.map((blockId) => normalizeBlock(blockId));
  stacks.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));

  const orphanIds = Object.keys(blocks).filter((blockId) => !covered.has(blockId));
  const orphans = orphanIds.map((blockId) => normalizeBlock(blockId));
  orphans.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));

  return {
    isStage: Boolean(target.isStage),
    stacks,
    orphans
  };
}

/**
 * Normalize one block and the blocks referenced by its inputs.
 * Surrounding parent/next connections are intentionally omitted so a generated
 * block can be compared with the same block embedded in a larger official sample.
 */
export function normalizeBlockShape(target, blockId) {
  const blocks = target.blocks || {};

  const normalizeBlock = (currentId, ancestors = new Set()) => {
    const block = blocks[currentId];
    if (!block) throw new Error(`参照先ブロック ${currentId} がありません。`);
    if (ancestors.has(currentId)) throw new Error(`ブロック入力に循環参照があります: ${currentId}`);

    const nextAncestors = new Set(ancestors);
    nextAncestors.add(currentId);
    const inputs = Object.fromEntries(
      Object.keys(block.inputs || {})
        .sort()
        .map((name) => [
          name,
          block.inputs[name].map((item, index) => {
            if (index > 0 && typeof item === "string" && blocks[item]) {
              return { block: normalizeBlock(item, nextAncestors) };
            }
            return sortObject(item);
          })
        ])
    );

    const normalized = {
      opcode: block.opcode,
      inputs,
      fields: sortObject(block.fields || {}),
      shadow: Boolean(block.shadow)
    };
    if (block.mutation) normalized.mutation = sortObject(block.mutation);
    return normalized;
  };

  return normalizeBlock(blockId);
}

/**
 * Convert project.json into an ID- and coordinate-independent block graph.
 * Parent links are derived from next/input edges, so they are intentionally omitted.
 */
export function normalizeProjectGraph(project) {
  const targets = (project.targets || []).map(normalizeTarget);
  targets.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));

  return sortObject({
    extensions: [...(project.extensions || [])].sort(),
    extensionURLs: [...(project.extensionURLs || [])]
      .map(sortObject)
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
    targets
  });
}

export function stableStringify(value) {
  return `${JSON.stringify(sortObject(value), null, 2)}\n`;
}

export function findFixtureBlocks(project, selector) {
  const matches = [];
  for (const target of project.targets || []) {
    for (const [blockId, block] of Object.entries(target.blocks || {})) {
      if (block.opcode !== selector.opcode) continue;
      if (selector.targetName && target.name !== selector.targetName) continue;
      const requiredFields = selector.fields || {};
      const fieldsMatch = Object.entries(requiredFields).every(([name, value]) => {
        return block.fields?.[name]?.[0] === value;
      });
      if (fieldsMatch) matches.push({ target, blockId, block });
    }
  }
  return matches;
}
