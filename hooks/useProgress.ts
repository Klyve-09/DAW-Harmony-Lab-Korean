"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { GeneratedProgression } from "@/types/music";
import {
  addRecentProgression,
  defaultProgress,
  getOverallProgress,
  getProgressSnapshot,
  hydrateProgress,
  subscribeProgress,
  updateProgress
} from "@/lib/storage/progressStorage";

export function useProgress(totalLessons: number) {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, () => defaultProgress);

  useEffect(() => {
    hydrateProgress();
  }, []);

  const completeLesson = useCallback(
    (lessonId: string, slug: string) => {
      updateProgress((current) => {
        const completedLessonIds = current.completedLessonIds.includes(lessonId)
          ? current.completedLessonIds
          : [...current.completedLessonIds, lessonId];
        return {
          ...current,
          completedLessonIds,
          lastLessonSlug: slug
        };
      });
    },
    []
  );

  const setLastLesson = useCallback(
    (slug: string) => {
      updateProgress((current) => (current.lastLessonSlug === slug ? current : { ...current, lastLessonSlug: slug }));
    },
    []
  );

  const saveQuizScore = useCallback(
    (lessonId: string, score: number) => {
      updateProgress((current) => ({ ...current, quizScores: { ...current.quizScores, [lessonId]: score } }));
    },
    []
  );

  const saveGeneratedProgression = useCallback(
    (generated: GeneratedProgression) => {
      updateProgress((current) => addRecentProgression(current, generated));
    },
    []
  );

  return useMemo(
    () => ({
      progress,
      ready: true,
      percent: getOverallProgress(progress, totalLessons),
      completeLesson,
      setLastLesson,
      saveQuizScore,
      saveGeneratedProgression
    }),
    [completeLesson, progress, saveGeneratedProgression, saveQuizScore, setLastLesson, totalLessons]
  );
}
