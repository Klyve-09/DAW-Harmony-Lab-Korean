"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import type { ProjectCheckpoint } from "@/types/lesson";
import { PianoRollPlaybackPanel } from "@/components/audio/PianoRollPlaybackPanel";
import { curriculum } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { buildProjectLayers, getAudibleProjectNotes, type ProjectLayerId } from "@/lib/learning/projectLayers";
import { getProjectCheckedSteps, scoreProjectSteps } from "@/lib/learning/projectScoring";
import { scoreRuleBasedProject } from "@/lib/learning/ruleScoring";

export function ProjectCheckpointPanel({ checkpoint, lessonId }: { checkpoint: ProjectCheckpoint; lessonId: string }) {
  const { progress, saveProjectSubmission } = useProgress(curriculum.length);
  const saved = progress.projectSubmissions?.[checkpoint.id];
  const [draftCheckedSteps, setDraftCheckedSteps] = useState<string[]>();
  const [mutedLayerIds, setMutedLayerIds] = useState<ProjectLayerId[]>([]);
  const [soloLayerId, setSoloLayerId] = useState<ProjectLayerId>();
  const layers = buildProjectLayers(checkpoint);
  const audibleNotes = getAudibleProjectNotes(layers, mutedLayerIds, soloLayerId);
  const scoringNotes = getAudibleProjectNotes(layers, [], undefined);
  const checkedSteps = getProjectCheckedSteps(saved, draftCheckedSteps);
  const checklistScore = scoreProjectSteps(checkedSteps, checkpoint.steps.length);
  const ruleScore = scoreRuleBasedProject({ notes: scoringNotes, chords: checkpoint.chords, genre: checkpoint.genre });
  const score = Math.round(checklistScore * 0.6 + ruleScore.score * 0.4);

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

  function toggleMute(layerId: ProjectLayerId) {
    setMutedLayerIds((current) => (current.includes(layerId) ? current.filter((id) => id !== layerId) : [...current, layerId]));
  }

  function toggleSolo(layerId: ProjectLayerId) {
    setSoloLayerId((current) => (current === layerId ? undefined : layerId));
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
              체크리스트 {checklistScore}% · 규칙 채점 {ruleScore.score}%{saved ? ` · 저장됨: ${saved.score}%` : ""}
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
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {ruleScore.items.map((item) => (
            <div key={item.title} className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-200">{item.title}</p>
                <span className="text-xs text-[#b8ff4d]">{item.score}%</span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-zinc-500">{item.detail}</p>
            </div>
          ))}
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
        {layers.length > 0 ? (
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {layers.map((layer) => (
              <div key={layer.name} className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{layer.name}</p>
                  <span className="rounded-sm border border-[#444] px-2 py-1 text-[11px] text-zinc-400">{layer.role}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{layer.instruction}</p>
                <div className="mt-3 flex gap-1">
                  <button
                    type="button"
                    aria-pressed={soloLayerId === layer.id}
                    onClick={() => toggleSolo(layer.id)}
                    className={`min-h-8 flex-1 rounded-sm border px-2 text-[11px] transition active:scale-[0.98] ${
                      soloLayerId === layer.id ? "border-[#b8ff4d] bg-[#26301d] text-[#d7ff98]" : "border-[#444] text-zinc-300 hover:border-[#5cd6ff]"
                    }`}
                  >
                    Solo
                  </button>
                  <button
                    type="button"
                    aria-pressed={mutedLayerIds.includes(layer.id)}
                    onClick={() => toggleMute(layer.id)}
                    disabled={soloLayerId === layer.id}
                    className={`min-h-8 flex-1 rounded-sm border px-2 text-[11px] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600 ${
                      mutedLayerIds.includes(layer.id) ? "border-[#ff5c5c] bg-[#2a1515] text-[#ffb4b4]" : "border-[#444] text-zinc-300 hover:border-[#ff5c5c]"
                    }`}
                  >
                    Mute
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <PianoRollPlaybackPanel
        notes={audibleNotes}
        chords={checkpoint.chords}
        beats={checkpoint.bars}
        title={`${checkpoint.genre} 프로젝트 피아노롤`}
        initialBpm={checkpoint.bpm}
        fileName={`${checkpoint.id}-${checkpoint.genre}`}
        markers={checkpoint.chords.map((chord) => chord.name)}
        scaleKey={checkpoint.key}
        showDawGuide
      />
      <div className="border-t border-[#333333] bg-[#181818] px-5 py-3 text-xs leading-5 text-zinc-400">{checkpoint.exportPrompt}</div>
    </section>
  );
}
