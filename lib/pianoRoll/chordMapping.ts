import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { noteNameToMidi } from "@/lib/theory/notes";

export function chordToPianoRollNotes(chord: ChordSymbol, beat = 0, octave = 4): PianoRollNote[] {
  const chordId = `${chord.name}-${beat}`;
  let previousMidi = noteNameToMidi(`${chord.root}${octave - 1}`);
  return chord.notes.map((note, index) => {
    let midi = noteNameToMidi(`${note}${index === 0 ? octave - 1 : octave}`);
    while (index > 0 && midi <= previousMidi) midi += 12;
    previousMidi = midi;
    const pitch = `${note}${Math.floor(midi / 12) - 1}`;
    return {
      id: `${chord.name}-${beat}-${note}-${index}`,
      pitch,
      midi,
      startBeat: beat,
      duration: 1,
      role: getChordNoteRole(chord, index),
      scaleDegree: getChordToneDegree(chord, index),
      chordId,
      voice: index === 0 ? "bass" : index === chord.notes.length - 1 ? "lead" : "inner"
    };
  });
}

export function progressionToPianoRollNotes(chords: ChordSymbol[]): PianoRollNote[] {
  return chords.flatMap((chord, index) => chordToPianoRollNotes(chord, index, 4));
}

function getChordNoteRole(chord: ChordSymbol, noteIndex: number): PianoRollNote["role"] {
  if (noteIndex === 0) return "root";
  if (noteIndex === 1) {
    return chord.quality === "sus2" || chord.quality === "sus4" ? "tension" : "third";
  }
  if (noteIndex === 2) return "fifth";
  if (noteIndex === 3) {
    return chord.quality === "add9" ? "tension" : "seventh";
  }
  return "tension";
}

function getChordToneDegree(chord: ChordSymbol, noteIndex: number) {
  if (noteIndex === 0) return "1";
  if (noteIndex === 1) {
    return chord.quality === "sus2" ? "2" : chord.quality === "sus4" ? "4" : "3";
  }
  if (noteIndex === 2) return "5";
  if (noteIndex === 3) return chord.quality === "add9" ? "9" : "7";
  return `${9 + Math.max(0, noteIndex - 4) * 2}`;
}
