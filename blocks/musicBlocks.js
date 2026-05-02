/* Scratch公式の音楽拡張を使うための定義です。 */
(function () {
  "use strict";

  const R = window.StretchScriptBlocks;
  const ext = "music";

  R.registerMany([
    {
      functionName: "playDrumForBeats",
      opcode: "music_playDrumForBeats",
      category: "音楽",
      extensionId: ext,
      blockType: "stack",
      arguments: [
        { name: "drum", scratchName: "DRUM", type: "number", role: "input", defaultValue: 1 },
        { name: "beats", scratchName: "BEATS", type: "number", role: "input", defaultValue: 0.25 }
      ],
      label: (args) => `${args[0]}番のドラムを${args[1]}拍鳴らす`,
      sample: "playDrumForBeats(1, 0.25);"
    },
    {
      functionName: "restForBeats",
      opcode: "music_restForBeats",
      category: "音楽",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "beats", scratchName: "BEATS", type: "number", role: "input", defaultValue: 0.25 }],
      label: (args) => `${args[0]}拍休む`,
      sample: "restForBeats(0.25);"
    },
    {
      functionName: "playNoteForBeats",
      opcode: "music_playNoteForBeats",
      category: "音楽",
      extensionId: ext,
      blockType: "stack",
      arguments: [
        { name: "note", scratchName: "NOTE", type: "number", role: "input", defaultValue: 60 },
        { name: "beats", scratchName: "BEATS", type: "number", role: "input", defaultValue: 0.5 }
      ],
      label: (args) => `${args[0]}番の音を${args[1]}拍鳴らす`,
      sample: "playNoteForBeats(60, 0.5);"
    },
    {
      functionName: "setInstrument",
      opcode: "music_setInstrument",
      category: "音楽",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "instrument", scratchName: "INSTRUMENT", type: "number", role: "input", defaultValue: 1 }],
      label: (args) => `楽器を${args[0]}にする`,
      sample: "setInstrument(1);"
    },
    {
      functionName: "changeTempo",
      opcode: "music_changeTempo",
      category: "音楽",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "tempo", scratchName: "TEMPO", type: "number", role: "input", defaultValue: 20 }],
      label: (args) => `テンポを${args[0]}ずつ変える`,
      sample: "changeTempo(20);"
    },
    {
      functionName: "setTempo",
      opcode: "music_setTempo",
      category: "音楽",
      extensionId: ext,
      blockType: "stack",
      arguments: [{ name: "tempo", scratchName: "TEMPO", type: "number", role: "input", defaultValue: 60 }],
      label: (args) => `テンポを${args[0]}にする`,
      sample: "setTempo(60);"
    },
    {
      functionName: "tempo",
      opcode: "music_getTempo",
      category: "音楽",
      extensionId: ext,
      blockType: "reporter",
      arguments: [],
      label: () => "テンポ",
      sample: "say(tempo(), 1);"
    }
  ]);
})();
