/*
 * Microbit More は fixture で project.json 保存形を確認できたものだけを有効化します。
 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "definitions/microbit-more.json (公式commit 28167dab + 公式fixture + 外部fixture履歴)";

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

  const MI = (name, scratchName, defaultValue, menuOpcode, menuField, extra = {}) => ({
    name,
    scratchName,
    type: "menuInput",
    defaultValue,
    role: "input",
    menuOpcode,
    menuField,
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
      description: "micro:bitの接続状態が変化したときに実行。公式fixture確認済み、実機再確認待ち。",
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
        F("button", "NAME", "A", { allowedValues: ["A", "B"] }),
        SUB()
      ],
      sample: "whenMicrobitButtonPressed(\"A\", () => { microbitDisplayText(\"2\", 120); });",
      description: "A/Bボタン押下（DOWN）で実行。fixture確認済み値のみ許可。",
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
        F("button", "NAME", "A", { allowedValues: ["A", "B"] }),
        SUB()
      ],
      sample: "ifMicrobitButtonPressed(\"A\", () => { microbitDisplayText(\"2\", 120); });",
      description: "互換エイリアス（推奨: whenMicrobitButtonPressed）。",
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
      description: "0と1を25個並べた5×5パターンをLEDへ表示する。専用matrix shadowを生成。",
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
      sample: "microbitDisplayText(\"Hello!\", 120);",
      description: "micro:bitに文字を表示する。delay省略時の既定値は120。",
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
      description: "micro:bitが測定した明るさを返す。公式fixture確認済み、実機値範囲の確認待ち。",
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
      description: "micro:bitの左右方向の傾きを返す。micro:bit V2で連続値の実機確認済み。",
      source
    },
    {
      functionName: "microbitSetPullMode",
      extensionId: "microbitMore",
      opcode: "microbitMore_setPullMode",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        F("pin", "PIN", "1", { allowedValues: ["1"] }),
        F("mode", "MODE", "NONE", { allowedValues: ["NONE"] })
      ],
      sample: 'microbitSetPullMode("1", "NONE");',
      description: "P1のプルモードをNONEにする。公式HC-SR04 fixtureで確認した組合せだけを許可。",
      source
    },
    {
      functionName: "microbitSetDigitalOut",
      extensionId: "microbitMore",
      opcode: "microbitMore_setDigitalOut",
      category: "Microbit More",
      blockType: "stack",
      arguments: [
        F("pin", "PIN", "0", { allowedValues: ["0"] }),
        MI(
          "level",
          "LEVEL",
          "false",
          "microbitMore_menu_digitalValueMenu",
          "digitalValueMenu",
          { allowedValues: ["false", "true"] }
        )
      ],
      sample: 'microbitSetDigitalOut("0", "true");',
      description: "P0をデジタルHIGH/LOWにする。公式HC-SR04 fixtureで確認した値だけを許可。",
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
      sample: "whenMicrobitShaken(() => { microbitPlayTone(440, 100); wait(1); microbitStopTone(); });",
      description: "ゆさぶられたとき（SHAKE）のみ対応。",
      source
    },
    {
      functionName: "whenMicrobitGesture",
      extensionId: "microbitMore",
      opcode: "microbitMore_whenGesture",
      category: "Microbit More",
      blockType: "hat",
      arguments: [
        F("gesture", "GESTURE", "SHAKE", { allowedValues: ["SHAKE"] }),
        SUB()
      ],
      sample: "whenMicrobitGesture(\"SHAKE\", () => { microbitPlayTone(440, 100); });",
      description: "互換用。現時点では SHAKE のみ許可。",
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
    }
  ]);

  const unsupportedBlocks = [
    {
      functionName: "whenMicrobitButtonEvent",
      opcode: "microbitMore_whenButtonEvent",
      reason: "DOWN以外のbutton event（UP/CLICK）の保存形と実機発火条件が未確認です。"
    },
    {
      functionName: "microbitButtonPressed",
      opcode: "microbitMore_isButtonPressed",
      reason: "boolean reporterとしての保存形が未確認です。"
    },
    {
      functionName: "whenMicrobitTouchEvent",
      opcode: "microbitMore_whenTouchEvent",
      reason: "LOGO/P0/P1/P2 touch eventの保存形と実機発火条件が未確認です。"
    },
    {
      functionName: "microbitPinTouched",
      opcode: "microbitMore_isPinTouched",
      reason: "touch reporterの保存形とpin touch設定の再現性が未確認です。"
    },
    {
      functionName: "microbitClearDisplay",
      opcode: "microbitMore_displayClear",
      reason: "clear display単体のproject.json保存形が未確認です。"
    },
    {
      functionName: "microbitTemperature",
      opcode: "microbitMore_getTemperature",
      reason: "temperature reporterの保存形と値範囲が未確認です。"
    },
    {
      functionName: "microbitCompassHeading",
      opcode: "microbitMore_getCompassHeading",
      reason: "compass reporterの保存形と校正が必要な実機挙動が未確認です。"
    },
    {
      functionName: "microbitPitch",
      opcode: "microbitMore_getPitch",
      reason: "pitch reporterの保存形と実機値が未確認です。"
    },
    {
      functionName: "microbitSoundLevel",
      opcode: "microbitMore_getSoundLevel",
      reason: "microphone設定を伴うreporterの保存形と実機挙動が未確認です。"
    },
    {
      functionName: "microbitMagneticForce",
      opcode: "microbitMore_getMagneticForce",
      reason: "AXIS menu付きreporterの保存形と実機値が未確認です。"
    },
    {
      functionName: "microbitAcceleration",
      opcode: "microbitMore_getAcceleration",
      reason: "AXIS menu付きacceleration reporterの保存形と実機値が未確認です。"
    },
    {
      functionName: "microbitAnalogValue",
      opcode: "microbitMore_getAnalogValue",
      reason: "analog input reporterのpin menu保存形と実機値が未確認です。"
    },
    {
      functionName: "microbitPinHigh",
      opcode: "microbitMore_isPinHigh",
      reason: "digital input booleanの保存形とpin許可値が未確認です。"
    },
    {
      functionName: "microbitSetAnalogOut",
      opcode: "microbitMore_setAnalogOut",
      reason: "analog/PWM output commandの保存形とpin許可値が未確認です。"
    },
    {
      functionName: "microbitSetServo",
      opcode: "microbitMore_setServo",
      reason: "servo commandは一部保存形メモがありますが、pin許可値と授業利用時の実機再現性が未固定です。"
    },
    {
      functionName: "microbitListenPinEventType",
      opcode: "microbitMore_listenPinEventType",
      reason: "公式fixtureで保存形は確認済みですが、生成処理と実機イベント条件が未確認です。"
    },
    {
      functionName: "whenMicrobitPinEvent",
      opcode: "microbitMore_whenPinEvent",
      reason: "公式fixtureで保存形は確認済みですが、生成処理と発火条件の実機確認が未完了です。"
    },
    {
      functionName: "microbitPinEventValue",
      opcode: "microbitMore_getPinEventValue",
      reason: "公式fixtureで保存形は確認済みですが、生成処理と値の意味の実機確認が未完了です。"
    },
    {
      functionName: "whenMicrobitDataReceived",
      opcode: "microbitMore_whenDataReceived",
      reason: "data receive hatの保存形と通信条件が未確認です。"
    },
    {
      functionName: "microbitDataLabeled",
      opcode: "microbitMore_getDataLabeled",
      reason: "data reporterの保存形と通信条件が未確認です。"
    },
    {
      functionName: "microbitSendData",
      opcode: "microbitMore_sendData",
      reason: "data send commandの保存形と通信条件が未確認です。"
    },
    {
      functionName: "microbitTiltAngle",
      opcode: "microbitMore_getPitch / microbitMore_getRoll",
      reason: "旧互換候補名です。公式getInfo上のpitch/roll reporterへ割り当てる仕様が未確定です。"
    }
  ];

  unsupportedBlocks.forEach((definition) => {
    R.registerUnsupported({
      functionName: definition.functionName,
      category: "Microbit More",
      source,
      opcode: definition.opcode,
      reason: definition.reason,
      nextStep: "definitions/microbit-more.jsonのfixture・対応・実機状態を確認し、不足している段階だけを1〜2ブロック単位で進めてください。"
    });
  });
})();
