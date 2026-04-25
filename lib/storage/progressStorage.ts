import type { UserProgress } from "@/types/progress";
import type { GeneratedProgression } from "@/types/music";

export const STORAGE_KEY = "daw-harmony-lab-progress";

export const defaultProgress: UserProgress = {
  completedLessonIds: [],
  quizScores: {},
  recentGeneratedProgressions: []
};

let memoryProgress: UserProgress = { ...defaultProgress };
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

function normalizeQuizScores(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
      .map(([lessonId, score]) => [lessonId, Math.min(100, Math.max(0, Math.round(score)))])
  );
}

function normalizeRecentProgressions(value: unknown): GeneratedProgression[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is GeneratedProgression => {
      if (!isRecord(item)) return false;
      return (
        typeof item.id === "string" &&
        typeof item.key === "string" &&
        typeof item.genre === "string" &&
        typeof item.mood === "string" &&
        typeof item.complexity === "string" &&
        typeof item.description === "string" &&
        typeof item.createdAt === "string" &&
        Array.isArray(item.chords) &&
        Array.isArray(item.romanNumerals)
      );
    })
    .slice(0, 5);
}

export function normalizeProgress(value: unknown): UserProgress {
  if (!isRecord(value)) return { ...defaultProgress };
  const lastLessonSlug = typeof value.lastLessonSlug === "string" ? value.lastLessonSlug : undefined;
  return {
    completedLessonIds: normalizeStringArray(value.completedLessonIds),
    quizScores: normalizeQuizScores(value.quizScores),
    recentGeneratedProgressions: normalizeRecentProgressions(value.recentGeneratedProgressions),
    ...(lastLessonSlug ? { lastLessonSlug } : {})
  };
}

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function loadProgress(): UserProgress {
  if (!canUseLocalStorage()) return memoryProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return memoryProgress;
  }
}

export function saveProgress(progress: UserProgress) {
  memoryProgress = normalizeProgress(progress);
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryProgress));
  } catch {
    memoryProgress = normalizeProgress(progress);
  }
}

export function getOverallProgress(progress: UserProgress, totalLessons: number) {
  if (totalLessons <= 0) return 0;
  const completed = Math.min(totalLessons, new Set(progress.completedLessonIds).size);
  return Math.min(100, Math.max(0, Math.round((completed / totalLessons) * 100)));
}

export function addRecentProgression(progress: UserProgress, generated: GeneratedProgression): UserProgress {
  return {
    ...progress,
    recentGeneratedProgressions: [
      generated,
      ...progress.recentGeneratedProgressions.filter((item) => item.id !== generated.id)
    ].slice(0, 5)
  };
}

function emitProgressChange() {
  listeners.forEach((listener) => listener());
}

export function getProgressSnapshot() {
  return memoryProgress;
}

export function hydrateProgress() {
  const loaded = loadProgress();
  if (JSON.stringify(loaded) === JSON.stringify(memoryProgress)) return;
  memoryProgress = loaded;
  emitProgressChange();
}

export function updateProgress(updater: (current: UserProgress) => UserProgress): UserProgress {
  const next = normalizeProgress(updater(memoryProgress));
  if (JSON.stringify(next) === JSON.stringify(memoryProgress)) return memoryProgress;
  saveProgress(next);
  emitProgressChange();
  return memoryProgress;
}

export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) hydrateProgress();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}
