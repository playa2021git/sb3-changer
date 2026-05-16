# StretchScript から .sb3 へ変換するMVP

日本語 | [English](README_EN.md)

このツールは、Geminiなどが出力した StretchScript を Scratch 3.0 / Stretch3 が読める `.sb3` に変換する静的Webアプリです。`index.html` をChromeで開くだけで使えます。

## 最優先の安全ルール

- 外部拡張ブロックは、推測した `opcode` / `inputs` / `fields` では `.sb3` に入れません。
- `blocks/*.js` に登録するのは、実装ソースの `getInfo()` と、できればStretch3で作成した実物 `.sb3` の `project.json` で保存形を確認できたものだけです。
- 未確認ブロックが1つでも含まれる場合は、変換成功にしません。
- 未確認ブロックがある場合、`.sb3をダウンロード` ボタンは無効のままにします。
- Scratch基本ブロックとPen成功ルートを壊さないことを最優先にします。

## 回帰テスト対象

次のルートは、Stretch3本家で読み込み成功したもの、または標準ブロックの重要構造として維持します。`tests/stretch-script.test.mjs` に固定しています。

- Pen四角
- リスト作成
- 宝くじB
- 宝くじC
- 宝くじD
- 四則演算ドリル
- シェルピンスキー基本
- 優先A: メッセージ、クローン、停止、条件系
- 優先B: costume/backdrop/size/layer/touching/current系
- goTo式対応
- sayNow + stopAll警告
- 謎関数安全停止
- じゃんけん判定用ifBlock

### 成功1: Pen拡張サンプル

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

期待される主な構造:

- `penClear()` -> `pen_clear`
- `penDown()` -> `pen_penDown`
- `repeat(4, ...)` -> `control_repeat`
- `move(100)` -> `motion_movesteps`
- `turnRight(90)` -> `motion_turnright`
- `penUp()` -> `pen_penUp`
- `extensions` には `"pen"` を入れる

### 成功2: リスト作成サンプル

```js
whenGreenFlagClicked(() => {
  deleteAllOfList("宝くじ全部");

  repeat(10, () => {
    addToList(random(1, 100), "宝くじ全部");
  });

  say(join("リストの長さは", lengthOfList("宝くじ全部")), 2);
});
```

期待される主な構造:

- `deleteAllOfList("宝くじ全部")` -> `data_deletealloflist`
- `addToList(random(1, 100), "宝くじ全部")` -> `data_addtolist`
- `random(1, 100)` -> `operator_random`
- `lengthOfList("宝くじ全部")` -> `data_lengthoflist`
- `say(..., 2)` -> `looks_sayforsecs`
- `extensions` は空配列

## 標準ブロック重点対応

現在は外部拡張を急がず、Scratch標準ブロックだけで作れる実用プログラムを優先します。

詳細な標準ブロック対応表は [`scratch-standard-blocks.md`](scratch-standard-blocks.md) にあります。
Geminiカスタム指示へ渡すための関数仕様は [`stretchscript-spec.md`](stretchscript-spec.md) にあります。
複数スプライト対応のMVP仕様と今後の設計は [`scratch-multisprite-plan.md`](scratch-multisprite-plan.md) にあります。
Microbit More対応状況は [`docs/microbit-more-block-matrix.md`](docs/microbit-more-block-matrix.md) にあります。

