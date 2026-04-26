"use client";

import Link from "next/link";
import { CheckCircle, Circle, Headphones, PenLine, Sparkles } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { getSkillTreeGroups, type SkillStateKey } from "@/lib/learning/skillTree";

const stateTone: Record<SkillStateKey, string> = {
  unstarted: "border-[#333333] text-zinc-500",
  viewed: "border-[#5a5140] bg-[#241f16] text-zinc-300",
  built: "border-[#37506b] bg-[#17212b] text-[#9fd2ff]",
  listened: "border-[#426140] bg-[#172617] text-[#b8ff4d]",
  varied: "border-[#5b4a14] bg-[#2a230f] text-[#f8d76a]",
  project: "border-[#5b3f76] bg-[#24182f] text-[#d8b4fe]"
};

const stateIcon: Record<SkillStateKey, typeof Circle> = {
  unstarted: Circle,
  viewed: PenLine,
  built: CheckCircle,
  listened: Headphones,
  varied: Sparkles,
  project: CheckCircle
};

export function SkillTreePanel({ compact = false }: { compact?: boolean }) {
  const { progress } = useProgress(curriculum.length);
  const groups = getSkillTreeGroups(curriculum, progress);

  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-5" aria-label="스킬트리 숙달 상태">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-[#5cd6ff]">Skill tree</p>
          <h2 className="mt-1 text-lg font-semibold">숙달 상태</h2>
        </div>
        <div className="text-xs text-zinc-500">설명 봄 → 따라 만들기 → 청음 → 변형 → 프로젝트</div>
      </div>
      <div className={`mt-4 grid gap-3 ${compact ? "" : "xl:grid-cols-2"}`}>
        {groups.map((group) => (
          <div key={group.id} className="rounded-sm border border-[#333333] bg-[#181818] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{group.description}</p>
              </div>
              <span className="shrink-0 rounded-sm border border-[#444] px-2 py-1 text-xs text-zinc-300">
                {group.completed}/{group.total}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#2a2a2a]" aria-hidden="true">
              <div className="h-full bg-[#b8ff4d]" style={{ width: `${group.percent}%` }} />
            </div>
            <div className="mt-3 grid gap-2">
              {group.lessons.map(({ lesson, state }) => {
                const Icon = stateIcon[state.key];
                return (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.slug}`}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-sm border px-3 py-2 text-xs transition hover:border-[#5cd6ff] ${stateTone[state.key]}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon size={14} aria-hidden />
                      <span className="truncate">{lesson.order}. {lesson.title}</span>
                    </span>
                    <span className="shrink-0">{state.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
