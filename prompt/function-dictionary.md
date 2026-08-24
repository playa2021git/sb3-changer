# 使える関数の辞書

このファイルは Sb3-Changer のブロック定義から自動で書き出しています。
**ここに載っていない関数名を書いてはいけません。似た名前を作ることも禁止です。**

読み方

- 見出しが関数の書き方です。引数の名前は説明用なので、そのまま書くのではなく値を入れます。
- 「えらぶ」と書いてある引数は、並んでいる値のどれかを ""で囲んで書きます。それ以外の値は使えません。
- 「いちばん外側に置く」ものは、他の関数の中に入れてはいけません。
- 引数名のうしろに ? が付いているものは省略できます。省略すると既定値が使われます。

関数の数: 205

## イベント

- `whenBackdropSwitchesTo(backdrop, () => { })` … いちばん外側に置く / backdrop: えらぶ
  - 例: `whenBackdropSwitchesTo("backdrop1", () => { show(); });`
- `whenGreaterThan(sensor, value, () => { })` … いちばん外側に置く / sensor: えらぶ、value: 数値
  - 例: `whenGreaterThan("LOUDNESS", 10, () => { say("大きい", 1); });`
- `whenGreenFlagClicked(() => { })` … いちばん外側に置く
  - 例: `whenGreenFlagClicked(() => { move(10); });`
- `whenKeyPressed(key, () => { })` … いちばん外側に置く / key: えらぶ
  - 例: `whenKeyPressed("space", () => { move(10); });`
- `whenSpriteClicked(() => { })` … いちばん外側に置く
  - 例: `whenSpriteClicked(() => { say("やあ", 1); });`
- `whenThisSpriteClicked(() => { })` … いちばん外側に置く
  - 例: `whenThisSpriteClicked(() => { say("やあ", 1); });`

## メッセージ

- `broadcast(message)` … message: メッセージ名
  - 例: `broadcast("スタート");`
- `broadcastAndWait(message)` … message: メッセージ名
  - 例: `broadcastAndWait("スタート");`
- `whenIReceive(message, () => { })` … いちばん外側に置く / message: メッセージ名
  - 例: `whenIReceive("スタート", () => { move(10); });`

## 動き

- `changeX(amount)` … amount: 数値
  - 例: `changeX(10);`
- `changeY(amount)` … amount: 数値
  - 例: `changeY(10);`
- `direction()` … 値を返す
  - 例: `say(direction(), 1);`
- `glideTo(seconds, target)` … seconds: 数値、target: えらぶ
  - 例: `glideTo(1, "_random_");`
- `glideToXY(seconds, x, y)` … seconds: 数値、x: 数値、y: 数値
  - 例: `glideToXY(1, 100, 0);`
- `goTo(target)` … target: えらぶ
  - 例: `goTo("_random_");`
- `goToXY(x, y)` … x: 数値、y: 数値
  - 例: `goToXY(0, 0);`
- `ifOnEdgeBounce()`
  - 例: `ifOnEdgeBounce();`
- `move(steps)` … steps: 数値
  - 例: `move(10);`
- `pointInDirection(direction)` … direction: 数値
  - 例: `pointInDirection(90);`
- `pointTowards(target)` … target: えらぶ
  - 例: `pointTowards("_mouse_");`
- `setRotationStyle(style)` … style: えらぶ
  - 例: `setRotationStyle("left-right");`
- `setX(x)` … x: 数値
  - 例: `setX(0);`
- `setY(y)` … y: 数値
  - 例: `setY(0);`
- `turnLeft(degrees)` … degrees: 数値
  - 例: `turnLeft(15);`
- `turnRight(degrees)` … degrees: 数値
  - 例: `turnRight(15);`
- `xPosition()` … 値を返す
  - 例: `say(xPosition(), 1);`
- `yPosition()` … 値を返す
  - 例: `say(yPosition(), 1);`

## 見た目

