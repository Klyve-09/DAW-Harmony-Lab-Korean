import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Music2, PlayCircle, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LessonCard } from "@/components/lesson/LessonCard";
import { curriculum } from "@/data/curriculum";
import { HomeProgress } from "@/components/lesson/HomeProgress";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  return (
    <AppShell sidebar={false}>
      <div className="p-4">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6 rounded-sm border border-[#333333] bg-[#1f1f1f] p-6 md:p-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(380px,1fr)]">
            <div className="self-center">
              <p className="text-sm font-semibold text-[#b8ff4d]">DAW Harmony Lab</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight [word-break:keep-all] md:text-4xl 2xl:text-5xl">
                피아노롤로 배우는 실전 화성학
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
                악보보다 MIDI 노트, 코드 이름보다 실제 피아노롤 배치를 먼저 익히는 DAW 입문자용 인터랙티브 커리큘럼입니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <HomeContinueButton />
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-2 rounded-sm border border-[#444] px-4 py-3 text-sm hover:border-[#5cd6ff]"
                >
                  <SlidersHorizontal size={16} aria-hidden />
                  코드 진행 생성기
                </Link>
              </div>
            </div>
            <HeroPianoPreview />
          </div>
          <div className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-5">
            <HomeProgress />
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <Metric label="Lessons" value="15" />
              <Metric label="Quiz" value="30+" />
              <Metric label="BPM" value="90" />
            </div>
            <div className="mt-6 rounded-sm border border-[#333333] bg-[#181818] p-4">
              <p className="text-sm font-semibold">오늘의 시작점</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">C major 스케일을 찍고, C-G-Am-F를 들어본 뒤 같은 진행을 다른 키로 옮겨보세요.</p>
            </div>
          </div>
        </section>
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">15단계 커리큘럼</h2>
            <Link href="/lessons" className="inline-flex items-center gap-1 text-sm text-[#5cd6ff]">
              전체 보기 <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {curriculum.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function HeroPianoPreview() {
  const bars = [
    { label: "C4", top: 132, left: 80, width: 74, color: "bg-[#ffcc00]" },
    { label: "E4", top: 96, left: 80, width: 92, color: "bg-[#b8ff4d]" },
    { label: "G4", top: 62, left: 80, width: 104, color: "bg-[#b8ff4d]" },
    { label: "G3", top: 152, left: 214, width: 78, color: "bg-[#ffcc00]" },
    { label: "B4", top: 78, left: 214, width: 92, color: "bg-[#b8ff4d]" },
    { label: "D5", top: 42, left: 214, width: 84, color: "bg-[#5cd6ff]" },
    { label: "A3", top: 142, left: 344, width: 78, color: "bg-[#ffcc00]" },
    { label: "C5", top: 54, left: 344, width: 106, color: "bg-[#b8ff4d]" },
    { label: "F3", top: 160, left: 476, width: 84, color: "bg-[#ffcc00]" },
    { label: "A4", top: 88, left: 476, width: 98, color: "bg-[#b8ff4d]" }
  ];

  return (
    <div className="min-w-0 self-stretch rounded-sm border border-[#333333] bg-[#161818]" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-[#333333] px-3 py-2 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Music2 size={14} className="text-[#b8ff4d]" />
          I - V - vi - IV / C major
        </span>
        <span>BPM 90</span>
      </div>
      <div className="overflow-x-auto">
        <div className="relative h-[230px] min-w-[640px] bg-[#1d2022]">
          <div className="absolute inset-y-0 left-0 w-16 border-r border-[#34383a] bg-[#f5f5f5]">
            {["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"].map((label) => (
              <div key={label} className="flex h-[28px] items-center justify-end border-b border-zinc-300 pr-2 text-[10px] font-semibold text-zinc-700">
                {label}
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-16 right-0 roll-grid">
            {[0, 1, 2, 3].map((beat) => (
              <div key={beat} className="absolute top-0 h-full border-l border-[#4a4f52]" style={{ left: beat * 132 }}>
                <span className="ml-2 text-[10px] text-zinc-400">{beat + 1}</span>
              </div>
            ))}
            <div className="absolute bottom-0 top-0 w-px bg-[#b8ff4d]" style={{ left: 44 }} />
            {bars.map((bar) => (
              <div
                key={`${bar.label}-${bar.left}`}
                className={`absolute h-[18px] rounded-[3px] px-2 text-[10px] font-semibold text-black ${bar.color}`}
                style={{ top: bar.top, left: bar.left, width: bar.width }}
              >
                {bar.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-[#333333] text-center text-xs">
        <div className="p-3">
          <div className="font-semibold text-white">코드톤</div>
          <div className="mt-1 text-zinc-500">루트/3도/5도</div>
        </div>
        <div className="border-x border-[#333333] p-3">
          <div className="font-semibold text-white">실습</div>
          <div className="mt-1 text-zinc-500">클릭해서 노트 배치</div>
        </div>
        <div className="p-3">
          <div className="font-semibold text-white">청음</div>
          <div className="mt-1 text-zinc-500">바로 재생</div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[#333333] bg-[#262626] p-3">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function HomeContinueButton() {
  return (
    <Link href="/lessons/piano-roll-intervals-scales" className="inline-flex items-center gap-2 rounded-sm bg-[#b8ff4d] px-4 py-3 text-sm font-semibold text-black hover:bg-[#d7ff98]">
      <PlayCircle size={16} aria-hidden />
      1단계 시작하기
    </Link>
  );
}
