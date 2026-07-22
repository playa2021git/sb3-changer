# StretchScript仕様書

この仕様書はGeminiなどのコード生成AIへ渡すための、現在のStretchScriptコンパイラ仕様です。
自然言語の説明ではなく、Stretch3で読み込める `.sb3` を安全に作るための関数だけを列挙します。

## 基本ルール

```yaml
language: StretchScript
output_required: StretchScriptだけを出力する
markdown_allowed: false
code_block_allowed: false
eval_required: false
top_level:
  - hat blockだけを置く
  - または sprite("名前", () => { ... }) を置く
closure_format: "() => { ... }"
statement_end: ";"
string_quote: "\""
unsupported_policy: 未対応または未確認の関数は出力しない
external_extension_policy: opcodeとproject.json保存形式が確認済みのものだけ出力する
```

## 型

```yaml
types:
  number: 数値。例 10, -5, 0.5
  positiveInteger: 1以上の整数。repeatの回数など
  string: ダブルクォートで囲んだ文字。例 "こんにちは"
  stringOrReporter: 文字列、数値、または値を返す関数
  boolean: 真偽を返す関数。ifBlockなどの条件に入れる
  color: "#ff0000" 形式の色文字列
  menu: Scratchの選択肢文字列
  variableName: 変数名文字列
  listName: リスト名文字列
  messageName: メッセージ名文字列
  closure: "() => { 命令; }"
```

## 対応関数

### イベント

```yaml
- { name: whenGreenFlagClicked, args: [closure body], returns: void, blockType: hat, example: "whenGreenFlagClicked(() => { move(10); });" }
- { name: whenKeyPressed, args: [string key, closure body], returns: void, blockType: hat, example: "whenKeyPressed(\"space\", () => { move(10); });" }
- { name: whenSpriteClicked, args: [closure body], returns: void, blockType: hat, example: "whenSpriteClicked(() => { sayNow(\"やあ\"); });" }
- { name: whenThisSpriteClicked, args: [closure body], returns: void, blockType: hat, example: "whenThisSpriteClicked(() => { say(\"クリック\", 1); });" }
- { name: whenBackdropSwitchesTo, args: [string backdrop, closure body], returns: void, blockType: hat, example: "whenBackdropSwitchesTo(\"backdrop1\", () => { show(); });" }
- { name: whenGreaterThan, args: [string sensor, number value, closure body], returns: void, blockType: hat, example: "whenGreaterThan(\"LOUDNESS\", 10, () => { sayNow(\"大きい\"); });" }
```

### メッセージ

```yaml
- { name: whenIReceive, args: [messageName message, closure body], returns: void, blockType: hat, example: "whenIReceive(\"スタート\", () => { move(10); });" }
- { name: broadcast, args: [messageName message], returns: void, blockType: command, example: "broadcast(\"スタート\");" }
- { name: broadcastAndWait, args: [messageName message], returns: void, blockType: command, example: "broadcastAndWait(\"スタート\");" }
```

### 動き

```yaml
- { name: move, args: [number steps], returns: void, blockType: command, example: "move(10);" }
- { name: turnRight, args: [number degrees], returns: void, blockType: command, example: "turnRight(15);" }
- { name: turnLeft, args: [number degrees], returns: void, blockType: command, example: "turnLeft(15);" }
- { name: goTo, args: [string target], returns: void, blockType: command, opcode: motion_goto, example: "goTo(\"_random_\");" }
- { name: goTo, args: [number|reporter x, number|reporter y], returns: void, blockType: command, opcode: motion_gotoxy, example: "goTo(getVariable(\"px\"), getVariable(\"py\"));" }
- { name: goToXY, args: [number x, number y], returns: void, blockType: command, example: "goToXY(0, 0);" }
- { name: glideTo, args: [number seconds, string target], returns: void, blockType: command, example: "glideTo(1, \"_mouse_\");" }
- { name: glideToXY, args: [number seconds, number x, number y], returns: void, blockType: command, example: "glideToXY(1, 0, 0);" }
- { name: pointInDirection, args: [number direction], returns: void, blockType: command, example: "pointInDirection(90);" }
- { name: pointTowards, args: [string target], returns: void, blockType: command, example: "pointTowards(\"_mouse_\");" }
- { name: changeX, args: [number amount], returns: void, blockType: command, example: "changeX(10);" }
- { name: setX, args: [number x], returns: void, blockType: command, example: "setX(0);" }
- { name: changeY, args: [number amount], returns: void, blockType: command, example: "changeY(10);" }
- { name: setY, args: [number y], returns: void, blockType: command, example: "setY(0);" }
- { name: ifOnEdgeBounce, args: [], returns: void, blockType: command, example: "ifOnEdgeBounce();" }
- { name: setRotationStyle, args: [string style], returns: void, blockType: command, example: "setRotationStyle(\"left-right\");" }
- { name: xPosition, args: [], returns: number, blockType: reporter, example: "say(xPosition(), 1);" }
- { name: yPosition, args: [], returns: number, blockType: reporter, example: "say(yPosition(), 1);" }
- { name: direction, args: [], returns: number, blockType: reporter, example: "say(direction(), 1);" }
```

