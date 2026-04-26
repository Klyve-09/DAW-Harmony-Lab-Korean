import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { LessonCard } from "@/components/lesson/LessonCard";
import { SkillTreePanel } from "@/components/lesson/SkillTreePanel";
import { curriculum } from "@/data/curriculum";

export const metadata: Metadata = {
  title: "15단계 커리큘럼",
  description: "피아노롤 기반 실전 화성학 레슨 15단계를 순서대로 학습합니다.",
  alternates: {
    canonical: "/lessons"
  }
};

export default function LessonsPage() {
  return (
    <AppShell>
      <div className="p-4">
        <section className="mb-4 rounded-sm border border-[#333333] bg-[#1f1f1f] p-5">
          <h1 className="text-2xl font-semibold">15단계 커리큘럼</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            피아노롤에서 스케일을 찍는 단계부터 장르별 코드 진행과 편곡 확장까지 순서대로 진행합니다.
          </p>
        </section>
        <div className="mb-4">
          <SkillTreePanel />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {curriculum.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
