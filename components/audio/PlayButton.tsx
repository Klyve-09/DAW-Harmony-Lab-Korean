"use client";

import React from "react";
import { Pause, Play, Square } from "lucide-react";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { getPlaybackDurationBeats } from "@/lib/audio/playback";
import { playNotes, playProgression, preparePlayback, stopAudio } from "@/lib/audio/synth";

let activePlaybackStop: (() => void) | undefined;
let activePlaybackOwner: symbol | undefined;
type PreloadMode = "auto" | "intent" | "none";

export function PlayButton({
  notes,
  chords,
  bpm = 90,
  label = "재생",
  loop = false,
  preload = "intent",
  onPlayStart,
  onPlayheadChange,
  onPlayingChange
}: {
  notes?: PianoRollNote[];
  chords?: ChordSymbol[];
  bpm?: number;
  label?: string;
  loop?: boolean;
  preload?: PreloadMode;
  onPlayStart?: () => void;
  onPlayheadChange?: (beat: number | undefined) => void;
  onPlayingChange?: (playing: boolean) => void;
}) {
  const [error, setError] = React.useState("");
  const [playing, setPlaying] = React.useState(false);
  const endTimer = React.useRef<number | null>(null);
  const animationFrame = React.useRef<number | null>(null);
  const runId = React.useRef(0);
  const activeStop = React.useRef<(() => void) | undefined>(undefined);
  const owner = React.useRef(Symbol("playback-owner"));
  const cleanup = React.useRef<() => void>(() => undefined);
  const latest = React.useRef({ notes, chords, bpm, loop, preload, onPlayStart, onPlayheadChange, onPlayingChange });
  const hasAudio = Boolean(notes?.length || chords?.length);

  latest.current = { notes, chords, bpm, loop, preload, onPlayStart, onPlayheadChange, onPlayingChange };

  React.useEffect(() => () => cleanup.current(), []);
  React.useEffect(() => {
    if (preload !== "auto" || !hasAudio) return;
    const timer = window.setTimeout(() => {
      void preparePlayback({ notes, chords, bpm });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [notes, chords, bpm, preload, hasAudio]);

  function clearEndTimer() {
    if (!endTimer.current) return;
    window.clearTimeout(endTimer.current);
    endTimer.current = null;
  }

  function clearAnimationFrame() {
    if (!animationFrame.current) return;
    window.cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
  }

  function clearActivePlayback() {
    if (activePlaybackStop === activeStop.current) {
      activePlaybackStop = undefined;
    }
    if (activePlaybackOwner === owner.current) {
      activePlaybackOwner = undefined;
    }
  }

  function setPlayingState(nextPlaying: boolean, updateState: boolean) {
    if (updateState) setPlaying(nextPlaying);
    latest.current.onPlayingChange?.(nextPlaying);
  }

  function stopPlayback({ updateState = true, stopEngine = true }: { updateState?: boolean; stopEngine?: boolean } = {}) {
    runId.current += 1;
    clearEndTimer();
    clearAnimationFrame();
    if (stopEngine) stopAudio();
    latest.current.onPlayheadChange?.(undefined);
    clearActivePlayback();
    setPlayingState(false, updateState);
  }

  cleanup.current = () => stopPlayback({ updateState: false });

  function startPlayhead(currentRunId: number, totalBeats: number, beatMs: number) {
    clearAnimationFrame();
    const startTime = performance.now();
    latest.current.onPlayheadChange?.(0);

    const update = () => {
      if (currentRunId !== runId.current) return;
      const beat = Math.min(totalBeats, (performance.now() - startTime) / beatMs);
      latest.current.onPlayheadChange?.(beat);
      if (beat < totalBeats) {
        animationFrame.current = window.requestAnimationFrame(update);
      }
    };

    animationFrame.current = window.requestAnimationFrame(update);
  }

  async function startPlaybackCycle(currentRunId: number) {
    try {
      clearEndTimer();
      setError("");

      const current = latest.current;
      const shouldStart = () => currentRunId === runId.current && activePlaybackOwner === owner.current;
      const durationMs = current.notes?.length
        ? await playNotes(current.notes, current.bpm, { shouldStart })
        : await playProgression(current.chords ?? [], current.bpm, { shouldStart });

      if (currentRunId !== runId.current) {
        if (activePlaybackOwner === undefined || activePlaybackOwner === owner.current) stopAudio();
        return;
      }

      const totalBeats = getPlaybackDurationBeats({ notes: latest.current.notes, chords: latest.current.chords });
      if (totalBeats > 0) startPlayhead(currentRunId, totalBeats, 60_000 / latest.current.bpm);

      endTimer.current = window.setTimeout(() => {
        if (currentRunId !== runId.current) return;
        if (latest.current.loop) {
          void startPlaybackCycle(currentRunId);
          return;
        }

        stopPlayback();
      }, Math.max(0, durationMs) + 80);
    } catch (err) {
      if (currentRunId !== runId.current) {
        if (activePlaybackOwner === undefined || activePlaybackOwner === owner.current) stopAudio();
        return;
      }
      setError(err instanceof Error ? err.message : "오디오를 시작할 수 없습니다.");
      stopPlayback();
    }
  }

  function handlePreloadIntent() {
    const current = latest.current;
    if (current.preload === "none" || !(current.notes?.length || current.chords?.length)) return;
    void preparePlayback({ notes: current.notes, chords: current.chords, bpm: current.bpm });
  }

  function handlePlay() {
    if (!hasAudio) return;
    if (activePlaybackStop && activePlaybackStop !== activeStop.current) activePlaybackStop();
    stopPlayback({ updateState: false });

    const currentRunId = runId.current;
    activeStop.current = () => stopPlayback();
    activePlaybackStop = activeStop.current;
    activePlaybackOwner = owner.current;
    setPlayingState(true, true);
    latest.current.onPlayStart?.();
    void startPlaybackCycle(currentRunId);
  }

  function handleStop() {
    stopPlayback();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label={playing ? "오디오 정지" : label}
        onPointerEnter={handlePreloadIntent}
        onFocus={handlePreloadIntent}
        onClick={playing ? handleStop : handlePlay}
        disabled={!hasAudio}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#b8ff4d] px-4 text-sm font-semibold text-black transition hover:bg-[#d5ff91] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
      >
        {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
        {playing ? "정지" : label}
      </button>
      <button
        type="button"
        aria-label="오디오 전체 정지"
        onClick={handleStop}
        disabled={!playing}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-[#444] px-4 text-sm transition hover:border-[#ff5c5c] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
      >
        <Square size={14} aria-hidden />
        전체 정지
      </button>
      {error ? (
        <p className="text-xs text-[#ff5c5c]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