### 見た目・コスチューム・背景

```yaml
- { name: say, args: [stringOrReporter text, number seconds], returns: void, blockType: command, example: "say(\"こんにちは\", 2);" }
- { name: sayNow, args: [stringOrReporter text], returns: void, blockType: command, example: "sayNow(\"こんにちは\");" }
- { name: think, args: [stringOrReporter text, number seconds], returns: void, blockType: command, example: "think(\"うーん\", 2);" }
- { name: thinkNow, args: [stringOrReporter text], returns: void, blockType: command, example: "thinkNow(\"うーん\");" }
- { name: show, args: [], returns: void, blockType: command, example: "show();" }
- { name: hide, args: [], returns: void, blockType: command, example: "hide();" }
- { name: switchCostume, args: [string costumeName], returns: void, blockType: command, example: "switchCostume(\"costume1\");" }
- { name: nextCostume, args: [], returns: void, blockType: command, example: "nextCostume();" }
- { name: switchBackdrop, args: [string backdropName], returns: void, blockType: command, example: "switchBackdrop(\"backdrop1\");" }
- { name: nextBackdrop, args: [], returns: void, blockType: command, example: "nextBackdrop();" }
- { name: changeSize, args: [number delta], returns: void, blockType: command, example: "changeSize(10);" }
- { name: setSize, args: [number percent], returns: void, blockType: command, example: "setSize(100);" }
- { name: changeEffect, args: [string effect, number value], returns: void, blockType: command, example: "changeEffect(\"COLOR\", 25);" }
- { name: setEffect, args: [string effect, number value], returns: void, blockType: command, example: "setEffect(\"COLOR\", 0);" }
- { name: clearGraphicEffects, args: [], returns: void, blockType: command, example: "clearGraphicEffects();" }
- { name: goToFront, args: [string frontBack], returns: void, blockType: command, example: "goToFront(\"front\");" }
- { name: goToFrontLayer, args: [], returns: void, blockType: command, example: "goToFrontLayer();" }
- { name: goToBackLayer, args: [], returns: void, blockType: command, example: "goToBackLayer();" }
- { name: goForwardLayers, args: [number layers], returns: void, blockType: command, example: "goForwardLayers(1);" }
- { name: goForwardLayers, args: [string direction, number layers], returns: void, blockType: command, example: "goForwardLayers(\"forward\", 1);" }
- { name: goBackwardLayers, args: [number layers], returns: void, blockType: command, example: "goBackwardLayers(1);" }
- { name: costumeNumber, args: [optional string numberName], returns: number|string, blockType: reporter, example: "say(costumeNumber(), 1);" }
- { name: backdropNumber, args: [optional string numberName], returns: number|string, blockType: reporter, example: "say(backdropNumber(), 1);" }
- { name: size, args: [], returns: number, blockType: reporter, example: "say(size(), 1);" }
```

### 音

```yaml
- { name: playSoundUntilDone, args: [string soundName], returns: void, blockType: command, example: "playSoundUntilDone(\"pop\");" }
- { name: startSound, args: [string soundName], returns: void, blockType: command, example: "startSound(\"pop\");" }
- { name: stopAllSounds, args: [], returns: void, blockType: command, example: "stopAllSounds();" }
- { name: changeSoundEffect, args: [string effect, number amount], returns: void, blockType: command, example: "changeSoundEffect(\"PITCH\", 10);" }
- { name: setSoundEffect, args: [string effect, number value], returns: void, blockType: command, example: "setSoundEffect(\"PITCH\", 100);" }
- { name: clearSoundEffects, args: [], returns: void, blockType: command, example: "clearSoundEffects();" }
- { name: changeVolume, args: [number delta], returns: void, blockType: command, example: "changeVolume(-10);" }
- { name: setVolume, args: [number value], returns: void, blockType: command, example: "setVolume(100);" }
- { name: volume, args: [], returns: number, blockType: reporter, example: "say(volume(), 1);" }
```

