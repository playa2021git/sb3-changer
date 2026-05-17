/*
 * Microbit More は fixture で project.json 保存形を確認できたものだけを有効化します。
 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const source = "Mirobitmoretest.sb3 + 揺さぶられたとき音を鳴らす.sb3 (project.json実測)";

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

  const SUB = (scratchName = "SUBSTACK") => ({
    name: "body",
    scratchName,
    type: "substack",
    role: "substack"
  });

  R.registerMany([
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
      functionName: "whenMicrobitConnectionChanged",
      opcode: "microbitMore_whenConnectionChanged",
      reason: "接続状態hatのproject.json保存形と授業環境での発火条件が未確認です。"
    },
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
      functionName: "microbitDisplayMatrix",
      opcode: "microbitMore_displayMatrix",
      reason: "MATRIX入力のshadow block保存形が未固定です。"
    },
    {
      functionName: "microbitClearDisplay",
      opcode: "microbitMore_displayClear",
      reason: "clear display単体のproject.json保存形が未確認です。"
    },
    {
      functionName: "microbitLightLevel",
      opcode: "microbitMore_getLightLevel",
      reason: "light reporterの保存形と値範囲が未確認です。"
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
      functionName: "microbitRoll",
      opcode: "microbitMore_getRoll",
      reason: "roll reporterの保存形と実機値が未確認です。"
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
      functionName: "microbitSetPullMode",
      opcode: "microbitMore_setPullMode",
      reason: "pin pull mode commandの保存形とpin許可値が未確認です。"
    },
    {
      functionName: "microbitPinHigh",
      opcode: "microbitMore_isPinHigh",
      reason: "digital input booleanの保存形とpin許可値が未確認です。"
    },
    {
      functionName: "microbitSetDigitalOut",
      opcode: "microbitMore_setDigitalOut",
      reason: "digital output commandの保存形とLEVEL menu保存形が未確認です。"
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
      reason: "pin event listener commandの保存形と実機イベント条件が未確認です。"
    },
    {
      functionName: "whenMicrobitPinEvent",
      opcode: "microbitMore_whenPinEvent",
      reason: "pin event hatの保存形と発火条件が未確認です。"
    },
    {
      functionName: "microbitPinEventValue",
      opcode: "microbitMore_getPinEventValue",
      reason: "pin event value reporterの保存形と値の意味が未確認です。"
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
      nextStep: "公式getInfoだけで有効化せず、実物.sb3のproject.json保存形と実機動作を確認してから1〜2ブロック単位で有効化してください。"
    });
  });
})();
