import type { NoteName, PianoRollNote } from "@/types/music";
import { getScaleForKey } from "@/lib/theory/scales";
import { normalizeNoteName } from "@/lib/theory/notes";

export function pitchClassFromPitch(pitch: string) {
  return normalizeNoteName(pitch.replace(/[0-9]/g, ""));
}

export function getScalePitchClasses(scaleKey?: string, fallbackNotes: PianoRollNote[] = []) {
  if (scaleKey) return new Set(getScaleForKey(scaleKey).map((note) => normalizeNoteName(note)));
  return new Set(fallbackNotes.map((note) => pitchClassFromPitch(note.pitch)));
}

export function isMidiInScale(midiNoteName: string, pitchClasses: Set<NoteName>) {
  return pitchClasses.has(pitchClassFromPitch(midiNoteName));
}