- `changeEffect(effect, amount)` … effect: えらぶ、amount: 数値
  - 例: `changeEffect("COLOR", 25);`
- `changeSize(amount)` … amount: 数値
  - 例: `changeSize(10);`
- `clearGraphicEffects()`
  - 例: `clearGraphicEffects();`
- `goBackwardLayers(layers)` … layers: 数値
  - 例: `goBackwardLayers(1);`
- `goForwardLayers(forwardBackward?, layers)` … forwardBackward: えらぶ（省略可・既定値 "forward"）、layers: 数値
  - 例: `goForwardLayers(1);
goForwardLayers("forward", 1);`
- `goToBackLayer()`
  - 例: `goToBackLayer();`
- `goToFront(frontBack)` … frontBack: えらぶ
  - 例: `goToFront("front");`
- `goToFrontLayer()`
  - 例: `goToFrontLayer();`
- `hide()`
  - 例: `hide();`
- `say(message, seconds?)` … message: 文字列、seconds: 数値（省略可・既定値 2）
  - 例: `say("こんにちは", 2);`
- `sayNow(message)` … message: 文字列
  - 例: `sayNow("こんにちは");`
- `setEffect(effect, value)` … effect: えらぶ、value: 数値
  - 例: `setEffect("COLOR", 0);`
- `setSize(size)` … size: 数値
  - 例: `setSize(100);`
- `show()`
  - 例: `show();`
- `size()` … 値を返す
  - 例: `say(size(), 1);`
- `think(message, seconds?)` … message: 文字列、seconds: 数値（省略可・既定値 2）
  - 例: `think("うーん", 2);`
- `thinkNow(message)` … message: 文字列
  - 例: `thinkNow("うーん");`

## コスチューム

- `costumeNumber(numberName?)` … 値を返す / numberName: えらぶ（省略可・既定値 "number"）
  - 例: `say(costumeNumber(), 1);`
- `nextCostume()`
  - 例: `nextCostume();`
- `switchCostume(costume)` … costume: えらぶ
  - 例: `switchCostume("costume1");`

## 背景

- `backdropNumber(numberName?)` … 値を返す / numberName: えらぶ（省略可・既定値 "number"）
  - 例: `say(backdropNumber(), 1);`
- `nextBackdrop()`
  - 例: `nextBackdrop();`
- `switchBackdrop(backdrop)` … backdrop: えらぶ
  - 例: `switchBackdrop("backdrop1");`

## 音

- `changeSoundEffect(effect, amount)` … effect: えらぶ、amount: 数値
  - 例: `changeSoundEffect("PITCH", 10);`
- `changeVolume(amount)` … amount: 数値
  - 例: `changeVolume(-10);`
- `clearSoundEffects()`
  - 例: `clearSoundEffects();`
- `playSoundUntilDone(sound)` … sound: えらぶ
  - 例: `playSoundUntilDone("pop");`
- `setSoundEffect(effect, value)` … effect: えらぶ、value: 数値
  - 例: `setSoundEffect("PITCH", 100);`
- `setVolume(volume)` … volume: 数値
  - 例: `setVolume(100);`
- `startSound(sound)` … sound: えらぶ
  - 例: `startSound("pop");`
- `stopAllSounds()`
  - 例: `stopAllSounds();`
- `volume()` … 値を返す
  - 例: `say(volume(), 1);`

## 制御

- `forever(() => { })` … 中にコードを入れる
  - 例: `forever(() => { move(10); });`
- `ifBlock(condition, () => { })` … 中にコードを入れる / condition: 条件
  - 例: `ifBlock(keyPressed("space"), () => { move(10); });`
- `ifElse(condition, () => { }, () => { })` … 中にコードを入れる / condition: 条件
  - 例: `ifElse(mouseDown(), () => { show(); }, () => { hide(); });`
- `ifThen(condition, () => { })` … 中にコードを入れる / condition: 条件
  - 例: `ifThen(keyPressed("space"), () => { move(10); });`
