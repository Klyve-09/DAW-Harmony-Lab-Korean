import type { Lesson } from "@/types/lesson";
import type { UserProgress } from "@/types/progress";

export type DailyReviewTask = {
  id: string;
  label: string;
  title: string;
  detail: string;
  href: string;
};

function lessonHref(lesson: Lesson) {
  return `/lessons/${lesson.slug}`;
}

function findLessonBySlug(lessons: Lesson[], slug?: string) {
  return slug ? lessons.find((lesson) => lesson.slug === slug) : undefined;
}

function findWeakLesson(lessons: Lesson[], progress: UserProgress) {
  return lessons.find((lesson) => {
    if (progress.completedLessonIds.includes(lesson.id)) return false;
    const scores = [progress.listeningScores?.[lesson.id], progress.exerciseScores?.[lesson.id], progress.quizScores[lesson.id]].filter(
      (score): score is number => typeof score === "number"
    );
    return scores.some((score) => score < 80);
  });
}

function findNextLesson(lessons: Lesson[], progress: UserProgress) {
  const last = findLessonBySlug(lessons, progress.lastLessonSlug);
  const afterLast = last ? lessons.find((lesson) => lesson.order > last.order && !progress.completedLessonIds.includes(lesson.id)) : undefined;
  return afterLast ?? lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? lessons[0];
}

function findProjectLesson(lessons: Lesson[], progress: UserProgress) {
  return lessons.find((lesson) => {
    if (!lesson.projectCheckpoint) return false;
    return (progress.projectSubmissions?.[lesson.projectCheckpoint.id]?.score ?? 0) < 80;
  });
}

export function buildDailyReviewTasks(lessons: Lesson[], progress: UserProgress): DailyReviewTask[] {
  const tasks: DailyReviewTask[] = [];
  const weakLesson = findWeakLesson(lessons, progress);
  const currentLesson = findLessonBySlug(lessons, progress.lastLessonSlug) ?? findNextLesson(lessons, progress);
  const projectLesson = findProjectLesson(lessons, progress);

  if (weakLesson) {
    tasks.push({
      id: `weak-${weakLesson.id}`,
      label: "보강",
      title: `${weakLesson.title} 80점 회복`,
      detail: "청음, 실습, 퀴즈 중 80점 미만인 항목을 먼저 다시 통과하세요.",
      href: lessonHref(weakLesson)
    });
  }

  if (currentLesson && currentLesson.id !== weakLesson?.id) {
    tasks.push({
      id: `continue-${currentLesson.id}`,
      label: "이어하기",
      title: `${currentLesson.order}단계 5분 루틴`,
      detail: "예제를 한 번 듣고, 실습 피아노롤에서 첫 코드나 첫 음부터 다시 찍습니다.",
      href: lessonHref(currentLesson)
    });
  }

  if (projectLesson?.projectCheckpoint) {
    tasks.push({
      id: `project-${projectLesson.id}`,
      label: "프로젝트",
      title: `${projectLesson.projectCheckpoint.genre} 4마디 저장`,
      detail: "체크리스트 3개를 확인하고 80점 이상으로 프로젝트 사용 기록을 남기세요.",
      href: lessonHref(projectLesson)
    });
  }

  if (progress.recentGeneratedProgressions.length > 0) {
    const recent = progress.recentGeneratedProgressions[0];
    tasks.push({
      id: `generated-${recent.id}`,
      label: "응용",
      title: `${recent.genre} 진행 MIDI 내보내기`,
      detail: `${recent.key} · ${recent.romanNumerals.join("-")} 진행을 DAW로 가져가 비교하세요.`,
      href: "/generator"
    });
  }

  if (tasks.length < 3 && lessons[0]) {
    tasks.push({
      id: "starter-scale",
      label: "기초",
      title: "C major 스케일 재점검",
      detail: "흰 건반 스케일을 반 박 단위로 찍고 A/B 청음으로 중심음을 확인하세요.",
      href: lessonHref(lessons[0])
    });
  }

  return tasks.filter((task, index, list) => list.findIndex((item) => item.id === task.id) === index).slice(0, 3);
}
