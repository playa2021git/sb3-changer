# Microbit More implementation plan (safe-first)

## 目的
Microbit More 拡張を sb3-changer に追加する際、未確認情報の推測実装を避け、既存機能を壊さず段階的に有効化する。

## 対応状態の定義
- **stable**: 保存形確認済み + 実機確認済み。授業利用可。
- **experimental**: 保存形確認済みだが実機確認が不十分。変換候補だが授業前検証が必要。
- **unsupported**: 保存形未確認、または授業利用に不向き。`registerUnsupported` で停止。

## 現在の stable 実装
- `whenMicrobitButtonPressed(button, body)`
- `ifMicrobitButtonPressed(button, body)`
- `microbitDisplayText(text, delay)`
- `whenMicrobitShaken(body)`
- `microbitPlayTone(freq, volume)`
- `microbitStopTone()`

## 現在の unsupported 維持
- `TILT_LEFT` / `TILT_RIGHT` を含む `SHAKE` 以外のgesture値（保存形は一部あるが実機発火未確認）
- `microbitDisplayMatrix(...)`（MATRIX shadow block保存形未固定）
- `microbitSetServo(...)`（pin許可値と授業運用時の実機再現性が未固定）
- 接続状態、touch、pin I/O、pin event、data通信、センサーreporter系
- 公式 `getInfo()` 上の未検証ブロックは、個別関数名で `registerUnsupported` に登録済み

## experimental 候補（次フェーズ）
- `microbitDisplayMatrix(pattern)`
- `microbitSetServo(pin, angle)`
- `whenMicrobitGesture(gesture, body)` の SHAKE以外
- pin I/O / sensor reporter 系

## 公式getInfo棚卸しメモ

2026-05-17に `microbit-more/mbit-more-v2` の `src/vm/extensions/block/index.js` を確認した。公式getInfoに存在する未検証opcodeは、変換可能として登録せず、対応するStretchScript関数名だけを安全停止登録する。

安全停止登録済みの代表例:

- connection: `whenMicrobitConnectionChanged`
- button/touch: `whenMicrobitButtonEvent`, `microbitButtonPressed`, `whenMicrobitTouchEvent`, `microbitPinTouched`
- display: `microbitDisplayMatrix`, `microbitClearDisplay`
- sensors: `microbitLightLevel`, `microbitTemperature`, `microbitCompassHeading`, `microbitPitch`, `microbitRoll`, `microbitSoundLevel`, `microbitMagneticForce`, `microbitAcceleration`
- pin I/O: `microbitAnalogValue`, `microbitSetPullMode`, `microbitPinHigh`, `microbitSetDigitalOut`, `microbitSetAnalogOut`
- servo: `microbitSetServo`
- pin event: `microbitListenPinEventType`, `whenMicrobitPinEvent`, `microbitPinEventValue`
- data: `whenMicrobitDataReceived`, `microbitDataLabeled`, `microbitSendData`

これにより、AIが未検証Microbit More関数を生成しても、一般的な未登録関数ではなく「Microbit Moreの保存形未確認」として停止する。

## 実装方針（推測禁止）
以下が揃うまで block 実装を禁止する。
1. 実物 fixture で `extensionId` を確認。
2. 対象ブロックの `opcode` を確認。
3. `inputs` のキー名・配列構造・shadow型を確認。
4. `fields` のキー名・保存値を確認。
5. menu内部値（表示名ではなく内部保存値）を確認。
6. Hat の場合 `topLevel` / `parent` / `next` を確認。
7. `project.json.extensions` へ `microbitMore` が入る条件を確認。
8. 実機で同じ動作が再現することを確認。

## `project.json.extensions` に `microbitMore` が入ることの確認手順
1. Stretch3 または Microbit More 対応環境で新規プロジェクト作成。
2. Microbit More 拡張を追加。
3. 対象ブロックだけを最小構成で配置。
4. `.sb3` を保存して unzip。
5. `project.json` の `extensions` 配列に `microbitMore` があるか確認。
6. blocks ツリーで該当ブロックの保存形を採取。

## 次にやる最小作業
1. `microbitDisplayMatrix` の最小fixture追加と保存形固定化。
2. `microbitSetServo` の pin許可値を fixture で固定化。
3. `TILT_LEFT/TILT_RIGHT` の再実機検証（発火条件・環境差の切り分け）。
4. `docs/microbit-more-block-matrix.md` を更新し stable/experimental/unsupported を再判定。
