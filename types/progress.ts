import type { GeneratedProgression } from "@/types/music";

export type UserProgress = {
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  lastLessonSlug?: string;
  recentGeneratedProgressions: GeneratedProgression[];
};
