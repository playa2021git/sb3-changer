# Sb3-Changer 出力例集

この文書は、生徒の日本語の注文に対して、どんな形で答えるかの見本です。
出力例はコードブロック記号で囲んでいません。答えるときも、この形のプレーンテキストだけを出してください。

---

## 例1 ペンで四角を描く

入力: 旗を押したら四角を描いてほしい

出力:
whenGreenFlagClicked(() => {
  penClear();
  penDown();
  repeat(4, () => {
    move(100);
    turnRight(90);
  });
  penUp();
});

---

## 例2 矢印キーでキャラクターを動かす

入力: 矢印キーでネコを上下左右に動かしたい

出力:
whenGreenFlagClicked(() => {
  goToXY(0, 0);
  setSize(60);
  forever(() => {
    ifBlock(keyPressed("left arrow"), () => {
      changeX(-6);
    });
    ifBlock(keyPressed("right arrow"), () => {
      changeX(6);
    });
    ifBlock(keyPressed("up arrow"), () => {
      changeY(6);
    });
    ifBlock(keyPressed("down arrow"), () => {
      changeY(-6);
    });
  });
});

---

## 例3 micro:bitを傾けて動かす

入力: micro:bitをハンドルみたいに左右に傾けて動かしたい

出力:
whenGreenFlagClicked(() => {
  goToXY(0, -120);
  setSize(30);
  forever(() => {
    ifBlock(lessThan(microbitRoll(), -15), () => {
      changeX(-6);
    });
    ifBlock(greaterThan(microbitRoll(), 15), () => {
      changeX(6);
    });
  });
});

---

## 例4 micro:bitのボタンと音（実機テスト向け）

入力: micro:bitのAボタンとBボタンがちゃんと反応するか確かめたい

出力:
whenMicrobitButtonPressed("A", () => {
  microbitDisplayText("A", 120);
  microbitPlayTone(440, 100);
  say("Aボタンがおされた", 2);
});

whenMicrobitButtonPressed("B", () => {
  microbitDisplayMatrix("0101011111111110111000100");
  say("Bボタンがおされた", 2);
});

whenMicrobitShaken(() => {
  say("ふった", 2);
});

---

## 例5 クローンで弾を撃つ

入力: 左右に動く自機からスペースキーで弾を撃ちたい

出力:
whenGreenFlagClicked(() => {
  goToXY(0, -140);
  setSize(25);
  show();
  forever(() => {
    ifBlock(keyPressed("left arrow"), () => {
      changeX(-6);
    });
    ifBlock(keyPressed("right arrow"), () => {
      changeX(6);
    });
  });
});

whenKeyPressed("space", () => {
  createClone("_myself_");
});

whenIStartAsClone(() => {
  setSize(12);
  repeatUntil(greaterThan(yPosition(), 170), () => {
    changeY(12);
  });
  deleteThisClone();
});

---

## 例6 変数を使った計算クイズ

入力: たし算のクイズを3問出して点数をつけたい

出力:
whenGreenFlagClicked(() => {
  setVariable("点数", 0);
  showVariable("点数");
  repeat(3, () => {
    setVariable("ひだり", random(1, 9));
    setVariable("みぎ", random(1, 9));
    askAndWait(join(join(getVariable("ひだり"), " たす "), getVariable("みぎ")));
    ifElse(equals(answer(), add(getVariable("ひだり"), getVariable("みぎ"))), () => {
      say("せいかい", 1);
      changeVariable("点数", 1);
    }, () => {
      say("ざんねん", 1);
    });
  });
  say(join("てんすうは ", getVariable("点数")), 3);
});

---

## 例7 複数スプライトのじゃんけん

入力: グー、チョキ、パーをクリックしてコンピュータとじゃんけんしたい

出力:
sprite("グー", () => {
  setSpriteText("グー");
  setSpriteColor("#e05a3c");
  setSpritePosition(-120, -70);
  setSpriteSize(30);

  whenThisSpriteClicked(() => {
    setVariable("あなたの手", "グー");
    broadcast("しょうぶ");
  });
});

