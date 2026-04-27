import { describe, expect, it } from "vitest";
import { createNotePlaybackPlan, createProgressionPlaybackPlan, getPlaybackDurationBeats } from "@/lib/audio/playback";
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

  it("normalizes note events into seconds for prerendering", () => {
    const plan = createNotePlaybackPlan(notes, 120);

    expect(plan.kind).toBe("notes");
    expect(plan.durationMs).toBe(2500);
    expect(plan.renderDurationSeconds).toBeCloseTo(2.85);
    expect(plan.events[0]).toEqual({
      notes: ["C4"],
      startSeconds: 0,
      durationSeconds: 0.5,
      velocity: 0.7
    });
    expect(plan.events[1]).toEqual({
      notes: ["E4"],
      startSeconds: 1.25,
      durationSeconds: 0.25,
      velocity: 0.7
    });
  });

  it("normalizes progression events with chord voicing and shorter note length", () => {
    const plan = createProgressionPlaybackPlan([buildChord("C", "major"), buildChord("G", "major")], 120);

    expect(plan.kind).toBe("progression");
    expect(plan.durationMs).toBe(1000);
    expect(plan.renderDurationSeconds).toBeCloseTo(1.35);
    expect(plan.events[0]).toEqual({
      notes: ["C3", "E4", "G4"],
      startSeconds: 0,
      durationSeconds: 0.425,
      velocity: 0.75
    });
    expect(plan.events[1].startSeconds).toBe(0.5);
  });

  it("changes the prerender cache key when musical timing or bpm changes", () => {
    const base = createNotePlaybackPlan([{ id: "a", pitch: "C4", midi: 60, startBeat: 0, duration: 1 }], 120).cacheKey;

    expect(createNotePlaybackPlan([{ id: "a", pitch: "D4", midi: 62, startBeat: 0, duration: 1 }], 120).cacheKey).not.toBe(base);
    expect(createNotePlaybackPlan([{ id: "a", pitch: "C4", midi: 60, startBeat: 0.5, duration: 1 }], 120).cacheKey).not.toBe(base);
    expect(createNotePlaybackPlan([{ id: "a", pitch: "C4", midi: 60, startBeat: 0, duration: 0.5 }], 120).cacheKey).not.toBe(base);
    expect(createNotePlaybackPlan([{ id: "a", pitch: "C4", midi: 60, startBeat: 0, duration: 1, velocity: 0.4 }], 120).cacheKey).not.toBe(base);
    expect(createNotePlaybackPlan([{ id: "a", pitch: "C4", midi: 60, startBeat: 0, duration: 1 }], 90).cacheKey).not.toBe(base);
  });
});
