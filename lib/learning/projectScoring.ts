import type { SavedProjectSubmission } from "@/types/progress";

export function getProjectCheckedSteps(saved: SavedProjectSubmission | undefined, draftCheckedSteps: string[] | undefined) {
  return draftCheckedSteps ?? saved?.checkedSteps ?? [];
}

export function scoreProjectSteps(checkedSteps: string[], totalSteps: number) {
  if (totalSteps <= 0) return 0;
  return Math.round((checkedSteps.length / totalSteps) * 100);
}
