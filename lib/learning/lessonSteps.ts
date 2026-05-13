export type LessonStepId = "concept" | "example" | "listening" | "practice" | "quiz" | "finish";

export type LessonStepProgress = {
  complete: boolean;
  exampleDone: boolean;
  listeningPassed: boolean;
  exercisePassed: boolean;
  quizPassed: boolean;
};

export type LessonStep = {
  id: LessonStepId;
  label: string;
  description: string;
  done: boolean;
  locked: boolean;
};

export const lessonStepOrder: LessonStepId[] = ["concept", "example", "listening", "practice", "quiz", "finish"];

export function buildLessonSteps(progress: LessonStepProgress): LessonStep[] {
  return [
    {
      id: "concept",
      label: "개념",
      description: "오늘 배울 내용을 짧게 확인합니다.",
      done: true,
      locked: false
    },
    {
      id: "example",
      label: "예제",
      description: "피아노롤 예제를 먼저 듣습니다.",
      done: progress.exampleDone,
      locked: false
    },
    {
      id: "listening",
      label: "청음",
      description: "A/B를 듣고 차이를 고릅니다.",
      done: progress.listeningPassed,
      locked: !progress.exampleDone
    },
    {
      id: "practice",
      label: "실습",
      description: "직접 노트를 찍고 점수를 확인합니다.",
      done: progress.exercisePassed,
      locked: !progress.listeningPassed
    },
    {
      id: "quiz",
      label: "퀴즈",
      description: "핵심 개념을 문제로 확인합니다.",
      done: progress.quizPassed,
      locked: !progress.exercisePassed
    },
    {
      id: "finish",
      label: "완료",
      description: "통과 조건을 확인하고 다음 레슨으로 이동합니다.",
      done: progress.complete,
      locked: !progress.quizPassed
    }
  ];
}

export function getNextLessonStepId(steps: LessonStep[], activeStepId: LessonStepId): LessonStepId {
  const activeIndex = lessonStepOrder.indexOf(activeStepId);
  const nextStep = lessonStepOrder.slice(activeIndex + 1).map((id) => steps.find((step) => step.id === id)).find((step) => step && !step.locked);
  return nextStep?.id ?? activeStepId;
}

export function getFirstUnlockedLessonStepId(steps: LessonStep[]): LessonStepId {
  return steps.find((step) => !step.locked && !step.done)?.id ?? steps.find((step) => !step.locked)?.id ?? "concept";
}
