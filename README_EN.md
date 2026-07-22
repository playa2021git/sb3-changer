# StretchScript to .sb3 Converter

[日本語](README.md) | English

This is a static web app that converts StretchScript into `.sb3` files that can be opened in Scratch 3.0 / [Stretch3](https://stretch3.github.io/).
It is designed for classroom use and prototyping workflows where an AI tool such as Gemini writes Scratch-like code, and this app turns that code into a Scratch project file.

Open `index.html` in a browser to use it. There is no build step.

## Project Priorities

This converter values safe, readable Scratch projects over broad but unreliable coverage.

- It never writes guessed `opcode`, `inputs`, or `fields` values into `.sb3` files.
- Unverified extension blocks fail safely instead of being converted from assumptions.
- If the input contains even one unverified block, conversion does not succeed.
- When conversion fails, the `.sb3` download button stays disabled.
- Existing successful routes, especially Scratch core blocks, Pen, lists, variables, and control blocks, are protected first.

## What It Can Do

The current main support areas are:

- Major Scratch core block categories
  - Events, broadcasts, motion, looks, sound, control, sensing, operators, variables, lists, and clones
- Pen extension
- Music extension
- Translate extension
- Text to Speech extension
- A small verified subset of Microbit More
- Six ML2Scratch blocks found in the official 1-or-2 sample
- CameraSelector `selectCamera`
- Speech2Scratch recognition start and recognized-text reporter
- A multi-sprite MVP through `sprite("name", () => { ... })`
- Downloadable `.sb3` files containing generated `project.json` and SVG assets
- Scratch-like preview, friendly errors, and warnings

Detailed references:

- [StretchScript specification](stretchscript-spec.md)
- [Scratch standard block table](scratch-standard-blocks.md)
- [Multi-sprite MVP plan](scratch-multisprite-plan.md)
- [Microbit More block matrix](docs/microbit-more-block-matrix.md)

## What It Does Not Do Yet

The following areas are unsupported or intentionally blocked until their saved `.sb3` shapes are verified:

- Extension blocks whose saved `project.json` shape has not been confirmed from a real `.sb3`
- Unverified blocks from ImageClassifier2Scratch, Posenet2Scratch, TM2Scratch, TMPose2Scratch, and AkaDako
- The 23 ML2Scratch blocks whose saved shapes are absent from the official 1-or-2 sample
- Compatibility helper functions that do not exist in the official CameraSelector / Speech2Scratch `getInfo()`
- Microbit More blocks such as `TILT_LEFT` / `TILT_RIGHT`, servos, pin I/O, and sensor reporters
- Scratch custom block definitions
- General JavaScript APIs such as arrays, `parseInt`, `Number`, `toString`, `includes`, and `push`

This is not a general JavaScript-to-Scratch compiler. It only converts supported StretchScript functions into verified Scratch block structures.

## How To Use

1. Open `index.html` in Chrome or another modern browser.
2. Paste StretchScript into the editor.
3. Press the conversion button.
4. Review the preview and any error messages.
5. Download the `.sb3` only after conversion succeeds.
6. Open the downloaded `.sb3` in [Stretch3](https://stretch3.github.io/) or a compatible Scratch 3.0 environment.

Example:

```js
whenGreenFlagClicked(() => {
  penClear();
  penDown();
  repeat(4, () => {
    move(100);
    turnRight(90);
  });
  penUp();
});
```

This mainly generates:

- `penClear()` -> `pen_clear`
- `penDown()` -> `pen_penDown`
- `repeat(4, ...)` -> `control_repeat`
- `move(100)` -> `motion_movesteps`
- `turnRight(90)` -> `motion_turnright`
- `penUp()` -> `pen_penUp`
- `"pen"` in the generated `project.json` `extensions` list

## Prompting An AI To Write StretchScript

When asking an AI tool to generate code for this converter, give instructions like:

```text
Output only StretchScript.
Do not output explanations, Markdown, or code fences.
Do not invent unsupported functions.
Use only functions listed in the StretchScript specification.
Do not use general JavaScript APIs.
Do not output .sb3 files or project.json directly.
```

Use [stretchscript-spec.md](stretchscript-spec.md) as the compact prompt-oriented function reference.

## Supported Function Areas

### Scratch Core Blocks

- Variables: `setVariable`, `changeVariable`, `getVariable`, `showVariable`, `hideVariable`
- Lists: `deleteAllOfList`, `addToList`, `deleteOfList`, `insertAtList`, `replaceItemOfList`, `itemOfList`, `itemNumOfList`, `lengthOfList`, `listContains`, `showList`, `hideList`
- Operators: `random`, `add`, `subtract`, `multiply`, `divide`, `lessThan`, `greaterThan`, `equals`, `and`, `or`, `not`, `join`, `letterOf`, `lengthOf`, `contains`, `mod`, `round`, `mathOp`
- Sensing: `ask`, `answer`, `keyPressed`, `mouseDown`, `mouseX`, `mouseY`, `timer`, `resetTimer`
- Control: `ifBlock`, `ifElse`, `repeat`, `forever`, `repeatUntil`, `waitUntil`, `wait`, `stopAll`, `stopThisScript`, `stopOtherScripts`
- Looks: `say`, `sayNow`, `think`, `thinkNow`, `show`, `hide`, `setSize`, `changeSize`, `switchCostume`, `nextCostume`, `switchBackdrop`, `nextBackdrop`
- Sound: `playSoundUntilDone`, `startSound`, `stopAllSounds`, `changeVolume`, `setVolume`
- Multi-sprite MVP: `sprite`, `setSpritePosition`, `setSpriteSize`, `setSpriteDirection`, `setSpriteText`, `setSpriteColor`, `whenThisSpriteClicked`

### Current Extension Handling

| Extension | Status | Main functions |
|---|---|---|
| Pen | Supported and protected by regression tests | `penClear`, `penDown`, `penUp`, `setPenColor`, `setPenSize` |
| Music | Registered in the converter; real `.sb3` fixture coverage is still pending | `playDrumForBeats`, `playNoteForBeats`, `setInstrument`, `setTempo`, `tempo` |
| Translate | Registered in the converter; real `.sb3` fixture coverage is still pending | `translate`, `viewerLanguage` |
| Text to Speech | Registered in the converter; real `.sb3` fixture coverage is still pending | `speak`, `setVoice`, `setSpeechLanguage` |
| Microbit More | Verified minimal subset only and protected by regression tests | A/B buttons, text display, shake, tone play/stop |
| ML2Scratch | Experimental; only six blocks found in the official 1-or-2 fixture | `mlAddExample1/2/3`, `whenMlLabelReceived`, `mlSetVideo`, `mlSetInput` |
| CameraSelector | Experimental; generated saved shape matches the official fixture, device behavior not yet verified | `selectCamera` |
| Speech2Scratch | Experimental; generated saved shape matches the official fixture, browser speech recognition not yet verified | `startSpeechRecognition`, `speechText` |

CameraSelector and Speech2Scratch example:

```js
whenGreenFlagClicked(() => {
  selectCamera("​標準カメラ​");
  startSpeechRecognition();
  wait(3);
  sayNow(speechText());
});
```

The CameraSelector argument is a dynamic device-menu value. The Japanese default-camera label above is verified by the official fixture, but classroom devices should use the camera name displayed by Stretch3.

## Current ML2Scratch Scope

Only saved shapes present in the official `sample_projects/1or2.sb3` are enabled. This example uses the stage as the learning input, adds examples with keys 1–3, and reacts to recognized labels 1 and 2.

```js
whenGreenFlagClicked(() => {
  mlSetInput("stage");
  mlSetVideo("off");
});

whenKeyPressed("1", () => { mlAddExample1(); });
whenKeyPressed("2", () => { mlAddExample2(); });
whenKeyPressed("3", () => { mlAddExample3(); });

whenMlLabelReceived("1", () => { sayNow("1"); });
whenMlLabelReceived("2", () => { sayNow("2"); });
```

All 29 official blocks are inventoried. The remaining 23—including `mlLabel()`, custom-label training, learning-data import/export, and camera switching—continue to fail safely until real fixtures are available.

## Microbit More Status

Microbit More support is intentionally limited to the subset with confirmed saved shapes and practical classroom behavior.
Other blocks from the official `getInfo()` have been inventoried, but they fail safely by individual function name until both saved shapes and hardware behavior are verified.

Supported:

- `whenMicrobitButtonPressed("A", () => { ... })`
- `whenMicrobitButtonPressed("B", () => { ... })`
- `ifMicrobitButtonPressed("A", () => { ... })`
- `ifMicrobitButtonPressed("B", () => { ... })`
- `microbitDisplayText("Hello", 120)`
- `whenMicrobitShaken(() => { ... })`
- `whenMicrobitGesture("SHAKE", () => { ... })`
- `microbitPlayTone(440, 100)`
- `microbitStopTone()`

Unsupported until further fixture and hardware verification:

- `TILT_LEFT` / `TILT_RIGHT`
- Servo blocks
- Pin I/O blocks
- Sensor reporter blocks
- Connection-dependent blocks
- Data, touch, and pin event blocks that depend on communication or runtime configuration

See the [Microbit More block matrix](docs/microbit-more-block-matrix.md), [fixture guide](docs/microbit-more-fixture-guide.md), and [implementation plan](docs/microbit-more-implementation-plan.md).

## Developer Map

Important files:

- `index.html`: page structure and script loading order
- `style.css`: UI styling
- `script.js`: UI behavior, StretchScript parser, Scratch `project.json` generation, `.sb3` generation, validation, and preview
- `blocks/blockRegistry.js`: block definition registry
- `blocks/coreBlocks.js`: Scratch core block definitions
- `blocks/*.js`: verified extension block definitions or safe-failure registrations for unverified blocks
- `tests/stretch-script.test.mjs`: regression tests
- `stretchscript-spec.md`: function reference for AI-generated StretchScript
- `scratch-standard-blocks.md`: Scratch standard block compatibility table

`index.html` loads `blocks/blockRegistry.js` first, then the block definition files, then `script.js`. That order is part of the converter design.

## Tests

Run the regression suite after every change:

```sh
npm test
```

The suite protects important routes including:

- Pen square sample
- List creation
- Lottery samples B/C/D
- Arithmetic drill
- Basic Sierpinski sample
- Messages, clones, stop blocks, and control blocks
- Costume, backdrop, size, layer, touching, and current-state blocks
- `goTo` expression handling
- `sayNow` followed by `stopAll` warning behavior
- Safe failure for unknown functions
- `ifBlock` patterns used in rock-paper-scissors logic
- Multi-sprite MVP
- Verified Microbit More subset
- ML2Scratch 29-block ledger and six official-fixture block shapes
- CameraSelector / Speech2Scratch official-fixture saved-shape comparisons

When adding support for a new block, also add regression coverage in `tests/stretch-script.test.mjs` and update this README or the relevant compatibility table.

## Adding Extension Blocks

1. Add the target extension in Stretch3.
2. Manually create a minimal project that uses only the block you want to support.
3. Save it as `.sb3`.
4. Inspect the saved `project.json`.
5. Confirm `opcode`, `inputs`, `fields`, `parent`, `next`, and `topLevel`.
6. Compare those details with the extension source `getInfo()`.
7. Add the definition in `blocks/*.js`.
8. Add regression tests in `tests/stretch-script.test.mjs`.
9. Load the generated `.sb3` in Stretch3.
10. Update this README or the relevant compatibility table.

If the saved shape cannot be verified, do not register the block as supported. Register it with `registerUnsupported` so conversion fails safely.
