"use client";

import { useState } from "react";
import { Repeat2 } from "lucide-react";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { DawImportGuide } from "@/components/audio/DawImportGuide";
import { MidiExportButton } from "@/components/audio/MidiExportButton";
import { PlayButton } from "@/components/audio/PlayButton";

export function TransportControls({
  notes,
  chords,
  initialBpm = 90,
  fileName,
  showDawGuide = false,
  onPlayheadChange,
  onPlayStart
}: {
  notes?: PianoRollNote[];
  chords?: ChordSymbol[];
  initialBpm?: number;
  fileName?: string;
  showDawGuide?: boolean;
  onPlayheadChange?: (beat: number | undefined) => void;
  onPlayStart?: () => void;
}) {
  const [bpm, setBpm] = useState(initialBpm);
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const setClampedBpm = (value: number) => setBpm(Math.min(180, Math.max(50, value || 90)));

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#333333] bg-[#181818] p-3">
        <PlayButton
          notes={notes}
          chords={chords}
          bpm={bpm}
          loop={loop}
          preload="auto"
          onPlayStart={onPlayStart}
          onPlayheadChange={onPlayheadChange}
          onPlayingChange={setPlaying}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          BPM
          <input
            aria-label="BPM"
            type="number"
            min={50}
            max={180}
            value={bpm}
            disabled={playing}
            onChange={(event) => setClampedBpm(Number(event.target.value))}
            className="h-11 w-20 rounded-sm border border-[#444] bg-[#262626] px-2 disabled:cursor-not-allowed disabled:text-zinc-500"
          />
        </label>
        <button
          type="button"
          aria-pressed={loop}
          aria-label={loop ? "루프 재생 끄기" : "루프 재생 켜기"}
          onClick={() => setLoop((current) => !current)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-sm border px-4 text-sm transition active:scale-[0.98] ${
            loop ? "border-[#b8ff4d] bg-[#26301d] text-[#d7ff98]" : "border-[#444] text-zinc-200 hover:border-[#b8ff4d]"
          }`}
        >
          <Repeat2 size={15} aria-hidden />
          루프
        </button>
        <MidiExportButton notes={notes} chords={chords} bpm={bpm} fileName={fileName} />
      </div>
      {showDawGuide ? <DawImportGuide bpm={bpm} /> : null}
    </>
  );
}
