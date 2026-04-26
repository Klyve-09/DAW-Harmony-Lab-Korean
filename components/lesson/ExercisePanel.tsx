"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import type { Exercise } from "@/types/lesson";
import type { PianoRollNote } from "@/types/music";
import { MidiExportButton } from "@/components/audio/MidiExportButton";
import { PlayButton } from "@/components/audio/PlayButton";
import { DraggablePianoRoll } from "@/components/piano-roll/DraggablePianoRoll";
import { scoreExerciseAnswer, type ExerciseScoreResult } from "@/lib/utils";

export function ExercisePanel({
  exercise,
  savedScore,
  savedHintCount = 0,
  onActivity,
  onResult,
  onHintUsed
}: {
  exercise: Exercise;
  savedScore?: number;
  savedHintCount?: number;
  onActivity?: (hasNotes: boolean) => void;
  onResult?: (result: ExerciseScoreResult | undefined) => void;
  onHintUsed?: () => void;
}) {
  const [notes, setNotes] = useState<PianoRollNote[]>([]);
  const [result, setResult] = useState<ExerciseScoreResult>();
  const [visibleHints, setVisibleHints] = useState(0);
  const expectedCount = exercise.expectedNotes?.length ?? 0;
  const hints = exercise.hints ?? [];

  function handleNotesChange(next: PianoRollNote[]) {
    setNotes(next);
    setResult(undefined);
    onActivity?.(next.length > 0);
    onResult?.(undefined);
  }

  function check() {
    const nextResult = scoreExerciseAnswer(notes, exercise.expectedNotes ?? []);
    setResult(nextResult);
    onResult?.(nextResult);
  }

  function revealHint() {
    if (visibleHints >= hints.length) return;
    setVisibleHints((count) => count + 1);
    onHintUsed?.();
  }

  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold">{exercise.title}</h2>
        <span className="text-xs text-zinc-400">저장된 점수 {savedScore ?? "-"}%</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{exercise.instruction}</p>
      {expectedCount > 0 ? (
        <p className="mt-3 rounded-sm border border-[#3a3a3a] bg-[#181818] px-3 py-2 text-xs text-zinc-400">
          목표: 정답 노트 {expectedCount}개를 같은 옥타브와 박자 패턴에 맞춰 배치합니다.
        </p>
      ) : null}
      {hints.length > 0 ? (
        <div className="mt-3 rounded-sm border border-[#333333] bg-[#181818] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Lightbulb size={14} className="text-[#f8d76a]" aria-hidden />
              힌트 {Math.min(visibleHints, hints.length)}/{hints.length}
            </p>
            <button
              type="button"
              onClick={revealHint}
              disabled={visibleHints >= hints.length}
              className="min-h-9 rounded-sm border border-[#444] px-3 py-1 text-xs text-zinc-200 transition hover:border-[#f8d76a] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
            >
              힌트 보기
            </button>
          </div>
          {visibleHints > 0 ? (
            <ol className="mt-2 grid gap-1 text-xs leading-5 text-zinc-400">
              {hints.slice(0, visibleHints).map((hint, index) => (
                <li key={hint}>
                  {index + 1}. {hint}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-xs leading-5 text-zinc-500">막히면 한 단계씩 공개하세요. 누적 사용 {savedHintCount}회</p>
          )}
        </div>
      ) : null}
      <div className="mt-4">
        <DraggablePianoRoll value={notes} onChange={handleNotesChange} expectedNotes={exercise.expectedNotes} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={check}
          className="min-h-11 rounded-sm border border-[#b8ff4d] px-4 py-2 text-sm text-[#b8ff4d] transition hover:bg-[#26301d] active:scale-[0.98]"
        >
          정답 확인
        </button>
        <PlayButton notes={notes} label="내 노트 재생" />
        <MidiExportButton notes={notes} fileName={`${exercise.id}-practice`} />
      </div>
      {result ? (
        <div
          className={`mt-3 rounded-sm border p-3 text-sm ${
            result.passed ? "border-[#4a6b2a] bg-[#1f2a18] text-[#d7ff98]" : "border-[#5b4a14] bg-[#2a230f] text-zinc-200"
          }`}
          role="status"
        >
          <p className="font-semibold">
            점수 {result.score}% · {result.passed ? "숙달 기준 통과" : "80점 이상 필요"}
          </p>
          <p className="mt-1 leading-6 text-zinc-300">{result.message}</p>
          <div className="mt-3 grid gap-2">
            <FeedbackBlock title="좋은 점" items={result.good} />
            <FeedbackBlock title="고칠 점" items={result.fixes} />
            <div className="rounded-sm border border-[#3a3a3a] bg-[#181818] px-3 py-2">
              <p className="text-xs font-semibold text-[#5cd6ff]">다음 행동</p>
              <p className="mt-1 text-xs leading-5 text-zinc-300">{result.nextAction}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FeedbackBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-sm border border-[#3a3a3a] bg-[#181818] px-3 py-2">
      <p className="text-xs font-semibold text-zinc-200">{title}</p>
      <ul className="mt-1 space-y-1 text-xs leading-5 text-zinc-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
