# 複数スプライト対応 設計メモ

この文書は複数スプライト対応のMVP仕様と、今後の拡張方針をまとめるものです。
現在の実装は「複数スプライトを作る」「各スプライトが自分のスクリプトを持つ」「Stretch3で読めるtarget/costume構造にする」ことを優先しています。

## 現在の状態

```yaml
status: mvp_implemented
compiler:
  existing_single_sprite: preserved
  multi_sprite_targets: supported
  local_variables_per_sprite: unsupported
  advanced_game_ui_generation: unsupported
safety_policy:
  - 既存の1スプライトコードは従来通りSprite1に入れる
  - sprite()がある場合はtargetsに各Sprite targetを追加する
  - 同名スプライトは安全停止
  - costumeのassetId/md5ext/ZIPファイル名を検証する
```

## Scratch 3.0 project.jsonの基本構造

```yaml
project:
  targets:
    - Stage target
    - Sprite target 1
    - Sprite target 2
    - ...
  monitors: []
  extensions: []
  meta:
    semver: "3.0.0"
```

## Stage target

Stage targetは必ず `targets[0]` に置きます。
複数スプライトMVPでは、変数・リスト・メッセージは共有データとしてStage targetに集約します。

```yaml
stage:
  isStage: true
  name: Stage
  variables: shared variables
  lists: shared lists
  broadcasts:
    broadcast_id: "メッセージ名"
  blocks: {}
  comments: {}
  currentCostume: 0
  costumes:
    - backdrop
  sounds: []
```

## Sprite target

各スプライトは `targets[1]` 以降に追加します。

```yaml
sprite:
  isStage: false
  name: "グー"
  variables: {}
  lists: {}
  broadcasts: {}
  blocks: sprite scripts
  comments: {}
  currentCostume: 0
  costumes:
    - generated svg costume
  sounds: []
  volume: 100
  visible: true
  x: 0
  y: 0
  size: 100
  direction: 90
  draggable: false
  rotationStyle: "all around"
```

## 対応済み構文

```js
sprite("Aさん", () => {
  setSpritePosition(-100, 0);
  setSpriteSize(100);
  setSpriteDirection(90);
  setSpriteText("A");
  setSpriteColor("#ff0000");

  whenGreenFlagClicked(() => {
    say("Aさん", 2);
  });
});
```

```yaml
supported_meta_commands:
  setSpritePosition:
    effect: target.x / target.y
    block_generated: false
  setSpriteSize:
    effect: target.size
    block_generated: false
  setSpriteDirection:
    effect: target.direction
    block_generated: false
  setSpriteText:
    effect: generated SVG text
    block_generated: false
  setSpriteColor:
    effect: generated SVG fill color
    block_generated: false
```

## 対応済みイベント

```yaml
events:
  whenGreenFlagClicked:
    opcode: event_whenflagclicked
    target: current sprite target
  whenIReceive:
    opcode: event_whenbroadcastreceived
    target: current sprite target
  whenThisSpriteClicked:
    opcode: event_whenthisspriteclicked
    target: current sprite target
```

## broadcast() / whenIReceive()

メッセージは全targetで共有します。

```yaml
broadcast:
  opcode: event_broadcast
  input: BROADCAST_INPUT
  menu_shadow: event_broadcast_menu
whenIReceive:
  opcode: event_whenbroadcastreceived
  field: BROADCAST_OPTION
stage_broadcasts:
  broadcast_id: "メッセージ名"
```

## スプライトごとのcostume

各スプライトには `setSpriteText()` と `setSpriteColor()` を使った簡易SVG costumeを自動生成します。

```yaml
costume_requirements:
  assetId: SVG内容のMD5
  md5ext: "{assetId}.svg"
  dataFormat: svg
  rotationCenterX: number
  rotationCenterY: number
  zip_file: md5extと完全一致
```

## じゃんけんクリック式UIの将来設計

```yaml
sprites:
  - グー
  - チョキ
  - パー
workflow:
  1: 各スプライトを横に並べる
  2: クリックされたスプライトがプレイヤーの手を変数に入れる
  3: broadcast("判定") を送る
  4: 判定用スクリプトがCPの手を乱数で決める
  5: ifBlock / ifElse / and / equals で勝敗を判定する
  6: 結果表示スプライトまたは各スプライトがsay()で結果を表示する
```

## まだ実装しないこと

- スプライトごとのローカル変数
- コスチューム画像の読み込みや複数costume管理
- スプライトごとの音声素材管理
- 複雑な同期やゲームUI自動生成
- 独自ブロック
- 未確認外部拡張

## 次の実装順

1. `broadcast()` / `whenIReceive()` を使った複数スプライトの回帰サンプルを追加する。
2. `whenThisSpriteClicked()` でじゃんけん最小UIを作る回帰テストを追加する。
3. スプライトごとのcostume名や表示文字の仕様をGemini向けにさらに厳密化する。
4. ローカル変数を扱う場合は、Scratch/Stretch3の実物 `.sb3` を解析して保存形式を確認してから実装する。
