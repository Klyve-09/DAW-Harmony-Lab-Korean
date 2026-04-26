import { describe, expect, it } from "vitest";
import { buildMidiFileName, notesToMidiFile } from "@/lib/midi/export";
import type { PianoRollNote } from "@/types/music";

function asText(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

function asHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const c4: PianoRollNote = {
  id: "c4",
  pitch: "C4",
  midi: 60,
  startBeat: 0,
  duration: 1,
  velocity: 0.5
};

describe("MIDI export", () => {
  it("writes a standard MIDI header, tempo event, and note events", () => {
    const bytes = notesToMidiFile([c4], { bpm: 120 });
    const hex = asHex(bytes);

    expect(asText(bytes, 0, 4)).toBe("MThd");
    expect(asText(bytes, 14, 18)).toBe("MTrk");
    expect(bytes[12]).toBe(0x01);
    expect(bytes[13]).toBe(0xe0);
    expect(hex).toContain("ff510307a120");
    expect(hex).toContain("903c40");
    expect(hex).toContain("803c00");
    expect(hex.endsWith("00ff2f00")).toBe(true);
  });

  it("uses variable-length deltas for later note starts", () => {
    const bytes = notesToMidiFile([{ ...c4, startBeat: 1 }], { bpm: 100 });

    expect(asHex(bytes)).toContain("8360903c40");
  });

  it("builds safe .mid filenames", () => {
    expect(buildMidiFileName("Progression C / G / Am / F")).toBe("progression-c-g-am-f.mid");
    expect(buildMidiFileName("already.mid")).toBe("already.mid");
    expect(buildMidiFileName("")).toBe("daw-harmony-loop.mid");
  });
});