### 制御・クローン

```yaml
- { name: wait, args: [number seconds], returns: void, blockType: command, example: "wait(1);" }
- { name: repeat, args: [positiveInteger times, closure body], returns: void, blockType: C, example: "repeat(10, () => { move(10); });" }
- { name: forever, args: [closure body], returns: void, blockType: C_cap, example: "forever(() => { move(10); });" }
- { name: ifThen, args: [boolean condition, closure body], returns: void, blockType: C, example: "ifThen(keyPressed(\"space\"), () => { move(10); });" }
- { name: ifBlock, args: [boolean condition, closure body], returns: void, blockType: C, example: "ifBlock(keyPressed(\"space\"), () => { move(10); });" }
- { name: ifElse, args: [boolean condition, closure thenBody, closure elseBody], returns: void, blockType: C, example: "ifElse(mouseDown(), () => { show(); }, () => { hide(); });" }
- { name: waitUntil, args: [boolean condition], returns: void, blockType: command, example: "waitUntil(mouseDown());" }
- { name: repeatUntil, args: [boolean condition, closure body], returns: void, blockType: C, example: "repeatUntil(mouseDown(), () => { move(10); });" }
- { name: stopAll, args: [], returns: void, blockType: cap, example: "stopAll();" }
- { name: stopThisScript, args: [], returns: void, blockType: cap, example: "stopThisScript();" }
- { name: stopOtherScripts, args: [], returns: void, blockType: command, example: "stopOtherScripts();" }
- { name: whenIStartAsClone, args: [closure body], returns: void, blockType: hat, example: "whenIStartAsClone(() => { move(10); });" }
- { name: whenCloned, args: [closure body], returns: void, blockType: hat, example: "whenCloned(() => { move(10); });" }
- { name: createClone, args: [string target], returns: void, blockType: command, example: "createClone(\"_myself_\");" }
- { name: deleteThisClone, args: [], returns: void, blockType: cap, example: "deleteThisClone();" }
```

### 調べる

```yaml
- { name: touchingObject, args: [string object], returns: boolean, blockType: boolean, example: "ifBlock(touchingObject(\"_edge_\"), () => { move(-10); });" }
- { name: touchingColor, args: [color color], returns: boolean, blockType: boolean, example: "ifBlock(touchingColor(\"#ff0000\"), () => { sayNow(\"赤\"); });" }
- { name: colorTouchingColor, args: [color color1, color color2], returns: boolean, blockType: boolean, example: "ifBlock(colorTouchingColor(\"#ff0000\", \"#00ff00\"), () => { sayNow(\"触れた\"); });" }
- { name: distanceTo, args: [string target], returns: number, blockType: reporter, example: "say(distanceTo(\"_mouse_\"), 1);" }
- { name: ask, args: [stringOrReporter question], returns: void, blockType: command, example: "ask(\"名前は？\");" }
- { name: askAndWait, args: [stringOrReporter question], returns: void, blockType: command, example: "askAndWait(\"名前は？\");" }
- { name: answer, args: [], returns: string, blockType: reporter, example: "say(answer(), 2);" }
- { name: keyPressed, args: [string key], returns: boolean, blockType: boolean, example: "ifBlock(keyPressed(\"space\"), () => { move(10); });" }
- { name: mouseDown, args: [], returns: boolean, blockType: boolean, example: "ifBlock(mouseDown(), () => { sayNow(\"クリック\"); });" }
- { name: mouseX, args: [], returns: number, blockType: reporter, example: "setX(mouseX());" }
- { name: mouseY, args: [], returns: number, blockType: reporter, example: "setY(mouseY());" }
- { name: setDragMode, args: [string mode], returns: void, blockType: command, example: "setDragMode(\"draggable\");" }
- { name: loudness, args: [], returns: number, blockType: reporter, example: "say(loudness(), 1);" }
- { name: timer, args: [], returns: number, blockType: reporter, example: "say(timer(), 1);" }
- { name: resetTimer, args: [], returns: void, blockType: command, example: "resetTimer();" }
- { name: of, args: [string property, string object], returns: any, blockType: reporter, example: "say(of(\"x position\", \"Sprite1\"), 1);" }
- { name: current, args: [string currentMenu], returns: number|string, blockType: reporter, example: "say(current(\"YEAR\"), 1);" }
- { name: daysSince2000, args: [], returns: number, blockType: reporter, example: "say(daysSince2000(), 1);" }
- { name: username, args: [], returns: string, blockType: reporter, example: "say(username(), 1);" }
```

