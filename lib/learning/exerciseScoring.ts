import type { PianoRollNote } from "@/types/music";
import { summarizeVoiceLeading } from "@/lib/learning/voiceLeading";

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
    duration?: ExerciseFeedbackItem[];
    bass?: ExerciseFeedbackItem[];
    tension?: ExerciseFeedbackItem[];
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
  const expectedDurationMap = new Map(expected.map((note) => [note.pitch, note.duration]));
  const durationIssues = input.filter((note) => {
    const expectedDuration = expectedDurationMap.get(note.pitch);
    return expectedDuration !== undefined && Math.abs(note.duration - expectedDuration) > 0.26;
  });
  const expectedBass = expected.filter((note) => note.role === "root" || note.voice === "bass");
  const bassMatches = countMatches(countBy(expectedBass.map((note) => note.pitch)), inputPitchCounts);
  const bassIssues = Math.max(0, expectedBass.length - bassMatches);
  const expectedTensions = expected.filter((note) => note.role === "seventh" || note.role === "tension");
  const tensionMatches = countMatches(countBy(expectedTensions.map((note) => note.pitch)), inputPitchCounts);
  const tensionIssues = Math.max(0, expectedTensions.length - tensionMatches);
  const inputVoiceSummary = summarizeVoiceLeading(input);
  const expectedVoiceSummary = summarizeVoiceLeading(expected);
  const voiceLeapIssues = Math.max(0, inputVoiceSummary.leaps.length - expectedVoiceSummary.leaps.length);
  const rawScore =
    Math.round((exactPitchMatches / expected.length) * 100) -
    unexpectedPitches.length * 25 -
    extraExactPitches.length * 25 -
    octaveIssues.length * 10 -
    timingIssues * 8 -
    durationIssues.length * 5 -
    bassIssues * 8 -
    tensionIssues * 6 -
    voiceLeapIssues * 4;
  const score = Math.min(100, Math.max(0, rawScore));
  const passed = score >= 80;
  const issues = [
    missingPitches.length ? `빠진 음: ${missingPitches.slice(0, 6).join(", ")}` : "",
    unexpectedPitches.length ? `다른 음: ${[...new Set(unexpectedPitches)].slice(0, 6).join(", ")}` : "",
    extraExactPitches.length ? `중복 음: ${extraExactPitches.slice(0, 6).join(", ")}` : "",
    octaveIssues.length ? `옥타브 확인: ${[...new Set(octaveIssues)].slice(0, 6).join(", ")}` : "",
    timingIssues ? `박자 위치 ${timingIssues}개 확인` : "",
    durationIssues.length ? `길이 ${durationIssues.length}개 확인` : "",
    bassIssues ? `베이스 루트 ${bassIssues}개 확인` : "",
    tensionIssues ? `텐션/7도 ${tensionIssues}개 확인` : "",
    voiceLeapIssues ? `큰 성부 도약 ${voiceLeapIssues}개 확인` : ""
  ].filter(Boolean);
  const message = score === 100 ? "구성음과 박자 패턴이 모두 맞습니다." : issues.join(" · ") || `${exactPitchMatches}/${expected.length}개 노트가 맞습니다.`;
  const missingSummary = missingPitches.slice(0, 6).join(", ");
  const extraSummary = extraExactPitches.slice(0, 6).join(", ");
  const unexpectedSummary = [...new Set(unexpectedPitches)].slice(0, 6).join(", ");
  const octaveSummary = [...new Set(octaveIssues)].slice(0, 6).join(", ");
  const durationSummary = durationIssues.slice(0, 6).map((note) => note.pitch).join(", ");
  const good = [
    exactPitchMatches > 0 ? `핵심 음 ${exactPitchMatches}/${expected.length}개를 정확한 높이로 맞췄습니다.` : "",
    missingPitches.length === 0 && exactPitchMatches > 0 ? "목표 구성음이 모두 들어갔습니다." : "",
    unexpectedPitches.length === 0 ? "과제 밖의 음을 추가하지 않았습니다." : "",
    timingIssues === 0 && exactPitchMatches > 0 ? "맞힌 음의 시작 위치가 목표 패턴과 맞습니다." : "",
    durationIssues.length === 0 && exactPitchMatches > 0 ? "노트 길이가 목표 패턴과 크게 어긋나지 않습니다." : "",
    voiceLeapIssues === 0 && input.length > 3 ? "성부가 큰 도약 없이 자연스럽게 이어집니다." : ""
  ].filter(Boolean);
  const fixes = [
    missingPitches.length ? `${missingSummary}을 같은 박자 안에 추가하세요.` : "",
    unexpectedPitches.length ? `${unexpectedSummary}은 목표 구성음 밖입니다. 빼거나 가까운 목표 음으로 바꾸세요.` : "",
    extraExactPitches.length ? `${extraSummary}이 중복되어 있습니다. 목표 패턴에 필요한 개수만 남기세요.` : "",
    octaveIssues.length ? `${octaveSummary}은 음 이름은 맞지만 옥타브가 다릅니다. 위아래 한 옥타브를 확인하세요.` : "",
    timingIssues ? `맞힌 음 중 ${timingIssues}개는 시작 박자가 다릅니다. 예제의 세로 위치를 기준으로 다시 맞추세요.` : "",
    durationIssues.length ? `${durationSummary}의 길이를 예제와 더 가깝게 맞추세요.` : "",
    bassIssues ? "베이스 역할의 루트 음을 각 코드 시작 위치에 맞춰 두세요." : "",
    tensionIssues ? "7도나 텐션 음이 빠졌습니다. 색채 음을 유지해야 장르 느낌이 살아납니다." : "",
    voiceLeapIssues ? "연속 코드 사이에서 7반음 넘는 큰 도약을 줄여보세요." : ""
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
                : durationIssues.length
                  ? `${durationIssues[0].pitch}의 길이를 목표 노트처럼 조정해보세요.`
                  : bassIssues
                    ? "각 코드의 가장 낮은 루트 음부터 다시 맞춰보세요."
                    : tensionIssues
                      ? "빠진 7도나 텐션 음을 추가한 뒤 색채를 비교해보세요."
                      : voiceLeapIssues
                        ? "가장 크게 튀는 위쪽 음을 가까운 코드톤으로 옮겨보세요."
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
      voiceLeading: [
        octaveIssues.length ? { title: "음역", detail: octaveSummary } : undefined,
        voiceLeapIssues ? { title: "성부 도약", detail: `${voiceLeapIssues}개 구간이 7반음보다 크게 움직입니다.` } : undefined
      ].filter((item): item is ExerciseFeedbackItem => Boolean(item)),
      duration: durationIssues.length ? [{ title: "길이", detail: durationSummary }] : [],
      bass: bassIssues ? [{ title: "베이스", detail: `${bassIssues}개 루트 베이스를 확인하세요.` }] : [],
      tension: tensionIssues ? [{ title: "텐션", detail: `${tensionIssues}개 색채 음을 확인하세요.` }] : []
    }
  };
}
