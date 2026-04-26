"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ListMusic } from "lucide-react";
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
import type { ExerciseScoreResult } from "@/lib/utils";

export function LessonContent({ lesson }: { lesson: Lesson }) {
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
  const checklistItems = [
    { label: "예제 듣기", done: exampleDone },
    { label: "청음 80점 이상", done: listeningPassed },
    { label: "실습 80점 이상", done: exercisePassed },
    { label: "퀴즈 80점 이상", done: quizPassed },
    { label: "레슨 완료", done: complete }
  ];
  const canComplete = exampleDone && listeningPassed && exercisePassed && quizPassed;

  useEffect(() => {
    setLastLesson(lesson.slug, lesson.id);
  }, [lesson.id, lesson.slug, setLastLesson]);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_380px]">
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
        <LearningChecklist items={checklistItems} />
        <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-5">
          <h2 className="text-base font-semibold">핵심 설명</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-300">{lesson.content}</p>
          <h3 className="mt-5 text-sm font-semibold text-[#b8ff4d]">DAW 실습</h3>
          <p className="mt-2 text-sm leading-7 text-zinc-300">{lesson.dawPractice}</p>
        </section>
        <section className="overflow-hidden rounded-sm border border-[#333333] bg-[#1f1f1f]">
          <div className="p-4">
            <h2 className="text-base font-semibold">{example.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{example.description}</p>
          </div>
          <PianoRollPlaybackPanel
            notes={example.notes}
            chords={example.chords}
            beats={Math.max(4, example.chords?.length ?? 4)}
            fileName={`${lesson.slug}-example`}
            markers={example.romanNumerals ?? example.chords?.map((chord) => chord.name)}
            scaleKey={example.key}
            showVoiceLeading={lesson.slug === "voicing-inversions" || lesson.slug === "arrangement-expansion"}
            onPlayStart={() => setExamplePlayed(true)}
          />
        </section>
        <CommonMistakesPanel mistakes={lesson.commonMistakes} />
        {lesson.slug === "melody-and-chords" ? <MelodyConflictPanel notes={example.notes} chord={example.chords?.[0]} /> : null}
        {lesson.projectCheckpoint ? <ProjectCheckpointPanel checkpoint={lesson.projectCheckpoint} lessonId={lesson.id} /> : null}
      </article>
      <aside className="space-y-4">
        <ListeningPanel drills={lesson.listeningDrills} savedScore={listeningScore} onComplete={(score) => saveListeningScore(lesson.id, score)} />
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
        <QuizPanel lesson={lesson} />
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
      </aside>
    </div>
  );
}

function LearningChecklist({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <section className="rounded-sm border border-[#333333] bg-[#181818] p-4" aria-label="레슨 진행 체크리스트">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">이번 레슨 진행</h2>
        <span className="text-xs text-zinc-500">
          {items.filter((item) => item.done).length}/{items.length}
        </span>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.label}
            className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-xs ${
              item.done ? "border-[#4a6b2a] bg-[#1f2a18] text-[#d7ff98]" : "border-[#333333] bg-[#202020] text-zinc-400"
            }`}
          >
            {item.done ? (
              <CheckCircle size={14} aria-hidden />
            ) : (
              <span className="size-[14px] rounded-full border border-[#555]" aria-hidden />
            )}
            {item.label}
          </li>
        ))}
      </ol>
    </section>
  );
}
