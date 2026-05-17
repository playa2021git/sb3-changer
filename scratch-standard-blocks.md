# Scratch標準ブロック対応表

この表は、StretchScriptコンパイラが推測せずに `.sb3` へ出力してよいScratch標準ブロックを管理するためのものです。
対応状況が「未対応」または「要確認」のブロックは、変換器が `.sb3` に入れてはいけません。

参考にした一次情報:
- Scratch VM procedures: https://github.com/scratchfoundation/scratch-vm/blob/develop/src/blocks/scratch3_procedures.js
- Scratch VM sb3 serialization: https://github.com/scratchfoundation/scratch-vm/blob/develop/src/serialization/sb3.js

## Issue 2照合サマリー

2026-05-17時点の `blocks/coreBlocks.js` を `blocks/blockRegistry.js` に読み込ませ、登録済み定義と安全停止定義を `scratch-standard-blocks.md` と照合しました。今回は差分調査だけで、変換実装は変更していません。

| 区分 | 件数 | 照合結果 | 備考 |
|---|---:|---|---|
| `coreBlocks.js` で対応済み登録されている関数 | 130 | すべて本表に記載あり | aliasを含む。例: `gt` / `greaterThan`, `lt` / `lessThan`, `ask` / `askAndWait` |
| `coreBlocks.js` で安全停止登録されている関数 | 5 | すべて本表に記載あり | `defineProcedure`, `callProcedure`, `argumentStringNumber`, `argumentBoolean`, `showVariableSlider` |
| 本表にあるが `coreBlocks.js` の標準ブロック定義ではないもの | 6 | 要確認として分離 | `sprite`, `setSpritePosition`, `setSpriteSize`, `setSpriteDirection`, `setSpriteText`, `setSpriteColor` は `script.js` 側の複数スプライトMVPメタ構文 |
| `script.js` 側で互換変換しているもの | 2 | 対応済みだが実装場所に注意 | `goTo(x, y)` は `goToXY` へ変換、`addToList(listName, value)` は引数順を正規化 |
| 状況列の記載ずれ | 7 | 修正済み | `random`, `lessThan`, `letterOf`, `lengthOf`, `contains`, `mod`, `round` の状況列を `対応済み` に統一 |

### ステータス定義

| 状況 | 意味 | `.sb3`生成 |
|---|---|---|
| 対応済み | `coreBlocks.js` に登録済みで、変換器が生成してよいブロック | 可 |
| 未対応（安全停止） | `registerUnsupported` で明示的に停止するブロック | 不可 |
| 要確認 | 標準ブロック表に関連情報はあるが、`coreBlocks.js` の対応済み定義としては扱えないもの | 不可 |

### `coreBlocks.js` 登録数

| カテゴリ | 対応済み登録数 |
|---|---:|
| イベント | 6 |
| メッセージ | 3 |
| 動き | 18 |
| 見た目 | 17 |
| コスチューム | 3 |
| 背景 | 3 |
| 音 | 9 |
| 制御 | 11 |
| クローン | 4 |
| 調べる | 19 |
| 演算 | 20 |
| 変数 | 6 |
| リスト | 11 |

### 要確認・標準外として分離する項目

| 項目 | 現在の扱い | 理由 | 次に必要な確認 |
|---|---|---|---|
| 複数スプライトMVPの `sprite(...)` 系 | 要確認 / 標準外 | Scratch標準ブロックではなく、`coreBlocks.js` ではなく `script.js` 側のproject.json生成メタ構文 | 標準ブロック対応表から別ドキュメントへ移すか、標準外として維持するか決める |
| `goTo(x, y)` | 対応済み / 実装場所注意 | `coreBlocks.js` には `goToXY` があり、`script.js` の `resolveCallVariant` が `goTo` 2引数を `goToXY` へ寄せる | 仕様表では「互換構文」と明記し続ける |
| `addToList(listName, value)` | 対応済み / 実装場所注意 | `coreBlocks.js` の定義は `addToList(value, listName)`、`script.js` がリスト名を推定して正規化する | 仕様表では「互換構文」と明記し続ける |
| `say(text)` / `think(text)` | 対応済み / 任意引数 | `coreBlocks.js` の `customOpcodeByArgs` で秒数なしの場合に `looks_say` / `looks_think` へ切り替える | 表では `sayNow` / `thinkNow` と混同しないよう注意 |