- `repeat(times, () => { })` … 中にコードを入れる / times: 1以上の整数
  - 例: `repeat(10, () => { move(10); });`
- `repeatUntil(condition, () => { })` … 中にコードを入れる / condition: 条件
  - 例: `repeatUntil(mouseDown(), () => { move(10); });`
- `stopAll()`
  - 例: `stopAll();`
- `stopOtherScripts()`
  - 例: `stopOtherScripts();`
- `stopThisScript()`
  - 例: `stopThisScript();`
- `wait(seconds)` … seconds: 数値
  - 例: `wait(1);`
- `waitUntil(condition)` … condition: 条件
  - 例: `waitUntil(mouseDown());`

## クローン

- `createClone(target)` … target: えらぶ
  - 例: `createClone("_myself_");`
- `deleteThisClone()`
  - 例: `deleteThisClone();`
- `whenCloned(() => { })` … いちばん外側に置く
  - 例: `whenCloned(() => { move(10); });`
- `whenIStartAsClone(() => { })` … いちばん外側に置く
  - 例: `whenIStartAsClone(() => { move(10); });`

## 調べる

- `answer()` … 値を返す
  - 例: `say(answer(), 1);`
- `ask(question)` … question: 文字列
  - 例: `ask("名前は？");`
- `askAndWait(question)` … question: 文字列
  - 例: `askAndWait("名前は？");`
- `colorTouchingColor(color, touchingColor)` … 条件として使う / color: 色（#RRGGBB）、touchingColor: 色（#RRGGBB）
  - 例: `ifThen(colorTouchingColor("#ff0000", "#0000ff"), () => { say("当たり", 1); });`
- `current(currentMenu)` … 値を返す / currentMenu: えらぶ
  - 例: `say(current("YEAR"), 1);`
- `daysSince2000()` … 値を返す
  - 例: `say(daysSince2000(), 1);`
- `distanceTo(target)` … 値を返す / target: えらぶ
  - 例: `say(distanceTo("_mouse_"), 1);`
- `keyPressed(key)` … 条件として使う / key: えらぶ
  - 例: `ifThen(keyPressed("space"), () => { move(10); });`
- `loudness()` … 値を返す
  - 例: `say(loudness(), 1);`
- `mouseDown()` … 条件として使う
  - 例: `ifThen(mouseDown(), () => { say("クリック", 1); });`
- `mouseX()` … 値を返す
  - 例: `setX(mouseX());`
- `mouseY()` … 値を返す
  - 例: `setY(mouseY());`
- `of(property, object)` … 値を返す / property: えらぶ、object: えらぶ
  - 例: `say(of("x position", "Sprite1"), 1);`
- `resetTimer()`
  - 例: `resetTimer();`
- `setDragMode(mode)` … mode: えらぶ
  - 例: `setDragMode("draggable");`
- `timer()` … 値を返す
  - 例: `say(timer(), 1);`
- `touchingColor(color)` … 条件として使う / color: 色（#RRGGBB）
  - 例: `ifThen(touchingColor("#ff0000"), () => { say("赤", 1); });`
- `touchingObject(object)` … 条件として使う / object: えらぶ
  - 例: `ifThen(touchingObject("_edge_"), () => { move(-10); });`
- `username()` … 値を返す
  - 例: `say(username(), 1);`

## 演算

- `add(a, b)` … 値を返す / a: 数値、b: 数値
  - 例: `say(add(1, 2), 1);`
- `and(a, b)` … 条件として使う / a: 条件、b: 条件
  - 例: `ifThen(and(mouseDown(), keyPressed("space")), () => { move(10); });`
- `contains(text, part)` … 条件として使う / text: 文字列、part: 文字列
  - 例: `ifThen(contains("apple", "a"), () => { say("ある", 1); });`
- `divide(a, b)` … 値を返す / a: 数値、b: 数値
  - 例: `say(divide(10, 2), 1);`
