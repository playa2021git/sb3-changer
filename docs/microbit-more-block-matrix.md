# Microbit More block matrix (stable / experimental / unsupported)

この表は **project.json 保存形** と **実機確認状態** を分離して、授業利用可否を判断するための台帳です。

## 判定基準
- **stable**: 保存形確認済み + 実機確認済み。授業利用可。
- **experimental**: 保存形確認済みだが実機確認が不十分/環境依存。変換は将来候補、授業前の再確認必須。
- **unsupported**: 保存形未確認、または授業利用に不向き。`registerUnsupported` で停止。

## 全ブロック棚卸し（現時点）

| カテゴリ | Scratch上の表示 | StretchScript関数名 | opcode | blockType | fields | inputs | menu値 | extensions | 対応状態 | 実機確認状態 | テスト有無 | 備考 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| button event | A/Bボタン押下 | `whenMicrobitButtonPressed(button, body)` | `microbitMore_whenButtonEvent` | hat | `EVENT:["DOWN",null]`,`NAME:[A/B,null]` | `{}` | `NAME=A/B` | `microbitMore` | **stable** | A/B発火確認済み | あり | A/Bのみ許可 |
| button event | 互換エイリアス | `ifMicrobitButtonPressed(button, body)` | `microbitMore_whenButtonEvent` | hat | 同上 | `{}` | 同上 | `microbitMore` | **stable** | A/B発火確認済み | あり | 推奨は `whenMicrobitButtonPressed` |
| display | 文字表示 | `microbitDisplayText(text, delay)` | `microbitMore_displayText` | stack | `{}` | `TEXT`,`DELAY` | - | `microbitMore` | **stable** | 実機表示確認済み | あり | delay既定値120 |
| gesture event | ゆさぶられたとき | `whenMicrobitShaken(body)` | `microbitMore_whenGesture` | hat | `GESTURE:["SHAKE",null]` | `{}` | `GESTURE=SHAKE` | `microbitMore` | **stable** | 発火確認済み | あり | SHAKE固定 |
| gesture event | 汎用gesture | `whenMicrobitGesture(gesture, body)` | `microbitMore_whenGesture` | hat | `GESTURE:[value,null]` | `{}` | 現在は `SHAKE` のみ許可 | `microbitMore` | **stable(限定)** | SHAKEのみ実機確認 | あり | `TILT_*` は停止 |
| tone | 音を鳴らす | `microbitPlayTone(freq, volume)` | `microbitMore_playTone` | stack | `{}` | `FREQ`,`VOL` | - | `microbitMore` | **stable** | 440Hz動作確認済み | あり | volume既定値100 |
| tone | 音を止める | `microbitStopTone()` | `microbitMore_stopTone` | stack | `{}` | `{}` | - | `microbitMore` | **stable** | 動作確認済み | あり | tone停止 |
| gesture event | 左傾き | `whenMicrobitGesture("TILT_LEFT", body)` | `microbitMore_whenGesture` | hat | `GESTURE:["TILT_LEFT",null]` | `{}` | `TILT_LEFT` | `microbitMore` | **unsupported** | 保存形確認のみ、発火未確認 | あり(失敗系) | 授業利用不可 |
| gesture event | 右傾き | `whenMicrobitGesture("TILT_RIGHT", body)` | `microbitMore_whenGesture` | hat | `GESTURE:["TILT_RIGHT",null]` | `{}` | `TILT_RIGHT` | `microbitMore` | **unsupported** | 保存形確認のみ、発火未確認 | あり(失敗系) | 授業利用不可 |
| display | パターン表示 | `microbitDisplayMatrix(pattern)` | `microbitMore_displayMatrix` | stack | `{}` | `MATRIX` | pattern依存 | `microbitMore` | **experimental候補** | 表示確認はあるが最小実装未着手 | なし | 次フェーズ候補 |
| servo | サーボ角度設定 | `microbitSetServo(pin, angle)` | `microbitMore_setServo` | stack | `PIN` | `ANGLE` | pin値未整理 | `microbitMore` | **experimental候補** | 単体動作は確認、授業運用未確認 | あり(失敗系) | gesture連動未確認 |
| pin I/O | ピン入出力系 | 未定 | 未整理 | reporter/stack | 未整理 | 未整理 | 未整理 | `microbitMore` | **unsupported** | 未確認 | なし | fixture待ち |
| sensors | センサー値取得系 | 未定 | 未整理 | reporter | 未整理 | 未整理 | 未整理 | `microbitMore` | **unsupported** | 未確認 | なし | fixture待ち |
| BLE/connection | 接続依存系 | 未定 | 未整理 | stack/hat | 未整理 | 未整理 | 未整理 | `microbitMore` | **unsupported** | 環境依存強い | なし | 授業前検証必須 |

## 授業で使わせてよい範囲（現時点）
- `whenMicrobitButtonPressed` / `ifMicrobitButtonPressed`
- `microbitDisplayText`
- `whenMicrobitShaken`
- `microbitPlayTone`
- `microbitStopTone`

上記以外は授業利用前に fixture + 実機再確認を行う。
