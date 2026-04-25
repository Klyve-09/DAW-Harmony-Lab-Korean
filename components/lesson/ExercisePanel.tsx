"use client";

import { useState } from "react";
import type { Exercise } from "@/types/lesson";
import type { PianoRollNote } from "@/types/music";
import { PlayButton } from "@/components/audio/PlayButton";
import { DraggablePianoRoll } from "@/components/piano-roll/DraggablePianoRoll";
import { scoreExerciseAnswer } from "@/lib/utils";

export function ExercisePanel({
  exercise,
  onActivity
}: {
  exercise: Exercise;
  onActivity?: (hasNotes: boolean) => void;
}) {
  const [notes, setNotes] = useState<PianoRollNote[]>([]);
  const [result, setResult] = useState<{ score: number; message: string }>();
  const expectedCount = exercise.expectedNotes?.length ?? 0;

  function handleNotesChange(next: PianoRollNote[]) {
    setNotes(next);
    setResult(undefined);
    onActivity?.(next.length > 0);
  }

  function check() {
    setResult(scoreExerciseAnswer(notes, exercise.expectedNotes ?? []));
  }

  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
      <h2 className="text-base font-semibold">{exercise.title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{exercise.instruction}</p>
      {expectedCount > 0 ? (
        <p className="mt-3 rounded-sm border border-[#3a3a3a] bg-[#181818] px-3 py-2 text-xs text-zinc-400">
          목표: 정답 노트 {expectedCount}개를 같은 옥타브와 박자 패턴에 맞춰 배치합니다.
        </p>
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
      </div>
      {result ? (
        <div
          className={`mt-3 rounded-sm border p-3 text-sm ${
            result.score === 100 ? "border-[#4a6b2a] bg-[#1f2a18] text-[#d7ff98]" : "border-[#444] bg-[#262626] text-zinc-200"
          }`}
          role="status"
        >
          <p className="font-semibold">점수 {result.score}%</p>
          <p className="mt-1 leading-6 text-zinc-300">{result.message}</p>
        </div>
      ) : null}
    </section>
  );
}
