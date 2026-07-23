# Microbit More V2 実機試験 第1便

対象は `microbitDisplayMatrix`、`microbitLightLevel`、`microbitRoll`、`whenMicrobitConnectionChanged` の4ブロックです。

これらは公式 `.sb3` fixtureとの保存形比較に合格しています。`microbitRoll`は2026-07-23にmicro:bit V2で変換・Stretch3読込・連続値表示の実機確認に合格しました。明るさと接続変化は引き続き実機確認待ちです。

## 試験前の準備

1. micro:bit V2を使用する。
2. この試験ではサーボを使用しない。予期しない動作と切り分けを避けるため、サーボの信号線・電源線・GND線をすべて外す。
3. Sb3-Changerで、下記のコードを1本ずつ変換する。
4. 生成した `.sb3` をStretch3で開き、Microbit Moreを接続する。
5. OS、ブラウザ、Stretch3のURL、接続結果を記録する。

## 試験1：5×5 LED模様

```js
whenGreenFlagClicked(() => {
  microbitDisplayMatrix("0101011111111110111000100");
});
```

期待結果：緑の旗を押すと、micro:bitのLEDにハート型の模様が表示される。

確認項目：

- `.sb3`をエラーなく読み込める。
- 5×5の模様が崩れず表示される。
- 3回実行して3回とも同じ表示になる。

## 試験2：明るさ

```js
whenGreenFlagClicked(() => {
  forever(() => {
    sayNow(join("明るさ: ", microbitLightLevel()));
    wait(0.5);
  });
});
```

期待結果：スプライトの吹き出しに数値が表示される。micro:bitを明るい場所へ向けた場合と覆った場合で値が変化する。

値の範囲や大小関係は実機結果を記録し、事前に決めつけない。

## 試験3：左右の傾き（roll）

```js
whenGreenFlagClicked(() => {
  forever(() => {
    sayNow(join("roll: ", microbitRoll()));
    wait(0.2);
  });
});
```

期待結果：micro:bitを水平、左傾斜、右傾斜にしたとき、表示される値が変化する。

左・水平・右それぞれの実測値を記録する。正負の向きは実測結果で判定する。

## 試験4：接続状態の変化

```js
whenMicrobitConnectionChanged("connected", () => {
  sayNow("micro:bit 接続");
});

whenMicrobitConnectionChanged("disconnected", () => {
  sayNow("micro:bit 切断");
});
```

期待結果：Microbit Moreの接続時に「micro:bit 接続」、切断時に「micro:bit 切断」と表示される。

確認順序：

1. プロジェクトを開く。
2. micro:bitを接続する。
3. 接続表示を確認する。
4. Microbit Moreの通常の切断操作を行う。
5. 切断表示を確認する。
6. 再接続して、もう一度接続表示を確認する。

USBケーブルを無理に抜き差しせず、通常の接続・切断操作を優先する。

## 報告書式

```text
試験日:
micro:bit: V2
OS:
ブラウザとバージョン:
Stretch3のURL:

LED模様: 3回中__回成功
実際の表示:

明るさ: 3回中__回成功
明るい場所の値:
覆ったときの値:

roll: 3回中__回成功
水平:
左傾斜:
右傾斜:

接続表示: 3回中__回成功
切断表示: 3回中__回成功
再接続表示: 3回中__回成功

エラー全文:
その他の気付いた点:
```

## 判定

- 変換成功だけでは実機合格にしない。
- Stretch3での読込、接続、期待動作、3回の再現性を確認する。
- 実機報告を確認後、`definitions/microbit-more.json` の `deviceVerificationStatus` と `supportStatus` を更新する。
- サーボP0、内蔵マイク、ロゴタッチは次便以降に分離して試験する。
