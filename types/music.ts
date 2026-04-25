export type NoteName =
  | "C"
  | "Db"
  | "C#"
  | "D"
  | "Eb"
  | "D#"
  | "E"
  | "F"
  | "Gb"
  | "F#"
  | "G"
  | "Ab"
  | "G#"
  | "A"
  | "Bb"
  | "A#"
  | "B";

export type NoteRole = "root" | "chordTone" | "tension" | "outside";

export type PianoRollNote = {
  id: string;
  pitch: string;
  midi: number;
  startBeat: number;
  duration: number;
  velocity?: number;
  role?: NoteRole;
};

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "maj7"
  | "m7"
  | "7"
  | "m7b5"
  | "add9"
  | "sus2"
  | "sus4"
  | "maj9"
  | "m9";

export type ChordSymbol = {
  name: string;
  root: NoteName;
  quality: ChordQuality;
  notes: string[];
};

export type GeneratedProgression = {
  id: string;
  key: string;
  genre: string;
  mood: string;
  complexity: string;
  chords: ChordSymbol[];
  romanNumerals: string[];
  description: string;
  createdAt: string;
};