## Shadow Block形式の凡例

| 型 | project.json入力例 |
|---|---|
| 数値 | `["INPUT": [1, [4, "10"]]]` |
| 正の整数 | `["INPUT": [1, [6, "10"]]]` |
| リスト番号 | `["INDEX": [1, [7, "1"]]]`、`last`などは `[10, "last"]` |
| 文字列 | `["INPUT": [1, [10, "text"]]]` |
| 色 | `["COLOR": [1, [9, "#ff0000"]]]` |
| 真偽 | `["CONDITION": [2, "<boolean block id>"]]` |
| メニュー入力 | `["MENU": [1, "<menu shadow block id>"]]` |
| メッセージ入力 | `["BROADCAST_INPUT": [1, "<event_broadcast_menu block id>"]]` |
| SUBSTACK | `["SUBSTACK": [2, "<first child block id>"]]` |

## イベント

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 緑の旗が押されたとき | `whenGreenFlagClicked(() => {})` | `event_whenflagclicked` | `SUBSTACK` | なし | hat | 対応済み | 回帰全般 |
| キーが押されたとき | `whenKeyPressed(key, () => {})` | `event_whenkeypressed` | `SUBSTACK` | `KEY_OPTION` | hat | 対応済み | 標準構造 |
| このスプライトが押されたとき | `whenSpriteClicked(() => {})` | `event_whenthisspriteclicked` | `SUBSTACK` | なし | hat | 対応済み | 構造検証 |
| このスプライトが押されたとき | `whenThisSpriteClicked(() => {})` | `event_whenthisspriteclicked` | `SUBSTACK` | なし | hat | 対応済み | 複数スプライトMVP |
| 背景が変わったとき | `whenBackdropSwitchesTo(backdrop, () => {})` | `event_whenbackdropswitchesto` | `SUBSTACK` | `BACKDROP` | hat | 対応済み | 構造検証 |
| 音量/タイマーが指定値より大きいとき | `whenGreaterThan(sensor, value, () => {})` | `event_whengreaterthan` | `VALUE` | `WHENGREATERTHANMENU` | hat | 対応済み | 構造検証 |

## メッセージ

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| メッセージを受け取ったとき | `whenIReceive(message, () => {})` | `event_whenbroadcastreceived` | `SUBSTACK` | `BROADCAST_OPTION` | hat | 対応済み | 優先A |
| メッセージを送る | `broadcast(message)` | `event_broadcast` | `BROADCAST_INPUT` | なし | command | 対応済み | 優先A |
| メッセージを送って待つ | `broadcastAndWait(message)` | `event_broadcastandwait` | `BROADCAST_INPUT` | なし | command | 対応済み | 優先A |

保存形式: `targets[0].broadcasts` は `{ "broadcast_id": "メッセージ名" }` にする。メニュー影ブロックは `event_broadcast_menu`。

