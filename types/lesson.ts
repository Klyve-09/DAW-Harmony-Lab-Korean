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

export type ListeningDrillOption = {
  id: "A" | "B";
  label: string;
  notes: PianoRollNote[];
  chords?: ChordSymbol[];
};

export type ListeningDrill = {
  id: string;
  prompt: string;
  options: ListeningDrillOption[];
  answerId: ListeningDrillOption["id"];
  explanation: string;
};

export type Exercise = {
  id: string;
  title: string;
  instruction: string;
  type: "build-scale" | "build-chord" | "build-progression" | "voicing" | "analysis";
  hints?: string[];
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

export type CommonMistake = {
  title: string;
  symptom: string;
  fix: string;
  miniDrill: string;
};

export type ProjectCheckpoint = {
  id: string;
  title: string;
  genre: "Pop" | "Lo-fi" | "Cinematic";
  goal: string;
  bars: number;
  bpm: number;
  key: string;
  chords: ChordSymbol[];
  notes: PianoRollNote[];
  steps: string[];
  instrumentLayers?: {
    name: string;
    role: string;
    instruction: string;
  }[];
  extensionBars?: number;
  extensionSteps?: string[];
  exportPrompt: string;
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
  listeningDrills: ListeningDrill[];
  commonMistakes: CommonMistake[];
  projectCheckpoint?: ProjectCheckpoint;
  exercises: Exercise[];
  quizzes: Quiz[];
};
