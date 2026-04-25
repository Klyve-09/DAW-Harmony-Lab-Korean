import { clsx, type ClassValue } from "clsx";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { noteNameToMidi } from "@/lib/theory/notes";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function chordToPianoRollNotes(chord: ChordSymbol, beat = 0, octave = 4): PianoRollNote[] {
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
      role: index === 0 ? "root" : "chordTone"
    };
  });
}

export function progressionToPianoRollNotes(chords: ChordSymbol[]): PianoRollNote[] {
  return chords.flatMap((chord, index) => chordToPianoRollNotes(chord, index, 4));
}

function pitchClass(pitch: string) {
  return pitch.replace(/[0-9]/g, "");
}

function countBy<T extends string | number>(items: T[]) {
  return items.reduce((counts, item) => {
    counts.set(item, (counts.get(item) ?? 0) + 1);
    return counts;
  }, new Map<T, number>());
}

function countMatches<T extends string | number>(left: Map<T, number>, right: Map<T, number>) {
  let matches = 0;
  left.forEach((count, key) => {
    matches += Math.min(count, right.get(key) ?? 0);
  });
  return matches;
}

function subtractCounts<T extends string | number>(left: Map<T, number>, right: Map<T, number>) {
  const result: T[] = [];
  left.forEach((count, key) => {
    const missing = count - (right.get(key) ?? 0);
    for (let index = 0; index < missing; index += 1) result.push(key);
  });
  return result;
}

function normalizedTimingSignatures(notes: PianoRollNote[]) {
  const firstBeat = Math.min(...notes.map((note) => note.startBeat));
  return notes.map((note) => `${note.pitch}@${Number((note.startBeat - firstBeat).toFixed(2))}`);
}

export function scoreExerciseAnswer(input: PianoRollNote[], expected: PianoRollNote[]) {
  if (input.length === 0) {
    return { score: 0, message: "노트를 먼저 찍어보세요." };
  }
  if (expected.length === 0) {
    return { score: 0, message: "비교할 정답 노트가 없습니다." };
  }

  const expectedPitchCounts = countBy(expected.map((note) => note.pitch));
  const inputPitchCounts = countBy(input.map((note) => note.pitch));
  const expectedClasses = new Set(expected.map((note) => pitchClass(note.pitch)));
  const expectedPitchNames = new Set(expected.map((note) => note.pitch));
  const exactPitchMatches = countMatches(expectedPitchCounts, inputPitchCounts);
  const missingPitches = subtractCounts(expectedPitchCounts, inputPitchCounts);
  const unexpectedPitches = input.map((note) => note.pitch).filter((pitch) => !expectedClasses.has(pitchClass(pitch)));
  const octaveIssues = input.map((note) => note.pitch).filter((pitch) => expectedClasses.has(pitchClass(pitch)) && !expectedPitchNames.has(pitch));
  const timingMatches = countMatches(countBy(normalizedTimingSignatures(expected)), countBy(normalizedTimingSignatures(input)));
  const timingIssues = Math.max(0, exactPitchMatches - timingMatches);
  const rawScore = Math.round((exactPitchMatches / expected.length) * 100) - unexpectedPitches.length * 15 - octaveIssues.length * 10 - timingIssues * 8;
  const score = Math.min(100, Math.max(0, rawScore));
  const issues = [
    missingPitches.length ? `빠진 음: ${missingPitches.slice(0, 6).join(", ")}` : "",
    unexpectedPitches.length ? `다른 음: ${[...new Set(unexpectedPitches)].slice(0, 6).join(", ")}` : "",
    octaveIssues.length ? `옥타브 확인: ${[...new Set(octaveIssues)].slice(0, 6).join(", ")}` : "",
    timingIssues ? `박자 위치 ${timingIssues}개 확인` : ""
  ].filter(Boolean);
  const message = score === 100 ? "구성음과 박자 패턴이 모두 맞습니다." : issues.join(" · ") || `${exactPitchMatches}/${expected.length}개 노트가 맞습니다.`;
  return { score, message };
}
