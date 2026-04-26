import { describe, expect, it } from "vitest";
import { curriculum } from "@/data/curriculum";
import { genreReferenceLibrary } from "@/data/referenceLibrary";
import { buildDailyReviewTasks } from "@/lib/learning/dailyReview";
import { getLessonSkillState } from "@/lib/learning/skillTree";
import { normalizeProgress } from "@/lib/storage/progressStorage";
import { generatorOptions } from "@/lib/theory/progressions";

describe("expanded learning loop", () => {
  it("normalizes viewed lessons, hint usage, and project submissions", () => {
    const progress = normalizeProgress({
      completedLessonIds: [],
      viewedLessonIds: ["lesson-1", "lesson-1", 7],
      quizScores: {},
      hintUsage: { "exercise-1": 2.4, "exercise-2": -1, bad: "nope" },
      projectSubmissions: {
        "roman-numerals-project": {
          id: "submission-1",
          checkpointId: "roman-numerals-project",
          lessonId: "lesson-3",
          title: "Pop project",
          genre: "Pop",
          score: 120,
          checkedSteps: ["a", "a", 4],
          savedAt: "2026-04-27T00:00:00.000Z"
        },
        broken: { id: "broken" }
      },
      recentGeneratedProgressions: []
    });

    expect(progress.viewedLessonIds).toEqual(["lesson-1"]);
    expect(progress.hintUsage).toEqual({ "exercise-1": 2, "exercise-2": 0 });
    expect(progress.projectSubmissions?.["roman-numerals-project"]?.score).toBe(100);
    expect(progress.projectSubmissions?.["roman-numerals-project"]?.checkedSteps).toEqual(["a"]);
    expect(progress.projectSubmissions?.broken).toBeUndefined();
  });

  it("derives skill states from view, score, and project records", () => {
    const lesson = curriculum.find((item) => item.slug === "roman-numerals");
    if (!lesson?.projectCheckpoint) throw new Error("Expected roman-numerals project checkpoint");

    expect(getLessonSkillState(lesson, normalizeProgress({ completedLessonIds: [], quizScores: {}, recentGeneratedProgressions: [] })).key).toBe("unstarted");
    expect(
      getLessonSkillState(
        lesson,
        normalizeProgress({ completedLessonIds: [], viewedLessonIds: [lesson.id], quizScores: {}, recentGeneratedProgressions: [] })
      ).key
    ).toBe("viewed");
    expect(
      getLessonSkillState(
        lesson,
        normalizeProgress({ completedLessonIds: [], quizScores: {}, exerciseScores: { [lesson.id]: 80 }, recentGeneratedProgressions: [] })
      ).key
    ).toBe("built");
    expect(
      getLessonSkillState(
        lesson,
        normalizeProgress({
          completedLessonIds: [],
          quizScores: {},
          exerciseScores: { [lesson.id]: 80 },
          listeningScores: { [lesson.id]: 80 },
          recentGeneratedProgressions: []
        })
      ).key
    ).toBe("listened");
    expect(
      getLessonSkillState(
        lesson,
        normalizeProgress({
          completedLessonIds: [],
          quizScores: { [lesson.id]: 80 },
          exerciseScores: { [lesson.id]: 80 },
          listeningScores: { [lesson.id]: 80 },
          projectSubmissions: {
            [lesson.projectCheckpoint.id]: {
              id: "submission-1",
              checkpointId: lesson.projectCheckpoint.id,
              lessonId: lesson.id,
              title: lesson.projectCheckpoint.title,
              genre: lesson.projectCheckpoint.genre,
              score: 100,
              checkedSteps: lesson.projectCheckpoint.steps,
              savedAt: "2026-04-27T00:00:00.000Z"
            }
          },
          recentGeneratedProgressions: []
        })
      ).key
    ).toBe("project");
  });

  it("prioritizes weak scores in the daily 5-minute review", () => {
    const lesson = curriculum[1];
    const tasks = buildDailyReviewTasks(
      curriculum,
      normalizeProgress({
        completedLessonIds: [],
        quizScores: { [lesson.id]: 50 },
        lastLessonSlug: lesson.slug,
        recentGeneratedProgressions: []
      })
    );

    expect(tasks[0].id).toBe(`weak-${lesson.id}`);
    expect(tasks).toHaveLength(3);
  });

  it("keeps all generator genres represented in the reference library", () => {
    expect(genreReferenceLibrary.map((item) => item.genre).sort()).toEqual([...generatorOptions.genres].sort());
  });
});
