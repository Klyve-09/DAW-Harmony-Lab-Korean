"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { getLessonSkillState } from "@/lib/learning/skillTree";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { progress } = useProgress(curriculum.length);

  return (
    <aside className="border-b border-[#333333] bg-[#1a1a1a] md:sticky md:top-[65px] md:h-[calc(100vh-65px)] md:w-72 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="p-3 md:p-4">
        <label className="mb-2 block text-xs font-semibold uppercase text-zinc-500 md:hidden" htmlFor="lesson-jump">
          Lesson
        </label>
        <select
          id="lesson-jump"
          className="mb-3 min-h-11 w-full rounded-sm border border-[#444] bg-[#262626] p-2 text-sm md:hidden"
          value={pathname.startsWith("/lessons/") ? pathname.split("/").pop() : ""}
          onChange={(event) => {
            if (event.target.value) router.push(`/lessons/${event.target.value}`);
          }}
        >
          <option value="">레슨 선택</option>
          {curriculum.map((lesson) => (
            <option key={lesson.id} value={lesson.slug}>
              {lesson.order}. {lesson.title}
            </option>
          ))}
        </select>
        <nav className="hidden space-y-1 md:block" aria-label="15단계 커리큘럼">
          {curriculum.map((lesson) => {
            const active = pathname === `/lessons/${lesson.slug}`;
            const complete = progress.completedLessonIds.includes(lesson.id);
            const state = getLessonSkillState(lesson, progress);
            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className={`flex items-center gap-3 rounded-sm border px-3 py-2 text-sm transition ${
                  active ? "border-[#b8ff4d] bg-[#26301d] text-white" : "border-transparent text-zinc-300 hover:border-[#444] hover:bg-[#222]"
                }`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-[#262626] text-xs">
                  {complete ? <Check size={14} className="text-[#b8ff4d]" aria-label="완료" /> : lesson.order}
                </span>
                <span className="min-w-0 leading-tight [word-break:keep-all]">
                  <span className="block">{lesson.title}</span>
                  <span className="mt-1 block text-[11px] text-zinc-500">{state.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