## 動き

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 10歩動かす | `move(steps)` | `motion_movesteps` | `STEPS` | なし | command | 対応済み | Pen回帰 |
| 右に回す | `turnRight(degrees)` | `motion_turnright` | `DEGREES` | なし | command | 対応済み | Pen回帰 |
| 左に回す | `turnLeft(degrees)` | `motion_turnleft` | `DEGREES` | なし | command | 対応済み | 構造検証 |
| どこかの場所へ行く | `goTo(target)` | `motion_goto` | `TO` menu shadow | なし | command | 対応済み | goTo target |
| x/y座標へ行く | `goTo(x, y)` / `goToXY(x, y)` | `motion_gotoxy` | `X`, `Y` | なし | command | 対応済み | goTo式 |
| 秒でどこかへ行く | `glideTo(seconds, target)` | `motion_glideto` | `SECS`, `TO` menu shadow | なし | command | 対応済み | 構造検証 |
| 秒でx/y座標へ行く | `glideToXY(seconds, x, y)` | `motion_glidesecstoxy` | `SECS`, `X`, `Y` | なし | command | 対応済み | 構造検証 |
| 向きを指定する | `pointInDirection(direction)` | `motion_pointindirection` | `DIRECTION` | なし | command | 対応済み | 優先B |
| 対象へ向ける | `pointTowards(target)` | `motion_pointtowards` | `TOWARDS` menu shadow | なし | command | 対応済み | 構造検証 |
| x座標を変える | `changeX(amount)` | `motion_changexby` | `DX` | なし | command | 対応済み | 構造検証 |
| x座標を指定する | `setX(x)` | `motion_setx` | `X` | なし | command | 対応済み | 優先B |
| y座標を変える | `changeY(amount)` | `motion_changeyby` | `DY` | なし | command | 対応済み | 優先B |
| y座標を指定する | `setY(y)` | `motion_sety` | `Y` | なし | command | 対応済み | 構造検証 |
| 端に着いたら跳ね返る | `ifOnEdgeBounce()` | `motion_ifonedgebounce` | なし | なし | command | 対応済み | Pen回帰外 |
| 回転方法を指定する | `setRotationStyle(style)` | `motion_setrotationstyle` | なし | `STYLE` | command | 対応済み | 構造検証 |
| x座標 | `xPosition()` | `motion_xposition` | なし | なし | reporter | 対応済み | 構造検証 |
| y座標 | `yPosition()` | `motion_yposition` | なし | なし | reporter | 対応済み | 構造検証 |
| 向き | `direction()` | `motion_direction` | なし | なし | reporter | 対応済み | 構造検証 |

## 見た目・コスチューム・背景

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 秒数つきで言う | `say(text, seconds)` | `looks_sayforsecs` | `MESSAGE`, `SECS` | なし | command | 対応済み | 回帰全般 |
| 言う | `sayNow(text)` | `looks_say` | `MESSAGE` | なし | command | 対応済み | 優先A/B |
| 秒数つきで考える | `think(text, seconds)` | `looks_thinkforsecs` | `MESSAGE`, `SECS` | なし | command | 対応済み | 構造検証 |
| 考える | `thinkNow(text)` | `looks_think` | `MESSAGE` | なし | command | 対応済み | 構造検証 |
| 表示する | `show()` | `looks_show` | なし | なし | command | 対応済み | 構造検証 |
| 隠す | `hide()` | `looks_hide` | なし | なし | command | 対応済み | 構造検証 |
| コスチュームを変える | `switchCostume(name)` | `looks_switchcostumeto` | `COSTUME` menu shadow | なし | command | 対応済み | 優先B |
| 次のコスチューム | `nextCostume()` | `looks_nextcostume` | なし | なし | command | 対応済み | 優先B |
| 背景を変える | `switchBackdrop(name)` | `looks_switchbackdropto` | `BACKDROP` menu shadow | なし | command | 対応済み | 優先B |
| 次の背景 | `nextBackdrop()` | `looks_nextbackdrop` | なし | なし | command | 対応済み | 優先B |
| 大きさを変える | `changeSize(delta)` | `looks_changesizeby` | `CHANGE` | なし | command | 対応済み | 優先B |
| 大きさを指定する | `setSize(percent)` | `looks_setsizeto` | `SIZE` | なし | command | 対応済み | 優先B |
| 画像効果を変える | `changeEffect(effect, value)` | `looks_changeeffectby` | `CHANGE` | `EFFECT` | command | 対応済み | 構造検証 |
| 画像効果を指定する | `setEffect(effect, value)` | `looks_seteffectto` | `VALUE` | `EFFECT` | command | 対応済み | 構造検証 |
| 画像効果を消す | `clearGraphicEffects()` | `looks_cleargraphiceffects` | なし | なし | command | 対応済み | 構造検証 |
| 最前面/最背面へ移動 | `goToFront(frontBack)` | `looks_gotofrontback` | なし | `FRONT_BACK` | command | 対応済み | 構造検証 |
| 最前面へ移動 | `goToFrontLayer()` | `looks_gotofrontback` | なし | `FRONT_BACK=front` | command | 対応済み | 優先B |
| 最背面へ移動 | `goToBackLayer()` | `looks_gotofrontback` | なし | `FRONT_BACK=back` | command | 対応済み | 優先B |
| 前/後ろへ層移動 | `goForwardLayers(layers)` / `goForwardLayers(direction, layers)` | `looks_goforwardbackwardlayers` | `NUM` | `FORWARD_BACKWARD` | command | 対応済み | 優先B |
| 後ろへ層移動 | `goBackwardLayers(layers)` | `looks_goforwardbackwardlayers` | `NUM` | `FORWARD_BACKWARD=backward` | command | 対応済み | 優先B |
| コスチューム番号/名前 | `costumeNumber(numberName?)` | `looks_costumenumbername` | なし | `NUMBER_NAME` | reporter | 対応済み | 構造検証 |
| 背景番号/名前 | `backdropNumber(numberName?)` | `looks_backdropnumbername` | なし | `NUMBER_NAME` | reporter | 対応済み | 構造検証 |
| 大きさ | `size()` | `looks_size` | なし | なし | reporter | 対応済み | 構造検証 |

