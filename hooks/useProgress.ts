"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { GeneratedProgression } from "@/types/music";
import type { SavedProjectSubmission } from "@/types/progress";
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
    (slug: string, lessonId?: string) => {
      updateProgress((current) => {
        const viewedLessonIds = lessonId && !current.viewedLessonIds?.includes(lessonId) ? [...(current.viewedLessonIds ?? []), lessonId] : current.viewedLessonIds;
        if (current.lastLessonSlug === slug && viewedLessonIds === current.viewedLessonIds) return current;
        return { ...current, lastLessonSlug: slug, ...(viewedLessonIds ? { viewedLessonIds } : {}) };
      });
    },
    []
  );

  const saveQuizScore = useCallback(
    (lessonId: string, score: number) => {
      updateProgress((current) => ({ ...current, quizScores: { ...current.quizScores, [lessonId]: score } }));
    },
    []
  );

  const saveListeningScore = useCallback(
    (lessonId: string, score: number) => {
      updateProgress((current) => ({ ...current, listeningScores: { ...current.listeningScores, [lessonId]: score } }));
    },
    []
  );

  const saveExerciseScore = useCallback(
    (lessonId: string, score: number) => {
      updateProgress((current) => ({ ...current, exerciseScores: { ...current.exerciseScores, [lessonId]: score } }));
    },
    []
  );

  const saveGeneratedProgression = useCallback(
    (generated: GeneratedProgression) => {
      updateProgress((current) => addRecentProgression(current, generated));
    },
    []
  );

  const recordHintUsage = useCallback(
    (exerciseId: string) => {
      updateProgress((current) => ({
        ...current,
        hintUsage: {
          ...current.hintUsage,
          [exerciseId]: (current.hintUsage?.[exerciseId] ?? 0) + 1
        }
      }));
    },
    []
  );

  const saveProjectSubmission = useCallback(
    (submission: SavedProjectSubmission) => {
      updateProgress((current) => ({
        ...current,
        projectSubmissions: {
          ...current.projectSubmissions,
          [submission.checkpointId]: submission
        }
      }));
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
      saveListeningScore,
      saveExerciseScore,
      saveGeneratedProgression,
      recordHintUsage,
      saveProjectSubmission
    }),
    [
      completeLesson,
      progress,
      recordHintUsage,
      saveExerciseScore,
      saveGeneratedProgression,
      saveListeningScore,
      saveProjectSubmission,
      saveQuizScore,
      setLastLesson,
      totalLessons
    ]
  );
}
