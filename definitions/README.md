# ブロック対応台帳

`definitions/*.json`を、拡張ブロックの保存形と対応状態の一次情報にします。形式は`schema.json`で固定します。

各ブロックは次を持ちます。

- `functionName`: StretchScriptで公開する関数名
- `extensionId` / `opcode` / `blockType`
- `inputs` / `fields` / `menuValues` / `shadow`
- `fixture`: 実物`.sb3`と、その中のブロックを特定するselector
- `fixtureStatus`: 実物保存形を検証できたか
- `supportStatus`: sb3-changerが生成できるか
- `deviceVerificationStatus`: カメラ、マイク、実機などで実行確認できたか
- `officialSource`: 参照した公式リポジトリ、コミット、ソースパス

状態を混同しないことが重要です。実物fixtureがあっても生成処理が未実装なら`supportStatus`は`unsupported`、生成できても実機未確認なら`deviceVerificationStatus`は`not-run`のままにします。

`fixtureStatus: external-only`は、過去の実測記録はあるものの元の`.sb3`バイナリをCIで再検証できない状態です。この場合は`fixture`を`null`にし、再取得できるまで`verified`へ上げません。

古いXcratchプロジェクトには`extensionURLs`が保存されていない場合があります。その事実を公式fixtureとして残す場合は`extensionURLStatus: legacy-missing`を付けます。現在の生成処理では、台帳の`extensionURL`を新しい`.sb3`へ必ず追加します。
