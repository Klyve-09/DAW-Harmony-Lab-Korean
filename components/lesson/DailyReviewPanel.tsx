"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { buildDailyReviewTasks } from "@/lib/learning/dailyReview";

export function DailyReviewPanel() {
  const { progress } = useProgress(curriculum.length);
  const tasks = buildDailyReviewTasks(curriculum, progress);

  return (
    <section className="mt-6 rounded-sm border border-[#333333] bg-[#181818] p-4" aria-label="오늘의 5분 루틴">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-[#b8ff4d]">Today</p>
          <h2 className="mt-1 text-sm font-semibold">오늘의 5분</h2>
        </div>
        <Clock3 size={17} className="text-zinc-500" aria-hidden />
      </div>
      <div className="mt-3 grid gap-2">
        {tasks.map((task) => (
          <Link key={task.id} href={task.href} className="group rounded-sm border border-[#333333] bg-[#202020] p-3 transition hover:border-[#5cd6ff]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-sm border border-[#444] px-2 py-1 text-[11px] text-zinc-300">{task.label}</span>
              <ArrowRight size={14} className="text-[#5cd6ff] transition group-hover:translate-x-1" aria-hidden />
            </div>
            <p className="mt-2 text-sm font-semibold">{task.title}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{task.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
