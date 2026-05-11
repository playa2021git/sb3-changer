# Microbit More implementation plan (safe-first)

## 目的
Microbit More 拡張を sb3-changer に追加する際、未確認情報の推測実装を避け、既存機能を壊さず段階的に有効化する。

## 現在の状態
- `project.json.extensions` に `microbitMore` が入るかどうかは、fixture採取時の確認対象とする。
- 各ブロックの保存形（`opcode` / `inputs` / `fields` / menu内部値 / shadow型 / hat構造）は fixture 未確認。
- そのため、現時点では `registerBlock` せず `registerUnsupported` で安全停止を維持する。

## 未実装理由
- Microbit More は Scratch公式 micro:bit 拡張と別物であり、opcode 互換を前提にできない。
- 実物 `.sb3` から保存形を確認していない段階で `registerBlock` すると、誤変換で project.json を破壊するリスクがある。
- 安全方針により、未確認ブロックを「動くかもしれない」で通さない。

## 実装方針（推測禁止）
以下が揃うまで block 実装を禁止する。

1. 実物 fixture で `extensionId` を確認。
2. 対象ブロックの `opcode` を確認。
3. `inputs` のキー名・配列構造・shadow型を確認。
4. `fields` のキー名・保存値を確認。
5. menu内部値（表示名ではなく内部保存値）を確認。
6. Hat の場合 `topLevel` / `parent` / `next` を確認。
7. `project.json.extensions` へ `microbitMore` が入る条件を確認。

## 次フェーズの実装条件
- A / B / A+B ボタン Hat fixture が最低1セットずつ取得済み。
- fixture の解析結果が docs に明記済み。
- 失敗系（unsupported）テストに加えて、成功系テストを有効化できる状態。
- 1PR で 1〜2 ブロックのみ registerBlock 化し、他は unsupported のまま維持。

## `project.json.extensions` に `microbitMore` が入ることの確認手順
1. Stretch3 または Microbit More 対応環境で新規プロジェクト作成。
2. Microbit More 拡張を追加。
3. 対象ブロック（A/B/A+B ボタン Hat）だけを最小構成で配置。
4. `.sb3` を保存して unzip。
5. `project.json` の `extensions` 配列に `microbitMore` があるか確認。
6. 同時に blocks ツリーで該当ブロックの opcode / inputs / fields / menu値 / topLevel / parent / next を採取。

## 実装時の最小ステップ
1. fixture 解析結果を docs に記録。
2. `blocks/microbitMore.js` の verified 配列へ 1 ブロック分だけ追加。
3. 成功系テストを `test.skip` から有効化。
4. 既存回帰テストを全実行し、他拡張への影響がないことを確認。
