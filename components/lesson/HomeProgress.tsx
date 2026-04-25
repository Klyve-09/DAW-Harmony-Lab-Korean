"use client";

import Link from "next/link";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { ProgressBar } from "@/components/layout/ProgressBar";

export function HomeProgress() {
  const { percent, progress } = useProgress(curriculum.length);
  const slug = progress.lastLessonSlug ?? "piano-roll-intervals-scales";

  return (
    <div>
      <ProgressBar value={percent} label="전체 진도율" />
      <Link href={`/lessons/${slug}`} className="mt-4 block rounded-sm border border-[#444] px-3 py-3 text-center text-sm hover:border-[#b8ff4d]">
        이어서 학습하기
      </Link>
    </div>
  );
}
