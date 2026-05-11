# Microbit More fixture notes (Mirobitmoretest.sb3 / 揺さぶられたとき音を鳴らす.sb3)

## 解析対象
- fixture名: `Mirobitmoretest.sb3`
- fixture名: `揺さぶられたとき音を鳴らす.sb3`
- 解析元: ユーザー提供 `project.json` 実測値

## extensions
- `[
  "microbitMore"
]`

## ブロック保存形まとめ

| Scratch上の表示 | opcode | fields | inputs | topLevel | parent | next | extensions | 実機動作確認 | 対応状態 |
|---|---|---|---|---|---|---|---|---|---|
| AボタンHat | `microbitMore_whenButtonEvent` | `NAME: ["A", null]`, `EVENT: ["DOWN", null]` | `{}` | `true` | `null` | `microbitMore_displayText` | `microbitMore` | 発火確認済み | **対応済み** (`whenMicrobitButtonPressed`) |
| BボタンHat | `microbitMore_whenButtonEvent` | `NAME: ["B", null]`, `EVENT: ["DOWN", null]` | `{}` | `true` | `null` | `microbitMore_displayMatrix` | `microbitMore` | 発火確認済み | **対応済み** (`whenMicrobitButtonPressed`) |
| 文字表示 | `microbitMore_displayText` | `{}` | `TEXT: [1, [10, "Hello!"]]`, `DELAY: [1, [4, "120"]]` | `false` | (Hat配下) | (実測依存) | `microbitMore` | Aボタン経由で表示確認済み | **対応済み** (`microbitDisplayText`) |
| ゆさぶられたときHat | `microbitMore_whenGesture` | `GESTURE: ["SHAKE", null]` | `{}` | `true` | `null` | `microbitMore_playTone` | `microbitMore` | 実機発火確認済み | **対応済み** (`whenMicrobitShaken`) |
| 音を鳴らす | `microbitMore_playTone` | `{}` | `FREQ: [1, [4, "440"]]`, `VOL: [1, [4, "100"]]` | `false` | (Hat配下) | `microbitMore_stopTone` | `microbitMore` | 実機動作確認済み | **対応済み** (`microbitPlayTone`) |
| 音を止める | `microbitMore_stopTone` | `{}` | `{}` | `false` | (tone配下) | (実測依存) | `microbitMore` | 実機動作確認済み | **対応済み** (`microbitStopTone`) |
| 左傾きHat | `microbitMore_whenGesture` | `GESTURE: ["TILT_LEFT", null]` | `{}` | `true` | `null` | (実測依存) | `microbitMore` | 保存形のみ確認、実機発火未確認 | 未対応（安全停止） |
| 右傾きHat | `microbitMore_whenGesture` | `GESTURE: ["TILT_RIGHT", null]` | `{}` | `true` | `null` | (実測依存) | `microbitMore` | 保存形のみ確認、実機発火未確認 | 未対応（安全停止） |
| パターン表示 | `microbitMore_displayMatrix` | `{}` | `MATRIX: [1, "<block-id参照>"]` | `false` | (Hat配下) | (実測依存) | `microbitMore` | Bボタン経由で表示確認済み | 今回は未対応（最小実装優先） |
| サーボ0度 | `microbitMore_setServo` | `PIN: ["0", null]` | `ANGLE: [1, [4, "0"]]` | `false` | (文脈依存) | (文脈依存) | `microbitMore` | ブロック単体クリックで動作 | 未対応（gesture経由の実用確認未完了） |
| サーボ180度 | `microbitMore_setServo` | `PIN: ["0", null]` | `ANGLE: [1, [4, "180"]]` | `false` | (文脈依存) | (文脈依存) | `microbitMore` | ブロック単体クリックで動作 | 未対応（gesture経由の実用確認未完了） |

## gesture対応方針（値ごと）
- **対応済み**: `SHAKE`（実機発火確認済み）
- **未対応**: `TILT_LEFT` / `TILT_RIGHT`（保存形は確認済みだが実機発火未確認）
- 汎用 `whenMicrobitGesture(gesture, body)` は現時点で `"SHAKE"` のみ許可し、他値は安全停止。

## 実装ポリシー反映
- `whenMicrobitButtonPressed(button, body)` は `button` を `"A"` / `"B"` のみ許可。
- `whenMicrobitShaken(body)` は `GESTURE: "SHAKE"` 固定。
- `microbitPlayTone(freq, volume)` は `volume` 省略時の既定値を `100` に設定。
- `microbitSetServo` / `microbitDisplayMatrix` / 未確認gesture値は `registerUnsupported` または許可値制限で安全停止を維持。
