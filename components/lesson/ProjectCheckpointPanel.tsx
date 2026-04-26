"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import type { ProjectCheckpoint } from "@/types/lesson";
import { PianoRollPlaybackPanel } from "@/components/audio/PianoRollPlaybackPanel";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { getProjectCheckedSteps, scoreProjectSteps } from "@/lib/learning/projectScoring";

export function ProjectCheckpointPanel({ checkpoint, lessonId }: { checkpoint: ProjectCheckpoint; lessonId: string }) {
  const { progress, saveProjectSubmission } = useProgress(curriculum.length);
  const saved = progress.projectSubmissions?.[checkpoint.id];
  const [draftCheckedSteps, setDraftCheckedSteps] = useState<string[]>();
  const checkedSteps = getProjectCheckedSteps(saved, draftCheckedSteps);
  const score = scoreProjectSteps(checkedSteps, checkpoint.steps.length);

  function toggleStep(step: string) {
    setDraftCheckedSteps((current) => {
      const source = getProjectCheckedSteps(saved, current);
      return source.includes(step) ? source.filter((item) => item !== step) : [...source, step];
    });
  }

  function saveProject() {
    saveProjectSubmission({
      id: `${checkpoint.id}-submission`,
      checkpointId: checkpoint.id,
      lessonId,
      title: checkpoint.title,
      genre: checkpoint.genre,
      score,
      checkedSteps,
      savedAt: "local"
    });
  }

  return (
    <section className="overflow-hidden rounded-sm border border-[#333333] bg-[#1f1f1f]">
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-[#5cd6ff]">{checkpoint.genre} mini project</p>
            <h2 className="mt-1 text-lg font-semibold">{checkpoint.title}</h2>
          </div>
          <div className="rounded-sm border border-[#444] bg-[#262626] px-3 py-2 text-xs text-zinc-300">
            {checkpoint.key} · {checkpoint.bpm} BPM · {checkpoint.bars}마디
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{checkpoint.goal}</p>
        <ol className="mt-4 grid gap-2 text-sm text-zinc-300 md:grid-cols-3">
          {checkpoint.steps.map((step, index) => (
            <li key={step}>
              <label className="flex h-full cursor-pointer items-start gap-2 rounded-sm border border-[#333333] bg-[#181818] px-3 py-2 transition hover:border-[#5cd6ff]">
                <input
                  type="checkbox"
                  checked={checkedSteps.includes(step)}
                  onChange={() => toggleStep(step)}
                  className="mt-1 size-4 accent-[#b8ff4d]"
                />
                <span>
                  <span className="mr-2 text-xs font-semibold text-[#b8ff4d]">{index + 1}</span>
                  {step}
                </span>
              </label>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#333333] bg-[#181818] px-3 py-3">
          <div className="text-sm">
            <p className="font-semibold">프로젝트 점수 {score}%</p>
            <p className="mt-1 text-xs text-zinc-500">
              {saved ? `저장됨: ${saved.score}%` : "3개 기준 중 80% 이상이면 스킬트리에 프로젝트 사용으로 기록됩니다."}
            </p>
          </div>
          <button
            type="button"
            onClick={saveProject}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-[#b8ff4d] px-4 py-2 text-sm font-semibold text-[#b8ff4d] transition hover:bg-[#26301d] active:scale-[0.98]"
          >
            <CheckCircle size={16} aria-hidden />
            저장/채점
          </button>
        </div>
        {checkpoint.extensionBars && checkpoint.extensionSteps ? (
          <div className="mt-4 rounded-sm border border-[#333333] bg-[#181818] p-3">
            <p className="text-sm font-semibold">{checkpoint.extensionBars}마디 확장 과제</p>
            <ol className="mt-2 grid gap-1 text-xs leading-5 text-zinc-400 md:grid-cols-3">
              {checkpoint.extensionSteps.map((step, index) => (
                <li key={step}>
                  <span className="mr-2 text-[#b8ff4d]">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {checkpoint.instrumentLayers ? (
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {checkpoint.instrumentLayers.map((layer) => (
              <div key={layer.name} className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{layer.name}</p>
                  <span className="rounded-sm border border-[#444] px-2 py-1 text-[11px] text-zinc-400">{layer.role}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{layer.instruction}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <PianoRollPlaybackPanel
        notes={checkpoint.notes}
        chords={checkpoint.chords}
        beats={checkpoint.bars}
        title={`${checkpoint.genre} 프로젝트 피아노롤`}
        initialBpm={checkpoint.bpm}
        fileName={`${checkpoint.id}-${checkpoint.genre}`}
        markers={checkpoint.chords.map((chord) => chord.name)}
        showDawGuide
      />
      <div className="border-t border-[#333333] bg-[#181818] px-5 py-3 text-xs leading-5 text-zinc-400">{checkpoint.exportPrompt}</div>
    </section>
  );
}
