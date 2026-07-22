# Fixture運用

`fixtures/`には、公式拡張機能リポジトリから取得した実物の`.sb3`と、その`project.json`を正規化したブロックグラフを置きます。

- `.sb3`は`definitions/*.json`に取得元リポジトリ、固定コミット、元パス、Git blob SHA、SHA-256を記録します。
- `graph.json`はブロックID、`x`/`y`座標、`parent`参照を除外します。接続関係は`next`と`inputs`から再構成します。
- opcode、inputs、fields、shadow、メニューshadow、スタックの接続順は比較対象です。
- snapshotを更新するときは`npm run fixtures:update`を実行し、必ず元の`.sb3`と公式コミットも確認します。
- 実物fixtureがない拡張機能には`.sb3`を推測で追加せず、各ディレクトリのREADMEに不足条件を残します。

fixtureの存在は、sb3-changerがそのブロックを生成できるという意味ではありません。対応状態は`definitions/*.json`の`supportStatus`、実機確認は`deviceVerificationStatus`で別々に管理します。
