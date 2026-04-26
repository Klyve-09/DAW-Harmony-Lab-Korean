import { clsx, type ClassValue } from "clsx";
import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { noteNameToMidi } from "@/lib/theory/notes";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

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

export type ExerciseFeedbackItem = {
  title: string;
  detail: string;
};

export type ExerciseScoreResult = {
  score: number;
  passed: boolean;
  message: string;
  good: string[];
  fixes: string[];
  nextAction: string;
  categories: {
    pitch: ExerciseFeedbackItem[];
    timing: ExerciseFeedbackItem[];
    harmony: ExerciseFeedbackItem[];
    voiceLeading: ExerciseFeedbackItem[];
  };
};

export function scoreExerciseAnswer(input: PianoRollNote[], expected: PianoRollNote[]) {
  if (input.length === 0) {
    return {
      score: 0,
      passed: false,
      message: "노트를 먼저 찍어보세요.",
      good: ["아직 채점할 노트가 없습니다."],
      fixes: ["피아노롤을 클릭해서 목표 패턴을 먼저 만들어보세요."],
      nextAction: "첫 목표 음을 찍은 뒤 내 노트 재생으로 소리를 확인하세요.",
      categories: {
        pitch: [{ title: "입력 필요", detail: "정답과 비교할 음이 아직 없습니다." }],
        timing: [],
        harmony: [],
        voiceLeading: []
      }
    };
  }
  if (expected.length === 0) {
    return {
      score: 0,
      passed: false,
      message: "비교할 정답 노트가 없습니다.",
      good: ["입력한 노트는 재생할 수 있습니다."],
      fixes: ["이 과제에는 아직 비교 기준이 연결되어 있지 않습니다."],
      nextAction: "다른 레슨 과제로 실습하거나 예제 피아노롤을 참고하세요.",
      categories: {
        pitch: [],
        timing: [],
        harmony: [{ title: "정답 없음", detail: "expectedNotes가 비어 있어 음악적 채점을 할 수 없습니다." }],
        voiceLeading: []
      }
    };
  }

  const expectedPitchCounts = countBy(expected.map((note) => note.pitch));
  const inputPitchCounts = countBy(input.map((note) => note.pitch));
  const expectedClasses = new Set(expected.map((note) => pitchClass(note.pitch)));
  const expectedPitchNames = new Set(expected.map((note) => note.pitch));
  const exactPitchMatches = countMatches(expectedPitchCounts, inputPitchCounts);
  const missingPitches = subtractCounts(expectedPitchCounts, inputPitchCounts);
  const extraExactPitches = subtractCounts(inputPitchCounts, expectedPitchCounts).filter((pitch) => expectedPitchNames.has(pitch));
  const unexpectedPitches = input.map((note) => note.pitch).filter((pitch) => !expectedClasses.has(pitchClass(pitch)));
  const octaveIssues = input.map((note) => note.pitch).filter((pitch) => expectedClasses.has(pitchClass(pitch)) && !expectedPitchNames.has(pitch));
  const timingMatches = countMatches(countBy(normalizedTimingSignatures(expected)), countBy(normalizedTimingSignatures(input)));
  const timingIssues = Math.max(0, exactPitchMatches - timingMatches);
  const rawScore =
    Math.round((exactPitchMatches / expected.length) * 100) -
    unexpectedPitches.length * 25 -
    extraExactPitches.length * 25 -
    octaveIssues.length * 10 -
    timingIssues * 8;
  const score = Math.min(100, Math.max(0, rawScore));
  const passed = score >= 80;
  const issues = [
    missingPitches.length ? `빠진 음: ${missingPitches.slice(0, 6).join(", ")}` : "",
    unexpectedPitches.length ? `다른 음: ${[...new Set(unexpectedPitches)].slice(0, 6).join(", ")}` : "",
    extraExactPitches.length ? `중복 음: ${extraExactPitches.slice(0, 6).join(", ")}` : "",
    octaveIssues.length ? `옥타브 확인: ${[...new Set(octaveIssues)].slice(0, 6).join(", ")}` : "",
    timingIssues ? `박자 위치 ${timingIssues}개 확인` : ""
  ].filter(Boolean);
  const message = score === 100 ? "구성음과 박자 패턴이 모두 맞습니다." : issues.join(" · ") || `${exactPitchMatches}/${expected.length}개 노트가 맞습니다.`;
  const missingSummary = missingPitches.slice(0, 6).join(", ");
  const extraSummary = extraExactPitches.slice(0, 6).join(", ");
  const unexpectedSummary = [...new Set(unexpectedPitches)].slice(0, 6).join(", ");
  const octaveSummary = [...new Set(octaveIssues)].slice(0, 6).join(", ");
  const good = [
    exactPitchMatches > 0 ? `핵심 음 ${exactPitchMatches}/${expected.length}개를 정확한 높이로 맞췄습니다.` : "",
    missingPitches.length === 0 && exactPitchMatches > 0 ? "목표 구성음이 모두 들어갔습니다." : "",
    unexpectedPitches.length === 0 ? "과제 밖의 음을 추가하지 않았습니다." : "",
    timingIssues === 0 && exactPitchMatches > 0 ? "맞힌 음의 시작 위치가 목표 패턴과 맞습니다." : ""
  ].filter(Boolean);
  const fixes = [
    missingPitches.length ? `${missingSummary}을 같은 박자 안에 추가하세요.` : "",
    unexpectedPitches.length ? `${unexpectedSummary}은 목표 구성음 밖입니다. 빼거나 가까운 목표 음으로 바꾸세요.` : "",
    extraExactPitches.length ? `${extraSummary}이 중복되어 있습니다. 목표 패턴에 필요한 개수만 남기세요.` : "",
    octaveIssues.length ? `${octaveSummary}은 음 이름은 맞지만 옥타브가 다릅니다. 위아래 한 옥타브를 확인하세요.` : "",
    timingIssues ? `맞힌 음 중 ${timingIssues}개는 시작 박자가 다릅니다. 예제의 세로 위치를 기준으로 다시 맞추세요.` : ""
  ].filter(Boolean);
  const nextAction =
    score === 100
      ? "이 패턴을 재생해서 소리로 확인한 뒤 다음 과제로 넘어가세요."
      : missingPitches.length
        ? `${missingPitches[0]}부터 추가하고 다시 정답 확인을 눌러보세요.`
        : unexpectedPitches.length
          ? `${unexpectedPitches[0]}을 목표 코드톤으로 바꾼 뒤 다시 들어보세요.`
          : extraExactPitches.length
            ? `${extraExactPitches[0]} 중복 노트를 하나만 남기고 다시 확인하세요.`
          : octaveIssues.length
            ? `${octaveIssues[0]}의 옥타브를 목표 위치로 옮겨보세요.`
            : timingIssues
              ? "음 이름은 거의 맞습니다. 시작 박자를 예제와 맞춰보세요."
              : "내 노트를 재생해서 목표 예제와 번갈아 들으며 차이를 좁혀보세요.";

  return {
    score,
    passed,
    message,
    good: good.length ? good : ["목표와 겹치는 음이 아직 없습니다."],
    fixes: fixes.length ? fixes : ["수정할 부분이 없습니다."],
    nextAction,
    categories: {
      pitch: [
        missingPitches.length ? { title: "빠진 음", detail: missingSummary } : undefined,
        unexpectedPitches.length ? { title: "과제 밖 음", detail: unexpectedSummary } : undefined,
        extraExactPitches.length ? { title: "중복 음", detail: extraSummary } : undefined
      ].filter((item): item is ExerciseFeedbackItem => Boolean(item)),
      timing: timingIssues ? [{ title: "박자", detail: `${timingIssues}개 음의 시작 위치를 확인하세요.` }] : [],
      harmony: [
        { title: "구성음", detail: `${exactPitchMatches}/${expected.length}개 음이 목표 코드와 일치합니다.` },
        passed ? { title: "숙달 기준", detail: "80점 이상으로 레슨 완료 조건을 통과했습니다." } : undefined
      ].filter((item): item is ExerciseFeedbackItem => Boolean(item)),
      voiceLeading: octaveIssues.length ? [{ title: "음역", detail: octaveSummary }] : []
    }
  };
}
