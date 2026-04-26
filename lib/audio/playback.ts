import type { ChordSymbol, PianoRollNote } from "@/types/music";

export function getPlaybackDurationBeats({ notes, chords }: { notes?: PianoRollNote[]; chords?: ChordSymbol[] }) {
  if (notes?.length) {
    return Math.max(...notes.map((note) => note.startBeat + note.duration));
  }

  return chords?.length ?? 0;
}