### 演算

```yaml
- { name: random, args: [number from, number to], returns: number, blockType: reporter, example: "random(1, 100)" }
- { name: add, args: [number a, number b], returns: number, blockType: reporter, example: "add(1, 2)" }
- { name: subtract, args: [number a, number b], returns: number, blockType: reporter, example: "subtract(5, 3)" }
- { name: multiply, args: [number a, number b], returns: number, blockType: reporter, example: "multiply(2, 3)" }
- { name: divide, args: [number a, number b], returns: number, blockType: reporter, example: "divide(10, 2)" }
- { name: greaterThan, args: [stringOrReporter a, stringOrReporter b], returns: boolean, blockType: boolean, example: "greaterThan(getVariable(\"点数\"), 80)" }
- { name: gt, args: [stringOrReporter a, stringOrReporter b], returns: boolean, blockType: boolean, example: "gt(10, 5)" }
- { name: lessThan, args: [stringOrReporter a, stringOrReporter b], returns: boolean, blockType: boolean, example: "lessThan(3, 10)" }
- { name: lt, args: [stringOrReporter a, stringOrReporter b], returns: boolean, blockType: boolean, example: "lt(3, 10)" }
- { name: equals, args: [stringOrReporter a, stringOrReporter b], returns: boolean, blockType: boolean, example: "equals(answer(), \"はい\")" }
- { name: and, args: [boolean a, boolean b], returns: boolean, blockType: boolean, example: "and(keyPressed(\"space\"), mouseDown())" }
- { name: or, args: [boolean a, boolean b], returns: boolean, blockType: boolean, example: "or(keyPressed(\"space\"), mouseDown())" }
- { name: not, args: [boolean value], returns: boolean, blockType: boolean, example: "not(mouseDown())" }
- { name: join, args: [stringOrReporter a, stringOrReporter b], returns: string, blockType: reporter, example: "join(\"答えは\", answer())" }
- { name: letterOf, args: [number index, stringOrReporter text], returns: string, blockType: reporter, example: "letterOf(1, \"ABC\")" }
- { name: lengthOf, args: [stringOrReporter text], returns: number, blockType: reporter, example: "lengthOf(\"ABC\")" }
- { name: contains, args: [stringOrReporter text, stringOrReporter keyword], returns: boolean, blockType: boolean, example: "contains(answer(), \"はい\")" }
- { name: mod, args: [number a, number b], returns: number, blockType: reporter, example: "mod(10, 3)" }
- { name: round, args: [number value], returns: number, blockType: reporter, example: "round(3.14)" }
- { name: mathOp, args: [string operator, number value], returns: number, blockType: reporter, example: "mathOp(\"sqrt\", 9)" }
```

### 変数

```yaml
- { name: setVariable, args: [variableName name, stringOrReporter value], returns: void, blockType: command, example: "setVariable(\"点数\", 0);" }
- { name: changeVariable, args: [variableName name, number value], returns: void, blockType: command, example: "changeVariable(\"点数\", 1);" }
- { name: getVariable, args: [variableName name], returns: any, blockType: reporter, example: "say(getVariable(\"点数\"), 1);" }
- { name: variable, args: [variableName name], returns: any, blockType: reporter, example: "say(variable(\"点数\"), 1);" }
- { name: showVariable, args: [variableName name], returns: void, blockType: command, example: "showVariable(\"点数\");" }
- { name: hideVariable, args: [variableName name], returns: void, blockType: command, example: "hideVariable(\"点数\");" }
```

`showVariableSlider(name, min, max, value)` は調査中です。Scratch/Stretch3の `monitors` 保存形式を実物 `.sb3` で確認するまで出力してはいけません。

### リスト

