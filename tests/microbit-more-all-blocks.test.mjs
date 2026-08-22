import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readProjectJsonFromSb3 } from "../tools/fixture-graph.mjs";

// ブラウザ用のグローバルをNodeテストで再現します。
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
globalThis.window = globalThis;
const require = createRequire(import.meta.url);

[
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
  "blocks/translateBlocks.js",
  "script.js"
].forEach((filePath) => {
  require(path.join(rootDir, filePath));
});

const app = globalThis.StretchScriptApp;
const fixturePath = path.join(rootDir, "fixtures/microbit-more/all-blocks.sb3");

// 公式fixtureに入っている各ブロックの保存形を、opcodeで引けるようにします。
function loadFixtureShapes() {
  const project = readProjectJsonFromSb3(fixturePath);
  const shapes = new Map();
  project.targets.forEach((target) => {
    Object.values(target.blocks).forEach((block) => {
      if (!block || typeof block !== "object") return;
      const opcode = block.opcode || "";
      if (!opcode.startsWith("microbitMore_") || opcode.startsWith("microbitMore_menu")) return;
      shapes.set(opcode, {
        inputs: Object.keys(block.inputs || {}).sort(),
        fields: Object.keys(block.fields || {}).sort()
      });
    });
  });
  return shapes;
}

const fixtureShapes = loadFixtureShapes();

// StretchScript 1行を変換して、生成されたMicrobit Moreブロックを取り出します。
function generatedShape(source, opcode) {
  const result = app.convertSourceForTest(source);
  assert.deepEqual(result.integrity, []);
  const blocks = [];
  result.project.targets.forEach((target) => {
    Object.values(target.blocks).forEach((block) => {
      if (block && block.opcode === opcode) blocks.push(block);
    });
  });
  assert.equal(blocks.length, 1, `${opcode} が1つ生成されるはずです`);
  const block = blocks[0];
  return {
    inputs: Object.keys(block.inputs || {}).filter((key) => key !== "SUBSTACK").sort(),
    fields: Object.keys(block.fields || {}).sort()
  };
}

// 公式31ブロックすべての最小サンプルです。
const cases = [
  ["microbitMore_whenConnectionChanged", 'whenMicrobitConnectionChanged("connected", () => { say("a", 1); });'],
  ["microbitMore_whenButtonEvent", 'whenMicrobitButtonEvent("A", "CLICK", () => { say("a", 1); });'],
  ["microbitMore_isButtonPressed", 'whenGreenFlagClicked(() => { ifBlock(microbitButtonPressed("A"), () => { say("a", 1); }); });'],
  ["microbitMore_whenTouchEvent", 'whenMicrobitTouchEvent("LOGO", "DOWN", () => { say("a", 1); });'],
  ["microbitMore_isPinTouched", 'whenGreenFlagClicked(() => { ifBlock(microbitPinTouched("LOGO"), () => { say("a", 1); }); });'],
  ["microbitMore_whenGesture", 'whenMicrobitGesture("SHAKE", () => { say("a", 1); });'],
  ["microbitMore_displayMatrix", 'whenGreenFlagClicked(() => { microbitDisplayMatrix("0101011111111110111000100"); });'],
  ["microbitMore_displayText", 'whenGreenFlagClicked(() => { microbitDisplayText("Hi", 120); });'],
  ["microbitMore_displayClear", 'whenGreenFlagClicked(() => { microbitClearDisplay(); });'],
  ["microbitMore_getLightLevel", 'whenGreenFlagClicked(() => { sayNow(microbitLightLevel()); });'],
  ["microbitMore_getTemperature", 'whenGreenFlagClicked(() => { sayNow(microbitTemperature()); });'],
  ["microbitMore_getCompassHeading", 'whenGreenFlagClicked(() => { sayNow(microbitCompassHeading()); });'],
  ["microbitMore_getPitch", 'whenGreenFlagClicked(() => { sayNow(microbitPitch()); });'],
  ["microbitMore_getRoll", 'whenGreenFlagClicked(() => { sayNow(microbitRoll()); });'],
  ["microbitMore_getSoundLevel", 'whenGreenFlagClicked(() => { sayNow(microbitSoundLevel()); });'],
  ["microbitMore_getMagneticForce", 'whenGreenFlagClicked(() => { sayNow(microbitMagneticForce("absolute")); });'],
  ["microbitMore_getAcceleration", 'whenGreenFlagClicked(() => { sayNow(microbitAcceleration("x")); });'],
  ["microbitMore_getAnalogValue", 'whenGreenFlagClicked(() => { sayNow(microbitAnalogValue("0")); });'],
  ["microbitMore_setPullMode", 'whenGreenFlagClicked(() => { microbitSetPullMode("0", "UP"); });'],
  ["microbitMore_isPinHigh", 'whenGreenFlagClicked(() => { ifBlock(microbitPinHigh("0"), () => { say("a", 1); }); });'],
  ["microbitMore_setDigitalOut", 'whenGreenFlagClicked(() => { microbitSetDigitalOut("0", "true"); });'],
  ["microbitMore_setAnalogOut", 'whenGreenFlagClicked(() => { microbitSetAnalogOut("0", 512); });'],
  ["microbitMore_setServo", 'whenGreenFlagClicked(() => { microbitSetServo("0", 90); });'],
  ["microbitMore_playTone", 'whenGreenFlagClicked(() => { microbitPlayTone(440, 100); });'],
  ["microbitMore_stopTone", 'whenGreenFlagClicked(() => { microbitStopTone(); });'],
  ["microbitMore_listenPinEventType", 'whenGreenFlagClicked(() => { microbitListenPinEventType("0", "ON_EDGE"); });'],
  ["microbitMore_whenPinEvent", 'whenMicrobitPinEvent("0", "RISE", () => { say("a", 1); });'],
  ["microbitMore_getPinEventValue", 'whenGreenFlagClicked(() => { sayNow(microbitPinEventValue("0", "PULSE_LOW")); });'],
  ["microbitMore_whenDataReceived", 'whenMicrobitDataReceived("label-01", () => { say("a", 1); });'],
  ["microbitMore_getDataLabeled", 'whenGreenFlagClicked(() => { sayNow(microbitDataLabeled("label-01")); });'],
  ["microbitMore_sendData", 'whenGreenFlagClicked(() => { microbitSendData("label-01", "hello"); });']
];