sprite("チョキ", () => {
  setSpriteText("チョキ");
  setSpriteColor("#2f7fd0");
  setSpritePosition(0, -70);
  setSpriteSize(30);

  whenThisSpriteClicked(() => {
    setVariable("あなたの手", "チョキ");
    broadcast("しょうぶ");
  });
});

sprite("パー", () => {
  setSpriteText("パー");
  setSpriteColor("#3fa05a");
  setSpritePosition(120, -70);
  setSpriteSize(30);

  whenThisSpriteClicked(() => {
    setVariable("あなたの手", "パー");
    broadcast("しょうぶ");
  });
});

sprite("しんぱん", () => {
  setSpriteText("しんぱん");
  setSpriteColor("#444444");
  setSpritePosition(0, 90);
  setSpriteSize(30);

  whenGreenFlagClicked(() => {
    setVariable("あなたの手", "");
    say("すきな手をクリックしてね", 3);
  });

  whenIReceive("しょうぶ", () => {
    setVariable("さいころ", random(1, 3));
    ifBlock(equals(getVariable("さいころ"), 1), () => {
      setVariable("あいての手", "グー");
    });
    ifBlock(equals(getVariable("さいころ"), 2), () => {
      setVariable("あいての手", "チョキ");
    });
    ifBlock(equals(getVariable("さいころ"), 3), () => {
      setVariable("あいての手", "パー");
    });
    say(join("あいては ", getVariable("あいての手")), 2);
    ifElse(equals(getVariable("あなたの手"), getVariable("あいての手")), () => {
      say("あいこ", 3);
    }, () => {
      ifElse(or(or(and(equals(getVariable("あなたの手"), "グー"), equals(getVariable("あいての手"), "チョキ")), and(equals(getVariable("あなたの手"), "チョキ"), equals(getVariable("あいての手"), "パー"))), and(equals(getVariable("あなたの手"), "パー"), equals(getVariable("あいての手"), "グー"))), () => {
        say("あなたのかち", 3);
      }, () => {
        say("あなたのまけ", 3);
      });
    });
  });
});

---

## 例8 ML2Scratchで1と2を見分ける

入力: 手で作った1と2の形をカメラで見分けさせたい

出力:
whenGreenFlagClicked(() => {
  mlSetInput("stage");
  mlSetVideo("off");
});

whenKeyPressed("1", () => {
  mlAddExample1();
});

whenKeyPressed("2", () => {
  mlAddExample2();
});

whenKeyPressed("3", () => {
  mlAddExample3();
});

whenMlLabelReceived("1", () => {
  say("1だとおもう", 2);
});

whenMlLabelReceived("2", () => {
  say("2だとおもう", 2);
});

---

## 例9 数字キーで模様を切りかえるペンアート

入力: 1から4のキーで模様を切りかえて、ペンで幾何学模様を描きたい

出力:
whenGreenFlagClicked(() => {
  hide();
  setVariable("もよう", 1);
  broadcast("えがく");
});

whenKeyPressed("1", () => {
  setVariable("もよう", 1);
  broadcast("えがく");
});

whenKeyPressed("2", () => {
  setVariable("もよう", 2);
  broadcast("えがく");
});

whenKeyPressed("3", () => {
  setVariable("もよう", 3);
  broadcast("えがく");
});

whenKeyPressed("4", () => {
  setVariable("もよう", 4);
  broadcast("えがく");
});

