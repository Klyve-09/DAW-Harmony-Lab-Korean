import type { GeneratedProgression } from "@/types/music";
import type { UserProgress } from "@/types/progress";

export const defaultProgress: UserProgress = {
  completedLessonIds: [],
  viewedLessonIds: [],
  quizScores: {},
  listeningScores: {},
  exerciseScores: {},
  hintUsage: {},
  projectSubmissions: {},
  recentGeneratedProgressions: []
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isChordSymbol(value: unknown): value is GeneratedProgression["chords"][number] {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.root === "string" &&
    typeof value.quality === "string" &&
    isStringArray(value.notes)
  );
}

function normalizeQuizScores(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
      .map(([lessonId, score]) => [lessonId, Math.min(100, Math.max(0, Math.round(score)))])
  );
}

function normalizeNonNegativeCounts(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
      .map(([id, count]) => [id, Math.max(0, Math.round(count))])
  );
}

function normalizeProjectSubmissions(value: unknown): UserProgress["projectSubmissions"] {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([checkpointId, item]) => {
      if (!isRecord(item)) return [];
      if (
        typeof item.id !== "string" ||
        typeof item.checkpointId !== "string" ||
        typeof item.lessonId !== "string" ||
        typeof item.title !== "string" ||
        typeof item.genre !== "string" ||
        typeof item.score !== "number" ||
        !Number.isFinite(item.score) ||
        !Array.isArray(item.checkedSteps) ||
        typeof item.savedAt !== "string"
      ) {
        return [];
      }
      return [
        [
          checkpointId,
          {
            id: item.id,
            checkpointId: item.checkpointId,
            lessonId: item.lessonId,
            title: item.title,
            genre: item.genre,
            score: Math.min(100, Math.max(0, Math.round(item.score))),
            checkedSteps: normalizeStringArray(item.checkedSteps),
            savedAt: item.savedAt
          }
        ]
      ];
    })
  );
}

function getProgressionHistoryKey(progression: GeneratedProgression): string {
  return [
    progression.key,
    progression.romanNumerals.join("|"),
    progression.chords.map((chord) => `${chord.name}:${chord.root}:${chord.quality}:${chord.notes.join(",")}`).join("|")
  ].join("::");
}

function normalizeRecentProgressions(value: unknown): GeneratedProgression[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
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
        item.chords.every(isChordSymbol) &&
        isStringArray(item.romanNumerals)
      );
    })
    .map(({ fallback, ...item }) => {
      const normalizedFallback = normalizeGeneratedFallback(fallback);
      return normalizedFallback ? { ...item, fallback: normalizedFallback } : item;
    })
    .filter((item) => {
      const key = getProgressionHistoryKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

function normalizeGeneratedFallback(value: unknown): GeneratedProgression["fallback"] | undefined {
  if (!isRecord(value) || !isRecord(value.requested) || !isRecord(value.used)) return undefined;
  const { requested, used } = value;
  if (
    typeof requested.genre !== "string" ||
    typeof requested.mood !== "string" ||
    typeof requested.complexity !== "string" ||
    typeof used.genre !== "string" ||
    typeof used.mood !== "string" ||
    typeof used.complexity !== "string"
  ) {
    return undefined;
  }
  return {
    requested: {
      genre: requested.genre,
      mood: requested.mood,
      complexity: requested.complexity
    },
    used: {
      genre: used.genre,
      mood: used.mood,
      complexity: used.complexity
    }
  };
}

export function normalizeProgress(value: unknown): UserProgress {
  if (!isRecord(value)) return { ...defaultProgress };
  const lastLessonSlug = typeof value.lastLessonSlug === "string" ? value.lastLessonSlug : undefined;
  return {
    completedLessonIds: normalizeStringArray(value.completedLessonIds),
    viewedLessonIds: normalizeStringArray(value.viewedLessonIds),
    quizScores: normalizeQuizScores(value.quizScores),
    listeningScores: normalizeQuizScores(value.listeningScores),
    exerciseScores: normalizeQuizScores(value.exerciseScores),
    hintUsage: normalizeNonNegativeCounts(value.hintUsage),
    projectSubmissions: normalizeProjectSubmissions(value.projectSubmissions),
    recentGeneratedProgressions: normalizeRecentProgressions(value.recentGeneratedProgressions),
    ...(lastLessonSlug ? { lastLessonSlug } : {})
  };
}

export function getOverallProgress(progress: UserProgress, totalLessons: number) {
  if (totalLessons <= 0) return 0;
  const completed = Math.min(totalLessons, new Set(progress.completedLessonIds).size);
  return Math.min(100, Math.max(0, Math.round((completed / totalLessons) * 100)));
}

export function addRecentProgression(progress: UserProgress, generated: GeneratedProgression): UserProgress {
  const generatedKey = getProgressionHistoryKey(generated);
  return {
    ...progress,
    recentGeneratedProgressions: [
      generated,
      ...progress.recentGeneratedProgressions.filter((item) => getProgressionHistoryKey(item) !== generatedKey)
    ].slice(0, 5)
  };
}
