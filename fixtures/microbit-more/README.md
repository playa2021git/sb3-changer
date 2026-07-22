# Microbit More fixtures

対象は`microbit-more/mbit-more-v2`の`stretch3`ブランチ、固定コミット`28167dabf63de93809278e965e8e36507b0ee4db`です。

## 公式fixture

| リポジトリ内の元パス | 保存ファイル | 現行ブロックの主なカバー範囲 |
|---|---|---|
| `examples/basic/connection.sb3` | `official-connection.sb3` | connection、button event、display matrix |
| `examples/basic/light_level.sb3` | `official-light-level.sb3` | light level |
| `examples/basic/platforme-game-controller.sb3` | `official-platform-game-controller.sb3` | roll |
| `examples/sensor/hc_sr04.sb3` | `official-hc-sr04.sb3` | pull mode、digital out、pin event |

取得元commit、Git blob SHA、SHA-256は`definitions/microbit-more.json`に記録しています。

## カバー状況

- `verified`: 10ブロック。上記の公式`.sb3`で保存形を再現検証できます。
- `external-only`: 5ブロック。過去のユーザー提供fixtureと実機確認記録はありますが、元の`.sb3`バイナリがリポジトリにありません。
- `missing`: 16ブロック。固定コミット内に実物fixtureが見つかっていません。

fixtureが不足する21ブロックには推測した`.sb3`を関連付けません。台帳の`fixture`は`null`のままにします。

## 既知の不整合

`official-hc-sr04.sb3`には`microbitMore_getPinEventTimestamp`が含まれますが、このopcodeは固定した現行`getInfo()`の31ブロックには存在しません。旧版由来のlegacy opcodeとしてfixtureメタデータに記録し、現行ブロックとしては登録しません。

保存形の確認と実機確認は別です。公式サンプルにブロックが存在しても、この監査でmicro:bit実機を再実行したことにはなりません。
