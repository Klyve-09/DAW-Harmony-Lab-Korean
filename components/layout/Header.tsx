"use client";

import Link from "next/link";
import { Cpu, SlidersHorizontal } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { ProgressBar } from "@/components/layout/ProgressBar";

export function Header() {
  const { percent } = useProgress(curriculum.length);

  return (
    <header className="sticky top-0 z-30 border-b border-[#333333] bg-[#121212]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="DAW Harmony Lab 홈">
          <span className="flex size-9 items-center justify-center rounded-sm border border-[#444] bg-[#1f1f1f] text-[#b8ff4d]">
            <Cpu size={18} aria-hidden />
          </span>
          <span>
            <span className="block text-base font-semibold">DAW Harmony Lab</span>
            <span className="block text-xs text-zinc-400">피아노롤로 배우는 실전 화성학</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 md:min-w-[420px]">
          <ProgressBar value={percent} label="전체 학습률" />
          <Link
            href="/generator"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm border border-[#444] bg-[#262626] px-3 text-sm transition hover:border-[#5cd6ff] active:scale-[0.98]"
          >
            <SlidersHorizontal size={16} aria-hidden />
            생성기
          </Link>
        </div>
      </div>
    </header>
  );
}
