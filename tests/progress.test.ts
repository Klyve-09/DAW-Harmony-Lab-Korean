import { describe, expect, it } from "vitest";
import { addRecentProgression, getOverallProgress, normalizeProgress } from "@/lib/storage/progressStorage";
import { scoreExerciseAnswer } from "@/lib/utils";
import type { GeneratedProgression } from "@/types/music";
import type { PianoRollNote } from "@/types/music";

function note(id: string, pitch: string, startBeat = 0): PianoRollNote {
  return { id, pitch, midi: 60, startBeat, duration: 1 };
}

function generatedProgression(id: string): GeneratedProgression {
  return {
    id,
    key: "C",
    genre: "pop",
    mood: "bright",
    complexity: "basic",
    description: `generated ${id}`,
    createdAt: "2026-04-24T00:00:00.000Z",
    romanNumerals: ["I"],
    chords: [{ name: "C", root: "C", quality: "major", notes: ["C", "E", "G"] }]
  };
}

describe("learning checks", () => {
  it("calculates overall progress", () => {
    expect(getOverallProgress({ completedLessonIds: ["a", "b", "c"], quizScores: {}, recentGeneratedProgressions: [] }, 15)).toBe(20);
  });

  it("scores exercise answers by exact pitch and missing notes", () => {
    const result = scoreExerciseAnswer([note("1", "C4"), note("2", "E4")], [note("a", "C4"), note("b", "E4"), note("c", "G4")]);
    expect(result.score).toBe(67);
    expect(result.message).toContain("빠진 음: G4");
  });

  it("penalizes unexpected exercise notes", () => {
    const result = scoreExerciseAnswer(
      [note("1", "C4"), note("2", "E4"), note("3", "F#4")],
      [note("a", "C4"), note("b", "E4"), note("c", "G4")]
    );
    expect(result.score).toBe(52);
    expect(result.message).toContain("다른 음: F#4");
  });

  it("penalizes octave and timing differences", () => {
    const octaveResult = scoreExerciseAnswer(
      [note("1", "C3"), note("2", "E4"), note("3", "G4")],
      [note("a", "C4"), note("b", "E4"), note("c", "G4")]
    );
    expect(octaveResult.score).toBe(57);
    expect(octaveResult.message).toContain("옥타브 확인: C3");

    const timingResult = scoreExerciseAnswer(
      [note("1", "C4", 0), note("2", "E4", 1), note("3", "G4", 1)],
      [note("a", "C4", 0), note("b", "E4", 0), note("c", "G4", 0)]
    );
    expect(timingResult.score).toBe(84);
    expect(timingResult.message).toContain("박자 위치 2개 확인");
  });

  it("normalizes corrupt progress payloads", () => {
    const progress = normalizeProgress({
      completedLessonIds: ["lesson-1", "lesson-1", 42],
      quizScores: { "lesson-1": 101.4, "lesson-2": -2, nope: "bad" },
      recentGeneratedProgressions: [{ id: "bad" }],
      lastLessonSlug: 123
    });

    expect(progress.completedLessonIds).toEqual(["lesson-1"]);
    expect(progress.quizScores).toEqual({ "lesson-1": 100, "lesson-2": 0 });
    expect(progress.recentGeneratedProgressions).toEqual([]);
    expect(progress.lastLessonSlug).toBeUndefined();
  });

  it("normalizes recent generated progressions to five valid entries", () => {
    const valid = Array.from({ length: 7 }, (_, index) => generatedProgression(`progression-${index + 1}`));
    const progress = normalizeProgress({
      completedLessonIds: [],
      quizScores: {},
      recentGeneratedProgressions: [valid[0], { id: "missing-fields" }, ...valid.slice(1)]
    });

    expect(progress.recentGeneratedProgressions.map((item) => item.id)).toEqual([
      "progression-1",
      "progression-2",
      "progression-3",
      "progression-4",
      "progression-5"
    ]);
  });

  it("caps saved generated progressions and moves regenerated items to the front", () => {
    const baseProgress = {
      completedLessonIds: [],
      quizScores: {},
      recentGeneratedProgressions: Array.from({ length: 5 }, (_, index) => generatedProgression(`progression-${index + 1}`))
    };

    expect(addRecentProgression(baseProgress, generatedProgression("progression-6")).recentGeneratedProgressions.map((item) => item.id)).toEqual([
      "progression-6",
      "progression-1",
      "progression-2",
      "progression-3",
      "progression-4"
    ]);

    expect(addRecentProgression(baseProgress, generatedProgression("progression-3")).recentGeneratedProgressions.map((item) => item.id)).toEqual([
      "progression-3",
      "progression-1",
      "progression-2",
      "progression-4",
      "progression-5"
    ]);
  });
});