## 音

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 終わるまで音を鳴らす | `playSoundUntilDone(soundName)` | `sound_playuntildone` | `SOUND_MENU` menu shadow | なし | command | 対応済み | 構造検証 |
| 音を鳴らす | `startSound(soundName)` | `sound_play` | `SOUND_MENU` menu shadow | なし | command | 対応済み | 構造検証 |
| すべての音を止める | `stopAllSounds()` | `sound_stopallsounds` | なし | なし | command | 対応済み | 構造検証 |
| 音の効果を変える | `changeSoundEffect(effect, amount)` | `sound_changeeffectby` | `VALUE` | `EFFECT` | command | 対応済み | 構造検証 |
| 音の効果を指定する | `setSoundEffect(effect, value)` | `sound_seteffectto` | `VALUE` | `EFFECT` | command | 対応済み | 構造検証 |
| 音の効果を消す | `clearSoundEffects()` | `sound_cleareffects` | なし | なし | command | 対応済み | 構造検証 |
| 音量を変える | `changeVolume(delta)` | `sound_changevolumeby` | `VOLUME` | なし | command | 対応済み | 構造検証 |
| 音量を指定する | `setVolume(value)` | `sound_setvolumeto` | `VOLUME` | なし | command | 対応済み | 構造検証 |
| 音量 | `volume()` | `sound_volume` | なし | なし | reporter | 対応済み | 構造検証 |

## 制御・クローン

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 秒待つ | `wait(seconds)` | `control_wait` | `DURATION` | なし | command | 対応済み | 構造検証 |
| 回繰り返す | `repeat(times, () => {})` | `control_repeat` | `TIMES`, `SUBSTACK` | なし | C型 | 対応済み | Pen/リスト/宝くじ回帰 |
| ずっと | `forever(() => {})` | `control_forever` | `SUBSTACK` | なし | C型/cap型 | 対応済み | サンプル回帰 |
| もし | `ifThen(condition, () => {})` / `ifBlock(condition, () => {})` | `control_if` | `CONDITION`, `SUBSTACK` | なし | C型 | 対応済み | 優先A |
| もし/でなければ | `ifElse(condition, () => {}, () => {})` | `control_if_else` | `CONDITION`, `SUBSTACK`, `SUBSTACK2` | なし | C型 | 対応済み | 宝くじD/優先A |
| まで待つ | `waitUntil(condition)` | `control_wait_until` | `CONDITION` | なし | command | 対応済み | 優先A |
| まで繰り返す | `repeatUntil(condition, () => {})` | `control_repeat_until` | `CONDITION`, `SUBSTACK` | なし | C型 | 対応済み | 構造検証 |
| すべてを止める | `stopAll()` | `control_stop` | なし | `STOP_OPTION=all` | cap型 | 対応済み | 構造検証 |
| このスクリプトを止める | `stopThisScript()` | `control_stop` | なし | `STOP_OPTION=this script` | cap型 | 対応済み | 構造検証 |
| 他のスクリプトを止める | `stopOtherScripts()` | `control_stop` | なし | `STOP_OPTION=other scripts in sprite` | command | 対応済み | 優先A |
| クローンされたとき | `whenIStartAsClone(() => {})` / `whenCloned(() => {})` | `control_start_as_clone` | `SUBSTACK` | なし | hat | 対応済み | 優先A |
| クローンを作る | `createClone(target)` | `control_create_clone_of` | `CLONE_OPTION` menu shadow | なし | command | 対応済み | 優先A |
| このクローンを削除 | `deleteThisClone()` | `control_delete_this_clone` | なし | なし | cap型 | 対応済み | 優先A |