- `equals(a, b)` … 条件として使う / a: 文字列、b: 文字列
  - 例: `ifThen(equals(answer(), "はい"), () => { say("OK", 1); });`
- `greaterThan(a, b)` … 条件として使う / a: 文字列、b: 文字列
  - 例: `ifBlock(greaterThan(xPosition(), 100), () => { say("右", 1); });`
- `gt(a, b)` … 条件として使う / a: 文字列、b: 文字列
  - 例: `ifThen(gt(xPosition(), 100), () => { say("右", 1); });`
- `join(a, b)` … 値を返す / a: 文字列、b: 文字列
  - 例: `say(join("こんにちは", "！"), 1);`
- `lengthOf(text)` … 値を返す / text: 文字列
  - 例: `say(lengthOf("こんにちは"), 1);`
- `lessThan(a, b)` … 条件として使う / a: 文字列、b: 文字列
  - 例: `ifBlock(lessThan(xPosition(), -100), () => { say("左", 1); });`
- `letterOf(index, text)` … 値を返す / index: 数値、text: 文字列
  - 例: `say(letterOf(1, "ABC"), 1);`
- `lt(a, b)` … 条件として使う / a: 文字列、b: 文字列
  - 例: `ifThen(lt(xPosition(), -100), () => { say("左", 1); });`
- `mathOp(operator, value)` … 値を返す / operator: えらぶ、value: 数値
  - 例: `say(mathOp("sqrt", 9), 1);`
- `mod(a, b)` … 値を返す / a: 数値、b: 数値
  - 例: `say(mod(10, 3), 1);`
- `multiply(a, b)` … 値を返す / a: 数値、b: 数値
  - 例: `say(multiply(2, 3), 1);`
- `not(condition)` … 条件として使う / condition: 条件
  - 例: `ifThen(not(mouseDown()), () => { say("はなした", 1); });`
- `or(a, b)` … 条件として使う / a: 条件、b: 条件
  - 例: `ifThen(or(mouseDown(), keyPressed("space")), () => { move(10); });`
- `random(from, to)` … 値を返す / from: 数値、to: 数値
  - 例: `move(random(1, 10));`
- `round(value)` … 値を返す / value: 数値
  - 例: `say(round(3.14), 1);`
- `subtract(a, b)` … 値を返す / a: 数値、b: 数値
  - 例: `say(subtract(5, 2), 1);`

## 変数

- `changeVariable(variable, value)` … variable: 変数名、value: 数値
  - 例: `changeVariable("score", 1);`
- `getVariable(variable)` … 値を返す / variable: 変数名
  - 例: `say(getVariable("score"), 1);`
- `hideVariable(variable)` … variable: 変数名
  - 例: `hideVariable("score");`
- `setVariable(variable, value)` … variable: 変数名、value: 文字列
  - 例: `setVariable("score", 0);`
- `showVariable(variable)` … variable: 変数名
  - 例: `showVariable("score");`
- `variable(variable)` … 値を返す / variable: 変数名
  - 例: `say(variable("score"), 1);`

## リスト

- `addToList(item, list)` … item: 文字列、list: リスト名
  - 例: `addToList("りんご", "items");`
- `deleteAllOfList(list)` … list: リスト名
  - 例: `deleteAllOfList("items");`
- `deleteOfList(index, list)` … index: 番号、list: リスト名
  - 例: `deleteOfList(1, "items");`
- `hideList(list)` … list: リスト名
  - 例: `hideList("items");`
- `insertAtList(index, item, list)` … index: 番号、item: 文字列、list: リスト名
  - 例: `insertAtList(1, "りんご", "items");`
- `itemNumOfList(item, list)` … 値を返す / item: 文字列、list: リスト名
  - 例: `say(itemNumOfList("りんご", "items"), 1);`
- `itemOfList(index, list)` … 値を返す / index: 番号、list: リスト名
  - 例: `say(itemOfList(1, "items"), 1);`