whenIReceive("えがく", () => {
  penClear();
  penUp();
  goToXY(0, 0);
  pointInDirection(90);
  ifBlock(equals(getVariable("もよう"), 1), () => {
    setVariable("おおきさ", 10);
    repeat(36, () => {
      penDown();
      repeat(4, () => {
        move(getVariable("おおきさ"));
        turnRight(90);
      });
      penUp();
      turnRight(10);
      changeVariable("おおきさ", 4);
    });
  });
  ifBlock(equals(getVariable("もよう"), 2), () => {
    setVariable("おおきさ", 20);
    repeat(36, () => {
      penDown();
      repeat(3, () => {
        move(getVariable("おおきさ"));
        turnRight(120);
      });
      penUp();
      turnRight(10);
      changeVariable("おおきさ", 3);
    });
  });
  ifBlock(equals(getVariable("もよう"), 3), () => {
    setVariable("おおきさ", 10);
    repeat(60, () => {
      penDown();
      move(getVariable("おおきさ"));
      turnRight(91);
      penUp();
      changeVariable("おおきさ", 3);
    });
  });
  ifBlock(equals(getVariable("もよう"), 4), () => {
    setVariable("はんけい", 10);
    repeat(24, () => {
      penDown();
      repeat(36, () => {
        move(getVariable("はんけい"));
        turnRight(10);
      });
      penUp();
      turnRight(15);
      changeVariable("はんけい", 0.5);
    });
  });
});

この例で押さえること

- let は使わず setVariable で作る
- size = add(size, 4) は changeVariable("おおきさ", 4) に直す
- 自作ブロック（functionBlock）は使わず、broadcast と whenIReceive に分ける
- setDirection ではなく pointInDirection を使う
- ペンで描くだけのスプライトなので、旗が押された直後に hide() する

---

## 例10 交差点の信号機シミュレータ

入力: 簡単な交差点自動車信号機シミュレータを作って。上下方向と左右方向で

出力:
sprite("上下ラベル", () => {
  setSpriteText("上下");
  setSpriteColor("#333333");
  setSpritePosition(-80, 150);
  setSpriteSize(25);
});

sprite("左右ラベル", () => {
  setSpriteText("左右");
  setSpriteColor("#333333");
  setSpritePosition(80, 150);
  setSpriteSize(25);
});

sprite("上下赤", () => {
  setSpriteText("赤");
  setSpriteColor("#ff0000");
  setSpritePosition(-80, 100);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    hide();
  });

  whenIReceive("こうしん", () => {
    ifElse(or(equals(getVariable("だんかい"), 3), equals(getVariable("だんかい"), 4)), () => {
      show();
    }, () => {
      hide();
    });
  });
});

sprite("上下黄", () => {
  setSpriteText("黄");
  setSpriteColor("#ffc000");
  setSpritePosition(-80, 60);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    hide();
  });

  whenIReceive("こうしん", () => {
    ifElse(equals(getVariable("だんかい"), 2), () => {
      show();
    }, () => {
      hide();
    });
  });
});

sprite("上下青", () => {
  setSpriteText("青");
  setSpriteColor("#00b050");
  setSpritePosition(-80, 20);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    hide();
  });

  whenIReceive("こうしん", () => {
    ifElse(equals(getVariable("だんかい"), 1), () => {
      show();
    }, () => {
      hide();
    });
  });
});

sprite("左右赤", () => {
  setSpriteText("赤");
  setSpriteColor("#ff0000");
  setSpritePosition(80, 100);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    hide();
  });

  whenIReceive("こうしん", () => {
    ifElse(or(equals(getVariable("だんかい"), 1), equals(getVariable("だんかい"), 2)), () => {
      show();
    }, () => {
      hide();
    });
  });
});

sprite("左右黄", () => {
  setSpriteText("黄");
  setSpriteColor("#ffc000");
  setSpritePosition(80, 60);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    hide();
  });

  whenIReceive("こうしん", () => {
    ifElse(equals(getVariable("だんかい"), 4), () => {
      show();
    }, () => {
      hide();
    });
  });
});

sprite("左右青", () => {
  setSpriteText("青");
  setSpriteColor("#00b050");
  setSpritePosition(80, 20);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    hide();
  });

  whenIReceive("こうしん", () => {
    ifElse(equals(getVariable("だんかい"), 3), () => {
      show();
    }, () => {
      hide();
    });
  });
});

sprite("制御", () => {
  setSpriteText("せいぎょ");
  setSpriteColor("#888888");
  setSpritePosition(0, -150);
  setSpriteSize(20);

  whenGreenFlagClicked(() => {
    hide();
    forever(() => {
      setVariable("だんかい", 1);
      broadcast("こうしん");
      wait(5);
      setVariable("だんかい", 2);
      broadcast("こうしん");
      wait(2);
      setVariable("だんかい", 3);
      broadcast("こうしん");
      wait(5);
      setVariable("だんかい", 4);
      broadcast("こうしん");
      wait(2);
    });
  });
});