## 調べる

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 触れた | `touchingObject(object)` | `sensing_touchingobject` | `TOUCHINGOBJECTMENU` menu shadow | なし | boolean | 対応済み | 優先B |
| 色に触れた | `touchingColor(color)` | `sensing_touchingcolor` | `COLOR` | なし | boolean | 対応済み | 構造検証 |
| 色が色に触れた | `colorTouchingColor(color1, color2)` | `sensing_coloristouchingcolor` | `COLOR`, `COLOR2` | なし | boolean | 対応済み | 優先B |
| 距離 | `distanceTo(target)` | `sensing_distanceto` | `DISTANCETOMENU` menu shadow | なし | reporter | 対応済み | 優先B |
| 質問して待つ | `ask(question)` / `askAndWait(question)` | `sensing_askandwait` | `QUESTION` | なし | command | 対応済み | 構造検証 |
| 答え | `answer()` | `sensing_answer` | なし | なし | reporter | 対応済み | 優先A |
| キーが押された | `keyPressed(key)` | `sensing_keypressed` | `KEY_OPTION` menu shadow | なし | boolean | 対応済み | 優先A |
| マウスが押された | `mouseDown()` | `sensing_mousedown` | なし | なし | boolean | 対応済み | 構造検証 |
| マウスのx座標 | `mouseX()` | `sensing_mousex` | なし | なし | reporter | 対応済み | 構造検証 |
| マウスのy座標 | `mouseY()` | `sensing_mousey` | なし | なし | reporter | 対応済み | 構造検証 |
| ドラッグ可否 | `setDragMode(mode)` | `sensing_setdragmode` | なし | `DRAG_MODE` | command | 対応済み | 構造検証 |
| 音量 | `loudness()` | `sensing_loudness` | なし | なし | reporter | 対応済み | 構造検証 |
| タイマー | `timer()` | `sensing_timer` | なし | なし | reporter | 対応済み | 構造検証 |
| タイマーをリセット | `resetTimer()` | `sensing_resettimer` | なし | なし | command | 対応済み | 構造検証 |
| 他のスプライト/ステージの値 | `of(property, object)` | `sensing_of` | `OBJECT` menu shadow | `PROPERTY` | reporter | 対応済み | 構造検証 |
| 現在の年/月/日など | `current(menu)` | `sensing_current` | なし | `CURRENTMENU` | reporter | 対応済み | 優先B |
| 2000年からの日数 | `daysSince2000()` | `sensing_dayssince2000` | なし | なし | reporter | 対応済み | 構造検証 |
| ユーザー名 | `username()` | `sensing_username` | なし | なし | reporter | 対応済み | 優先B |

