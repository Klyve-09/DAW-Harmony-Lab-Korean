"use client";

import { useMemo, useState } from "react";
import { Wand2 } from "lucide-react";
import type { GeneratedProgression, PianoRollNote } from "@/types/music";
import { curriculum } from "@/data/curriculum";
import { generatorOptions, generateProgression } from "@/lib/theory/progressions";
import { progressionToPianoRollNotes } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import { GenreReferenceLibrary } from "@/components/generator/GenreReferenceLibrary";
import { ProgressionCoach } from "@/components/generator/ProgressionCoach";
import { PianoRollPlaybackPanel } from "@/components/audio/PianoRollPlaybackPanel";
import { DraggablePianoRoll } from "@/components/piano-roll/DraggablePianoRoll";

const moodLabels: Record<string, string> = {
  bright: "밝음",
  sad: "슬픔",
  dreamy: "몽환적",
  dark: "어두움",
  tense: "긴장감",
  chill: "편안함"
};

const genreLabels: Record<string, string> = {
  pop: "팝",
  rnb: "R&B",
  lofi: "로파이",
  edm: "EDM",
  hiphop: "힙합",
  cinematic: "시네마틱"
};

const complexityLabels: Record<string, string> = {
  basic: "기본",
  intermediate: "중급",
  advanced: "고급"
};

export function ChordProgressionGenerator() {
  const [key, setKey] = useState("C");
  const [mood, setMood] = useState("bright");
  const [genre, setGenre] = useState("pop");
  const [complexity, setComplexity] = useState("basic");
  const [generated, setGenerated] = useState<GeneratedProgression>(() => generateProgression("C", "pop", "bright", "basic"));
  const [practiceNotes, setPracticeNotes] = useState<PianoRollNote[]>([]);
  const { progress, saveGeneratedProgression } = useProgress(curriculum.length);

  const rollNotes = useMemo(() => progressionToPianoRollNotes(generated.chords), [generated]);

  function handleGenerate() {
    const next = generateProgression(key, genre, mood, complexity);
    setGenerated(next);
    saveGeneratedProgression(next);
    setPracticeNotes([]);
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
        <h1 className="text-2xl font-semibold">코드 진행 생성기</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">키, 장르, 분위기, 난이도를 고르면 피아노롤로 바로 확인할 수 있는 진행을 만듭니다.</p>
        <div className="mt-5 grid gap-3">
          <Select label="키" helper="진행을 만들 기준 조성입니다." value={key} values={generatorOptions.keys} onChange={setKey} />
          <Select label="분위기" value={mood} values={generatorOptions.moods} labels={moodLabels} onChange={setMood} />
          <Select label="장르" value={genre} values={generatorOptions.genres} labels={genreLabels} onChange={setGenre} />
          <Select label="난이도" value={complexity} values={generatorOptions.complexities} labels={complexityLabels} onChange={setComplexity} />
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#b8ff4d] px-3 py-3 text-sm font-semibold text-black transition hover:bg-[#d6ff97] active:scale-[0.98]"
        >
          <Wand2 size={16} aria-hidden />
          진행 만들기
        </button>
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">최근 생성 기록</h2>
          <div className="space-y-2" aria-live="polite">
            {progress.recentGeneratedProgressions.length === 0 ? (
              <p className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-3 text-xs leading-5 text-zinc-500">
                아직 저장된 기록이 없습니다. 진행을 만들면 최근 5개가 여기에 남습니다.
              </p>
            ) : null}
            {progress.recentGeneratedProgressions.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGenerated(item)}
                className="min-h-11 w-full rounded-sm border border-[#3a3a3a] bg-[#262626] px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-[#5cd6ff] active:scale-[0.99]"
              >
                {item.key} · {genreLabels[item.genre] ?? item.genre} · {item.romanNumerals.join(" - ")}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h2 className="text-xl font-semibold">{generated.chords.map((chord) => chord.name).join(" - ")}</h2>
              <p className="mt-2 text-sm text-[#5cd6ff]">{generated.romanNumerals.join(" - ")}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {genreLabels[generated.genre] ?? generated.genre} · {moodLabels[generated.mood] ?? generated.mood} ·{" "}
                {complexityLabels[generated.complexity] ?? generated.complexity}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{generated.description}</p>
              {generated.fallback ? (
                <div className="mt-3 max-w-2xl rounded-sm border border-[#5b4a14] bg-[#2a230f] px-3 py-2 text-xs leading-5 text-[#ffcc00]">
                  선택한 {genreLabels[generated.fallback.requested.genre] ?? generated.fallback.requested.genre} ·{" "}
                  {moodLabels[generated.fallback.requested.mood] ?? generated.fallback.requested.mood} ·{" "}
                  {complexityLabels[generated.fallback.requested.complexity] ?? generated.fallback.requested.complexity} 템플릿은 아직 없습니다.
                  가장 가까운 {genreLabels[generated.fallback.used.genre] ?? generated.fallback.used.genre} ·{" "}
                  {moodLabels[generated.fallback.used.mood] ?? generated.fallback.used.mood} ·{" "}
                  {complexityLabels[generated.fallback.used.complexity] ?? generated.fallback.used.complexity} 진행을 추천했습니다.
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setPracticeNotes(rollNotes)}
              className="min-h-11 rounded-sm border border-[#444] px-4 py-2 text-sm transition hover:border-[#b8ff4d] active:scale-[0.98]"
            >
              이 진행으로 실습하기
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-sm border border-[#333333] bg-[#1f1f1f]">
          <PianoRollPlaybackPanel
            notes={rollNotes}
            chords={generated.chords}
            beats={Math.max(4, generated.chords.length)}
            title="생성된 피아노롤"
            fileName={`progression-${generated.key}-${generated.chords.map((chord) => chord.name).join("-")}`}
            markers={generated.romanNumerals}
            showDawGuide
          />
        </div>
        <ProgressionCoach progression={generated} />
        <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4">
          <h2 className="mb-3 text-base font-semibold">실습 노트</h2>
          <DraggablePianoRoll value={practiceNotes} onChange={setPracticeNotes} />
        </section>
        <GenreReferenceLibrary />
      </section>
    </div>
  );
}

function Select({
  label,
  helper,
  value,
  values,
  labels,
  onChange
}: {
  label: string;
  helper?: string;
  value: string;
  values: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-zinc-300">
      <span>{label}</span>
      {helper ? <span className="text-xs text-zinc-500">{helper}</span> : null}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-sm border border-[#444] bg-[#262626] px-2">
        {values.map((item) => (
          <option key={item} value={item}>
            {labels?.[item] ?? item}
          </option>
        ))}
      </select>
    </label>
  );
}