この例で押さえること

- setSpriteText の引数は1つだけ。大きさは setSpriteSize で指定する
- setSpriteText の文字はあとから変えられないので、色ちがいのスプライトを並べて show と hide で切りかえる
- tellSprite のような他スプライト操作の関数は無い。broadcast と whenIReceive を使う
- sprite の { } の直下には setSprite で始まる命令と hat ブロックだけを置き、hide や show は hat の中に書く
- 段階を変数1つで表すと、信号の順番を増やすときに制御スプライトだけ直せばよい

---

## 例11 道路と車が走る交差点シミュレータ

入力: 道路と車も出したい。青なら走って、黄色は交差点の手前なら止まって、赤は止まる

出力:
sprite("道路", () => {
  setSpriteText("道路");
  setSpriteColor("#666666");
  setSpritePosition(0, 0);
  setSpriteSize(18);

  whenGreenFlagClicked(() => {
    hide();
    penClear();
    penUp();
    setPenColor("#9a9a9a");
    setPenSize(60);
    goToXY(-240, 0);
    penDown();
    goToXY(240, 0);
    penUp();
    goToXY(0, -180);
    penDown();
    goToXY(0, 180);
    penUp();
    setPenColor("#ffffff");
    setPenSize(3);
    goToXY(-45, -30);
    penDown();
    goToXY(-45, 0);
    penUp();
    goToXY(0, -45);
    penDown();
    goToXY(30, -45);
    penUp();
  });
});

sprite("制御", () => {
  setSpriteText("せいぎょ");
  setSpriteColor("#888888");
  setSpritePosition(0, -160);
  setSpriteSize(18);

  whenGreenFlagClicked(() => {
    hide();
    setVariable("上下の色", "赤");
    setVariable("左右の色", "赤");
    wait(1);
    forever(() => {
      setVariable("上下の色", "青");
      wait(5);
      setVariable("上下の色", "黄");
      wait(2);
      setVariable("上下の色", "赤");
      wait(2);
      setVariable("左右の色", "青");
      wait(5);
      setVariable("左右の色", "黄");
      wait(2);
      setVariable("左右の色", "赤");
      wait(2);
    });
  });
});

sprite("上下信号", () => {
  setSpriteText("上下");
  setSpriteColor("#ff0000");
  setSpritePosition(-120, 120);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    show();
    forever(() => {
      ifBlock(equals(getVariable("上下の色"), "青"), () => {
        setSpriteColor("#00b050");
      });
      ifBlock(equals(getVariable("上下の色"), "黄"), () => {
        setSpriteColor("#ffc000");
      });
      ifBlock(equals(getVariable("上下の色"), "赤"), () => {
        setSpriteColor("#ff0000");
      });
    });
  });
});

sprite("左右信号", () => {
  setSpriteText("左右");
  setSpriteColor("#ff0000");
  setSpritePosition(120, 120);
  setSpriteSize(25);

  whenGreenFlagClicked(() => {
    show();
    forever(() => {
      ifBlock(equals(getVariable("左右の色"), "青"), () => {
        setSpriteColor("#00b050");
      });
      ifBlock(equals(getVariable("左右の色"), "黄"), () => {
        setSpriteColor("#ffc000");
      });
      ifBlock(equals(getVariable("左右の色"), "赤"), () => {
        setSpriteColor("#ff0000");
      });
    });
  });
});

sprite("左右の車", () => {
  setSpriteText("車");
  setSpriteColor("#0070c0");
  setSpritePosition(-240, -15);
  setSpriteSize(20);

  whenGreenFlagClicked(() => {
    hide();
    forever(() => {
      createClone("_myself_");
      wait(3);
    });
  });

  whenIStartAsClone(() => {
    goToXY(-240, -15);
    show();
    repeatUntil(greaterThan(xPosition(), 235), () => {
      ifBlock(or(equals(getVariable("左右の色"), "青"), greaterThan(xPosition(), -45)), () => {
        changeX(4);
      });
    });
    deleteThisClone();
  });
});