test("公式fixtureに31ブロックすべてが入っている", () => {
  assert.equal(fixtureShapes.size, 31);
});

test("StretchScriptの各関数が31ブロックすべてを網羅している", () => {
  assert.equal(cases.length, 31);
  const covered = new Set(cases.map(([opcode]) => opcode));
  fixtureShapes.forEach((_shape, opcode) => {
    assert.ok(covered.has(opcode), `${opcode} のテストがありません`);
  });
});

cases.forEach(([opcode, source]) => {
  test(`保存形が公式fixtureと一致する: ${opcode}`, () => {
    const expected = fixtureShapes.get(opcode);
    assert.ok(expected, `${opcode} がfixtureにありません`);
    assert.deepEqual(generatedShape(source, opcode), expected);
  });
});

test("軸を選ぶ別名が同じopcodeへ変換される", () => {
  const aliases = [
    ["microbitAccelerationX", "microbitMore_getAcceleration", "x"],
    ["microbitAccelerationY", "microbitMore_getAcceleration", "y"],
    ["microbitAccelerationZ", "microbitMore_getAcceleration", "z"],
    ["microbitAccelerationAbsolute", "microbitMore_getAcceleration", "absolute"],
    ["microbitMagneticForceX", "microbitMore_getMagneticForce", "x"],
    ["microbitMagneticForceY", "microbitMore_getMagneticForce", "y"],
    ["microbitMagneticForceZ", "microbitMore_getMagneticForce", "z"],
    ["microbitMagneticForceAbsolute", "microbitMore_getMagneticForce", "absolute"]
  ];

  aliases.forEach(([functionName, opcode, axis]) => {
    const result = app.convertSourceForTest(`whenGreenFlagClicked(() => { sayNow(${functionName}()); });`);
    assert.deepEqual(result.integrity, []);
    const blocks = [];
    result.project.targets.forEach((target) => {
      Object.values(target.blocks).forEach((block) => {
        if (block && block.opcode === opcode) blocks.push(block);
      });
    });
    assert.equal(blocks.length, 1);
    assert.deepEqual(blocks[0].fields.AXIS, [axis, null]);
  });
});

test("メニューにない値はエラーになる", () => {
  assert.throws(() => app.convertSourceForTest('whenMicrobitGesture("JUMP", () => { say("a", 1); });'));
  assert.throws(() => app.convertSourceForTest('whenGreenFlagClicked(() => { sayNow(microbitAcceleration("X")); });'));
});
