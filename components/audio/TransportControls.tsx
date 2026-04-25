"use client";

import { useState } from "react";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { PlayButton } from "@/components/audio/PlayButton";

export function TransportControls({
  notes,
  chords,
  onPlayStart
}: {
  notes?: PianoRollNote[];
  chords?: ChordSymbol[];
  onPlayStart?: () => void;
}) {
  const [bpm, setBpm] = useState(90);
  const setClampedBpm = (value: number) => setBpm(Math.min(180, Math.max(50, value || 90)));

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[#333333] bg-[#181818] p-3">
      <PlayButton notes={notes} chords={chords} bpm={bpm} onPlayStart={onPlayStart} />
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        BPM
        <input
          aria-label="BPM"
          type="number"
          min={50}
          max={180}
          value={bpm}
          onChange={(event) => setClampedBpm(Number(event.target.value))}
          className="h-11 w-20 rounded-sm border border-[#444] bg-[#262626] px-2"
        />
      </label>
    </div>
  );
}
