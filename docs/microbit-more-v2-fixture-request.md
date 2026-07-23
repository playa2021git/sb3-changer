# Microbit More V2 追加fixture採取依頼

## 目的

`microbitPitch()`、`microbitSoundLevel()`、`microbitSetServo()`は公式 `getInfo()` に存在しますが、公式リポジトリには保存形を確認できる `.sb3` がありません。

推測で実装せず、Stretch3で手作業した実物 `.sb3` をfixtureとして採取します。実機を接続して動かす前でも、ブロックを配置して保存すれば保存形の確認に使えます。

## 作るファイル

ファイル名:

```text
microbit-more-v2-pitch-sound-servo.sb3
```

## Stretch3で配置するブロック

Microbit More拡張を追加し、次の3種類が入るようにします。

### 1. ピッチ

緑の旗を押したとき、ずっと、スプライトがMicrobit Moreの「ピッチ」の値を言うスクリプトを作ります。

```text
緑の旗が押されたとき
  ずっと
    （ピッチ）と言う
```

### 2. 音の大きさ

別のスプライト、または離れた別スクリプトとして、Microbit Moreの「音の大きさ」の値を言うスクリプトを作ります。

```text
スペースキーが押されたとき
  ずっと
    （音の大きさ）と言う
```

### 3. サーボ

P0を選び、角度0度・90度・180度の3ブロックを置きます。実機を動かす必要はありません。

```text
1キーが押されたとき
  ピン P0 をサーボ 0 度にする

2キーが押されたとき
  ピン P0 をサーボ 90 度にする

3キーが押されたとき
  ピン P0 をサーボ 180 度にする
```

## 保存と提出

1. Stretch3の「ファイル」からコンピューターへ保存する。
2. ファイル名を `microbit-more-v2-pitch-sound-servo.sb3` にする。
3. 保存後の `.sb3` をChatGPTへ添付する。
4. スクリーンショットやPDFではなく、必ず元の `.sb3` ファイルを添付する。

## fixture受領後の処理

1. `project.json`を抽出する。
2. ブロックIDと座標を除外してグラフを正規化する。
3. opcode、inputs、fields、menu値、shadow形式を台帳へ記録する。
4. StretchScript関数を実装する。
5. 生成結果と提供fixtureの構造をCIで比較する。
6. micro:bit V2で実機確認後、`stable`へ昇格する。
