import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { summarizeVoiceLeading } from "@/lib/learning/voiceLeading";
import { pitchClassFromPitch } from "@/lib/theory/scaleHighlight";

export type RuleScoreItem = {
  title: string;
  score: number;
  detail: string;
};

export type RuleScoreResult = {
  score: number;
  items: RuleScoreItem[];
};

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function notesAtBeat(notes: PianoRollNote[], beat: number) {
  return notes.filter((note) => Math.round(note.startBeat) === beat);
}

function hasChordIdentity(notes: PianoRollNote[], chord: ChordSymbol) {
  const classes = new Set(notes.map((note) => pitchClassFromPitch(note.pitch)));
  return chord.notes.every((note) => classes.has(pitchClassFromPitch(note)));
}

function scoreDuration(notes: PianoRollNote[]) {
  const sustained = notes.filter((note) => note.duration >= 0.75).length;
  return clampScore((sustained / Math.max(1, notes.length)) * 100);
}

function scoreFunction(notes: PianoRollNote[], chords: ChordSymbol[]) {
  const matches = chords.filter((chord, beat) => hasChordIdentity(notesAtBeat(notes, beat), chord)).length;
  return clampScore((matches / Math.max(1, chords.length)) * 100);
}

function scoreBassMotion(notes: PianoRollNote[], chords: ChordSymbol[]) {
  const roots = chords.filter((chord, beat) => notesAtBeat(notes, beat).some((note) => note.role === "root" && pitchClassFromPitch(note.pitch) === pitchClassFromPitch(chord.root))).length;
  return clampScore((roots / Math.max(1, chords.length)) * 100);
}

function scoreTensions(notes: PianoRollNote[], genre: string) {
  const tensionCount = notes.filter((note) => note.role === "seventh" || note.role === "tension").length;
  const target = genre === "Lo-fi" ? 4 : genre === "Cinematic" ? 2 : 1;
  return clampScore((Math.min(tensionCount, target) / target) * 100);
}

function scoreGenreFit(notes: PianoRollNote[], genre: string) {
  if (genre === "Pop") {
    const shortNotes = notes.filter((note) => note.duration <= 1).length;
    return clampScore((shortNotes / Math.max(1, notes.length)) * 100);
  }
  if (genre === "Lo-fi") {
    const softNotes = notes.filter((note) => (note.velocity ?? 0.7) <= 0.72).length;
    return clampScore((softNotes / Math.max(1, notes.length)) * 100);
  }
  const bassNotes = notes.filter((note) => note.voice === "bass" || note.role === "root").length;
  return clampScore((bassNotes / Math.max(1, notes.length / 4)) * 100);
}

export function scoreRuleBasedProject({ notes, chords, genre }: { notes: PianoRollNote[]; chords: ChordSymbol[]; genre: string }): RuleScoreResult {
  const voice = summarizeVoiceLeading(notes);
  const voiceScore = clampScore(100 - voice.leaps.length * 18);
  const items: RuleScoreItem[] = [
    { title: "Duration", score: scoreDuration(notes), detail: "코드와 레이어가 충분히 길게 유지되는지 봅니다." },
    { title: "Function", score: scoreFunction(notes, chords), detail: "각 박자의 노트가 목표 코드 정체성을 유지하는지 봅니다." },
    { title: "Voice leading", score: voiceScore, detail: voice.leaps.length ? `큰 도약 ${voice.leaps.length}개를 줄이면 더 자연스럽습니다.` : "큰 도약 없이 가까운 이동이 유지됩니다." },
    { title: "Bass motion", score: scoreBassMotion(notes, chords), detail: "각 코드의 루트가 저역 움직임을 잡는지 봅니다." },
    { title: "Tension", score: scoreTensions(notes, genre), detail: "7도와 텐션이 장르 색채를 충분히 만드는지 봅니다." },
    { title: "Genre fit", score: scoreGenreFit(notes, genre), detail: `${genre} 프로젝트에 맞는 길이, 세기, 역할 분리를 확인합니다.` }
  ];

  return {
    score: clampScore(items.reduce((sum, item) => sum + item.score, 0) / items.length),
    items
  };
}
