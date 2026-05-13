"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ChevronLeft, ChevronRight, ListMusic, Lock } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { PianoRollPlaybackPanel } from "@/components/audio/PianoRollPlaybackPanel";
import { CommonMistakesPanel } from "@/components/lesson/CommonMistakesPanel";
import { ExercisePanel } from "@/components/lesson/ExercisePanel";
import { ListeningPanel } from "@/components/lesson/ListeningPanel";
import { MelodyConflictPanel } from "@/components/lesson/MelodyConflictPanel";
import { ProjectCheckpointPanel } from "@/components/lesson/ProjectCheckpointPanel";
import { QuizPanel } from "@/components/lesson/QuizPanel";
import type { ExerciseScoreResult } from "@/lib/learning/exerciseScoring";
import { buildLessonSteps, getNextLessonStepId, type LessonStepId } from "@/lib/learning/lessonSteps";

export function LessonContent({ lesson }: { lesson: Lesson }) {
  const [activeStepId, setActiveStepId] = useState<LessonStepId>("concept");
  const [examplePlayed, setExamplePlayed] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [exerciseResult, setExerciseResult] = useState<ExerciseScoreResult>();
  const { completeLesson, progress, recordHintUsage, saveExerciseScore, saveListeningScore, setLastLesson } = useProgress(curriculum.length);
  const example = lesson.examples[0];
  const complete = progress.completedLessonIds.includes(lesson.id);
  const next = curriculum.find((item) => item.order === lesson.order + 1);
  const quizScore = progress.quizScores[lesson.id];
  const listeningScore = progress.listeningScores?.[lesson.id];
  const savedExerciseScore = progress.exerciseScores?.[lesson.id];
  const exampleDone = complete || examplePlayed;
  const listeningPassed = complete || (listeningScore ?? 0) >= 80;
  const exerciseScore = exerciseResult?.score ?? savedExerciseScore;
  const exercisePassed = complete || (exerciseScore ?? 0) >= 80;
  const quizPassed = complete || (quizScore ?? 0) >= 80;
  const canComplete = exampleDone && listeningPassed && exercisePassed && quizPassed;
  const steps = buildLessonSteps({ complete, exampleDone, listeningPassed, exercisePassed, quizPassed });
  const requestedStep = steps.find((step) => step.id === activeStepId) ?? steps[0];
  const activeStep = requestedStep.locked ? steps[0] : requestedStep;
  const activeStepIndex = steps.findIndex((step) => step.id === activeStep.id);
  const previousStep = [...steps].slice(0, activeStepIndex).reverse().find((step) => !step.locked);
  const nextStepId = getNextLessonStepId(steps, activeStep.id);
  const canMoveNext = nextStepId !== activeStep.id;

  useEffect(() => {
    setLastLesson(lesson.slug, lesson.id);
  }, [lesson.id, lesson.slug, setLastLesson]);

  function moveNext() {
    if (canMoveNext) setActiveStepId(nextStepId);
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <LessonStepPath steps={steps} activeStepId={activeStep.id} onSelect={setActiveStepId} />
      </aside>
      <article className="space-y-4">
        <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-5">
          <div className="mb-3 flex items-center gap-2 text-xs text-[#5cd6ff]">
            <ListMusic size={14} aria-hidden />
            STEP {lesson.order.toString().padStart(2, "0")}
          </div>
          <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">{lesson.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{lesson.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {lesson.concepts.map((concept) => (
              <span key={concept} className="rounded-sm border border-[#444] bg-[#262626] px-2 py-1 text-xs text-zinc-300">
                {concept}
              </span>
            ))}
          </div>
        </section>
        <StepFrame
          eyebrow={`${activeStepIndex + 1}/${steps.length}`}
          title={activeStep.label}
          description={activeStep.description}
          footer={
            <StepNavigation
              previousLabel={previousStep?.label}
              nextLabel={steps.find((step) => step.id === nextStepId)?.label}
              canMoveNext={canMoveNext}
              onPrevious={previousStep ? () => setActiveStepId(previousStep.id) : undefined}
              onNext={moveNext}
            />
          }
        >
          {activeStep.id === "concept" ? (
            <div className="space-y-4">
              <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-5">
                <h2 className="text-base font-semibold">핵심 설명</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{lesson.content}</p>
                <h3 className="mt-5 text-sm font-semibold text-[#b8ff4d]">DAW 실습</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-300">{lesson.dawPractice}</p>
              </section>
              <CommonMistakesPanel mistakes={lesson.commonMistakes} />
            </div>
          ) : null}
          {activeStep.id === "example" ? (
            <section className="overflow-hidden rounded-sm border border-[#333333] bg-[#1f1f1f]">
              <div className="p-4">
                <h2 className="text-base font-semibold">{example.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{example.description}</p>
                <p className="mt-3 text-xs text-zinc-500">예제를 한 번 재생하면 다음 청음 단계가 열립니다.</p>
              </div>
              <PianoRollPlaybackPanel
                notes={example.notes}
                chords={example.chords}
                beats={Math.max(4, example.chords?.length ?? 4)}
                fileName={`${lesson.slug}-example`}
                markers={example.romanNumerals ?? example.chords?.map((chord) => chord.name)}
                scaleKey={example.key}
                showVoiceLeading={lesson.slug === "voicing-inversions" || lesson.slug === "arrangement-expansion"}
                voiceLeadingMode={lesson.slug === "voicing-inversions" ? "position" : "role"}
                onPlayStart={() => setExamplePlayed(true)}
              />
            </section>
          ) : null}
          {activeStep.id === "listening" ? (
            <ListeningPanel drills={lesson.listeningDrills} savedScore={listeningScore} onComplete={(score) => saveListeningScore(lesson.id, score)} />
          ) : null}
          {activeStep.id === "practice" ? (
            <div className="space-y-4">
              {lesson.slug === "melody-and-chords" ? <MelodyConflictPanel notes={example.notes} chord={example.chords?.[0]} /> : null}
              <ExercisePanel
                exercise={lesson.exercises[0]}
                savedScore={savedExerciseScore}
                savedHintCount={progress.hintUsage?.[lesson.exercises[0].id] ?? 0}
                scaleKey={example.key}
                onActivity={setExerciseStarted}
                onHintUsed={() => recordHintUsage(lesson.exercises[0].id)}
                onResult={(result) => {
                  setExerciseResult(result);
                  if (result) saveExerciseScore(lesson.id, result.score);
                }}
              />
            </div>
          ) : null}
          {activeStep.id === "quiz" ? <QuizPanel lesson={lesson} /> : null}
          {activeStep.id === "finish" ? (
            <div className="space-y-4">
              {lesson.projectCheckpoint ? <ProjectCheckpointPanel checkpoint={lesson.projectCheckpoint} lessonId={lesson.id} /> : null}
              <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
                <button
                  type="button"
                  onClick={() => {
                    if (canComplete && !complete) completeLesson(lesson.id, lesson.slug);
                  }}
                  disabled={complete || !canComplete}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#b8ff4d] px-3 py-3 text-sm font-semibold text-black transition hover:bg-[#d7ff98] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
                >
                  <CheckCircle size={16} aria-hidden />
                  {complete ? "완료됨" : "레슨 완료"}
                </button>
                {!complete && !canComplete ? (
                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    예제 재생, 청음 80점 이상, 실습 80점 이상, 퀴즈 80점 이상을 모두 통과해야 완료할 수 있습니다.
                    {listeningScore !== undefined && !listeningPassed ? ` 현재 청음 점수는 ${listeningScore}%입니다.` : ""}
                    {(exerciseStarted || savedExerciseScore !== undefined) && !exercisePassed ? ` 현재 실습 점수는 ${exerciseScore ?? 0}%입니다.` : ""}
                    {quizScore !== undefined && !quizPassed ? ` 현재 퀴즈 점수는 ${quizScore}%입니다.` : ""}
                  </p>
                ) : null}
                {next ? (
                  <Link
                    href={`/lessons/${next.slug}`}
                    className="mt-3 block min-h-11 rounded-sm border border-[#444] px-3 py-3 text-center text-sm transition hover:border-[#5cd6ff] active:scale-[0.98]"
                  >
                    다음 단계로 이동
                  </Link>
                ) : (
                  <Link href="/generator" className="mt-3 block min-h-11 rounded-sm border border-[#444] px-3 py-3 text-center text-sm transition hover:border-[#5cd6ff] active:scale-[0.98]">
                    생성기로 실습 확장
                  </Link>
                )}
              </section>
            </div>
          ) : null}
        </StepFrame>
      </article>
    </div>
  );
}

