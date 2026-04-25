"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { progress } = useProgress(curriculum.length);
  const complete = progress.completedLessonIds.includes(lesson.id);

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group flex h-full flex-col justify-between rounded-sm border border-[#333333] bg-[#1f1f1f] p-4 transition hover:border-[#5cd6ff]"
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-zinc-500">STEP {lesson.order.toString().padStart(2, "0")}</span>
          {complete ? <Check size={16} className="text-[#b8ff4d]" aria-label="완료" /> : null}
        </div>
        <h3 className="text-base font-semibold">{lesson.title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{lesson.description}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-sm text-[#5cd6ff]">
        학습하기 <ArrowRight size={14} className="transition group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