- `lengthOfList(list)` … 値を返す / list: リスト名
  - 例: `say(lengthOfList("items"), 1);`
- `listContains(list, item)` … 条件として使う / list: リスト名、item: 文字列
  - 例: `ifThen(listContains("items", "りんご"), () => { say("ある", 1); });`
- `replaceItemOfList(index, item, list)` … index: 番号、item: 文字列、list: リスト名
  - 例: `replaceItemOfList(1, "みかん", "items");`
- `showList(list)` … list: リスト名
  - 例: `showList("items");`

## ML2Scratch

- `mlAddExample1()`
  - 例: `mlAddExample1();`
- `mlAddExample2()`
  - 例: `mlAddExample2();`
- `mlAddExample3()`
  - 例: `mlAddExample3();`
- `mlSetInput(input)` … input: "stage"
  - 例: `mlSetInput("stage");`
- `mlSetVideo(state)` … state: "off"
  - 例: `mlSetVideo("off");`
- `whenMlLabelReceived(label, () => { })` … いちばん外側に置く / label: "1" / "2"
  - 例: `whenMlLabelReceived("1", () => { sayNow("1"); });`

## Posenet2Scratch

- `posePeopleCount()` … 値を返す
  - 例: `posePeopleCount()`
- `poseX(personNumber, part)` … 値を返す / personNumber: "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "10"、part: "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "10" / "11" / "12" / "13" / "14" / "15" / "16"
  - 例: `poseX(1, "鼻")`
- `poseY(personNumber, part)` … 値を返す / personNumber: "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "10"、part: "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "10" / "11" / "12" / "13" / "14" / "15" / "16"
  - 例: `poseY(1, "鼻")`

## Microbit More

- `ifMicrobitButtonPressed(button, () => { })` … いちばん外側に置く / button: "A" / "B"
  - 例: `ifMicrobitButtonPressed("A", () => { microbitDisplayText("2", 120); });`
- `microbitAcceleration(axis)` … 値を返す / axis: "x" / "y" / "z" / "absolute"
  - 例: `sayNow(microbitAcceleration("x"));`
- `microbitAccelerationAbsolute()` … 値を返す
  - 例: `sayNow(microbitAccelerationAbsolute());`
- `microbitAccelerationX()` … 値を返す
  - 例: `sayNow(microbitAccelerationX());`
- `microbitAccelerationY()` … 値を返す
  - 例: `sayNow(microbitAccelerationY());`
- `microbitAccelerationZ()` … 値を返す
  - 例: `sayNow(microbitAccelerationZ());`
- `microbitAnalogValue(pin)` … 値を返す / pin: "0" / "1" / "2"
  - 例: `sayNow(microbitAnalogValue("0"));`
- `microbitButtonPressed(button)` … 条件として使う / button: "A" / "B"
  - 例: `ifBlock(microbitButtonPressed("A"), () => { move(10); });`
- `microbitClearDisplay()`
  - 例: `microbitClearDisplay();`
- `microbitCompassHeading()` … 値を返す
  - 例: `sayNow(microbitCompassHeading());`
- `microbitDataLabeled(label)` … 値を返す / label: 文字列
  - 例: `sayNow(microbitDataLabeled("label-01"));`
- `microbitDisplayMatrix(pattern)` … pattern: 5行5列の0と1
  - 例: `microbitDisplayMatrix("0101011111111110111000100");`
- `microbitDisplayText(text, delay?)` … text: 文字列、delay: 数値（省略可・既定値 120）
  - 例: `microbitDisplayText("Hello!", 120);`
- `microbitLightLevel()` … 値を返す
  - 例: `sayNow(microbitLightLevel());`
- `microbitListenPinEventType(pin, eventType)` … pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"、eventType: "NONE" / "ON_PULSE" / "ON_EDGE"
  - 例: `microbitListenPinEventType("0", "ON_EDGE");`