```yaml
- { name: deleteAllOfList, args: [listName listName], returns: void, blockType: command, example: "deleteAllOfList(\"宝くじ全部\");" }
- { name: addToList, args: [stringOrReporter value, listName listName], returns: void, blockType: command, example: "addToList(random(1, 100), \"宝くじ全部\");" }
- { name: addToList, args: [listName listName, stringOrReporter value], returns: void, blockType: command, example: "addToList(\"宝くじ全部\", random(1, 100));" }
- { name: deleteOfList, args: [number|string index, listName listName], returns: void, blockType: command, example: "deleteOfList(1, \"宝くじ全部\");" }
- { name: insertAtList, args: [number|string index, stringOrReporter value, listName listName], returns: void, blockType: command, example: "insertAtList(1, \"りんご\", \"持ち物\");" }
- { name: replaceItemOfList, args: [number|string index, stringOrReporter value, listName listName], returns: void, blockType: command, example: "replaceItemOfList(1, \"みかん\", \"持ち物\");" }
- { name: itemOfList, args: [number|string index, listName listName], returns: any, blockType: reporter, example: "itemOfList(1, \"宝くじ全部\")" }
- { name: itemNumOfList, args: [stringOrReporter value, listName listName], returns: number, blockType: reporter, example: "itemNumOfList(\"りんご\", \"持ち物\")" }
- { name: lengthOfList, args: [listName listName], returns: number, blockType: reporter, example: "lengthOfList(\"宝くじ全部\")" }
- { name: listContains, args: [listName listName, stringOrReporter value], returns: boolean, blockType: boolean, example: "listContains(\"持ち物\", \"りんご\")" }
- { name: showList, args: [listName listName], returns: void, blockType: command, example: "showList(\"持ち物\");" }
- { name: hideList, args: [listName listName], returns: void, blockType: command, example: "hideList(\"持ち物\");" }
```

### 複数スプライトMVP

```yaml
- { name: sprite, args: [string spriteName, closure spriteBody], returns: target, blockType: meta, example: "sprite(\"Aさん\", () => { setSpriteText(\"A\"); whenGreenFlagClicked(() => { say(\"A\", 1); }); });" }
- { name: setSpritePosition, args: [number x, number y], returns: void, blockType: meta, scope: sprite_body_only, example: "setSpritePosition(-100, 0);" }
- { name: setSpriteSize, args: [number size], returns: void, blockType: meta, scope: sprite_body_only, example: "setSpriteSize(100);" }
- { name: setSpriteDirection, args: [number direction], returns: void, blockType: meta, scope: sprite_body_only, example: "setSpriteDirection(90);" }
- { name: setSpriteText, args: [string text], returns: void, blockType: meta, scope: sprite_body_only, example: "setSpriteText(\"グー\");" }
- { name: setSpriteColor, args: [color color], returns: void, blockType: meta, scope: sprite_body_only, example: "setSpriteColor(\"#ff0000\");" }
```

```yaml
multi_sprite_rules:
  - sprite_bodyの中では、setSpritePositionなどのmeta命令とhatブロックを置ける
  - 各spriteはproject.jsonのtargetsに個別のSprite targetとして出力される
  - spriteを使わない既存コードは従来通りSprite1に入る
  - 同名spriteは安全停止
  - 変数・リスト・ブロードキャストはMVPでは共有扱い
  - ローカル変数、画像costume読み込み、高度な同期は未対応
```

## 確認済みScratch標準拡張

外部拡張ではなく、Scratch標準拡張としてopcode確認済みのものだけ使用できる。

```yaml
extensions:
  pen:
    status: confirmed
    examples:
      - penClear()
      - penDown()
      - penUp()
  music:
    status: confirmed_basic_only
  translate:
    status: confirmed_basic_only
  text2speech:
    status: confirmed_basic_only
```

詳細なopcode表は `blocks/penBlocks.js`、`blocks/musicBlocks.js`、`blocks/translateBlocks.js`、`blocks/textToSpeechBlocks.js` を見る。

## 確認済みカスタム拡張

次の関数は公式fixtureと生成ブロックの保存形を比較済み。`experimental`は `.sb3` 保存形を確認済みだが、ブラウザ権限や実機を使う動作確認が未完了であることを表す。

```yaml
custom_extensions:
  ml2scratch:
    status: experimental
    functions:
      - { name: mlAddExample1, args: [], returns: void, blockType: command, example: "mlAddExample1();" }
      - { name: mlAddExample2, args: [], returns: void, blockType: command, example: "mlAddExample2();" }
      - { name: mlAddExample3, args: [], returns: void, blockType: command, example: "mlAddExample3();" }
      - { name: whenMlLabelReceived, args: [string label, closure body], allowedLabels: ["1", "2"], returns: void, blockType: hat, example: "whenMlLabelReceived(\"1\", () => { sayNow(\"1\"); });" }
      - { name: mlSetVideo, args: [string state], allowedStates: ["off"], returns: void, blockType: command, example: "mlSetVideo(\"off\");" }
      - { name: mlSetInput, args: [string input], allowedInputs: ["stage"], returns: void, blockType: command, example: "mlSetInput(\"stage\");" }
    notes:
      - 公式1or2 fixtureで確認できた値だけを出力する
      - 他の23ブロックは台帳化済みだが未対応
  cameraselector:
    status: experimental
    functions:
      - { name: selectCamera, args: [string cameraName], returns: void, blockType: command, example: "selectCamera(\"​標準カメラ​\");" }
    notes:
      - cameraNameは実行環境の動的メニュー値
  speech2scratch:
    status: experimental
    functions:
      - { name: startSpeechRecognition, args: [], returns: void, blockType: command, example: "startSpeechRecognition();" }
      - { name: speechText, args: [], returns: string, blockType: reporter, example: "sayNow(speechText());" }
    notes:
      - 実行時にブラウザのマイク権限が必要
  microbitMore:
    status: confirmed_minimum_only
    reference: docs/microbit-more-block-matrix.md
```