- 変数: `setVariable`, `changeVariable`, `getVariable`, `showVariable`, `hideVariable`
- リスト: `deleteAllOfList`, `addToList`, `deleteOfList`, `insertAtList`, `replaceItemOfList`, `itemOfList`, `itemNumOfList`, `lengthOfList`, `listContains`, `showList`, `hideList`
- 演算: `random`, `add`, `subtract`, `multiply`, `divide`, `lessThan`, `greaterThan`, `equals`, `and`, `or`, `not`, `join`, `letterOf`, `lengthOf`, `contains`, `mod`, `round`, `mathOp`
- 調べる: `ask`, `answer`, `keyPressed`, `mouseDown`, `mouseX`, `mouseY`, `timer`, `resetTimer`
- 制御: `ifBlock`, `ifElse`, `repeatUntil`, `waitUntil`, `wait`, `stopAll`, `stopThisScript`, `stopOtherScripts`
- 見た目: `say`, `sayNow`, `think`, `thinkNow`, `show`, `hide`, `setSize`, `changeSize`, `switchCostume`, `nextCostume`, `switchBackdrop`, `nextBackdrop`
- 音: `playSoundUntilDone`, `startSound`, `stopAllSounds`, `changeVolume`, `setVolume`
- 複数スプライトMVP: `sprite`, `setSpritePosition`, `setSpriteSize`, `setSpriteDirection`, `setSpriteText`, `setSpriteColor`, `whenThisSpriteClicked`

`addToList` は次の2つを受け付けます。

```js
addToList(random(1, 100), "宝くじ全部");
addToList("宝くじ全部", random(1, 100));
```

`goTo` は次の2種類を受け付けます。

```js
goTo("_mouse_");
goTo(getVariable("px"), getVariable("py"));
```

- 引数1個なら `motion_goto`
- 引数2個なら `motion_gotoxy`
- `goTo(x, y)` の `x` / `y` には `getVariable()`、`random()`、`add()`、`divide()` などの値ブロックを入れられます。

`sayNow("文字"); stopAll();` のように結果表示の直後に停止する場合は、変換は成功させた上で警告を表示します。
`showVariableSlider(...)` はmonitor保存形式を実物 `.sb3` で確認するまで未対応として停止します。

## Microbit More対応状況

Microbit Moreは、授業で安全に使えることを優先して、保存形と実機動作を確認できた最小範囲だけを変換対象にしています。

現時点で対応している関数:

- `whenMicrobitButtonPressed("A", () => { ... })`
- `whenMicrobitButtonPressed("B", () => { ... })`
- `ifMicrobitButtonPressed("A", () => { ... })`
- `ifMicrobitButtonPressed("B", () => { ... })`
- `microbitDisplayText("Hello", 120)`
- `whenMicrobitShaken(() => { ... })`
- `whenMicrobitGesture("SHAKE", () => { ... })`
- `microbitPlayTone(440, 100)`
- `microbitStopTone()`

`TILT_LEFT` / `TILT_RIGHT`、サーボ、ピン入出力、センサー値取得などは、授業前に保存形と実機動作を再確認するまで未対応として安全停止します。
詳細は [`docs/microbit-more-block-matrix.md`](docs/microbit-more-block-matrix.md)、fixture採取手順は [`docs/microbit-more-fixture-guide.md`](docs/microbit-more-fixture-guide.md) を参照してください。

## 複数スプライトMVP

`sprite("名前", () => { ... })` を使うと、`project.json` の `targets` に新しいSprite targetを追加します。
各スプライトには簡易SVGコスチュームを自動生成し、`md5ext` / `assetId` / ZIP内ファイル名を一致させます。

```js
sprite("Aさん", () => {
  setSpritePosition(-100, 0);
  setSpriteText("A");

  whenGreenFlagClicked(() => {
    say("Aさん", 2);
  });
});
```

- `setSpritePosition(x, y)`、`setSpriteSize(size)`、`setSpriteDirection(direction)` はtargetの初期値です。
- `setSpriteText("文字")` は自動生成SVGに表示する文字です。
- `setSpriteColor("#ff0000")` は自動生成SVGの色です。
- `whenThisSpriteClicked(() => { ... })` は `event_whenthisspriteclicked` に変換します。
- 変数・リスト・ブロードキャストはMVPでは共有データとして扱います。
- 同名スプライトがある場合は安全に変換停止します。

## 拡張ブロック追加手順

1. Stretch3本家で対象拡張を追加します。
2. 追加したいブロックだけを使った最小プロジェクトを手作業で作ります。
3. `.sb3` として保存します。
4. この変換サイトの「拡張ブロック解析モード」で `.sb3` を読み込みます。
5. 表示された `opcode` / `inputs` / `fields` / `parent` / `next` / `topLevel` を確認します。
6. GitHubの実装ソース `getInfo()` と照合します。
7. `blocks/各拡張.js` に登録します。
8. 生成した `.sb3` をStretch3本家で読み込みテストします。

