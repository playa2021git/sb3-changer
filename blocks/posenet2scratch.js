/*
 * Posenet2Scratchは、公式サンプル .sb3 で保存形を確認できた3ブロックだけを有効化します。
 *
 * 根拠にした実物ファイル:
 *   champierre/posenet2scratch  commit 94f396d749010353bc7254af0be92a2e0ef52559
 *   projects/glasses.sb3        sha256 0b683dd6e4a09d061234ba4b665801dd2c36723d1e9962a8915b8c4a877e2e5e
 *
 * このfixtureで確認できたこと:
 *   - opcodeは posenet2scratch_getX / posenet2scratch_getY / posenet2scratch_getPeopleCount
 *   - getX / getY は PERSON_NUMBER と PART を「fieldではなくmenu shadowブロック」として持つ
 *   - shadowのopcodeは posenet2scratch_menu_personNumbers / posenet2scratch_menu_parts
 *   - shadowのfield名は personNumbers / parts
 *   - PARTの値は文字列の数字。fixtureには "0"(鼻) "1"(左目) "2"(右目) が実在する
 *   - getPeopleCount は inputs も fields も空
 *
 * まだ実物で確認できていないこと（今後の宿題）:
 *   - PERSON_NUMBER にプルダウンの値だけを入れた形。fixtureでは変数ブロックが差し込まれていた
 *   - PARTの "3"〜"16"。公式getInfo()の固定列挙にはあるが、fixtureには出てこない
 *   - 人数の枠へ変数や値ブロックを入れる書き方（menuInputは今は文字と数字だけ受け取ります）
 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "champierre/posenet2scratch commit 94f396d + 公式 projects/glasses.sb3 fixture";
  const extensionURL = "https://champierre.github.io/posenet2scratch/posenet2scratch.mjs";

  /* [Scratch内部名, 日本語ラベル, PARTに入る値] の順です。値は公式getInfo()のPARTS_MENUと同じ並びです。 */
  const PARTS = [
    ["Nose", "鼻", "0"],
    ["LeftEye", "左目", "1"],
    ["RightEye", "右目", "2"],
    ["LeftEar", "左耳", "3"],
    ["RightEar", "右耳", "4"],
    ["LeftShoulder", "左肩", "5"],
    ["RightShoulder", "右肩", "6"],
    ["LeftElbow", "左ひじ", "7"],
    ["RightElbow", "右ひじ", "8"],
    ["LeftWrist", "左手首", "9"],
    ["RightWrist", "右手首", "10"],
    ["LeftHip", "左腰", "11"],
    ["RightHip", "右腰", "12"],
    ["LeftKnee", "左ひざ", "13"],
    ["RightKnee", "右ひざ", "14"],
    ["LeftAnkle", "左足首", "15"],
    ["RightAnkle", "右足首", "16"]
  ];

  const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

  /* PARTに入れる値の一覧です。"0"〜"16" だけを受け付けます。 */
  const PART_VALUES = PARTS.map(([, , value]) => value);

  /*
   * 生徒とGemが「鼻」「nose」と書いても通るように、体の部分名を値へ寄せます。
   * 変換結果の .sb3 に入るのは、いつも公式の値（"0" など）だけです。
   */
  const PART_ALIASES = {};
  PARTS.forEach(([internalName, japaneseLabel, value]) => {
    PART_ALIASES[japaneseLabel] = value;
    PART_ALIASES[internalName] = value;
    PART_ALIASES[lowerFirst(internalName)] = value;
    PART_ALIASES[value] = value;
  });

  /* 何人目かは公式メニューと同じ1〜10だけにします。 */
  const PERSON_VALUES = Array.from({ length: 10 }, (_, index) => String(index + 1));

  const PERSON_ARG = {
    name: "personNumber",
    scratchName: "PERSON_NUMBER",
    type: "menuInput",
    role: "input",
    defaultValue: "1",
    allowedValues: PERSON_VALUES,
    menuOpcode: "posenet2scratch_menu_personNumbers",
    menuField: "personNumbers"
  };

  const PART_ARG = {
    name: "part",
    scratchName: "PART",
    type: "menuInput",
    role: "input",
    defaultValue: "0",
    allowedValues: PART_VALUES,
    valueAliases: PART_ALIASES,
    menuOpcode: "posenet2scratch_menu_parts",
    menuField: "parts"
  };

  const common = {
    extensionId: "posenet2scratch",
    extensionURL,
    extensionNote: window.StretchScriptExtensionNotes.posenet2scratch,
    category: "Posenet2Scratch",
    blockType: "reporter",
    source
  };

  R.registerMany([
    {
      ...common,
      functionName: "poseX",
      opcode: "posenet2scratch_getX",
      arguments: [{ ...PERSON_ARG }, { ...PART_ARG }],
      sample: 'poseX(1, "鼻")',
      description: "何人目の、体のどの部分の、x座標かを返す。カメラに映っていないときは空になる。"
    },
    {
      ...common,
      functionName: "poseY",
      opcode: "posenet2scratch_getY",
      arguments: [{ ...PERSON_ARG }, { ...PART_ARG }],
      sample: 'poseY(1, "鼻")',
      description: "何人目の、体のどの部分の、y座標かを返す。カメラに映っていないときは空になる。"
    },
    {
      ...common,
      functionName: "posePeopleCount",
      opcode: "posenet2scratch_getPeopleCount",
      arguments: [],
      sample: "posePeopleCount()",
      description: "カメラに映っている人数を返す。誰も映っていなければ0になる。"
    }
  ]);

  /* Gemが書きがちな言い換えを、正式名へ寄せます。 */
  R.registerAliases({
    poseCount: "posePeopleCount",
    peopleCount: "posePeopleCount",
    posePersonCount: "posePeopleCount",
    poseGetX: "poseX",
    poseGetY: "poseY"
  });

  /*
   * 部分ごとの専用ブロック（鼻のx座標だけを返す古い形）は、実物fixtureにある物もありますが、
   * 授業で使う入口を1つに保つため、poseX / poseY へ案内して安全停止します。
   */
  PARTS.forEach(([internalName, japaneseLabel]) => {
    ["X", "Y"].forEach((axis) => {
      R.registerUnsupported({
        functionName: `pose${internalName}${axis}`,
        opcode: `posenet2scratch_get${internalName}${axis}`,
        category: "Posenet2Scratch",
        source,
        reason: "部分ごとの専用ブロックは、sb3-changerでは入口をposeX / poseYの2つにまとめています。",
        nextStep: `pose${axis}(1, "${japaneseLabel}") と書いてください。`
      });
    });
  });

  /* 映像表示と透明度は、実物 .sb3 での保存形が未確認です。 */
  [
    ["poseSetVideo", "posenet2scratch_videoToggle"],
    ["poseSetVideoTransparency", "posenet2scratch_setVideoTransparency"]
  ].forEach(([functionName, opcode]) => {
    R.registerUnsupported({
      functionName,
      opcode,
      category: "Posenet2Scratch",
      source,
      reason: "公式getInfo()にはありますが、収録fixtureにこのブロックの実物保存形がありません。",
      nextStep: "definitions/posenet2scratch.jsonでfixtureStatusがverifiedになるまで安全停止します。"
    });
  });

  R.registerUnsupported({
    functionName: "poseScore",
    category: "Posenet2Scratch",
    source,
    reason: "固定した公式getInfo()に、確信度を返すブロックは存在しません。",
    nextStep: "映っているかどうかを見たいときは、posePeopleCount() を使ってください。"
  });
})();
