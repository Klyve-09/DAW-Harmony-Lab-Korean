import type { UserProgress } from "@/types/progress";
import { defaultProgress, normalizeProgress } from "@/lib/storage/progressSchema";

export { addRecentProgression, defaultProgress, getOverallProgress, normalizeProgress } from "@/lib/storage/progressSchema";

export const STORAGE_KEY = "daw-harmony-lab-progress";

let memoryProgress: UserProgress = { ...defaultProgress };
const listeners = new Set<() => void>();

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