## 実装ソース調査メモ

READMEだけを根拠にはしません。以下の実装ソースを確認対象にしています。

- Scratch公式 Pen: https://github.com/scratchfoundation/scratch-vm/blob/develop/src/extensions/scratch3_pen/index.js
- Scratch公式 Music: https://github.com/scratchfoundation/scratch-vm/blob/develop/src/extensions/scratch3_music/index.js
- Scratch公式 Translate: https://github.com/scratchfoundation/scratch-vm/blob/develop/src/extensions/scratch3_translate/index.js
- Scratch公式 Text to Speech: https://github.com/scratchfoundation/scratch-vm/blob/develop/src/extensions/scratch3_text2speech/index.js
- ImageClassifier2Scratch: https://github.com/champierre/ic2scratch/blob/master/scratch-vm/src/extensions/scratch3_ic2scratch/index.js
- ML2Scratch: https://github.com/champierre/ml2scratch/blob/master/scratch-vm/src/extensions/scratch3_ml2scratch/index.js
- Posenet2Scratch: https://github.com/champierre/posenet2scratch/blob/master/scratch-vm/src/extensions/scratch3_posenet2scratch/index.js
- TM2Scratch: https://github.com/champierre/tm2scratch/blob/master/scratch-vm/src/extensions/scratch3_tm2scratch/index.js
- TMPose2Scratch: https://github.com/champierre/tmpose2scratch/blob/master/scratch-vm/src/extensions/scratch3_tmpose2scratch/index.js
- Speech2Scratch: https://github.com/champierre/speech2scratch/blob/master/scratch-vm/src/extensions/scratch3_speech2scratch/index.js
- Microbit More: https://github.com/microbit-more/mbit-more-v2/blob/master/src/vm/extensions/block/index.js

## 変換対応表: 公式拡張

### ペン

状態: 対応可。サンプル2でStretch3本家読み込み成功を確認済み。

| StretchScript関数名 | opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| `penClear()` | `pen_clear` | COMMAND | なし | なし | なし | なし | `pen` | 対応可 |
| `penStamp()` | `pen_stamp` | COMMAND | なし | なし | なし | なし | `pen` | 対応可 |
| `penDown()` | `pen_penDown` | COMMAND | なし | なし | なし | なし | `pen` | 対応可 |
| `penUp()` | `pen_penUp` | COMMAND | なし | なし | なし | なし | `pen` | 対応可 |
| `setPenColor(color)` | `pen_setPenColorToColor` | COMMAND | `COLOR` | なし | color | `[1,[9,"#ff0000"]]` | `pen` | 対応可 |
| `changePenSize(size)` | `pen_changePenSizeBy` | COMMAND | `SIZE` | なし | number | `[1,[4,"1"]]` | `pen` | 対応可 |
| `setPenSize(size)` | `pen_setPenSizeTo` | COMMAND | `SIZE` | なし | number | `[1,[4,"1"]]` | `pen` | 対応可 |
| `changePenColorParam(param, value)` | `pen_changePenColorParamBy` | COMMAND | `VALUE` | `COLOR_PARAM` | menu, number | number shadow | `pen` | 対応可 |
| `setPenColorParam(param, value)` | `pen_setPenColorParamTo` | COMMAND | `VALUE` | `COLOR_PARAM` | menu, number | number shadow | `pen` | 対応可 |

### 音楽

状態: 実装ソースで `id: music` とopcode確認済み。生成器には登録済み。実物 `.sb3` 回帰サンプルは今後追加します。