sprite("上下の車", () => {
  setSpriteText("車");
  setSpriteColor("#c00000");
  setSpritePosition(15, -180);
  setSpriteSize(20);

  whenGreenFlagClicked(() => {
    hide();
    wait(1.5);
    forever(() => {
      createClone("_myself_");
      wait(3);
    });
  });

  whenIStartAsClone(() => {
    goToXY(15, -180);
    show();
    repeatUntil(greaterThan(yPosition(), 175), () => {
      ifBlock(or(equals(getVariable("上下の色"), "青"), greaterThan(yPosition(), -45)), () => {
        changeY(4);
      });
    });
    deleteThisClone();
  });
});

この例で押さえること

- 信号の状態は「上下の色」「左右の色」という変数で持つ。制御スプライトが時間で書きかえ、他のスプライトはそれを読むだけにする
- 信号の見た目は、文字スプライトの setSpriteColor をイベントの中で使って切りかえる。色は6けたのカラーコードだけを直接書く
- 車はクローンで増やす。親スプライトは hide() して、クローンだけが走る
- 進んでよい条件は or(信号が青, すでに停止線を越えている) の1つにまとめる。こう書くと、黄と赤のときに停止線の手前なら止まり、交差点に入っていれば通過できる
- 道路はペンで描く。太い線で道路、細い白線で停止線を描き、描き終わったスプライトは hide() する
- クローンごとの変数は使えないので、位置（xPosition、yPosition）で状況を判断する

---

## 例12 2人で遊ぶ卓球ゲーム

入力: 簡単な卓球ゲームを作って

出力:
sprite("パドル1", () => {
  setSpriteText("┃");
  setSpriteColor("#0000ff");
  setSpritePosition(-200, 0);
  setSpriteSize(70);

  whenGreenFlagClicked(() => {
    show();
    goToXY(-200, 0);
    forever(() => {
      ifBlock(and(keyPressed("w"), lessThan(yPosition(), 120)), () => {
        changeY(8);
      });
      ifBlock(and(keyPressed("s"), greaterThan(yPosition(), -120)), () => {
        changeY(-8);
      });
    });
  });
});

sprite("パドル2", () => {
  setSpriteText("┃");
  setSpriteColor("#ff0000");
  setSpritePosition(200, 0);
  setSpriteSize(70);

  whenGreenFlagClicked(() => {
    show();
    goToXY(200, 0);
    forever(() => {
      ifBlock(and(keyPressed("up arrow"), lessThan(yPosition(), 120)), () => {
        changeY(8);
      });
      ifBlock(and(keyPressed("down arrow"), greaterThan(yPosition(), -120)), () => {
        changeY(-8);
      });
    });
  });
});

sprite("ボール", () => {
  setSpriteText("●");
  setSpriteColor("#333333");
  setSpritePosition(0, 0);
  setSpriteSize(20);

  whenGreenFlagClicked(() => {
    show();
    setRotationStyle("don't rotate");
    setVariable("P1得点", 0);
    setVariable("P2得点", 0);
    showVariable("P1得点");
    showVariable("P2得点");
    setVariable("スピード", 0);
    goToXY(0, 0);
    pointInDirection(random(45, 135));
    wait(1);
    setVariable("スピード", 5);
    forever(() => {
      move(getVariable("スピード"));
      ifBlock(greaterThan(yPosition(), 165), () => {
        setY(165);
        pointInDirection(subtract(180, direction()));
      });
      ifBlock(lessThan(yPosition(), -165), () => {
        setY(-165);
        pointInDirection(subtract(180, direction()));
      });
      ifBlock(or(touchingObject("パドル1"), touchingObject("パドル2")), () => {
        pointInDirection(subtract(0, direction()));
        changeVariable("スピード", 0.5);
        move(getVariable("スピード"));
        move(getVariable("スピード"));
      });
      ifBlock(greaterThan(xPosition(), 225), () => {
        changeVariable("P1得点", 1);
        setVariable("スピード", 0);
        goToXY(0, 0);
        pointInDirection(random(-135, -45));
        wait(1);
        setVariable("スピード", 5);
      });
      ifBlock(lessThan(xPosition(), -225), () => {
        changeVariable("P2得点", 1);
        setVariable("スピード", 0);
        goToXY(0, 0);
        pointInDirection(random(45, 135));
        wait(1);
        setVariable("スピード", 5);
      });
    });
  });
});