function LessonStepPath({
  steps,
  activeStepId,
  onSelect
}: {
  steps: ReturnType<typeof buildLessonSteps>;
  activeStepId: LessonStepId;
  onSelect: (stepId: LessonStepId) => void;
}) {
  return (
    <section className="rounded-sm border border-[#333333] bg-[#181818] p-4" aria-label="레슨 단계">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">단계별 학습</h2>
        <span className="text-xs text-zinc-500">
          {steps.filter((step) => step.done).length}/{steps.length}
        </span>
      </div>
      <ol className="grid gap-2">
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onSelect(step.id)}
              disabled={step.locked}
              aria-current={activeStepId === step.id ? "step" : undefined}
              className={`grid min-h-16 w-full grid-cols-[28px_1fr] items-center gap-3 rounded-sm border px-3 py-2 text-left transition ${
                activeStepId === step.id
                  ? "border-[#5cd6ff] bg-[#17303a] text-white"
                  : step.done
                    ? "border-[#4a6b2a] bg-[#1f2a18] text-[#d7ff98]"
                    : "border-[#333333] bg-[#202020] text-zinc-400 hover:border-[#5cd6ff]"
              } disabled:cursor-not-allowed disabled:border-[#333333] disabled:bg-[#181818] disabled:text-zinc-600`}
            >
              <span className="flex size-7 items-center justify-center rounded-sm border border-current text-xs font-semibold">
                {step.locked ? <Lock size={13} aria-hidden /> : step.done ? <CheckCircle size={14} aria-hidden /> : index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold">{step.label}</span>
                <span className="mt-1 block text-xs leading-4 opacity-75">{step.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepFrame({
  eyebrow,
  title,
  description,
  footer,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-sm border border-[#333333] bg-[#181818]">
      <div className="border-b border-[#333333] p-4">
        <p className="text-xs font-semibold text-[#5cd6ff]">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-normal">{title}</h2>
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      </div>
      <div className="p-4">{children}</div>
      <div className="border-t border-[#333333] p-4">{footer}</div>
    </section>
  );
}

function StepNavigation({
  previousLabel,
  nextLabel,
  canMoveNext,
  onPrevious,
  onNext
}: {
  previousLabel?: string;
  nextLabel?: string;
  canMoveNext: boolean;
  onPrevious?: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!onPrevious}
        className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-[#444] px-3 py-2 text-sm text-zinc-200 transition hover:border-[#5cd6ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
      >
        <ChevronLeft size={16} aria-hidden />
        {previousLabel ?? "이전"}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canMoveNext}
        className="inline-flex min-h-10 items-center gap-2 rounded-sm bg-[#5cd6ff] px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#9be7ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
      >
        {nextLabel && canMoveNext ? `다음: ${nextLabel}` : "다음 단계 잠김"}
        <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  );
}