| StretchScript関数名 | opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| `playDrumForBeats(drum, beats)` | `music_playDrumForBeats` | COMMAND | `DRUM`, `BEATS` | なし | number, number | number shadow | `music` | 対応可 |
| `restForBeats(beats)` | `music_restForBeats` | COMMAND | `BEATS` | なし | number | number shadow | `music` | 対応可 |
| `playNoteForBeats(note, beats)` | `music_playNoteForBeats` | COMMAND | `NOTE`, `BEATS` | なし | number, number | number shadow | `music` | 対応可 |
| `setInstrument(instrument)` | `music_setInstrument` | COMMAND | `INSTRUMENT` | なし | number | number shadow | `music` | 対応可 |
| `setTempo(tempo)` | `music_setTempo` | COMMAND | `TEMPO` | なし | number | number shadow | `music` | 対応可 |
| `changeTempo(tempo)` | `music_changeTempo` | COMMAND | `TEMPO` | なし | number | number shadow | `music` | 対応可 |
| `tempo()` | `music_getTempo` | REPORTER | なし | なし | なし | なし | `music` | 対応可 |

### 翻訳

状態: 実装ソースで `id: translate` とopcode確認済み。生成器には登録済み。実物 `.sb3` 回帰サンプルは今後追加します。

| StretchScript関数名 | opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| `translate(words, language)` | `translate_getTranslate` | REPORTER | `WORDS` | `LANGUAGE` | string/reporter, menu | string shadow | `translate` | 対応可 |
| `viewerLanguage()` | `translate_getViewerLanguage` | REPORTER | なし | なし | なし | なし | `translate` | 対応可 |

### 音声合成

状態: 実装ソースで `id: text2speech` とopcode確認済み。生成器には登録済み。実物 `.sb3` 回帰サンプルは今後追加します。

| StretchScript関数名 | opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| `speak(words)` | `text2speech_speakAndWait` | COMMAND | `WORDS` | なし | string/reporter | string shadow | `text2speech` | 対応可 |
| `setVoice(voice)` | `text2speech_setVoice` | COMMAND | なし | `VOICE` | menu | field | `text2speech` | 対応可 |
| `setSpeechLanguage(language)` | `text2speech_setLanguage` | COMMAND | なし | `LANGUAGE` | menu | field | `text2speech` | 対応可 |

## 変換対応表: 外部拡張

外部拡張は、実装ソースでopcodeを見つけても、実物 `.sb3` の保存形が未確認なら生成器に登録しません。以下は調査メモであり、変換許可リストではありません。

### ImageClassifier2Scratch

状態: 調査中。実装ソースで `extensionId: ic2scratch` を確認済み。変換器では `ifImageClassifiedAs()` などを未確認エラーで停止します。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| 未割当 | `getResult1` / `getResult2` / `getResult3` | REPORTER | なし | なし | なし | なし | `ic2scratch` | 未確認 |
| 未割当 | `getConfidence1` / `getConfidence2` / `getConfidence3` | REPORTER | なし | なし | なし | なし | `ic2scratch` | 未確認 |
| 未割当 | `whenReceived` | HAT | なし | なし | なし | なし | `ic2scratch` | 未確認 |
| 未割当 | `toggleClassification` | COMMAND | `CLASSIFICATION_STATE` | 未確認 | string menu | 未確認 | `ic2scratch` | 未確認 |
| 未割当 | `setClassificationInterval` | COMMAND | `CLASSIFICATION_INTERVAL` | 未確認 | string menu | 未確認 | `ic2scratch` | 未確認 |
| 未割当 | `videoToggle` | COMMAND | `VIDEO_STATE` | 未確認 | string menu | 未確認 | `ic2scratch` | 未確認 |
| 未割当 | `setVideoTransparency` | COMMAND | `TRANSPARENCY` | なし | number | number shadow | `ic2scratch` | 未確認 |

必要な次作業: Stretch3本家で同等ブロックを手作業作成した最小 `.sb3` を解析し、`ic2scratch_getResult1` のような保存時opcodeになるか、メニューがfieldかinputかを確認します。

### ML2Scratch

