"use client";

import { useState } from "react";
import type { ListeningDrill } from "@/types/lesson";
import { PlayButton } from "@/components/audio/PlayButton";

export function ListeningPanel({
  drills,
  savedScore,
  onComplete
}: {
  drills: ListeningDrill[];
  savedScore?: number;
  onComplete?: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, "A" | "B">>({});
  const [submitted, setSubmitted] = useState(false);
  const answeredCount = drills.filter((drill) => answers[drill.id]).length;
  const allAnswered = answeredCount === drills.length;
  const correctCount = drills.filter((drill) => answers[drill.id] === drill.answerId).length;
  const score = drills.length > 0 ? Math.round((correctCount / drills.length) * 100) : 0;

  function submit() {
    setSubmitted(true);
    if (!allAnswered) return;
    onComplete?.(score);
  }

  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">A/B 청음</h2>
        <span className="text-xs text-zinc-400">저장된 점수 {savedScore ?? "-"}%</span>
      </div>
      <div className="space-y-4">
        {drills.map((drill, index) => (
          <div key={drill.id} className="rounded-sm border border-[#333333] bg-[#181818] p-3">
            <p className="text-sm font-medium">
              {index + 1}. {drill.prompt}
            </p>
            <div className="mt-3 grid gap-2">
              {drill.options.map((option) => {
                const selected = answers[drill.id] === option.id;
                const isAnswer = option.id === drill.answerId;
                const showCorrect = submitted && isAnswer;
                const showWrong = submitted && selected && !isAnswer;
                return (
                  <div
                    key={option.id}
                    className={`grid gap-2 rounded-sm border px-3 py-2 text-sm ${
                      showCorrect
                        ? "border-[#4a6b2a] bg-[#1f2a18]"
                        : showWrong
                          ? "border-[#7c2d2d] bg-[#2a1717]"
                          : selected
                            ? "border-[#5cd6ff] bg-[#17303a]"
                            : "border-[#3a3a3a] bg-[#262626]"
                    }`}
                  >
                    <label className="flex min-h-8 cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={drill.id}
                        value={option.id}
                        checked={selected}
                        onChange={() => {
                          setAnswers((prev) => ({ ...prev, [drill.id]: option.id }));
                          setSubmitted(false);
                        }}
                      />
                      <span className="flex-1">
                        {option.id}. {option.label}
                      </span>
                      {showCorrect ? <span className="text-xs font-semibold text-[#d7ff98]">정답</span> : null}
                      {showWrong ? <span className="text-xs font-semibold text-[#ffb3b3]">선택</span> : null}
                    </label>
                    <PlayButton notes={option.notes} label={`${option.id} 듣기`} />
                  </div>
                );
              })}
            </div>
            {submitted && answers[drill.id] ? (
              <p className={answers[drill.id] === drill.answerId ? "mt-2 text-sm text-[#b8ff4d]" : "mt-2 text-sm text-[#ff5c5c]"} role="status">
                {answers[drill.id] === drill.answerId ? "정답" : "오답"} · {drill.explanation}
              </p>
            ) : null}
            {submitted && !answers[drill.id] ? <p className="mt-2 text-sm text-[#ffcc00]">A 또는 B를 선택하세요.</p> : null}
          </div>
        ))}
      </div>
      {submitted && allAnswered ? (
        <p
          className={`mt-4 rounded-sm border p-3 text-sm ${
            score >= 80 ? "border-[#4a6b2a] bg-[#1f2a18] text-[#d7ff98]" : "border-[#5b4a14] bg-[#2a230f] text-[#ffcc00]"
          }`}
          role="status"
        >
          청음 점수 {score}%가 저장되었습니다. {score >= 80 ? "레슨 완료 기준을 통과했습니다." : "레슨 완료에는 80점 이상이 필요합니다."}
        </p>
      ) : null}
      {submitted && !allAnswered ? (
        <p className="mt-4 rounded-sm border border-[#5b4a14] bg-[#2a230f] p-3 text-sm text-[#ffcc00]" role="alert">
          모든 청음 문항을 선택하면 점수가 저장됩니다. 현재 {answeredCount}/{drills.length}문항을 선택했습니다.
        </p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        className="mt-4 min-h-11 w-full rounded-sm bg-[#5cd6ff] px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#9be7ff] active:scale-[0.98]"
      >
        {allAnswered ? "청음 정답 확인 및 점수 저장" : "선택한 청음 답 확인"}
      </button>
    </section>
  );
}