---

## 例12 2人で遊ぶ卓球ゲーム

入力: 簡単な卓球ゲームを作って

出力:
sprite("パドル1", () => {
  setSpriteText("┃");
  setSpriteColor("#0000ff");
  setSpritePosition(-200, 0);
  setSpriteSize(70);

  whenGreenFlagClicked(() => {
    show();
    goToXY(-200, 0);
    forever(() => {
      ifBlock(and(keyPressed("w"), lessThan(yPosition(), 120)), () => {
        changeY(8);
      });
      ifBlock(and(keyPressed("s"), greaterThan(yPosition(), -120)), () => {
        changeY(-8);
      });
    });
  });
});

sprite("パドル2", () => {
  setSpriteText("┃");
  setSpriteColor("#ff0000");
  setSpritePosition(200, 0);
  setSpriteSize(70);

  whenGreenFlagClicked(() => {
    show();
    goToXY(200, 0);
    forever(() => {
      ifBlock(and(keyPressed("up arrow"), lessThan(yPosition(), 120)), () => {
        changeY(8);
      });
      ifBlock(and(keyPressed("down arrow"), greaterThan(yPosition(), -120)), () => {
        changeY(-8);
      });
    });
  });
});

sprite("ボール", () => {
  setSpriteText("●");
  setSpriteColor("#333333");
  setSpritePosition(0, 0);
  setSpriteSize(20);

  whenGreenFlagClicked(() => {
    show();
    setRotationStyle("don't rotate");
    setVariable("P1得点", 0);
    setVariable("P2得点", 0);
    showVariable("P1得点");
    showVariable("P2得点");
    setVariable("スピード", 0);
    goToXY(0, 0);
    pointInDirection(random(45, 135));
    wait(1);
    setVariable("スピード", 5);
    forever(() => {
      move(getVariable("スピード"));
      ifBlock(greaterThan(yPosition(), 165), () => {
        setY(165);
        pointInDirection(subtract(180, direction()));
      });
      ifBlock(lessThan(yPosition(), -165), () => {
        setY(-165);
        pointInDirection(subtract(180, direction()));
      });
      ifBlock(or(touchingObject("パドル1"), touchingObject("パドル2")), () => {
        pointInDirection(subtract(0, direction()));
        changeVariable("スピード", 0.5);
        move(getVariable("スピード"));
        move(getVariable("スピード"));
      });
      ifBlock(greaterThan(xPosition(), 225), () => {
        changeVariable("P1得点", 1);
        setVariable("スピード", 0);
        goToXY(0, 0);
        pointInDirection(random(-135, -45));
        wait(1);
        setVariable("スピード", 5);
      });
      ifBlock(lessThan(xPosition(), -225), () => {
        changeVariable("P2得点", 1);
        setVariable("スピード", 0);
        goToXY(0, 0);
        pointInDirection(random(45, 135));
        wait(1);
        setVariable("スピード", 5);
      });
    });
  });
});

この例で押さえること

- 乱数は pickRandom ではなく random(45, 135) と書く
- パドルが画面外へ出ないように and(keyPressed("w"), lessThan(yPosition(), 120)) で限界を付ける
- 壁の跳ね返りは、まず setY(165) で壁ぎわに戻してから pointInDirection(subtract(180, direction())) で角度を反転する
- 左右のパドルに当たったときの反転は pointInDirection(subtract(0, direction()))
- 反転したあと move を2回入れて、ボールがパドルに埋まったまま連続反射するのを防ぐ
- 得点したら setVariable("スピード", 0) で一度止め、wait(1) してから出し直す
- 得点は showVariable で画面に出す