状態: 調査中。実装ソースで `extensionId: ml2scratch` を確認済み。生成器には未登録です。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| 未割当 | `addExample1` / `addExample2` / `addExample3` | COMMAND | なし | なし | なし | なし | `ml2scratch` | 未確認 |
| 未割当 | `train` / `trainAny` | COMMAND | `LABEL` | 未確認 | string/menu | 未確認 | `ml2scratch` | 未確認 |
| 未割当 | `getLabel` | REPORTER | なし | なし | なし | なし | `ml2scratch` | 未確認 |
| 未割当 | `whenReceived` / `whenReceivedAny` | HAT | `LABEL` | 未確認 | string/menu | 未確認 | `ml2scratch` | 未確認 |
| 未割当 | `getCountByLabel1` から `getCountByLabel10` | REPORTER | なし | なし | なし | なし | `ml2scratch` | 未確認 |
| 未割当 | `getCountByLabel` | REPORTER | `LABEL` | 未確認 | string | 未確認 | `ml2scratch` | 未確認 |
| 未割当 | `reset` / `resetAny` | COMMAND | `LABEL` | 未確認 | string/menu | 未確認 | `ml2scratch` | 未確認 |
| 未割当 | `download` / `upload` | COMMAND | なし | なし | なし | なし | `ml2scratch` | 未確認 |
| 未割当 | `toggleClassification` / `setClassificationInterval` / `videoToggle` / `setVideoTransparency` / `setInput` / `switchCamera` | COMMAND | ソース参照 | 未確認 | ソース参照 | 未確認 | `ml2scratch` | 未確認 |

### Posenet2Scratch

状態: 調査中。実装ソースで `extensionId: posenet2scratch` を確認済み。生成器には未登録です。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| 未割当 | `getX` / `getY` | REPORTER | `PERSON_NUMBER`, `PART` | 未確認 | string menu | 未確認 | `posenet2scratch` | 未確認 |
| 未割当 | `getPeopleCount` | REPORTER | なし | なし | なし | なし | `posenet2scratch` | 未確認 |
| 未割当 | `getNoseX` など各部位X/Y reporter | REPORTER | なし | なし | なし | なし | `posenet2scratch` | 未確認 |
| 未割当 | `videoToggle` | COMMAND | `VIDEO_STATE` | 未確認 | string menu | 未確認 | `posenet2scratch` | 未確認 |
| 未割当 | `setVideoTransparency` | COMMAND | `TRANSPARENCY` | なし | number | number shadow | `posenet2scratch` | 未確認 |

### Microbit More

状態: 調査中。実装ソースで `extensionId: microbitMore` を確認済み。生成器には未登録です。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| `ifMicrobitButtonPressed(button, body)` | 未確定 | 未確定 | 未確定 | 未確定 | string, substack | 未確定 | `microbitMore` | 未確認 |
| `microbitButtonPressed(button)` | ソース調査継続 | BOOLEAN想定だが未確定 | 未確定 | 未確定 | string | 未確定 | `microbitMore` | 未確認 |
| `microbitDisplayText(text)` | ソース調査継続 | COMMAND想定だが未確定 | 未確定 | 未確定 | string | 未確定 | `microbitMore` | 未確認 |

必要な次作業: `src/vm/extensions/block/index.js` の `getInfo()` 全体から対象opcodeを抽出し、さらに実物 `.sb3` で保存形を確認します。

### TM2Scratch

状態: 調査中。実装ソースで `extensionId: tm2scratch` を確認済み。生成器には未登録です。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| 未割当 | `whenReceived` | HAT | `LABEL` | 未確認 | string menu | 未確認 | `tm2scratch` | 未確認 |
| 未割当 | `isImageLabelDetected` | BOOLEAN | `LABEL` | 未確認 | string menu | 未確認 | `tm2scratch` | 未確認 |
| 未割当 | `imageLabelConfidence` | REPORTER | `LABEL` | 未確認 | string menu | 未確認 | `tm2scratch` | 未確認 |
| 未割当 | `setImageClassificationModelURL` / `classifyVideoImageBlock` / `getImageLabel` | COMMAND/REPORTER | ソース参照 | 未確認 | ソース参照 | 未確認 | `tm2scratch` | 未確認 |
| 未割当 | `whenReceivedSoundLabel` / `isSoundLabelDetected` / `soundLabelConfidence` / `setSoundClassificationModelURL` / `getSoundLabel` | HAT/BOOLEAN/REPORTER/COMMAND | ソース参照 | 未確認 | ソース参照 | 未確認 | `tm2scratch` | 未確認 |
| 未割当 | `toggleClassification` / `setClassificationInterval` / `setConfidenceThreshold` / `getConfidenceThreshold` / `videoToggle` / `switchCamera` | COMMAND/REPORTER | ソース参照 | 未確認 | ソース参照 | 未確認 | `tm2scratch` | 未確認 |

