"use client";

import { Download } from "lucide-react";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { buildMidiFileName, notesToMidiFile } from "@/lib/midi/export";
import { progressionToPianoRollNotes } from "@/lib/utils";

export function MidiExportButton({
  notes,
  chords,
  bpm = 90,
  fileName,
  label = "MIDI export"
}: {
  notes?: PianoRollNote[];
  chords?: ChordSymbol[];
  bpm?: number;
  fileName?: string;
  label?: string;
}) {
  const exportNotes = notes?.length ? notes : chords?.length ? progressionToPianoRollNotes(chords) : [];
  const disabled = exportNotes.length === 0;

  function handleExport() {
    if (disabled) return;
    const bytes = notesToMidiFile(exportNotes, { bpm });
    const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const url = URL.createObjectURL(new Blob([data], { type: "audio/midi" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = buildMidiFileName(fileName);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleExport}
      disabled={disabled}
      className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-[#444] px-4 text-sm text-zinc-200 transition hover:border-[#5cd6ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
    >
      <Download size={15} aria-hidden />
      {label}
    </button>
  );
}
