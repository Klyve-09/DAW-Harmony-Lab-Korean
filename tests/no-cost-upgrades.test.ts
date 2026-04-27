import { describe, expect, it } from "vitest";
import { buildProjectLayers, getAudibleProjectNotes } from "@/lib/learning/projectLayers";
import { scoreRuleBasedProject } from "@/lib/learning/ruleScoring";
import { getScalePitchClasses, isMidiInScale } from "@/lib/theory/scaleHighlight";
import { buildVoiceLeadingSegments, summarizeVoiceLeading } from "@/lib/learning/voiceLeading";
import { curriculum } from "@/data/curriculum";
import { buildChord } from "@/lib/theory/chords";
import { scoreExerciseAnswer } from "@/lib/learning/exerciseScoring";
import type { PianoRollNote } from "@/types/music";

function note(id: string, pitch: string, midi: number, startBeat: number, role: PianoRollNote["role"] = "chordTone"): PianoRollNote {
  return { id, pitch, midi, startBeat, duration: 1, role };
}

describe("no-cost learning upgrades", () => {
  it("normalizes scale highlighting across flat and sharp pitch classes", () => {
    const scale = getScalePitchClasses("F");

    expect(isMidiInScale("A#4", scale)).toBe(true);
    expect(isMidiInScale("F#4", scale)).toBe(false);
  });

  it("builds structural voice-leading segments and flags large leaps", () => {
    const notes = [
      note("c1", "C4", 60, 0, "root"),
      note("e1", "E4", 64, 0, "third"),
      note("c2", "C5", 72, 1, "root"),
      note("e2", "E5", 76, 1, "third"),
      { ...note("arp", "G4", 67, 0.5, "chordTone"), id: "layer-arp-g" }
    ];

    expect(buildVoiceLeadingSegments(notes)).toHaveLength(2);
    expect(summarizeVoiceLeading(notes).leaps).toHaveLength(2);
  });

  it("draws inversion voice-leading by vertical voice position", () => {
    const lesson = curriculum.find((item) => item.slug === "voicing-inversions");
    if (!lesson) throw new Error("Expected voicing-inversions lesson");

    const summary = summarizeVoiceLeading(lesson.examples[0].notes, { mode: "position" });

    expect(summary.segments).toHaveLength(9);
    expect(summary.leaps).toHaveLength(0);
  });

  it("does not draw voice-leading segments for derived project layer notes", () => {
    const checkpoint = curriculum.find((lesson) => lesson.slug === "tensions-add-sus")?.projectCheckpoint;
    if (!checkpoint) throw new Error("Expected Lo-fi project checkpoint");
    const layerNotes = buildProjectLayers(checkpoint).flatMap((layer) => layer.notes);

    expect(buildVoiceLeadingSegments(layerNotes)).toHaveLength(0);
  });

  it("keeps display filtering separate from project voice-leading analysis", () => {
    const layerJumpNotes = [
      { ...note("low-root", "C3", 48, 0, "root"), id: "layer-pad-low-root" },
      { ...note("low-third", "E3", 52, 0, "third"), id: "layer-pad-low-third" },
      { ...note("low-fifth", "G3", 55, 0, "fifth"), id: "layer-pad-low-fifth" },
      { ...note("high-root", "C5", 72, 1, "root"), id: "layer-pad-high-root" },
      { ...note("high-third", "E5", 76, 1, "third"), id: "layer-pad-high-third" },
      { ...note("high-fifth", "G5", 79, 1, "fifth"), id: "layer-pad-high-fifth" }
    ];

    const voiceItem = scoreRuleBasedProject({ notes: layerJumpNotes, chords: [buildChord("C", "major"), buildChord("C", "major")], genre: "Pop" }).items.find(
      (item) => item.title === "Voice leading"
    );

    expect(buildVoiceLeadingSegments(layerJumpNotes)).toHaveLength(0);
    expect(summarizeVoiceLeading(layerJumpNotes, { includeDerivedLayers: true }).leaps).toHaveLength(3);
    expect(voiceItem?.score).toBeLessThan(100);
  });

  it("derives project layer playback sets and supports solo/mute filtering", () => {
    const checkpoint = curriculum.find((lesson) => lesson.slug === "roman-numerals")?.projectCheckpoint;
    if (!checkpoint) throw new Error("Expected Pop project checkpoint");

    const layers = buildProjectLayers(checkpoint);

    expect(layers.map((layer) => layer.id)).toEqual(["bass", "pad", "piano", "arp"]);
    expect(getAudibleProjectNotes(layers, [], "bass").every((item) => item.voice === "bass")).toBe(true);
    expect(getAudibleProjectNotes(layers, ["bass"]).some((item) => item.voice === "bass")).toBe(true);
    expect(getAudibleProjectNotes(layers, ["bass"]).some((item) => item.id.startsWith("layer-bass"))).toBe(false);
  });

  it("scores project rules without external services", () => {
    const chords = [buildChord("C", "major"), buildChord("G", "major")];
    const notes = [
      note("c-root", "C3", 48, 0, "root"),
      note("c-third", "E4", 64, 0, "third"),
      note("c-fifth", "G4", 67, 0, "fifth"),
      note("g-root", "G3", 55, 1, "root"),
      note("g-third", "B4", 71, 1, "third"),
      note("g-fifth", "D5", 74, 1, "fifth")
    ];

    const result = scoreRuleBasedProject({ notes, chords, genre: "Pop" });

    expect(result.items.map((item) => item.title)).toEqual(["Duration", "Function", "Voice leading", "Bass motion", "Tension", "Genre fit"]);
    expect(result.score).toBeGreaterThan(60);
  });

  it("does not penalize the repository expected answers for their own voice-leading shape", () => {
    curriculum.forEach((lesson) => {
      const expected = lesson.exercises[0].expectedNotes ?? [];
      const result = scoreExerciseAnswer(expected, expected);
      expect(result.score, lesson.slug).toBe(100);
    });
  });

  it("keeps project scoring independent from solo and mute playback filters", () => {
    const checkpoint = curriculum.find((lesson) => lesson.slug === "roman-numerals")?.projectCheckpoint;
    if (!checkpoint) throw new Error("Expected Pop project checkpoint");
    const layers = buildProjectLayers(checkpoint);
    const fullScore = scoreRuleBasedProject({ notes: getAudibleProjectNotes(layers, []), chords: checkpoint.chords, genre: checkpoint.genre });
    const mutedPlaybackNotes = getAudibleProjectNotes(layers, ["bass", "pad", "piano", "arp"]);

    expect(mutedPlaybackNotes).toHaveLength(0);
    expect(fullScore.score).toBeGreaterThan(60);
  });
});
