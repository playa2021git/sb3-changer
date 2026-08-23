# Microbit More 対応関数

Sb3-Changerは公式Microbit Moreの31ブロックすべてを変換できます。
ここに書かれていない関数名は使わないでください。

## 授業で使ってよい範囲

いま実機で動作を確認できているのは次の関数だけです。**特に指示がないときは、この中から選んでください。**

- whenMicrobitButtonPressed(button, body)
- ifMicrobitButtonPressed(button, body)
- whenMicrobitShaken(body)
- whenMicrobitGesture(gesture, body)
- microbitDisplayText(text, delay)
- microbitDisplayMatrix(pattern)
- microbitPlayTone(freq, volume)
- microbitStopTone()
- microbitRoll()

先生が「温度を使いたい」「サーボを動かしたい」のように指定したときは、下の一覧から使ってかまいません。

## メニュー値

大文字小文字を区別します。ここに無い値を書くとエラーになります。

| メニュー | 使える値 |
| --- | --- |
| button | "A" "B" |
| buttonEvent | "DOWN" "UP" "CLICK" "HOLD" "LONG_CLICK" "DOUBLE_CLICK" |
| touchId | "LOGO" "P0" "P1" "P2" |
| gesture | "TILT_UP" "TILT_DOWN" "TILT_LEFT" "TILT_RIGHT" "FACE_UP" "FACE_DOWN" "FREEFALL" "G3" "G6" "G8" "SHAKE" |
| axis | "x" "y" "z" "absolute" （小文字） |
| analogPin | "0" "1" "2" |
| gpioPin | "0" "1" "2" "8" "12" "13" "14" "15" "16" |
| pullMode | "NONE" "DOWN" "UP" |
| pinEventType | "NONE" "ON_PULSE" "ON_EDGE" |
| pinEvent | "PULSE_LOW" "PULSE_HIGH" "FALL" "RISE" |
| digitalLevel | "true" "false" （文字列で書く） |
| connectionState | "connected" "disconnected" |

## 全31関数

### イベント

- whenMicrobitConnectionChanged("connected", () => { });
- whenMicrobitButtonPressed("A", () => { });
- whenMicrobitButtonEvent("A", "CLICK", () => { });
- whenMicrobitTouchEvent("LOGO", "DOWN", () => { });
- whenMicrobitGesture("SHAKE", () => { });
- whenMicrobitShaken(() => { });
- whenMicrobitPinEvent("0", "RISE", () => { });
- whenMicrobitDataReceived("label-01", () => { });

### 条件（ifBlockの中に入れる）

- microbitButtonPressed("A")
- microbitPinTouched("LOGO")
- microbitPinHigh("0")

### 画面と音

- microbitDisplayText("Hello!", 120);
- microbitDisplayMatrix("0101011111111110111000100");
- microbitClearDisplay();
- microbitPlayTone(440, 100);
- microbitStopTone();

### センサーの値を読む

- microbitLightLevel()
- microbitTemperature()
- microbitCompassHeading()
- microbitPitch()
- microbitRoll()
- microbitSoundLevel()
- microbitAcceleration("x")
- microbitMagneticForce("absolute")
- microbitAnalogValue("0")
- microbitPinEventValue("0", "PULSE_LOW")
- microbitDataLabeled("label-01")

軸を指定するかわりに、引数なしの別名も使えます。

- microbitAccelerationX() microbitAccelerationY() microbitAccelerationZ() microbitAccelerationAbsolute()
- microbitMagneticForceX() microbitMagneticForceY() microbitMagneticForceZ() microbitMagneticForceAbsolute()

### ピンとサーボ

- microbitSetPullMode("0", "UP");
- microbitSetDigitalOut("0", "true");
- microbitSetAnalogOut("0", 512);
- microbitSetServo("0", 90);
- microbitListenPinEventType("0", "ON_EDGE");

### データ送受信（micro:bitが2台必要）

- microbitSendData("label-01", "こんにちは");

## 出力を設定する4つは Set が付きます

ブロックの表示名は「サーボ」「デジタル出力」ですが、関数名には Set が入ります。省略しないでください。

| 書いてはいけない名前 | 正しい名前 |
| --- | --- |
| microbitServo | microbitSetServo |
| microbitDigitalOut | microbitSetDigitalOut |
| microbitAnalogOut | microbitSetAnalogOut |
| microbitPullMode | microbitSetPullMode |

Sb3-Changerは左の名前でも変換できますが、警告が出ます。最初から右の名前で書いてください。

## よくある書き間違い

- microbitTiltAngle は存在しません。前後は microbitPitch()、左右は microbitRoll()
- microbitAcceleration("X") は大文字なのでエラーです。"x" と書きます
- microbitDisplayMatrix のパターンは0と1をちょうど25個並べます
- whenMicrobitPinEvent を使う前に microbitListenPinEventType でイベントの種類を設定します
- ## 無いブロックは作らない

ブロック一覧に無い機能を求められたら、名前を推測して書いてはいけません。
メニューの選択肢も、一覧にある値以外は使ってはいけません。

無い場合は次の順で答えます。
1. 「Microbit More に〇〇のブロックはありません」と伝える
2. ふつうのブロックの組み合わせで作れるなら、その方法でコードを書く
3. 組み合わせでも作れないなら、作れないと伝えて終わる

例: 「A+Bボタンが押されたとき」
→ A+B のハットブロックはありません。ボタンの選択肢は A と B だけです。
   かわりに「ずっと」の中で、Aが押されている かつ Bが押されている を調べます。
   押しっぱなしで何度も反応しないよう、直前の状態を変数で覚えておきます。
