import type { CommonMistake, ListeningDrill, ProjectCheckpoint, Quiz } from "@/types/lesson";
import type { ChordSymbol, NoteName, PianoRollNote } from "@/types/music";
import { isPianoRollNoteRole } from "@/lib/pianoRoll/noteRoles";
import { buildChord } from "@/lib/theory/chords";
import { midiToNoteName, noteNameToMidi } from "@/lib/theory/notes";
import { progressionToPianoRollNotes } from "@/lib/pianoRoll/chordMapping";

function note(id: string, pitch: string, startBeat: number, duration = 1, role: PianoRollNote["role"] = "chordTone"): PianoRollNote {
  return {
    id,
    pitch,
    midi: noteNameToMidi(pitch),
    startBeat,
    duration,
    role,
    scaleDegree: role === "root" ? "1" : undefined,
    voice: role === "root" ? "bass" : role === "passing" ? "melody" : "inner"
  };
}

export function chord(root: NoteName, quality: ChordSymbol["quality"]) {
  return buildChord(root, quality);
}

type TimedNoteSpec = {
  pitch: string;
  startBeat: number;
  duration?: number;
  role?: PianoRollNote["role"] | string;
};

export function notesFromPitches(slug: string, pitches: string[], step = 0.5, roles?: PianoRollNote["role"][]): PianoRollNote[] {
  return pitches.map((pitch, noteIndex) =>
    note(`${slug}-${noteIndex}`, pitch, noteIndex * step, Math.min(step, 1), roles?.[noteIndex] ?? (noteIndex === 0 ? "root" : "passing"))
  );
}

export function notesFromTimedSpecs(slug: string, specs: TimedNoteSpec[]): PianoRollNote[] {
  return specs.map((spec, noteIndex) => {
    const role = isPianoRollNoteRole(spec.role) ? spec.role : noteIndex === 0 ? "root" : "chordTone";
    return note(`${slug}-${noteIndex}`, spec.pitch, spec.startBeat, spec.duration ?? 1, role);
  });
}

export function quiz(id: string, question: string, choices: string[], answer: string, explanation: string): Quiz {
  return { id, question, type: "multiple-choice", choices, answer, explanation };
}

export function rolesFromSingleChord(pitches: string[], chords?: ChordSymbol[]) {
  if (chords?.length !== 1 || pitches.length !== chords[0].notes.length) return undefined;
  return progressionToPianoRollNotes(chords).map((item) => item.role);
}

function cloneNotes(slug: string, notes: PianoRollNote[]) {
  return notes.map((item, index) => ({ ...item, id: `${slug}-${index}` }));
}

function alterOneNote(slug: string, notes: PianoRollNote[], semitones: number) {
  if (notes.length === 0) return [];
  const targetIndex = Math.max(0, notes.length - 1);
  return notes.map((item, index) => {
    if (index !== targetIndex) return { ...item, id: `${slug}-${index}` };
    const midi = item.midi + semitones;
    return {
      ...item,
      id: `${slug}-${index}`,
      midi,
      pitch: midiToNoteName(midi),
      role: (item.role === "root" ? "root" : "outside") as PianoRollNote["role"]
    };
  });
}

function makeListeningOptions(slug: string, correctNotes: PianoRollNote[], distractorNotes: PianoRollNote[], correctFirst: boolean) {
  return correctFirst
    ? {
        answerId: "A" as const,
        options: [
          { id: "A" as const, label: "버전 A", notes: cloneNotes(`${slug}-a`, correctNotes) },
          { id: "B" as const, label: "버전 B", notes: cloneNotes(`${slug}-b`, distractorNotes) }
        ]
      }
    : {
        answerId: "B" as const,
        options: [
          { id: "A" as const, label: "버전 A", notes: cloneNotes(`${slug}-a`, distractorNotes) },
          { id: "B" as const, label: "버전 B", notes: cloneNotes(`${slug}-b`, correctNotes) }
        ]
      };
}