## 演算

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 足し算 | `add(a, b)` | `operator_add` | `NUM1`, `NUM2` | なし | reporter | 対応済み | 構造検証 |
| 引き算 | `subtract(a, b)` | `operator_subtract` | `NUM1`, `NUM2` | なし | reporter | 対応済み | 構造検証 |
| 掛け算 | `multiply(a, b)` | `operator_multiply` | `NUM1`, `NUM2` | なし | reporter | 対応済み | 構造検証 |
| 割り算 | `divide(a, b)` | `operator_divide` | `NUM1`, `NUM2` | なし | reporter | 対応済み | 構造検証 |
| 乱数 | `random(from, to)` | `operator_random` | `FROM`, `TO` | なし | reporter | 対応済み | リスト回帰 |
| より大きい | `greaterThan(a, b)` / `gt(a, b)` | `operator_gt` | `OPERAND1`, `OPERAND2` | なし | boolean | 対応済み | 構造検証 |
| より小さい | `lessThan(a, b)` / `lt(a, b)` | `operator_lt` | `OPERAND1`, `OPERAND2` | なし | boolean | 対応済み | 宝くじD |
| 等しい | `equals(a, b)` | `operator_equals` | `OPERAND1`, `OPERAND2` | なし | boolean | 対応済み | 優先A |
| かつ | `and(a, b)` | `operator_and` | `OPERAND1`, `OPERAND2` | なし | boolean | 対応済み | 構造検証 |
| または | `or(a, b)` | `operator_or` | `OPERAND1`, `OPERAND2` | なし | boolean | 対応済み | 構造検証 |
| ではない | `not(a)` | `operator_not` | `OPERAND` | なし | boolean | 対応済み | 構造検証 |
| つなげる | `join(a, b)` | `operator_join` | `STRING1`, `STRING2` | なし | reporter | リスト回帰 |
| 文字目 | `letterOf(index, text)` | `operator_letter_of` | `LETTER`, `STRING` | なし | reporter | 対応済み | 構造検証 |
| 長さ | `lengthOf(text)` | `operator_length` | `STRING` | なし | reporter | 対応済み | 構造検証 |
| 含む | `contains(text, keyword)` | `operator_contains` | `STRING1`, `STRING2` | なし | boolean | 対応済み | 構造検証 |
| 余り | `mod(a, b)` | `operator_mod` | `NUM1`, `NUM2` | なし | reporter | 対応済み | 構造検証 |
| 四捨五入 | `round(value)` | `operator_round` | `NUM` | なし | reporter | 対応済み | 構造検証 |
| 数学関数 | `mathOp(operator, value)` | `operator_mathop` | `NUM` | `OPERATOR` | reporter | 対応済み | 構造検証 |

## 変数

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| 変数を指定する | `setVariable(name, value)` | `data_setvariableto` | `VALUE` | `VARIABLE` | command | 対応済み | 宝くじB/C/D |
| 変数を変える | `changeVariable(name, value)` | `data_changevariableby` | `VALUE` | `VARIABLE` | command | 対応済み | 宝くじD |
| 変数を表示 | `showVariable(name)` | `data_showvariable` | なし | `VARIABLE` | command | 対応済み | 構造検証 |
| 変数を隠す | `hideVariable(name)` | `data_hidevariable` | なし | `VARIABLE` | command | 対応済み | 構造検証 |
| 変数の値 | `getVariable(name)` / `variable(name)` | `data_variable` | なし | `VARIABLE` | reporter | 対応済み | 宝くじB/C/D |
| 変数スライダー表示 | `showVariableSlider(name, min, max, value)` | monitors保存形式 | 要確認 | 要確認 | monitor | 未対応（安全停止） | 安全停止 |

保存形式: 変数はSprite targetの `variables` に `{ "var_id": ["変数名", 0] }` として登録する。