- `microbitMagneticForce(axis)` … 値を返す / axis: "x" / "y" / "z" / "absolute"
  - 例: `sayNow(microbitMagneticForce("absolute"));`
- `microbitMagneticForceAbsolute()` … 値を返す
  - 例: `sayNow(microbitMagneticForceAbsolute());`
- `microbitMagneticForceX()` … 値を返す
  - 例: `sayNow(microbitMagneticForceX());`
- `microbitMagneticForceY()` … 値を返す
  - 例: `sayNow(microbitMagneticForceY());`
- `microbitMagneticForceZ()` … 値を返す
  - 例: `sayNow(microbitMagneticForceZ());`
- `microbitPinEventValue(pin, event)` … 値を返す / pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"、event: "PULSE_LOW" / "PULSE_HIGH" / "FALL" / "RISE"
  - 例: `sayNow(microbitPinEventValue("0", "PULSE_LOW"));`
- `microbitPinHigh(pin)` … 条件として使う / pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"
  - 例: `ifBlock(microbitPinHigh("0"), () => { say("HIGH", 1); });`
- `microbitPinTouched(name)` … 条件として使う / name: "LOGO" / "P0" / "P1" / "P2"
  - 例: `ifBlock(microbitPinTouched("LOGO"), () => { say("タッチ中", 1); });`
- `microbitPitch()` … 値を返す
  - 例: `sayNow(microbitPitch());`
- `microbitPlayTone(freq, volume?)` … freq: 数値、volume: 数値（省略可・既定値 100）
  - 例: `microbitPlayTone(440, 100);`
- `microbitRoll()` … 値を返す
  - 例: `sayNow(microbitRoll());`
- `microbitSendData(label, data)` … label: 文字列、data: 文字列
  - 例: `microbitSendData("label-01", "こんにちは");`
- `microbitSetAnalogOut(pin, level)` … pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"、level: 数値
  - 例: `microbitSetAnalogOut("0", 512);`
- `microbitSetDigitalOut(pin, level)` … pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"、level: "true" / "false"
  - 例: `microbitSetDigitalOut("0", "true");`
- `microbitSetPullMode(pin, mode)` … pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"、mode: "NONE" / "DOWN" / "UP"
  - 例: `microbitSetPullMode("0", "UP");`
- `microbitSetServo(pin, angle)` … pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"、angle: 数値
  - 例: `microbitSetServo("0", 90);`
- `microbitSoundLevel()` … 値を返す
  - 例: `sayNow(microbitSoundLevel());`
- `microbitStopTone()`
  - 例: `microbitStopTone();`
- `microbitTemperature()` … 値を返す
  - 例: `sayNow(microbitTemperature());`
- `whenMicrobitButtonEvent(button, event, () => { })` … いちばん外側に置く / button: "A" / "B"、event: "DOWN" / "UP" / "CLICK" / "HOLD" / "LONG_CLICK" / "DOUBLE_CLICK"
  - 例: `whenMicrobitButtonEvent("A", "CLICK", () => { sayNow("クリック"); });`
- `whenMicrobitButtonPressed(button, () => { })` … いちばん外側に置く / button: "A" / "B"
  - 例: `whenMicrobitButtonPressed("A", () => { microbitDisplayText("2", 120); });`
- `whenMicrobitConnectionChanged(state, () => { })` … いちばん外側に置く / state: "connected" / "disconnected"
  - 例: `whenMicrobitConnectionChanged("connected", () => { sayNow("接続"); });`
- `whenMicrobitDataReceived(label, () => { })` … いちばん外側に置く / label: 文字列
  - 例: `whenMicrobitDataReceived("label-01", () => { sayNow("受信"); });`
- `whenMicrobitGesture(gesture, () => { })` … いちばん外側に置く / gesture: "TILT_UP" / "TILT_DOWN" / "TILT_LEFT" / "TILT_RIGHT" / "FACE_UP" / "FACE_DOWN" / "FREEFALL" / "G3" / "G6" / "G8" / "SHAKE"
  - 例: `whenMicrobitGesture("TILT_LEFT", () => { changeX(-10); });`