export function buildListeningDrills(slug: string, notes: PianoRollNote[], expectedNotes: PianoRollNote[], lessonIndex: number): ListeningDrill[] {
  const exampleOptions = makeListeningOptions(`${slug}-listen-example`, notes, alterOneNote(`${slug}-listen-example-distractor`, notes, 1), lessonIndex % 2 === 0);
  const practiceOptions = makeListeningOptions(
    `${slug}-listen-practice`,
    expectedNotes,
    alterOneNote(`${slug}-listen-practice-distractor`, expectedNotes, -1),
    lessonIndex % 3 === 0
  );
  return [
    {
      id: `${slug}-listen-example`,
      prompt: "어느 쪽이 이번 레슨 예제와 더 가깝게 들리나요?",
      answerId: exampleOptions.answerId,
      explanation: "정답 버전은 예제 피아노롤 그대로이고, 다른 버전은 마지막 음을 살짝 바꿔 중심감이나 해결감이 달라집니다.",
      options: exampleOptions.options
    },
    {
      id: `${slug}-listen-practice`,
      prompt: "어느 쪽이 실습 목표 패턴인가요?",
      answerId: practiceOptions.answerId,
      explanation: "정답 버전은 이 레슨의 실습 목표 음 묶음입니다. 다른 버전은 한 음이 바뀌어 코드 정체성이나 스케일 감각이 흐려집니다.",
      options: practiceOptions.options
    }
  ];
}

export function buildCommonMistakes(spec: {
  title: string;
  concepts: string[];
  exerciseTitle: string;
  exerciseInstruction: string;
  exerciseNotes?: string[];
  exerciseChords?: ChordSymbol[];
}): CommonMistake[] {
  const mainConcept = spec.concepts[0] ?? "핵심 개념";
  const target = spec.exerciseChords?.map((chordItem) => chordItem.name).join(" - ") ?? spec.exerciseNotes?.join(" ") ?? spec.exerciseTitle;
  return [
    {
      title: `${mainConcept}를 이름으로만 외움`,
      symptom: `${spec.title}을 설명 문장으로는 이해하지만 피아노롤에서 어떤 음을 찍어야 하는지 바로 찾지 못합니다.`,
      fix: `먼저 ${target}을 피아노롤에 배치하고, 각 음이 ${mainConcept}에서 어떤 역할인지 말해보세요.`,
      miniDrill: `${spec.exerciseTitle}를 한 번 만든 뒤 루트와 가장 중요한 색채 음을 각각 하나씩 짚어보세요.`
    },
    {
      title: "소리는 듣지 않고 정답만 맞힘",
      symptom: "노트 위치는 맞지만 예제와 번갈아 들었을 때 안정, 긴장, 색채 차이를 설명하지 못합니다.",
      fix: "A/B 청음과 예제 재생을 먼저 하고, 다른 버전에서 바뀐 음 하나가 느낌을 어떻게 바꾸는지 확인하세요.",
      miniDrill: "정답 패턴과 한 음 변형 패턴을 번갈아 재생한 뒤 차이를 한 문장으로 말해보세요."
    },
    {
      title: "DAW 적용으로 이어지지 않음",
      symptom: `${spec.exerciseInstruction} 과제는 통과했지만 4마디 루프 안에서 같은 아이디어를 다시 쓰지 못합니다.`,
      fix: "실습 패턴을 2마디로 줄인 뒤 같은 키에서 한 번 반복하고, 마지막 박자만 바꿔 다음 코드로 연결하세요.",
      miniDrill: "실습 노트를 복사해 4마디 그리드에 두 번 배치하고 마지막 음 하나만 바꿔 들어보세요."
    }
  ];
}

export function buildExerciseHints(spec: { exerciseTitle: string; exerciseInstruction: string; exerciseNotes?: string[]; exerciseChords?: ChordSymbol[] }) {
  const target = spec.exerciseChords?.map((chordItem) => chordItem.name).join(" - ") ?? spec.exerciseNotes?.join(" ") ?? spec.exerciseTitle;
  return [
    `목표 패턴은 ${target}입니다. 먼저 루트나 첫 음부터 같은 박자에 놓으세요.`,
    "맞힌 음이 있어도 옥타브가 다르면 감점됩니다. 예제의 세로 위치를 기준으로 위아래 한 옥타브를 확인하세요.",
    `${spec.exerciseInstruction}을 한 번 재생한 뒤, 틀린 음 하나만 고치고 다시 채점하세요.`
  ];
}