## リスト

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| リストへ追加 | `addToList(value, listName)` / `addToList(listName, value)` | `data_addtolist` | `ITEM` | `LIST` | command | 対応済み | リスト回帰 |
| リストから削除 | `deleteOfList(index, listName)` | `data_deleteoflist` | `INDEX` | `LIST` | command | 対応済み | 宝くじC/D |
| リストをすべて削除 | `deleteAllOfList(listName)` | `data_deletealloflist` | なし | `LIST` | command | 対応済み | リスト回帰 |
| リストへ挿入 | `insertAtList(index, value, listName)` | `data_insertatlist` | `INDEX`, `ITEM` | `LIST` | command | 対応済み | 構造検証 |
| リスト項目を置き換え | `replaceItemOfList(index, value, listName)` | `data_replaceitemoflist` | `INDEX`, `ITEM` | `LIST` | command | 対応済み | 構造検証 |
| リストの項目 | `itemOfList(index, listName)` | `data_itemoflist` | `INDEX` | `LIST` | reporter | 対応済み | 宝くじB/C/D |
| リスト内の番号 | `itemNumOfList(value, listName)` | `data_itemnumoflist` | `ITEM` | `LIST` | reporter | 対応済み | 構造検証 |
| リストの長さ | `lengthOfList(listName)` | `data_lengthoflist` | なし | `LIST` | reporter | 対応済み | リスト回帰 |
| リストに含まれる | `listContains(listName, value)` | `data_listcontainsitem` | `ITEM` | `LIST` | boolean | 対応済み | 構造検証 |
| リストを表示 | `showList(listName)` | `data_showlist` | なし | `LIST` | command | 対応済み | 構造検証 |
| リストを隠す | `hideList(listName)` | `data_hidelist` | なし | `LIST` | command | 対応済み | 構造検証 |

保存形式: リストはSprite targetの `lists` に `{ "list_id": ["リスト名", []] }` として登録する。

## 独自ブロック

| Scratch表示名 | StretchScript関数名 | opcode | inputs | fields | blockType | 状況 | テスト |
|---|---|---|---|---|---|---|---|
| ブロック定義 | `defineProcedure(...)` | `procedures_definition` | `custom_block` | なし | hat相当 | 未対応（安全停止） | 安全停止 |
| 独自ブロック呼び出し | `callProcedure(...)` | `procedures_call` | 引数に依存 | なし | command/reporterなし | 未対応（安全停止） | 安全停止 |
| 文字列/数値引数 | `argumentStringNumber(...)` | `argument_reporter_string_number` | なし | `VALUE` | reporter | 未対応（安全停止） | 安全停止 |
| 真偽引数 | `argumentBoolean(...)` | `argument_reporter_boolean` | なし | `VALUE` | boolean | 未対応（安全停止） | 安全停止 |

独自ブロックは `procedures_definition`、`procedures_prototype`、`procedures_call`、mutation内の `proccode` / `argumentids` / `argumentnames` / `argumentdefaults` を実物 `.sb3` で確認してから実装する。

## 複数スプライトMVP

| 役割 | StretchScript関数名 | project.jsonへの反映 | blockType | 状況 | テスト |
|---|---|---|---|---|---|
| Sprite target作成 | `sprite(name, () => {})` | `targets` にSprite targetを追加 | meta | 要確認 / 標準外 | 複数スプライト最小 |
| 初期座標 | `setSpritePosition(x, y)` | target直下の `x` / `y` | meta | 要確認 / 標準外 | 複数スプライト最小 |
| 初期サイズ | `setSpriteSize(size)` | target直下の `size` | meta | 要確認 / 標準外 | 構造検証 |
| 初期向き | `setSpriteDirection(direction)` | target直下の `direction` | meta | 要確認 / 標準外 | 構造検証 |
| 簡易SVG文字 | `setSpriteText(text)` | 自動生成SVG costume | meta | 要確認 / 標準外 | MD5整合性検証 |
| 簡易SVG色 | `setSpriteColor(color)` | 自動生成SVG costume | meta | 要確認 / 標準外 | 色形式検証 |

MVPでは変数・リスト・ブロードキャストは共有扱いにする。スプライトローカル変数、外部画像costume、高度な同期はまだ実装しない。

## 未対応または注意が必要な項目

- 変数・リストのモニター表示位置はまだ生成しない。`showVariable` / `showList` ブロック自体は生成する。
- `showVariableSlider` は `monitors` 保存形式を実物 `.sb3` で確認するまで生成しない。
- 独自ブロックは安全停止する。
- 複数スプライトはMVP対応済み。ただしスプライトローカル変数や高度なUI生成は未対応。
- Scratch標準拡張は `pen` / `music` / `translate` / `text2speech` の確認済み定義だけ変換する。
- Stretch3独自拡張はGitHub実装ソースと実物 `.sb3` で確認できるまで変換しない。
