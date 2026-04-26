"use client";

import { useState } from "react";
import type { Lesson } from "@/types/lesson";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";

export function QuizPanel({ lesson, onComplete }: { lesson: Lesson; onComplete?: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { saveQuizScore, progress } = useProgress(curriculum.length);

  const correctCount = lesson.quizzes.filter((quiz) => answers[quiz.id] === quiz.answer).length;
  const answeredCount = lesson.quizzes.filter((quiz) => answers[quiz.id]).length;
  const allAnswered = answeredCount === lesson.quizzes.length;
  const score = Math.round((correctCount / lesson.quizzes.length) * 100);

  function submit() {
    setSubmitted(true);
    if (!allAnswered) return;
    saveQuizScore(lesson.id, score);
    onComplete?.();
  }

  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">퀴즈</h2>
        <span className="text-xs text-zinc-400">저장된 점수 {progress.quizScores[lesson.id] ?? "-"}%</span>
      </div>
      <div className="space-y-5">
        {lesson.quizzes.map((quiz, index) => {
          const selected = answers[quiz.id];
          const correct = selected === quiz.answer;
          return (
            <div key={quiz.id} className="space-y-2">
              <p className="text-sm font-medium">
                {index + 1}. {quiz.question}
              </p>
              <div className="grid gap-2">
                {quiz.choices.map((choice) => {
                  const isSelected = selected === choice;
                  const isAnswer = choice === quiz.answer;
                  const showCorrect = submitted && isAnswer;
                  const showWrong = submitted && isSelected && !correct;
                  const className = showCorrect
                    ? "border-[#4a6b2a] bg-[#1f2a18] text-[#d7ff98]"
                    : showWrong
                      ? "border-[#7c2d2d] bg-[#2a1717] text-[#ffb3b3]"
                      : isSelected
                        ? "border-[#5cd6ff] bg-[#17303a] text-white"
                        : "border-[#3a3a3a] bg-[#262626] text-zinc-300 hover:border-[#5cd6ff]";
                  return (
                    <label
                      key={choice}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm transition active:scale-[0.99] ${className}`}
                    >
                      <input
                        type="radio"
                        name={quiz.id}
                        value={choice}
                        checked={isSelected}
                        onChange={() => {
                          setAnswers((prev) => ({ ...prev, [quiz.id]: choice }));
                          setSubmitted(false);
                        }}
                      />
                      <span className="flex-1">{choice}</span>
                      {showCorrect ? <span className="text-xs font-semibold">정답</span> : null}
                      {showWrong ? <span className="text-xs font-semibold">선택</span> : null}
                    </label>
                  );
                })}
              </div>
              {submitted && selected ? (
                <p className={correct ? "text-sm text-[#b8ff4d]" : "text-sm text-[#ff5c5c]"} role="status">
                  {correct ? "정답" : "오답"} · {quiz.explanation}
                </p>
              ) : null}
              {submitted && !selected ? <p className="text-sm text-[#ffcc00]" role="status">답을 선택하세요.</p> : null}
            </div>
          );
        })}
      </div>
      {submitted && !allAnswered ? (
        <p className="mt-4 rounded-sm border border-[#5b4a14] bg-[#2a230f] p-3 text-sm text-[#ffcc00]" role="alert">
          모든 문항을 선택하면 점수가 저장됩니다. 현재 {answeredCount}/{lesson.quizzes.length}문항을 선택했습니다.
        </p>
      ) : null}
      {submitted && allAnswered ? (
        <p
          className={`mt-4 rounded-sm border p-3 text-sm ${
            score >= 80 ? "border-[#4a6b2a] bg-[#1f2a18] text-[#d7ff98]" : "border-[#5b4a14] bg-[#2a230f] text-[#ffcc00]"
          }`}
          role="status"
        >
          점수 {score}%가 저장되었습니다. {score >= 80 ? "레슨 완료 기준을 통과했습니다." : "레슨 완료에는 80점 이상이 필요합니다."}
        </p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        className="mt-4 min-h-11 w-full rounded-sm bg-[#5cd6ff] px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#9be7ff] active:scale-[0.98]"
      >
        {allAnswered ? "정답 확인 및 점수 저장" : "선택한 답 확인"}
      </button>
    </section>
  );
}
