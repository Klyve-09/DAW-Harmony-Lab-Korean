import type { Lesson } from "@/types/lesson";
import type { UserProgress } from "@/types/progress";

export type SkillStateKey = "unstarted" | "viewed" | "built" | "listened" | "varied" | "project";

export type SkillTreeLevel = {
  id: string;
  title: string;
  description: string;
  lessonSlugs: string[];
};

export type LessonSkillState = {
  key: SkillStateKey;
  label: string;
  rank: number;
};

export const skillStateOrder: Record<SkillStateKey, LessonSkillState> = {
  unstarted: { key: "unstarted", label: "미학습", rank: 0 },
  viewed: { key: "viewed", label: "설명 봄", rank: 1 },
  built: { key: "built", label: "따라 만들기 완료", rank: 2 },
  listened: { key: "listened", label: "청음 통과", rank: 3 },
  varied: { key: "varied", label: "변형 과제 통과", rank: 4 },
  project: { key: "project", label: "프로젝트에 사용함", rank: 5 }
};

export const skillTreeLevels: SkillTreeLevel[] = [
  {
    id: "foundation",
    title: "피아노롤 기초",
    description: "스케일, 3화음, 로마 숫자, 기능을 DAW 그리드에 연결합니다.",
    lessonSlugs: ["piano-roll-intervals-scales", "triads", "roman-numerals", "chord-functions"]
  },
  {
    id: "color-voicing",
    title: "색채와 보이싱",
    description: "7th, 인버전, 베이스, 텐션으로 실제 루프의 질감을 만듭니다.",
    lessonSlugs: ["seventh-chords", "voicing-inversions", "basslines-slash-chords", "tensions-add-sus"]
  },
  {
    id: "expansion",
    title: "확장 화성",
    description: "세컨더리 도미넌트, 모달 인터체인지, 모드, 리하모니를 다룹니다.",
    lessonSlugs: ["secondary-dominants", "modal-interchange", "modes", "reharmonization"]
  },
  {
    id: "production",
    title: "장르와 편곡",
    description: "장르 어휘, 멜로디 충돌, 편곡 레이어로 프로젝트에 적용합니다.",
    lessonSlugs: ["genre-vocabulary", "melody-and-chords", "arrangement-expansion"]
  }
];

export function getLessonSkillState(lesson: Lesson, progress: UserProgress): LessonSkillState {
  const quizPassed = (progress.quizScores[lesson.id] ?? 0) >= 80;
  const exercisePassed = (progress.exerciseScores?.[lesson.id] ?? 0) >= 80;
  const listeningPassed = (progress.listeningScores?.[lesson.id] ?? 0) >= 80;
  const projectPassed = lesson.projectCheckpoint ? (progress.projectSubmissions?.[lesson.projectCheckpoint.id]?.score ?? 0) >= 80 : false;

  if (projectPassed) return skillStateOrder.project;
  if (progress.completedLessonIds.includes(lesson.id) || (quizPassed && exercisePassed && listeningPassed)) return skillStateOrder.varied;
  if (exercisePassed && listeningPassed) return skillStateOrder.listened;
  if (exercisePassed) return skillStateOrder.built;
  if (progress.viewedLessonIds?.includes(lesson.id) || progress.lastLessonSlug === lesson.slug) return skillStateOrder.viewed;
  return skillStateOrder.unstarted;
}

export function getSkillTreeGroups(lessons: Lesson[], progress: UserProgress) {
  return skillTreeLevels.map((level) => {
    const levelLessons = level.lessonSlugs.flatMap((slug) => {
      const lesson = lessons.find((item) => item.slug === slug);
      return lesson ? [{ lesson, state: getLessonSkillState(lesson, progress) }] : [];
    });
    const completed = levelLessons.filter((item) => item.state.rank >= skillStateOrder.varied.rank).length;
    const usedInProject = levelLessons.filter((item) => item.state.key === "project").length;
    return {
      ...level,
      lessons: levelLessons,
      completed,
      usedInProject,
      total: levelLessons.length,
      percent: levelLessons.length > 0 ? Math.round((completed / levelLessons.length) * 100) : 0
    };
  });
}
