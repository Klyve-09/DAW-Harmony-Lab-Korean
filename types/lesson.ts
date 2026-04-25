import type { ChordSymbol, PianoRollNote } from "@/types/music";

export type MusicExample = {
  id: string;
  title: string;
  description: string;
  key?: string;
  chords?: ChordSymbol[];
  notes: PianoRollNote[];
  romanNumerals?: string[];
};

export type Exercise = {
  id: string;
  title: string;
  instruction: string;
  type: "build-scale" | "build-chord" | "build-progression" | "voicing" | "analysis";
  expectedNotes?: PianoRollNote[];
  expectedChords?: ChordSymbol[];
};

export type Quiz = {
  id: string;
  question: string;
  type: "multiple-choice";
  choices: string[];
  answer: string;
  explanation: string;
};

export type Lesson = {
  id: string;
  slug: string;
  order: number;
  title: string;
  description: string;
  concepts: string[];
  content: string;
  dawPractice: string;
  examples: MusicExample[];
  exercises: Exercise[];
  quizzes: Quiz[];
};
