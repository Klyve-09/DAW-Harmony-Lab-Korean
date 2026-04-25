import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ChordProgressionGenerator } from "@/components/generator/ChordProgressionGenerator";

export const metadata: Metadata = {
  title: "코드 진행 생성기",
  description: "키, 장르, 분위기, 난이도에 맞는 코드 진행을 만들고 피아노롤로 확인합니다.",
  alternates: {
    canonical: "/generator"
  }
};

export default function GeneratorPage() {
  return (
    <AppShell>
      <ChordProgressionGenerator />
    </AppShell>
  );
}
