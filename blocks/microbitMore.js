/*
 * Microbit More は fixture で project.json 保存形を確認できたものだけを有効化します。
 * fixtures/microbit-more/all-blocks.sb3 で公式31ブロックの保存形を採取済みです。
 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "definitions/microbit-more.json (公式commit 28167dab + fixtures/microbit-more/all-blocks.sb3)";

  const F = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "menu",
    defaultValue,
    role: "field",
    ...extra
  });

  const S = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "stringOrReporter",
    defaultValue,
    role: "input",
    ...extra
  });

  const N = (name, scratchName, defaultValue, extra = {}) => ({
    name,
    scratchName,
    type: "number",
    defaultValue,
    role: "input",
    ...extra
  });

  const MATRIX = (name, scratchName, defaultValue) => ({
    name,
    scratchName,
    type: "matrix",
    defaultValue,
    role: "input",
    shadowOpcode: "matrix",
    shadowField: "MATRIX"
  });

  const SUB = (scratchName = "SUBSTACK") => ({
    name: "body",
    scratchName,
    type: "substack",
    role: "substack"
  });

  const BUTTONS = ["A", "B"];
  const BUTTON_EVENTS = ["DOWN", "UP", "CLICK", "HOLD", "LONG_CLICK", "DOUBLE_CLICK"];
  const TOUCH_IDS = ["LOGO", "P0", "P1", "P2"];
  const GESTURES = [
    "TILT_UP", "TILT_DOWN", "TILT_LEFT", "TILT_RIGHT",
    "FACE_UP", "FACE_DOWN", "FREEFALL", "G3", "G6", "G8", "SHAKE"
  ];
  const AXES = ["x", "y", "z", "absolute"];
  const ANALOG_PINS = ["0", "1", "2"];
  const GPIO_PINS = ["0", "1", "2", "8", "12", "13", "14", "15", "16"];
  const PULL_MODES = ["NONE", "DOWN", "UP"];
  const PIN_EVENT_TYPES = ["NONE", "ON_PULSE", "ON_EDGE"];
  const PIN_EVENTS = ["PULSE_LOW", "PULSE_HIGH", "FALL", "RISE"];

  const axisReporter = (functionName, opcode, axis, label) => ({
    functionName,
    extensionId: "microbitMore",
    opcode,
    category: "Microbit More",
    blockType: "reporter",
    fixedFields: { AXIS: axis },
    arguments: [],
    sample: `sayNow(${functionName}());`,
    description: `${label}。引数なしで書ける別名です。`,
    source
  });

  R.registerMany([
    {
      functionName: "whenMicrobitConnectionChanged",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenConnectionChanged",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        F("state", "STATE", "connected", { allowedValues: ["connected", "disconnected"] }),
        SUB()
      ],
      sample: 'whenMicrobitConnectionChanged("connected", () => { sayNow("接続"); });',
      description: "micro:bitの接続状態が変化したときに実行。",
      source
    },
    {
      functionName: "whenMicrobitButtonPressed",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenButtonEvent",
      category: "Microbit More",
      blockType: "hat",
      fixedFields: { EVENT: "DOWN" },
      arguments: [
        F("button", "NAME", "A", { allowedValues: BUTTONS }),
        SUB()
      ],
      sample: 'whenMicrobitButtonPressed("A", () => { microbitDisplayText("2", 120); });',
      description: "A/Bボタンが押された（DOWN）ときに実行。",
      source
    },
    {
      functionName: "ifMicrobitButtonPressed",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenButtonEvent",
      category: "Microbit More",
      blockType: "hat",
      fixedFields: { EVENT: "DOWN" },
      arguments: [
        F("button", "NAME", "A", { allowedValues: BUTTONS }),
        SUB()
      ],
      sample: 'ifMicrobitButtonPressed("A", () => { microbitDisplayText("2", 120); });',
      description: "互換エイリアス（推奨: whenMicrobitButtonPressed）。",
      source
    },
    {
      functionName: "whenMicrobitButtonEvent",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenButtonEvent",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        F("button", "NAME", "A", { allowedValues: BUTTONS }),
        F("event", "EVENT", "DOWN", { allowedValues: BUTTON_EVENTS }),
        SUB()
      ],
      sample: 'whenMicrobitButtonEvent("A", "CLICK", () => { sayNow("クリック"); });',
      description: "ボタンのイベント種類まで指定して実行する。",
      source
    },
    {
      functionName: "microbitButtonPressed",
      extensionId: "microbitMore",
      opcode: "microbitMore_isButtonPressed",
      category: "Microbit More",
      blockType: "boolean",
      arguments: [
        F("button", "NAME", "A", { allowedValues: BUTTONS })
      ],
      sample: 'ifBlock(microbitButtonPressed("A"), () => { move(10); });',
      description: "ボタンが押されているかを返す条件ブロック。",
      source
    },
    {
      functionName: "whenMicrobitTouchEvent",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenTouchEvent",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        F("name", "NAME", "LOGO", { allowedValues: TOUCH_IDS }),
        F("event", "EVENT", "DOWN", { allowedValues: BUTTON_EVENTS }),
        SUB()
      ],
      sample: 'whenMicrobitTouchEvent("LOGO", "DOWN", () => { sayNow("さわった"); });',
      description: "ロゴやピンに触れたときに実行。",
      source
    },
    {
      functionName: "microbitPinTouched",
      extensionId: "microbitMore",
      opcode: "microbitMore_isPinTouched",
      category: "Microbit More",
      blockType: "boolean",
      arguments: [
        F("name", "NAME", "LOGO", { allowedValues: TOUCH_IDS })
      ],
      sample: 'ifBlock(microbitPinTouched("LOGO"), () => { say("タッチ中", 1); });',
      description: "ロゴやピンに触れているかを返す条件ブロック。",
      source
    },
    {
      functionName: "whenMicrobitShaken",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenGesture",
      category: "Microbit More",
      blockType: "hat",
      fixedFields: { GESTURE: "SHAKE" },
      arguments: [SUB()],
      sample: 'whenMicrobitShaken(() => { microbitPlayTone(440, 100); });',
      description: "ゆさぶられたとき（SHAKE）に実行する別名。",
      source
    },
    {
      functionName: "whenMicrobitGesture",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenGesture",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        F("gesture", "GESTURE", "SHAKE", { allowedValues: GESTURES }),
        SUB()
      ],
      sample: 'whenMicrobitGesture("TILT_LEFT", () => { changeX(-10); });',
      description: "傾き・落下・シェイクなどのジェスチャーで実行。",
      source
    },
    {
      functionName: "microbitDisplayMatrix",
      extensionId: "microbitMore",
      opcode: "microbitMore_displayMatrix",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        MATRIX("pattern", "MATRIX", "0101010101100010101000100")
      ],
      sample: 'microbitDisplayMatrix("0101011111111110111000100");',
      description: "0と1を25個並べた5×5パターンをLEDへ表示する。",
      source
    },
    {
      functionName: "microbitDisplayText",
      extensionId: "microbitMore",
      opcode: "microbitMore_displayText",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        S("text", "TEXT", "Hello!"),
        N("delay", "DELAY", 120)
      ],
      sample: 'microbitDisplayText("Hello!", 120);',
      description: "micro:bitに文字を表示する。delay省略時の既定値は120。",
      source
    },
    {
      functionName: "microbitClearDisplay",
      extensionId: "microbitMore",
      opcode: "microbitMore_displayClear",
      category: "Microbit More",
      blockType: "stack",
      arguments: [],
      sample: "microbitClearDisplay();",
      description: "LEDの表示を消す。",
      source
    },
    {
      functionName: "microbitLightLevel",
      extensionId: "microbitMore",
      opcode: "microbitMore_getLightLevel",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [],
      sample: "sayNow(microbitLightLevel());",
      description: "明るさを返す。",
      source
    },
    {
      functionName: "microbitTemperature",
      extensionId: "microbitMore",
      opcode: "microbitMore_getTemperature",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [],
      sample: "sayNow(microbitTemperature());",
      description: "温度を返す。",
      source
    },
    {
      functionName: "microbitCompassHeading",
      extensionId: "microbitMore",
      opcode: "microbitMore_getCompassHeading",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [],
      sample: "sayNow(microbitCompassHeading());",
      description: "方位を返す。実機では最初に校正が必要。",
      source
    },
    {
      functionName: "microbitPitch",
      extensionId: "microbitMore",
      opcode: "microbitMore_getPitch",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [],
      sample: "sayNow(microbitPitch());",
      description: "前後方向の傾きを返す。",
      source
    },
    {
      functionName: "microbitRoll",
      extensionId: "microbitMore",
      opcode: "microbitMore_getRoll",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [],
      sample: "sayNow(microbitRoll());",
      description: "左右方向の傾きを返す。",
      source
    },
    {
      functionName: "microbitSoundLevel",
      extensionId: "microbitMore",
      opcode: "microbitMore_getSoundLevel",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [],
      sample: "sayNow(microbitSoundLevel());",
      description: "マイクが拾った音の大きさを返す（micro:bit v2）。",
      source
    },
    {
      functionName: "microbitMagneticForce",
      extensionId: "microbitMore",
      opcode: "microbitMore_getMagneticForce",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [
        F("axis", "AXIS", "absolute", { allowedValues: AXES })
      ],
      sample: 'sayNow(microbitMagneticForce("absolute"));',
      description: "磁力を返す。軸は x / y / z / absolute。",
      source
    },
    {
      functionName: "microbitAcceleration",
      extensionId: "microbitMore",
      opcode: "microbitMore_getAcceleration",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [
        F("axis", "AXIS", "x", { allowedValues: AXES })
      ],
      sample: 'sayNow(microbitAcceleration("x"));',
      description: "加速度を返す。軸は x / y / z / absolute。",
      source
    },
    {
      functionName: "microbitAnalogValue",
      extensionId: "microbitMore",
      opcode: "microbitMore_getAnalogValue",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: ANALOG_PINS })
      ],
      sample: 'sayNow(microbitAnalogValue("0"));',
      description: "P0/P1/P2のアナログ値を返す。",
      source
    },
    {
      functionName: "microbitSetPullMode",
      extensionId: "microbitMore",
      opcode: "microbitMore_setPullMode",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS }),
        F("mode", "MODE", "UP", { allowedValues: PULL_MODES })
      ],
      sample: 'microbitSetPullMode("0", "UP");',
      description: "ピンのプルモードを設定する。",
      source
    },
    {
      functionName: "microbitPinHigh",
      extensionId: "microbitMore",
      opcode: "microbitMore_isPinHigh",
      category: "Microbit More",
      blockType: "boolean",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS })
      ],
      sample: 'ifBlock(microbitPinHigh("0"), () => { say("HIGH", 1); });',
      description: "ピンがHIGHかどうかを返す条件ブロック。",
      source
    },
    {
      functionName: "microbitSetDigitalOut",
      extensionId: "microbitMore",
      opcode: "microbitMore_setDigitalOut",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS }),
        {
          name: "level",
          scratchName: "LEVEL",
          type: "menuInput",
          defaultValue: "false",
          role: "input",
          menuOpcode: "microbitMore_menu_digitalValueMenu",
          menuField: "digitalValueMenu",
          allowedValues: ["true", "false"]
        }
      ],
      sample: 'microbitSetDigitalOut("0", "true");',
      description: "ピンのデジタル出力をHIGH(true)/LOW(false)にする。",
      source
    },
    {
      functionName: "microbitSetAnalogOut",
      extensionId: "microbitMore",
      opcode: "microbitMore_setAnalogOut",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS }),
        N("level", "LEVEL", 0)
      ],
      sample: 'microbitSetAnalogOut("0", 512);',
      description: "ピンのアナログ出力（PWM）を設定する。",
      source
    },
    {
      functionName: "microbitSetServo",
      extensionId: "microbitMore",
      opcode: "microbitMore_setServo",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS }),
        N("angle", "ANGLE", 0)
      ],
      sample: 'microbitSetServo("0", 90);',
      description: "サーボモーターの角度を設定する。",
      source
    },
    {
      functionName: "microbitPlayTone",
      extensionId: "microbitMore",
      opcode: "microbitMore_playTone",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        N("freq", "FREQ", 440),
        N("volume", "VOL", 100, { optional: true })
      ],
      sample: "microbitPlayTone(440, 100);",
      description: "指定周波数で音を鳴らす。volume省略時は100。",
      source
    },
    {
      functionName: "microbitStopTone",
      extensionId: "microbitMore",
      opcode: "microbitMore_stopTone",
      category: "Microbit More",
      blockType: "stack",
      arguments: [],
      sample: "microbitStopTone();",
      description: "鳴らしている音を停止する。",
      source
    },
    {
      functionName: "microbitListenPinEventType",
      extensionId: "microbitMore",
      opcode: "microbitMore_listenPinEventType",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS }),
        F("eventType", "EVENT_TYPE", "NONE", { allowedValues: PIN_EVENT_TYPES })
      ],
      sample: 'microbitListenPinEventType("0", "ON_EDGE");',
      description: "ピンのイベント検出方法を設定する。whenMicrobitPinEventの前に必要。",
      source
    },
    {
      functionName: "whenMicrobitPinEvent",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenPinEvent",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS }),
        F("event", "EVENT", "PULSE_LOW", { allowedValues: PIN_EVENTS }),
        SUB()
      ],
      sample: 'whenMicrobitPinEvent("0", "RISE", () => { sayNow("立ち上がり"); });',
      description: "ピンイベントが起きたときに実行。",
      source
    },
    {
      functionName: "microbitPinEventValue",
      extensionId: "microbitMore",
      opcode: "microbitMore_getPinEventValue",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: GPIO_PINS }),
        F("event", "EVENT", "PULSE_LOW", { allowedValues: PIN_EVENTS })
      ],
      sample: 'sayNow(microbitPinEventValue("0", "PULSE_LOW"));',
      description: "ピンイベントの値を返す。",
      source
    },
    {
      functionName: "whenMicrobitDataReceived",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenDataReceived",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        S("label", "LABEL", "label-01"),
        SUB()
      ],
      sample: 'whenMicrobitDataReceived("label-01", () => { sayNow("受信"); });',
      description: "ラベル付きデータを受け取ったときに実行。micro:bitが2台必要。",
      source
    },
    {
      functionName: "microbitDataLabeled",
      extensionId: "microbitMore",
      opcode: "microbitMore_getDataLabeled",
      category: "Microbit More",
      blockType: "reporter",
      arguments: [
        S("label", "LABEL", "label-01")
      ],
      sample: 'sayNow(microbitDataLabeled("label-01"));',
      description: "受け取ったラベル付きデータの中身を返す。",
      source
    },
    {
      functionName: "microbitSendData",
      extensionId: "microbitMore",
      opcode: "microbitMore_sendData",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        S("label", "LABEL", "label-01"),
        S("data", "DATA", "data")
      ],
      sample: 'microbitSendData("label-01", "こんにちは");',
      description: "ラベルを付けてデータを送る。micro:bitが2台必要。",
      source
    },
    axisReporter("microbitAccelerationX", "microbitMore_getAcceleration", "x", "x軸の加速度"),
    axisReporter("microbitAccelerationY", "microbitMore_getAcceleration", "y", "y軸の加速度"),
    axisReporter("microbitAccelerationZ", "microbitMore_getAcceleration", "z", "z軸の加速度"),
    axisReporter("microbitAccelerationAbsolute", "microbitMore_getAcceleration", "absolute", "加速度の大きさ"),
    axisReporter("microbitMagneticForceX", "microbitMore_getMagneticForce", "x", "x軸の磁力"),
    axisReporter("microbitMagneticForceY", "microbitMore_getMagneticForce", "y", "y軸の磁力"),
    axisReporter("microbitMagneticForceZ", "microbitMore_getMagneticForce", "z", "z軸の磁力"),
    axisReporter("microbitMagneticForceAbsolute", "microbitMore_getMagneticForce", "absolute", "磁力の大きさ")
  ]);

  /*
   * Gemは「Scratchのブロック表示がサーボだから microbitServo だろう」と推測しがちです。
   * Set が付くかどうかは表示名から予測できないため、よく外れる4つを別名として受けます。
   * 変換は成功させたうえで、警告欄に正式名を出して生徒が正しい名前を覚えられるようにします。
   */
  R.registerAliases({
    microbitServo: "microbitSetServo",
    microbitDigitalOut: "microbitSetDigitalOut",
    microbitAnalogOut: "microbitSetAnalogOut",
    microbitPullMode: "microbitSetPullMode"
  });

  const unsupportedBlocks = [
    {
      functionName: "microbitTiltAngle",
      opcode: "microbitMore_getPitch / microbitMore_getRoll",
      reason: "旧互換候補名です。前後の傾きは microbitPitch()、左右の傾きは microbitRoll() を使ってください。"
    }
  ];

  unsupportedBlocks.forEach((definition) => {
    R.registerUnsupported({
      functionName: definition.functionName,
      category: "Microbit More",
      source,
      opcode: definition.opcode,
      reason: definition.reason,
      nextStep: "stretchscript-spec.md のMicrobit More対応関数一覧から、近い働きの関数を選んでください。"
    });
  });
})();
