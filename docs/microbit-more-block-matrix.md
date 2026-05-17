# Microbit More block matrix (stable / experimental / unsupported)

この表は **project.json 保存形** と **実機確認状態** を分離して、授業利用可否を判断するための台帳です。

## 判定基準
- **stable**: 保存形確認済み + 実機確認済み。授業利用可。
- **experimental**: 保存形確認済みだが実機確認が不十分/環境依存。変換は将来候補、授業前の再確認必須。
- **unsupported**: 保存形未確認、または授業利用に不向き。`registerUnsupported` で停止。

## 全ブロック棚卸し（現時点）

2026-05-17に公式実装 `microbit-more/mbit-more-v2` の `src/vm/extensions/block/index.js` の `getInfo()` を確認し、既存fixtureで保存形と実機確認が揃っているもの以外は安全停止に登録した。

| カテゴリ | Scratch上の表示 | StretchScript関数名 | opcode | blockType | fields | inputs | menu値 | extensions | 対応状態 | 実機確認状態 | テスト有無 | 備考 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| button event | A/Bボタン押下 | `whenMicrobitButtonPressed(button, body)` | `microbitMore_whenButtonEvent` | hat | `EVENT:["DOWN",null]`,`NAME:[A/B,null]` | `{}` | `NAME=A/B` | `microbitMore` | **stable** | A/B発火確認済み | あり | A/Bのみ許可 |
| button event | 互換エイリアス | `ifMicrobitButtonPressed(button, body)` | `microbitMore_whenButtonEvent` | hat | 同上 | `{}` | 同上 | `microbitMore` | **stable** | A/B発火確認済み | あり | 推奨は `whenMicrobitButtonPressed` |
| display | 文字表示 | `microbitDisplayText(text, delay)` | `microbitMore_displayText` | stack | `{}` | `TEXT`,`DELAY` | - | `microbitMore` | **stable** | 実機表示確認済み | あり | delay既定値120 |
| gesture event | ゆさぶられたとき | `whenMicrobitShaken(body)` | `microbitMore_whenGesture` | hat | `GESTURE:["SHAKE",null]` | `{}` | `GESTURE=SHAKE` | `microbitMore` | **stable** | 発火確認済み | あり | SHAKE固定 |
| gesture event | 汎用gesture | `whenMicrobitGesture(gesture, body)` | `microbitMore_whenGesture` | hat | `GESTURE:[value,null]` | `{}` | 現在は `SHAKE` のみ許可 | `microbitMore` | **stable(限定)** | SHAKEのみ実機確認 | あり | `TILT_*` は停止 |
| tone | 音を鳴らす | `microbitPlayTone(freq, volume)` | `microbitMore_playTone` | stack | `{}` | `FREQ`,`VOL` | - | `microbitMore` | **stable** | 440Hz動作確認済み | あり | volume既定値100 |
| tone | 音を止める | `microbitStopTone()` | `microbitMore_stopTone` | stack | `{}` | `{}` | - | `microbitMore` | **stable** | 動作確認済み | あり | tone停止 |
| connection | 接続状態が変わったとき | `whenMicrobitConnectionChanged(state, body)` | `microbitMore_whenConnectionChanged` | hat | `STATE`想定 | `{}`想定 | `connected` / `disconnected` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | 接続環境依存 |
| button event | 汎用ボタンイベント | `whenMicrobitButtonEvent(button, event, body)` | `microbitMore_whenButtonEvent` | hat | `NAME`,`EVENT`想定 | `{}`想定 | `A/B`, `DOWN/UP/CLICK` | `microbitMore` | **unsupported** | DOWN以外未確認 | あり(登録) | stable APIはDOWN固定 |
| button reporter | ボタンが押された | `microbitButtonPressed(button)` | `microbitMore_isButtonPressed` | boolean | `NAME`想定 | `{}`想定 | `A/B` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | reporter保存形待ち |
| touch event | ピン/ロゴtouch | `whenMicrobitTouchEvent(name, event, body)` | `microbitMore_whenTouchEvent` | hat | `NAME`,`EVENT`想定 | `{}`想定 | `LOGO/P0/P1/P2`, `DOWN/UP/CLICK` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | touch設定を伴う |
| touch reporter | ピン/ロゴが触られた | `microbitPinTouched(name)` | `microbitMore_isPinTouched` | boolean | `NAME`想定 | `{}`想定 | `LOGO/P0/P1/P2` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | touch設定を伴う |
| gesture event | SHAKE以外のgesture | `whenMicrobitGesture(value, body)` | `microbitMore_whenGesture` | hat | `GESTURE` | `{}` | `TILT_UP/DOWN/LEFT/RIGHT/FACE_UP/FACE_DOWN/FREEFALL/G3/G6/G8` | `microbitMore` | **unsupported** | 未確認または発火未確認 | あり(失敗系) | `SHAKE`のみstable |
| display | パターン表示 | `microbitDisplayMatrix(pattern)` | `microbitMore_displayMatrix` | stack | `{}`想定 | `MATRIX` | pattern依存 | `microbitMore` | **unsupported** | 表示確認メモあり、shadow未固定 | あり(登録) | MATRIX shadow block待ち |
| display | 表示を消す | `microbitClearDisplay()` | `microbitMore_displayClear` | stack | `{}`想定 | `{}`想定 | - | `microbitMore` | **unsupported** | 未確認 | あり(登録) | fixture待ち |
| sensors | 明るさ | `microbitLightLevel()` | `microbitMore_getLightLevel` | reporter | `{}`想定 | `{}`想定 | - | `microbitMore` | **unsupported** | 未確認 | あり(登録) | reporter保存形待ち |
| sensors | 温度 | `microbitTemperature()` | `microbitMore_getTemperature` | reporter | `{}`想定 | `{}`想定 | - | `microbitMore` | **unsupported** | 未確認 | あり(登録) | reporter保存形待ち |
| sensors | 方位 | `microbitCompassHeading()` | `microbitMore_getCompassHeading` | reporter | `{}`想定 | `{}`想定 | - | `microbitMore` | **unsupported** | 未確認 | あり(登録) | 校正動作確認が必要 |
| sensors | ピッチ | `microbitPitch()` | `microbitMore_getPitch` | reporter | `{}`想定 | `{}`想定 | - | `microbitMore` | **unsupported** | 未確認 | あり(登録) | reporter保存形待ち |
| sensors | ロール | `microbitRoll()` | `microbitMore_getRoll` | reporter | `{}`想定 | `{}`想定 | - | `microbitMore` | **unsupported** | 未確認 | あり(登録) | reporter保存形待ち |
| sensors | 音量 | `microbitSoundLevel()` | `microbitMore_getSoundLevel` | reporter | `{}`想定 | `{}`想定 | - | `microbitMore` | **unsupported** | 未確認 | あり(登録) | microphone設定を伴う |
| sensors | 磁力 | `microbitMagneticForce(axis)` | `microbitMore_getMagneticForce` | reporter | `AXIS`想定 | `{}`想定 | `x/y/z/absolute` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | menu field保存形待ち |
| sensors | 加速度 | `microbitAcceleration(axis)` | `microbitMore_getAcceleration` | reporter | `AXIS`想定 | `{}`想定 | `x/y/z/absolute` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | menu field保存形待ち |
| pin I/O | アナログ値 | `microbitAnalogValue(pin)` | `microbitMore_getAnalogValue` | reporter | `PIN`想定 | `{}`想定 | analogIn pins | `microbitMore` | **unsupported** | 未確認 | あり(登録) | pin menu実測待ち |
| pin I/O | プルモード設定 | `microbitSetPullMode(pin, mode)` | `microbitMore_setPullMode` | stack | `PIN`,`MODE`想定 | `{}`想定 | gpio, `NONE/UP/DOWN` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | pin menu実測待ち |
| pin I/O | デジタル入力 | `microbitPinHigh(pin)` | `microbitMore_isPinHigh` | boolean | `PIN`想定 | `{}`想定 | gpio | `microbitMore` | **unsupported** | 未確認 | あり(登録) | pin menu実測待ち |
| pin I/O | デジタル出力 | `microbitSetDigitalOut(pin, level)` | `microbitMore_setDigitalOut` | stack | `PIN`想定 | `LEVEL`想定 | gpio, `false/true` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | LEVEL保存形待ち |
| pin I/O | アナログ/PWM出力 | `microbitSetAnalogOut(pin, level)` | `microbitMore_setAnalogOut` | stack | `PIN`想定 | `LEVEL`想定 | gpio | `microbitMore` | **unsupported** | 未確認 | あり(登録) | pin menu実測待ち |
| servo | サーボ角度設定 | `microbitSetServo(pin, angle)` | `microbitMore_setServo` | stack | `PIN` | `ANGLE` | pin値未整理 | `microbitMore` | **unsupported** | 単体動作メモあり、運用未確認 | あり(失敗系/登録) | pin許可値と授業再現性待ち |
| pin event | pin event監視設定 | `microbitListenPinEventType(pin, eventType)` | `microbitMore_listenPinEventType` | stack | `EVENT_TYPE`,`PIN`想定 | `{}`想定 | `NONE/ON_PULSE/ON_EDGE` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | 実機イベント条件待ち |
| pin event | pin event発生 | `whenMicrobitPinEvent(event, pin, body)` | `microbitMore_whenPinEvent` | hat | `EVENT`,`PIN`想定 | `{}`想定 | `PULSE_LOW/PULSE_HIGH/FALL/RISE` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | 実機イベント条件待ち |
| pin event | pin event値 | `microbitPinEventValue(event, pin)` | `microbitMore_getPinEventValue` | reporter | `EVENT`,`PIN`想定 | `{}`想定 | `PULSE_LOW/PULSE_HIGH/FALL/RISE` | `microbitMore` | **unsupported** | 未確認 | あり(登録) | 値意味のfixture待ち |
| data | データ受信 | `whenMicrobitDataReceived(label, body)` | `microbitMore_whenDataReceived` | hat | `{}`想定 | `LABEL`想定 | - | `microbitMore` | **unsupported** | 通信条件未確認 | あり(登録) | 通信fixture待ち |
| data | ラベル付きデータ | `microbitDataLabeled(label)` | `microbitMore_getDataLabeled` | reporter | `{}`想定 | `LABEL`想定 | - | `microbitMore` | **unsupported** | 通信条件未確認 | あり(登録) | 通信fixture待ち |
| data | データ送信 | `microbitSendData(label, data)` | `microbitMore_sendData` | stack | `{}`想定 | `LABEL`,`DATA`想定 | - | `microbitMore` | **unsupported** | 通信条件未確認 | あり(登録) | 通信fixture待ち |
| compatibility | 傾き角度旧候補 | `microbitTiltAngle(axis)` | `microbitMore_getPitch` / `microbitMore_getRoll` | reporter | 未定 | 未定 | 未定 | `microbitMore` | **unsupported** | 未確認 | あり(登録) | 公式名への割当未定 |

## 授業で使わせてよい範囲（現時点）
- `whenMicrobitButtonPressed` / `ifMicrobitButtonPressed`
- `microbitDisplayText`
- `whenMicrobitShaken`
- `microbitPlayTone`
- `microbitStopTone`

上記以外は授業利用前に fixture + 実機再確認を行う。