- `whenMicrobitPinEvent(pin, event, () => { })` … いちばん外側に置く / pin: "0" / "1" / "2" / "8" / "12" / "13" / "14" / "15" / "16"、event: "PULSE_LOW" / "PULSE_HIGH" / "FALL" / "RISE"
  - 例: `whenMicrobitPinEvent("0", "RISE", () => { sayNow("立ち上がり"); });`
- `whenMicrobitShaken(() => { })` … いちばん外側に置く
  - 例: `whenMicrobitShaken(() => { microbitPlayTone(440, 100); });`
- `whenMicrobitTouchEvent(name, event, () => { })` … いちばん外側に置く / name: "LOGO" / "P0" / "P1" / "P2"、event: "DOWN" / "UP" / "CLICK" / "HOLD" / "LONG_CLICK" / "DOUBLE_CLICK"
  - 例: `whenMicrobitTouchEvent("LOGO", "DOWN", () => { sayNow("さわった"); });`

## Speech2Scratch

- `speechText()` … 値を返す
  - 例: `sayNow(speechText());`
- `startSpeechRecognition()`
  - 例: `startSpeechRecognition();`

## カメラセレクター

- `selectCamera(camera)` … camera: えらぶ
  - 例: `selectCamera("​標準カメラ​");`

## ペン

- `changePenColorParam(param, value)` … param: えらぶ、value: 数値
  - 例: `changePenColorParam("color", 10);`
- `changePenSize(size)` … size: 数値
  - 例: `changePenSize(1);`
- `penClear()`
  - 例: `penClear();`
- `penDown()`
  - 例: `penDown();`
- `penStamp()`
  - 例: `penStamp();`
- `penUp()`
  - 例: `penUp();`
- `setPenColor(color)` … color: 色（#RRGGBB）
  - 例: `setPenColor("#ff0000");`
- `setPenColorParam(param, value)` … param: えらぶ、value: 数値
  - 例: `setPenColorParam("color", 50);`
- `setPenSize(size)` … size: 数値
  - 例: `setPenSize(3);`

## 音楽

- `changeTempo(tempo)` … tempo: 数値
  - 例: `changeTempo(20);`
- `playDrumForBeats(drum, beats)` … drum: 数値、beats: 数値
  - 例: `playDrumForBeats(1, 0.25);`
- `playNoteForBeats(note, beats)` … note: 数値、beats: 数値
  - 例: `playNoteForBeats(60, 0.5);`
- `restForBeats(beats)` … beats: 数値
  - 例: `restForBeats(0.25);`
- `setInstrument(instrument)` … instrument: 数値
  - 例: `setInstrument(1);`
- `setTempo(tempo)` … tempo: 数値
  - 例: `setTempo(60);`
- `tempo()` … 値を返す
  - 例: `say(tempo(), 1);`

## 音声合成

- `setSpeechLanguage(language)` … language: えらぶ
  - 例: `setSpeechLanguage("ja");`
- `setVoice(voice)` … voice: えらぶ
  - 例: `setVoice("alto");`
- `speak(words)` … words: 文字列
  - 例: `speak("こんにちは");`

## 翻訳

- `translate(words, language)` … 値を返す / words: 文字列、language: えらぶ
  - 例: `say(translate("Hello", "ja"), 2);`
- `viewerLanguage()` … 値を返す
  - 例: `say(viewerLanguage(), 1);`

## 使えないもの

次の機能はまだ対応していません。頼まれても書かず、対応していないと伝えてください。

