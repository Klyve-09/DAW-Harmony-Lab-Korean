import { describe, expect, it } from "vitest";
import { buildLessonSteps, getNextLessonStepId } from "@/lib/learning/lessonSteps";

describe("lesson step flow", () => {
  it("locks each learning task until the previous task is passed", () => {
    const steps = buildLessonSteps({
      complete: false,
      exampleDone: false,
      listeningPassed: false,
      exercisePassed: false,
      quizPassed: false
    });

    expect(steps.map((step) => ({ id: step.id, locked: step.locked }))).toEqual([
      { id: "concept", locked: false },
      { id: "example", locked: false },
      { id: "listening", locked: true },
      { id: "practice", locked: true },
      { id: "quiz", locked: true },
      { id: "finish", locked: true }
    ]);
  });

  it("opens the next Duolingo-style step after each pass condition", () => {
    const steps = buildLessonSteps({
      complete: false,
      exampleDone: true,
      listeningPassed: true,
      exercisePassed: false,
      quizPassed: false
    });

    expect(steps.find((step) => step.id === "practice")?.locked).toBe(false);
    expect(steps.find((step) => step.id === "quiz")?.locked).toBe(true);
    expect(getNextLessonStepId(steps, "listening")).toBe("practice");
  });

  it("keeps the finish step locked until the quiz passes", () => {
    const beforeQuiz = buildLessonSteps({
      complete: false,
      exampleDone: true,
      listeningPassed: true,
      exercisePassed: true,
      quizPassed: false
    });
    const afterQuiz = buildLessonSteps({
      complete: false,
      exampleDone: true,
      listeningPassed: true,
      exercisePassed: true,
      quizPassed: true
    });

    expect(beforeQuiz.find((step) => step.id === "finish")?.locked).toBe(true);
    expect(afterQuiz.find((step) => step.id === "finish")?.locked).toBe(false);
  });
});
