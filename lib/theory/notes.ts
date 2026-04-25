import type { NoteName } from "@/types/music";

export const NOTE_NAMES: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const FLAT_NOTE_NAMES: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const FLAT_TO_SHARP: Record<string, NoteName> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#"
};

export function normalizeNoteName(note: string): NoteName {
  const clean = note.replace(/[0-9]/g, "").trim();
  if (NOTE_NAMES.includes(clean as NoteName)) return clean as NoteName;
  if (FLAT_NOTE_NAMES.includes(clean as NoteName)) return clean as NoteName;
  return FLAT_TO_SHARP[clean] ?? "C";
}

export function transposeNote(root: NoteName, semitones: number, preferFlats = root.includes("b")): NoteName {
  const index = NOTE_NAMES.indexOf(FLAT_TO_SHARP[root] ?? root);
  const names = preferFlats ? FLAT_NOTE_NAMES : NOTE_NAMES;
  return names[(index + semitones + 120) % 12];
}

export function midiToNoteName(midi: number): string {
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

export function noteNameToMidi(note: string, fallbackOctave = 4): number {
  const match = note.match(/^([A-G]#?|[A-G]b?)(-?\d+)?$/);
  if (!match) return 60;
  const name = normalizeNoteName(match[1]);
  const octave = match[2] ? Number(match[2]) : fallbackOctave;
  return NOTE_NAMES.indexOf(FLAT_TO_SHARP[name] ?? name) + (octave + 1) * 12;
}

export function notesToMidi(notes: string[]): number[] {
  return notes.map((note) => noteNameToMidi(note));
}

export function frequencyFromMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}