- `argumentBoolean` … 独自ブロック
- `argumentStringNumber` … 独自ブロック
- `callProcedure` … 独自ブロック
- `cameraName` … カメラセレクター
- `classifiedLabel` … ImageClassifier2Scratch
- `defineProcedure` … 独自ブロック
- `ifImageClassifiedAs` … ImageClassifier2Scratch
- `imageClassifiedAs` … ImageClassifier2Scratch
- `microbitTiltAngle` … Microbit More
- `mlConfidence` … ML2Scratch
- `mlDownloadLearningData` … ML2Scratch
- `mlExampleCount1` … ML2Scratch
- `mlExampleCount10` … ML2Scratch
- `mlExampleCount2` … ML2Scratch
- `mlExampleCount3` … ML2Scratch
- `mlExampleCount4` … ML2Scratch
- `mlExampleCount5` … ML2Scratch
- `mlExampleCount6` … ML2Scratch
- `mlExampleCount7` … ML2Scratch
- `mlExampleCount8` … ML2Scratch
- `mlExampleCount9` … ML2Scratch
- `mlExampleCountForLabel` … ML2Scratch
- `mlIsDetected` … ML2Scratch
- `mlLabel` … ML2Scratch
- `mlReset` … ML2Scratch
- `mlResetLabel` … ML2Scratch
- `mlSetClassification` … ML2Scratch
- `mlSetClassificationInterval` … ML2Scratch
- `mlSetVideoTransparency` … ML2Scratch
- `mlSwitchCamera` … ML2Scratch
- `mlTrain` … ML2Scratch
- `mlTrainLabel` … ML2Scratch
- `mlUploadLearningData` … ML2Scratch
- `poseLeftAnkleX` … Posenet2Scratch
- `poseLeftAnkleY` … Posenet2Scratch
- `poseLeftEarX` … Posenet2Scratch
- `poseLeftEarY` … Posenet2Scratch
- `poseLeftElbowX` … Posenet2Scratch
- `poseLeftElbowY` … Posenet2Scratch
- `poseLeftEyeX` … Posenet2Scratch
- `poseLeftEyeY` … Posenet2Scratch
- `poseLeftHipX` … Posenet2Scratch
- `poseLeftHipY` … Posenet2Scratch
- `poseLeftKneeX` … Posenet2Scratch
- `poseLeftKneeY` … Posenet2Scratch
- `poseLeftShoulderX` … Posenet2Scratch
- `poseLeftShoulderY` … Posenet2Scratch
- `poseLeftWristX` … Posenet2Scratch
- `poseLeftWristY` … Posenet2Scratch
- `poseNoseX` … Posenet2Scratch
- `poseNoseY` … Posenet2Scratch
- `poseRightAnkleX` … Posenet2Scratch
- `poseRightAnkleY` … Posenet2Scratch
- `poseRightEarX` … Posenet2Scratch
- `poseRightEarY` … Posenet2Scratch
- `poseRightElbowX` … Posenet2Scratch
- `poseRightElbowY` … Posenet2Scratch
- `poseRightEyeX` … Posenet2Scratch
- `poseRightEyeY` … Posenet2Scratch
- `poseRightHipX` … Posenet2Scratch
- `poseRightHipY` … Posenet2Scratch
- `poseRightKneeX` … Posenet2Scratch
- `poseRightKneeY` … Posenet2Scratch
- `poseRightShoulderX` … Posenet2Scratch
- `poseRightShoulderY` … Posenet2Scratch
- `poseRightWristX` … Posenet2Scratch
- `poseRightWristY` … Posenet2Scratch
- `poseScore` … Posenet2Scratch
- `poseSetVideo` … Posenet2Scratch
- `poseSetVideoTransparency` … Posenet2Scratch
- `showVariableSlider` … 変数モニター
- `speechContains` … Speech2Scratch
- `tmClassifiedAs` … TM2Scratch
- `tmConfidence` … TM2Scratch
- `tmLabel` … TM2Scratch
- `tmPoseConfidence` … TMPose2Scratch
- `tmPoseIs` … TMPose2Scratch
- `tmPoseLabel` … TMPose2Scratch
- `whenMlCustomLabelReceived` … ML2Scratch
