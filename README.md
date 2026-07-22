# StretchScript to .sb3 Converter

日本語 | [English](README_EN.md)

StretchScript を Scratch 3.0 / [Stretch3](https://stretch3.github.io/) で読み込める `.sb3` ファイルへ変換する静的Webアプリです。
Gemini などの生成AIに Scratch 風のコードを書かせ、そのコードを授業や試作で開ける Scratch プロジェクトにすることを目的にしています。

`index.html` をブラウザで開くだけで使えます。ビルド工程はありません。

## このプロジェクトが大切にしていること

この変換器は「とにかく `.sb3` を出す」ことよりも、「Stretch3で読める可能性が高い、安全な `.sb3` だけを出す」ことを優先します。

- 未確認の `opcode` / `inputs` / `fields` を推測して `.sb3` に書き込みません。
- 保存形を確認できていない外部拡張ブロックは、安全停止します。
- 未確認ブロックが1つでも含まれる入力は、変換成功にしません。
- 変換に失敗した場合、`.sb3` ダウンロードボタンは有効になりません。
- 既存の成功ルート、特に Scratch標準ブロック、Pen、リスト、変数、制御系を壊さないことを優先します。

## できること

現在の主な対応範囲は次の通りです。

- Scratch標準ブロックの主要カテゴリ
  - イベント、メッセージ、動き、見た目、音、制御、調べる、演算、変数、リスト、クローン
- Pen拡張
- Music拡張
- Translate拡張
- Text to Speech拡張
- Microbit Moreの保存形確認済み範囲（実機確認待ちを含む）
- ML2Scratchの公式1or2サンプルで確認できた6ブロック
- CameraSelectorの`selectCamera`
- Speech2Scratchの音声認識開始・認識文字列取得
- `sprite("名前", () => { ... })` による複数スプライトMVP
- 生成した `project.json` とSVG素材をまとめた `.sb3` のダウンロード
- Scratch風プレビュー、エラー表示、警告表示

詳細な関数一覧は次のファイルを見てください。

- [StretchScript仕様書](stretchscript-spec.md)
- [Scratch標準ブロック対応表](scratch-standard-blocks.md)
- [複数スプライトMVP計画](scratch-multisprite-plan.md)
- [Microbit More対応表](docs/microbit-more-block-matrix.md)

## まだできないこと

次の機能は、未確認または対応範囲外として扱います。これらを含む入力は、安全のため `.sb3` に変換しません。

- 保存形を実物 `.sb3` で確認していない外部拡張ブロック
- ImageClassifier2Scratch、Posenet2Scratch、TM2Scratch、TMPose2Scratch、AkaDakoの未確認ブロック
- ML2Scratchのうち、公式1or2サンプルに保存形がない23ブロック
- CameraSelector / Speech2Scratchで公式`getInfo()`に存在しない互換候補関数
- Microbit Moreのうち、`TILT_LEFT` / `TILT_RIGHT`、サーボ、ピン入出力、温度・音量など未検証のブロック
- Scratchの独自ブロック定義
- JavaScript一般機能としての配列操作、`parseInt`、`Number`、`toString`、`includes`、`push` など

このプロジェクトは汎用JavaScriptからScratchへ変換するツールではありません。対応済みのStretchScript関数だけをScratchブロックへ変換します。

## 使い方

1. `index.html` をChromeなどのブラウザで開きます。
2. 入力欄へStretchScriptを貼り付けます。
3. 「1. 変換して確認」を押します。
4. プレビューとエラー表示を確認します。
5. 成功した場合だけ「2. .sb3をダウンロード」を押します。
6. ダウンロードした `.sb3` を [Stretch3](https://stretch3.github.io/) または Scratch 3.0互換環境で読み込みます。

例:

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

この例は、主に次のScratchブロックへ変換されます。

- `penClear()` -> `pen_clear`
- `penDown()` -> `pen_penDown`
- `repeat(4, ...)` -> `control_repeat`
- `move(100)` -> `motion_movesteps`
- `turnRight(90)` -> `motion_turnright`
- `penUp()` -> `pen_penUp`
- `project.json` の `extensions` に `"pen"` を追加

## 生成AIへStretchScriptを書かせるときの注意

生成AIには、次のように指示してください。

```text
StretchScriptだけを出力してください。
説明文、Markdown、コードブロック記号は出さないでください。
対応していない関数を作らないでください。
JavaScriptの一般APIではなく、StretchScript仕様書にある関数だけを使ってください。
.sb3やproject.jsonを直接出力しないでください。
```

詳しいプロンプト用仕様は [stretchscript-spec.md](stretchscript-spec.md) にあります。

## 対応済み関数の概要

### Scratch標準ブロック

- 変数: `setVariable`, `changeVariable`, `getVariable`, `showVariable`, `hideVariable`
- リスト: `deleteAllOfList`, `addToList`, `deleteOfList`, `insertAtList`, `replaceItemOfList`, `itemOfList`, `itemNumOfList`, `lengthOfList`, `listContains`, `showList`, `hideList`
- 演算: `random`, `add`, `subtract`, `multiply`, `divide`, `lessThan`, `greaterThan`, `equals`, `and`, `or`, `not`, `join`, `letterOf`, `lengthOf`, `contains`, `mod`, `round`, `mathOp`
- 調べる: `ask`, `answer`, `keyPressed`, `mouseDown`, `mouseX`, `mouseY`, `timer`, `resetTimer`
- 制御: `ifBlock`, `ifElse`, `repeat`, `forever`, `repeatUntil`, `waitUntil`, `wait`, `stopAll`, `stopThisScript`, `stopOtherScripts`
- 見た目: `say`, `sayNow`, `think`, `thinkNow`, `show`, `hide`, `setSize`, `changeSize`, `switchCostume`, `nextCostume`, `switchBackdrop`, `nextBackdrop`
- 音: `playSoundUntilDone`, `startSound`, `stopAllSounds`, `changeVolume`, `setVolume`
- 複数スプライトMVP: `sprite`, `setSpritePosition`, `setSpriteSize`, `setSpriteDirection`, `setSpriteText`, `setSpriteColor`, `whenThisSpriteClicked`

### 拡張ブロックの現在の扱い

| 拡張 | 状態 | 主な関数 |
|---|---|---|
| Pen | 対応済み。回帰テストで保護 | `penClear`, `penDown`, `penUp`, `setPenColor`, `setPenSize` |
| Music | 変換器に登録済み。実物 `.sb3` fixtureの追加は今後の課題 | `playDrumForBeats`, `playNoteForBeats`, `setInstrument`, `setTempo`, `tempo` |
| Translate | 変換器に登録済み。実物 `.sb3` fixtureの追加は今後の課題 | `translate`, `viewerLanguage` |
| Text to Speech | 変換器に登録済み。実物 `.sb3` fixtureの追加は今後の課題 | `speak`, `setVoice`, `setSpeechLanguage` |
| Microbit More | 保存形確認済み範囲を変換。実機未確認分はexperimental | A/Bボタン、LED模様/文字、シェイク、音、明るさ、roll、接続変化 |
| ML2Scratch | experimental。公式1or2 fixtureで確認できた6ブロックのみ対応 | `mlAddExample1/2/3`, `whenMlLabelReceived`, `mlSetVideo`, `mlSetInput` |
| CameraSelector | experimental。公式fixtureと保存形を比較、実機未確認 | `selectCamera` |
| Speech2Scratch | experimental。公式fixtureと保存形を比較、ブラウザの音声認識動作は未確認 | `startSpeechRecognition`, `speechText` |

CameraSelectorとSpeech2Scratchを使う例:

```js
whenGreenFlagClicked(() => {
  selectCamera("​標準カメラ​");
  startSpeechRecognition();
  wait(3);
  sayNow(speechText());
});
```

`selectCamera`のカメラ名は実行環境の動的メニュー値です。上の「標準カメラ」は公式fixtureで確認した値ですが、授業で使う端末ではStretch3に表示されたカメラ名に合わせてください。

## ML2Scratchの現在の対応範囲

公式の`sample_projects/1or2.sb3`に実在する保存形だけを使えます。次の例では、ステージ画像を入力にし、数字キー1〜3で学習例を追加し、ラベル1または2を認識したときに反応します。

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

全29ブロックは台帳化済みです。ただし、`mlLabel()`、任意ラベル学習、学習データの保存・読込、カメラ切替など、公式fixtureに存在しない23ブロックは引き続き安全停止します。

## Microbit Moreの現在の対応範囲

Microbit Moreは、授業で安全に使えることを優先し、実物fixtureで保存形を確認できた範囲だけを変換対象にしています。
実機確認済みのブロックと、保存形は確認済みだが実機確認待ちのexperimentalブロックを区別しています。

実機確認済み:

- `whenMicrobitButtonPressed("A", () => { ... })`
- `whenMicrobitButtonPressed("B", () => { ... })`
- `ifMicrobitButtonPressed("A", () => { ... })`
- `ifMicrobitButtonPressed("B", () => { ... })`
- `microbitDisplayText("Hello", 120)`
- `whenMicrobitShaken(() => { ... })`
- `whenMicrobitGesture("SHAKE", () => { ... })`
- `microbitPlayTone(440, 100)`
- `microbitStopTone()`

- `microbitDisplayMatrix("0101011111111110111000100")`

experimental（公式fixtureとの構造比較は合格、実機確認待ち）:

- `whenMicrobitConnectionChanged("connected", () => { ... })`
- `whenMicrobitConnectionChanged("disconnected", () => { ... })`
- `microbitLightLevel()`
- `microbitRoll()`

未対応:

- `TILT_LEFT` / `TILT_RIGHT`
- サーボ
- ピン入出力
- 明るさ・roll以外のセンサー値取得
- データ送受信、touch、pin eventなど通信・設定依存のブロック

詳細は [Microbit More V2実機試験 第1便](docs/microbit-more-v2-device-test-batch-1.md)、[Microbit More対応表](docs/microbit-more-block-matrix.md)、[fixture採取手順](docs/microbit-more-fixture-guide.md)、[実装計画](docs/microbit-more-implementation-plan.md) を参照してください。

## 開発者向け構成

主なファイル:

- `index.html`: 画面構成とJavaScript読み込み順
- `style.css`: 画面デザイン
- `script.js`: UI制御、StretchScriptパーサー、Scratch project.json生成、`.sb3`生成、検証、プレビュー
- `blocks/blockRegistry.js`: ブロック定義レジストリ
- `blocks/coreBlocks.js`: Scratch標準ブロック定義
- `blocks/*.js`: 各拡張ブロック、または未確認ブロックの安全停止登録
- `tests/stretch-script.test.mjs`: 回帰テスト
- `stretchscript-spec.md`: 生成AI向け関数仕様
- `scratch-standard-blocks.md`: 標準ブロック対応表

`index.html` では、まず `blocks/blockRegistry.js` を読み込み、各 `blocks/*.js` を登録したあと、最後に `script.js` を読み込みます。この順番が変換器の前提です。

## テスト

変更後は必ず次を実行してください。

```sh
npm test
```

テストでは、次の重要ルートを固定しています。

- Pen四角
- リスト作成
- 宝くじサンプルB/C/D
- 四則演算ドリル
- シェルピンスキー基本
- メッセージ、クローン、停止、条件系
- costume/backdrop/size/layer/touching/current系
- `goTo` 式対応
- `sayNow` + `stopAll` 警告
- 謎関数の安全停止
- じゃんけん判定用 `ifBlock`
- 複数スプライトMVP
- Microbit Moreの確認済み範囲
- ML2Scratchの全29ブロック台帳と公式1or2 fixtureの6ブロック
- CameraSelector / Speech2Scratchの公式fixture保存形比較

新しくブロックを対応した場合は、必ず `tests/stretch-script.test.mjs` に回帰テストを追加し、READMEまたは対応表も更新してください。

## 拡張ブロックを追加する手順

1. Stretch3本家で対象拡張を追加します。
2. 追加したいブロックだけを使った最小プロジェクトを手作業で作ります。
3. `.sb3` として保存します。
4. この変換サイトの解析機能で `.sb3` 内の `project.json` を確認します。
5. `opcode` / `inputs` / `fields` / `parent` / `next` / `topLevel` を確認します。
6. 実装ソースの `getInfo()` と照合します。
7. `blocks/*.js` に定義を追加します。
8. `tests/stretch-script.test.mjs` に回帰テストを追加します。
9. 生成した `.sb3` をStretch3本家で読み込みテストします。
10. READMEまたは対応表を更新します。

保存形を確認できない場合は、対応済みとして登録せず、`registerUnsupported` で安全停止にしてください。
