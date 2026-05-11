# Microbit More Button Hat fixture guide

## 目的
Microbit More の Button Hat を推測なしで実装するため、実物 `.sb3` から保存形を採取する。

## 採取対象
- Aボタン
- Bボタン
- A+Bボタン

各対象について、**別々の最小プロジェクト**を作る（混在させない）ことを推奨。

## 事前準備
1. Stretch3 または Microbit More 対応環境を開く。
2. 新規プロジェクトを作成。
3. Microbit More 拡張を追加。
4. スプライトは1体のみ（Sprite1）にする。

## 最小fixtureの作り方（1ボタンごと）
1. 対象ボタンの Hat ブロックを1つだけ置く。
2. Hat の直下に `say` など簡単なスタックブロックを1つ接続する。
3. 変数・リスト・他拡張ブロックは置かない。
4. `.sb3` を保存する。

## 採取時の確認項目
`project.json` から以下を必ず記録する。
- `opcode`
- `inputs`（キー名・配列値）
- `fields`（キー名・保存値）
- menu内部値（表示文字列との対応）
- `topLevel`
- `parent`
- `next`
- `extensions`（`microbitMore` が含まれるか）

## 採取手順（ローカル）
1. `.sb3` を `.zip` にリネームして展開。
2. `project.json` を開く。
3. 対象スプライトの `blocks` から Button Hat ノードを特定。
4. 上記確認項目を docs へ転記。
5. 3種類（A/B/A+B）すべてで同じ形式か差分があるか比較。

## fixture保存先案
- `tests/fixtures/microbit-more/button-hat-a.sb3`
- `tests/fixtures/microbit-more/button-hat-b.sb3`
- `tests/fixtures/microbit-more/button-hat-ab.sb3`
- 解析メモ: `docs/microbit-more-fixture-notes.md`

## 実装ゲート
以下を満たすまで `registerBlock` を禁止し、`registerUnsupported` を維持する。
- A/B/A+B の fixture が揃っている。
- opcode / inputs / fields / menu値 が確定している。
- Hat の `topLevel / parent / next` 構造を確認済み。
- テストに成功系・失敗系の両方を用意できる。
