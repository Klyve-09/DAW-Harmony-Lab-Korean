import { describe, expect, it } from "vitest";
import { getPlaybackDurationBeats } from "@/lib/audio/playback";
import { buildChord } from "@/lib/theory/chords";
import type { PianoRollNote } from "@/types/music";

const notes: PianoRollNote[] = [
  { id: "a", pitch: "C4", midi: 60, startBeat: 0, duration: 1 },
  { id: "b", pitch: "E4", midi: 64, startBeat: 2.5, duration: 0.5 },
  { id: "c", pitch: "G4", midi: 67, startBeat: 3, duration: 2 }
];

describe("playback helpers", () => {
  it("uses the latest note end as the playback length", () => {
    expect(getPlaybackDurationBeats({ notes })).toBe(5);
  });

  it("falls back to chord count when no timed notes are available", () => {
    expect(getPlaybackDurationBeats({ chords: [buildChord("C", "major"), buildChord("G", "major")] })).toBe(2);
  });

  it("returns zero when there is no playable content", () => {
    expect(getPlaybackDurationBeats({ notes: [], chords: [] })).toBe(0);
  });
});