### TMPose2Scratch

状態: 調査中。実装ソースで `extensionId: tmpose2scratch` を確認済み。生成器には未登録です。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| 未割当 | `whenPoseLabelReceived` | HAT | `LABEL` | 未確認 | string menu | 未確認 | `tmpose2scratch` | 未確認 |
| 未割当 | `isPoseLabelDetected` | BOOLEAN | `LABEL` | 未確認 | string menu | 未確認 | `tmpose2scratch` | 未確認 |
| 未割当 | `poseLabelConfidence` | REPORTER | `LABEL` | 未確認 | string menu | 未確認 | `tmpose2scratch` | 未確認 |
| 未割当 | `setPoseClassificationModelURL` / `classifyVideoPoseBlock` / `getPoseLabel` | COMMAND/REPORTER | ソース参照 | 未確認 | ソース参照 | 未確認 | `tmpose2scratch` | 未確認 |
| 未割当 | `toggleClassification` / `setClassificationInterval` / `setConfidenceThreshold` / `getConfidenceThreshold` / `videoToggle` | COMMAND/REPORTER | ソース参照 | 未確認 | ソース参照 | 未確認 | `tmpose2scratch` | 未確認 |

### Speech2Scratch

状態: 調査中。実装ソースで `extensionId: speech2scratch` を確認済み。生成器には未登録です。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| 未割当 | `startRecognition` | COMMAND | なし | なし | なし | なし | `speech2scratch` | 未確認 |
| 未割当 | `getSpeech` | REPORTER | なし | なし | なし | なし | `speech2scratch` | 未確認 |

### カメラセレクター

状態: 調査中。該当するGitHub実装ソースをまだ特定できていません。生成器には未登録です。

| StretchScript関数名 | Scratch / Stretch3 opcode | blockType | inputs名 | fields名 | 引数型 | shadow block形式 | extensionId / extensions | 状態 |
|---|---|---|---|---|---|---|---|---|
| `selectCamera(device)` | 未確定 | 未確定 | 未確定 | 未確定 | string | 未確定 | 未確定 | 未確認 |
| `cameraName()` | 未確定 | 未確定 | 未確定 | 未確定 | なし | 未確定 | 未確定 | 未確認 |

## ImageClassifier2Scratchの現在の扱い

次のコードは現在、意図的に `.sb3` を生成しません。

```js
whenGreenFlagClicked(() => {
  forever(() => {
    ifImageClassifiedAs("cat", () => {
      say("ねこを見つけた", 2);
    });
  });
});
```

表示されるべきエラー:

```text
ImageClassifier2Scratchの内部opcodeまたはproject.json保存形が未確認のため、まだ .sb3 に変換できません。
Stretch3本家で同じブロックを手作業で作った .sb3 を解析してから対応します。
```

次に実装する場合は、実物 `.sb3` から ImageClassifier2Scratch の reporter 保存形を確認し、必要なら次のScratch標準構造で作ります。

```text
forever
  control_if
    CONDITION:
      operator_equals
        OPERAND1: ImageClassifier2Scratchの分類結果 reporter
        OPERAND2: "cat"
    SUBSTACK:
      say("ねこを見つけた", 2)
```

ただし、`OPERAND1` に入れる reporter の `opcode` と `inputs` が実物 `.sb3` で確定するまで登録しません。
