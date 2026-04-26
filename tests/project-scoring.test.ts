import { describe, expect, it } from "vitest";
import { getProjectCheckedSteps, scoreProjectSteps } from "@/lib/learning/projectScoring";
import type { SavedProjectSubmission } from "@/types/progress";

const saved: SavedProjectSubmission = {
  id: "saved-project",
  checkpointId: "roman-numerals-project",
  lessonId: "lesson-3",
  title: "Pop project",
  genre: "Pop",
  score: 100,
  checkedSteps: ["one", "two", "three"],
  savedAt: "2026-04-27T00:00:00.000Z"
};

describe("project scoring", () => {
  it("uses hydrated saved steps until the user creates a draft", () => {
    expect(getProjectCheckedSteps(saved, undefined)).toEqual(["one", "two", "three"]);
    expect(scoreProjectSteps(getProjectCheckedSteps(saved, undefined), 3)).toBe(100);
  });

  it("keeps an explicit draft separate from saved progress", () => {
    expect(getProjectCheckedSteps(saved, ["one"])).toEqual(["one"]);
    expect(scoreProjectSteps(["one"], 3)).toBe(33);
  });
});