const projectSpecs: Record<string, { genre: ProjectCheckpoint["genre"]; title: string; goal: string; bpm: number; key: string; chords: ChordSymbol[]; steps: string[]; exportPrompt: string }> = {
  "roman-numerals": {
    genre: "Pop",
    title: "Pop 4마디 훅 진행 만들기",
    goal: "I-V-vi-IV를 다른 키로 옮겨도 같은 흐름으로 들리는지 확인합니다.",
    bpm: 96,
    key: "C",
    chords: [chord("C", "major"), chord("G", "major"), chord("A", "minor"), chord("F", "major")],
    steps: ["1마디마다 코드 하나씩 배치", "탑노트가 너무 크게 튀지 않게 조정", "마지막 F에서 다음 C로 돌아오는 느낌 확인"],
    exportPrompt: "DAW에서는 이 진행을 피아노 컴핑으로 찍고, 킥은 1박과 3박에 놓아 후렴 스케치로 확장하세요."
  },
  "tensions-add-sus": {
    genre: "Lo-fi",
    title: "Lo-fi 4마디 7th/add9 루프",
    goal: "기본 3화음에 7th와 add9를 더해 부드러운 반복 루프를 만듭니다.",
    bpm: 78,
    key: "C",
    chords: [chord("F", "maj7"), chord("E", "m7"), chord("A", "m7"), chord("G", "7")],
    steps: ["각 코드 길이를 1마디로 유지", "7도 음을 빠뜨리지 않기", "마지막 G7에서 다시 Fmaj7로 돌아오는 긴장 확인"],
    exportPrompt: "DAW에서는 로즈 피아노나 부드러운 키로 찍고, 2마디째와 4마디째에만 짧은 멜로디 응답을 넣어보세요."
  },
  "arrangement-expansion": {
    genre: "Cinematic",
    title: "Cinematic 4마디 레이어 스케치",
    goal: "하나의 진행을 패드, 베이스, 아르페지오 역할로 나누어 편곡 감각을 확인합니다.",
    bpm: 84,
    key: "Am",
    chords: [chord("A", "minor"), chord("F", "major"), chord("C", "major"), chord("G", "major")],
    steps: ["베이스는 각 코드의 루트만 길게 유지", "중역 패드는 코드톤을 길게 배치", "상단은 8분음표 아르페지오로 분리"],
    exportPrompt: "DAW에서는 패드, 피아노, 베이스 트랙을 따로 만들고 같은 MIDI를 역할별로 나눠 배치하세요."
  }
};

export function buildProjectCheckpoint(slug: string): ProjectCheckpoint | undefined {
  const spec = projectSpecs[slug];
  if (!spec) return undefined;
  return {
    id: `${slug}-project`,
    title: spec.title,
    genre: spec.genre,
    goal: spec.goal,
    bars: 4,
    bpm: spec.bpm,
    key: spec.key,
    chords: spec.chords,
    notes: progressionToPianoRollNotes(spec.chords),
    steps: spec.steps,
    instrumentLayers: [
      { name: "Bass", role: "저역", instruction: "각 마디 첫 박에 루트만 길게 둡니다." },
      { name: "Pad", role: "중역", instruction: "코드톤을 4박 길이로 유지해 화성을 받칩니다." },
      { name: "Piano", role: "리듬", instruction: "2박과 4박에 짧은 컴핑을 추가합니다." },
      { name: "Arp", role: "상단", instruction: "코드톤을 8분음표로 나누어 움직임을 만듭니다." }
    ],
    extensionBars: 8,
    extensionSteps: ["앞 4마디는 원형 루프 유지", "뒤 4마디는 탑노트나 베이스를 하나씩 변형", "8마디 끝에서 다시 첫 코드로 돌아오는지 확인"],
    exportPrompt: spec.exportPrompt
  };
}
