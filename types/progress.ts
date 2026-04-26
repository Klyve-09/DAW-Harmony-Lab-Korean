import type { GeneratedProgression } from "@/types/music";

export type SavedProjectSubmission = {
  id: string;
  checkpointId: string;
  lessonId: string;
  title: string;
  genre: string;
  score: number;
  checkedSteps: string[];
  savedAt: string;
};

export type UserProgress = {
  completedLessonIds: string[];
  viewedLessonIds?: string[];
  quizScores: Record<string, number>;
  listeningScores?: Record<string, number>;
  exerciseScores?: Record<string, number>;
  hintUsage?: Record<string, number>;
  projectSubmissions?: Record<string, SavedProjectSubmission>;
  lastLessonSlug?: string;
  recentGeneratedProgressions: GeneratedProgression[];
};
