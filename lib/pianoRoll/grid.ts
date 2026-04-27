import type { PianoRollNote } from "@/types/music";

export const DEFAULT_EDITABLE_BEATS = 4;
export const DEFAULT_MIN_MIDI = 48;
export const DEFAULT_MAX_MIDI = 72;

function noteEndBeat(note: PianoRollNote) {
  return note.startBeat + note.duration;
}

export function getEditableBeatCount(notes: PianoRollNote[] = [], expectedNotes: PianoRollNote[] = []) {
  const endBeat = [...notes, ...expectedNotes].reduce((max, note) => Math.max(max, noteEndBeat(note)), 0);
  return Math.max(DEFAULT_EDITABLE_BEATS, Math.ceil(endBeat));
}

export function getEditableMidiRange(notes: PianoRollNote[] = [], expectedNotes: PianoRollNote[] = []) {
  const allNotes = [...notes, ...expectedNotes];
  const minMidi = Math.min(DEFAULT_MIN_MIDI, ...allNotes.map((note) => note.midi));
  const maxMidi = Math.max(DEFAULT_MAX_MIDI, ...allNotes.map((note) => note.midi));
  return Array.from({ length: maxMidi - minMidi + 1 }, (_, index) => maxMidi - index);
}