## 禁止事項

```yaml
forbidden:
  - 説明文を出す
  - Markdownを出す
  - ``` を出す
  - 未対応の関数名を作る
  - .sb3やproject.jsonを直接出力する
  - JavaScriptのeval/new Function前提の構文を出す
  - for/while/ifなどのJavaScript構文を出す
  - 配列、オブジェクト、class、import、requireを出す
  - 外部拡張の推測opcodeに相当する関数を出す
  - showVariableSliderを出す
```

条件分岐はJavaScriptの `if` ではなく `ifBlock(...)` または `ifElse(...)` を使う。
繰り返しはJavaScriptの `for` / `while` ではなく `repeat(...)`、`forever(...)`、`repeatUntil(...)` を使う。

## 未対応関数

```yaml
unsupported:
  custom_blocks:
    - defineProcedure
    - callProcedure
    - argumentStringNumber
    - argumentBoolean
    - showVariableSlider
  unconfirmed_external_extensions:
    - Posenet2scratch
    - TM2Scratch
    - TMPose2scratch
    - ImageClassifier2scratch
    - AkaDako
  unsupported_compatibility_helpers:
    - cameraName
    - speechContains
  partially_supported_extensions:
    - ML2Scratchは公式1or2 fixtureで確認した6ブロックだけ
    - Microbit Moreの対応表にない関数
    - CameraSelectorはselectCamera以外
    - Speech2ScratchはstartSpeechRecognitionとspeechText以外
```

未対応関数を含むコードは、変換器が `.sb3` を生成せずにエラーで停止する。

## 警告

```yaml
warnings:
  sayNow_then_stopAll:
    pattern: "sayNow(...); stopAll();"
    message: "結果表示の直後に stopAll() があるため、表示がすぐ消える可能性があります。say(\"文字\", 2) を使うと見やすくなります。"
    conversion: allowed
```

## よくある未対応関数の直し方

```yaml
unknown_function_hints:
  communities: "and() または or() の書き間違いの可能性。複雑な条件は複数のifBlockに分ける。"
  drawCircle: "repeat(360, () => { move(1); turnRight(1); }); で表現する。"
  parseInt: "JavaScript関数なので使わない。round() を使う。"
  Number: "JavaScript関数なので使わない。数値はそのまま書く。"
  toString: "join() を使う。"
  includes: "文字列なら contains()、リストなら listContains() を使う。"
  push: "addToList() を使う。"
  array: "Scratchのリストを使う。deleteAllOfList() と addToList() で作る。"
  listAdd: "addToList() を使う。"
```

## 安全に使えるサンプル

### Pen四角

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

### 宝くじD

```js
whenGreenFlagClicked(() => {
  deleteAllOfList("宝くじ全部");
  setVariable("当選金合計金額", 0);

  repeat(100, () => {
    addToList(random(1, 1000), "宝くじ全部");
  });

  repeat(5, () => {
    setVariable("引いた場所", random(1, lengthOfList("宝くじ全部")));
    setVariable("引いた番号", itemOfList(getVariable("引いた場所"), "宝くじ全部"));

    ifElse(lessThan(getVariable("引いた番号"), 10), () => {
      say("1等！5000円！", 2);
      changeVariable("当選金合計金額", 5000);
    }, () => {
      ifElse(lessThan(getVariable("引いた番号"), 100), () => {
        say("2等！1000円！", 2);
        changeVariable("当選金合計金額", 1000);
      }, () => {
        say("はずれ", 1);
      });
    });

    deleteOfList(getVariable("引いた場所"), "宝くじ全部");
  });

  say(join("合計当選金額は", getVariable("当選金合計金額")), 3);
});
```
