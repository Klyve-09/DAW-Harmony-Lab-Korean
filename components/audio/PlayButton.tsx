"use client";

import React from "react";
import { Pause, Play, Square } from "lucide-react";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { playNotes, playProgression, stopAudio } from "@/lib/audio/synth";

export function PlayButton({
  notes,
  chords,
  bpm = 90,
  label = "재생",
  onPlayStart
}: {
  notes?: PianoRollNote[];
  chords?: ChordSymbol[];
  bpm?: number;
  label?: string;
  onPlayStart?: () => void;
}) {
  const [error, setError] = React.useState("");
  const [playing, setPlaying] = React.useState(false);
  const endTimer = React.useRef<number | null>(null);
  const hasAudio = Boolean(notes?.length || chords?.length);

  React.useEffect(() => {
    return () => {
      if (endTimer.current) window.clearTimeout(endTimer.current);
      stopAudio();
    };
  }, []);

  function clearEndTimer() {
    if (!endTimer.current) return;
    window.clearTimeout(endTimer.current);
    endTimer.current = null;
  }

  async function handlePlay() {
    try {
      if (!hasAudio) return;
      clearEndTimer();
      setError("");
      setPlaying(true);
      onPlayStart?.();
      const durationMs = notes?.length ? await playNotes(notes, bpm) : await playProgression(chords ?? [], bpm);
      endTimer.current = window.setTimeout(() => {
        stopAudio();
        setPlaying(false);
        endTimer.current = null;
      }, Math.max(0, durationMs) + 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오디오를 시작할 수 없습니다.");
      setPlaying(false);
    }
  }

  function handleStop() {
    clearEndTimer();
    stopAudio();
    setPlaying(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label={playing ? "오디오 정지" : label}
        onClick={playing ? handleStop : handlePlay}
        disabled={!hasAudio}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#b8ff4d] px-4 text-sm font-semibold text-black transition hover:bg-[#d5ff91] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
      >
        {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
        {playing ? "정지" : label}
      </button>
      <button
        type="button"
        aria-label="오디오 정지"
        onClick={handleStop}
        disabled={!playing}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-[#444] px-4 text-sm transition hover:border-[#ff5c5c] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
      >
        <Square size={14} aria-hidden />
        전체 정지
      </button>
      {error ? <p className="text-xs text-[#ff5c5c]" role="alert">{error}</p> : null}
    </div>
  );
}
