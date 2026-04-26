import type { CommonMistake, Lesson, ListeningDrill, ProjectCheckpoint, Quiz } from "@/types/lesson";
import type { ChordSymbol, NoteName, PianoRollNote } from "@/types/music";
import { buildChord } from "@/lib/theory/chords";
import { midiToNoteName, noteNameToMidi } from "@/lib/theory/notes";
import { progressionToPianoRollNotes } from "@/lib/utils";

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

function chord(root: NoteName, quality: ChordSymbol["quality"]) {
  return buildChord(root, quality);
}

type TimedNoteSpec = {
  pitch: string;
  startBeat: number;
  duration?: number;
  role?: PianoRollNote["role"] | string;
};

function notesFromPitches(slug: string, pitches: string[], step = 0.5, roles?: PianoRollNote["role"][]): PianoRollNote[] {
  return pitches.map((pitch, noteIndex) =>
    note(`${slug}-${noteIndex}`, pitch, noteIndex * step, Math.min(step, 1), roles?.[noteIndex] ?? (noteIndex === 0 ? "root" : "passing"))
  );
}

function notesFromTimedSpecs(slug: string, specs: TimedNoteSpec[]): PianoRollNote[] {
  return specs.map((spec, noteIndex) => {
    const role = isNoteRole(spec.role)
      ? spec.role
      : noteIndex === 0 ? "root" : "chordTone";
    return note(`${slug}-${noteIndex}`, spec.pitch, spec.startBeat, spec.duration ?? 1, role);
  });
}

function isNoteRole(value: unknown): value is PianoRollNote["role"] {
  return value === "root" || value === "third" || value === "fifth" || value === "seventh" || value === "tension" || value === "passing" || value === "outside" || value === "chordTone";
}

function quiz(id: string, question: string, choices: string[], answer: string, explanation: string): Quiz {
  return { id, question, type: "multiple-choice", choices, answer, explanation };
}

function rolesFromSingleChord(pitches: string[], chords?: ChordSymbol[]) {
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

function buildListeningDrills(slug: string, notes: PianoRollNote[], expectedNotes: PianoRollNote[], lessonIndex: number): ListeningDrill[] {
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

function buildCommonMistakes(spec: {
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

function buildExerciseHints(spec: { exerciseTitle: string; exerciseInstruction: string; exerciseNotes?: string[]; exerciseChords?: ChordSymbol[] }) {
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

function buildProjectCheckpoint(slug: string): ProjectCheckpoint | undefined {
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

const lessonSpecs = [
  {
    slug: "piano-roll-intervals-scales",
    title: "피아노롤에서 음정과 스케일 이해하기",
    description: "C major와 A minor를 피아노롤에 찍으며 키와 스케일 감각을 익힙니다.",
    concepts: ["반음/온음", "메이저 스케일", "내추럴 마이너", "키"],
    content: "악보보다 피아노롤을 먼저 보는 DAW 사용자에게 스케일은 '쓸 수 있는 MIDI 노트 묶음'입니다. C major와 A minor는 같은 흰 건반을 쓰지만 중심음이 달라 느낌이 바뀝니다.",
    dawPractice: "C D E F G A B C를 한 박씩 찍고, 같은 방식으로 A B C D E F G A를 찍어 비교해보세요.",
    chords: [chord("C", "major")],
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
    exerciseTitle: "C major 스케일 만들기",
    exerciseInstruction: "빈 그리드에 C4부터 C5까지 C major 음을 순서대로 찍어보세요.",
    quizzes: [
      quiz("q1", "C major 스케일의 음은?", ["C D E F G A B", "C D Eb F G Ab Bb", "C Db E F G A B"], "C D E F G A B", "C major는 샵/플랫 없이 흰 건반만 사용합니다."),
      quiz("q2", "A natural minor의 중심음은?", ["C", "A", "G"], "A", "같은 흰 건반이어도 A를 중심으로 들으면 A minor가 됩니다.")
    ]
  },
  {
    slug: "triads",
    title: "3화음 만들기",
    description: "스케일 안에서 3도씩 쌓아 메이저, 마이너, 디미니쉬 코드를 만듭니다.",
    concepts: ["루트", "3도", "5도", "다이어토닉 코드"],
    content: "C major 안의 기본 3화음은 C, Dm, Em, F, G, Am, Bdim입니다. 코드 이름보다 어떤 MIDI 노트가 쌓이는지 보는 것이 중요합니다.",
    dawPractice: "C E G, D F A, E G B처럼 한 코드씩 세 음을 동시에 찍어보세요.",
    chords: [chord("C", "major"), chord("G", "major"), chord("A", "minor"), chord("F", "major")],
    exerciseTitle: "C major 코드 만들기",
    exerciseInstruction: "C, E, G 세 음을 같은 박자에 배치하세요.",
    exerciseChords: [chord("C", "major")],
    exerciseNotes: ["C4", "E4", "G4"],
    quizzes: [
      quiz("q1", "C major 3화음의 구성음은?", ["C E G", "C F G", "C Eb G"], "C E G", "메이저 3화음은 루트, 장3도, 완전5도로 만들어집니다."),
      quiz("q2", "C major 키의 vi 코드는?", ["F", "G", "Am"], "Am", "C major의 여섯 번째 음 A 위에 쌓은 코드는 Am입니다.")
    ]
  },
  {
    slug: "roman-numerals",
    title: "로마 숫자 분석",
    description: "코드 진행을 숫자로 기억해 다른 키로 옮기는 방법을 배웁니다.",
    concepts: ["I-V-vi-IV", "트랜스포즈", "키 변경", "레퍼런스 분석"],
    content: "C-G-Am-F는 C key에서 I-V-vi-IV입니다. 같은 숫자를 G key로 옮기면 G-D-Em-C가 됩니다.",
    dawPractice: "I-V-vi-IV를 C major와 G major에 각각 찍고 같은 진행인지 들어보세요.",
    chords: [chord("G", "major"), chord("D", "major"), chord("E", "minor"), chord("C", "major")],
    exerciseTitle: "I-V-vi-IV 찍기",
    exerciseInstruction: "C key 기준 C, G, Am, F의 코드톤을 한 마디씩 찍어보세요.",
    exerciseChords: [chord("C", "major"), chord("G", "major"), chord("A", "minor"), chord("F", "major")],
    quizzes: [
      quiz("q1", "C-G-Am-F의 로마 숫자는?", ["I-V-vi-IV", "vi-IV-I-V", "ii-V-I"], "I-V-vi-IV", "C major에서 C는 I, G는 V, Am은 vi, F는 IV입니다."),
      quiz("q2", "I-V-vi-IV를 G key로 옮기면?", ["G-D-Em-C", "G-C-D-Em", "C-G-Am-F"], "G-D-Em-C", "G major의 I, V, vi, IV입니다.")
    ]
  },
  {
    slug: "chord-functions",
    title: "코드 기능 이해하기",
    description: "토닉, 서브도미넌트, 도미넌트의 안정과 긴장을 들어봅니다.",
    concepts: ["토닉", "서브도미넌트", "도미넌트", "ii-V-I"],
    content: "코드는 이름만 있는 것이 아니라 역할이 있습니다. 토닉은 안정, 도미넌트는 긴장과 해결 욕구를 만듭니다.",
    dawPractice: "C-F-G-C와 C-Dm-G-C를 비교하며 ii-V-I의 움직임을 들어보세요.",
    chords: [chord("C", "major"), chord("D", "minor"), chord("G", "major"), chord("C", "major")],
    exerciseTitle: "긴장에서 안정으로 해결하기",
    exerciseInstruction: "Dm-G-C를 찍어 마지막 C에서 안정되는 느낌을 확인하세요.",
    exerciseChords: [chord("D", "minor"), chord("G", "major"), chord("C", "major")],
    quizzes: [
      quiz("q1", "C major에서 도미넌트 계열 대표 코드는?", ["G", "F", "Am"], "G", "V인 G는 I인 C로 해결하려는 긴장을 만듭니다."),
      quiz("q2", "ii-V-I in C는?", ["Dm-G-C", "F-G-Am", "C-Am-F"], "Dm-G-C", "C key에서 ii는 Dm, V는 G, I는 C입니다.")
    ]
  },
  {
    slug: "seventh-chords",
    title: "7th 코드",
    description: "3화음에 7도를 더해 팝, R&B, 로파이 색채를 만듭니다.",
    concepts: ["maj7", "m7", "dominant 7", "m7b5"],
    content: "3화음만 쓰면 단순하게 들릴 수 있습니다. 7th를 추가하면 코드의 색이 부드럽고 세련되게 바뀝니다.",
    dawPractice: "C-Am-F-G를 Cmaj7-Am7-Fmaj7-G7로 바꿔 들어보세요.",
    chords: [chord("C", "maj7"), chord("A", "m7"), chord("F", "maj7"), chord("G", "7")],
    exerciseTitle: "Cmaj7 만들기",
    exerciseInstruction: "C, E, G, B를 같은 박자에 배치하세요.",
    exerciseChords: [chord("C", "maj7")],
    exerciseNotes: ["C4", "E4", "G4", "B4"],
    quizzes: [
      quiz("q1", "Cmaj7의 구성음은?", ["C E G B", "C E G Bb", "C Eb G B"], "C E G B", "maj7은 루트에서 장7도인 B를 포함합니다."),
      quiz("q2", "G7의 역할은 보통?", ["C로 해결하려는 긴장", "완전한 정지", "키 밖의 오류"], "C로 해결하려는 긴장", "C key에서 G7은 V7로 I에 해결됩니다.")
    ]
  },
  {
    slug: "voicing-inversions",
    title: "보이싱과 인버전",
    description: "루트 포지션만 반복하지 않고 가까운 음으로 코드가 이어지게 만듭니다.",
    concepts: ["전위", "공통음", "탑노트", "보이스 리딩"],
    content: "모든 코드를 루트부터 쌓으면 위아래로 크게 튑니다. 좋은 보이싱은 공통음을 유지하고 가까운 음으로 이동합니다.",
    dawPractice: "C-G-Am-F를 E G C / D G B / C E A / C F A처럼 찍어보세요.",
    chords: [chord("C", "major"), chord("G", "major"), chord("A", "minor"), chord("F", "major")],
    notes: ["E4", "G4", "C5", "D4", "G4", "B4", "C4", "E4", "A4", "C4", "F4", "A4"],
    timedNotes: [
      { pitch: "E4", startBeat: 0, role: "chordTone" }, { pitch: "G4", startBeat: 0 }, { pitch: "C5", startBeat: 0 },
      { pitch: "D4", startBeat: 1 }, { pitch: "G4", startBeat: 1 }, { pitch: "B4", startBeat: 1 },
      { pitch: "C4", startBeat: 2 }, { pitch: "E4", startBeat: 2 }, { pitch: "A4", startBeat: 2 },
      { pitch: "C4", startBeat: 3 }, { pitch: "F4", startBeat: 3 }, { pitch: "A4", startBeat: 3 }
    ],
    exerciseTitle: "가까운 보이싱 만들기",
    exerciseInstruction: "C-G-Am-F를 각 코드의 위 음이 크게 튀지 않도록 배치하세요.",
    exerciseTimedNotes: [
      { pitch: "E4", startBeat: 0, role: "chordTone" }, { pitch: "G4", startBeat: 0 }, { pitch: "C5", startBeat: 0 },
      { pitch: "D4", startBeat: 1 }, { pitch: "G4", startBeat: 1 }, { pitch: "B4", startBeat: 1 },
      { pitch: "C4", startBeat: 2 }, { pitch: "E4", startBeat: 2 }, { pitch: "A4", startBeat: 2 },
      { pitch: "C4", startBeat: 3 }, { pitch: "F4", startBeat: 3 }, { pitch: "A4", startBeat: 3 }
    ],
    quizzes: [
      quiz("q1", "보이싱을 정리하는 핵심은?", ["가까운 음으로 이동", "항상 루트를 맨 아래에 두기", "모든 코드를 낮게 쌓기"], "가까운 음으로 이동", "공통음 유지와 가까운 이동이 자연스러운 연결을 만듭니다."),
      quiz("q2", "탑노트가 중요한 이유는?", ["청자가 잘 기억하기 때문", "항상 루트여야 해서", "오디오를 크게 해서"], "청자가 잘 기억하기 때문", "가장 위 음은 멜로디처럼 들리기 쉽습니다.")
    ]
  },
  {
    slug: "basslines-slash-chords",
    title: "베이스라인과 슬래시 코드",
    description: "코드는 유지하고 베이스만 움직여 진행을 더 세련되게 만듭니다.",
    concepts: ["슬래시 코드", "하행 베이스", "페달 포인트", "전위 베이스"],
    content: "G/B는 G 코드이지만 베이스는 B라는 뜻입니다. DAW에서는 베이스가 진행의 움직임을 강하게 결정합니다.",
    dawPractice: "C-G/B-Am-Am/G-F-C/E-Dm-G의 베이스만 따로 들어보세요.",
    chords: [chord("C", "major"), chord("G", "major"), chord("A", "minor"), chord("F", "major")],
    notes: ["C3", "E4", "G4", "B2", "G4", "B4", "A2", "C4", "E4", "F2", "A4", "C5"],
    timedNotes: [
      { pitch: "C3", startBeat: 0, role: "root" }, { pitch: "E4", startBeat: 0 }, { pitch: "G4", startBeat: 0 },
      { pitch: "B2", startBeat: 1, role: "root" }, { pitch: "G4", startBeat: 1 }, { pitch: "B4", startBeat: 1 },
      { pitch: "A2", startBeat: 2, role: "root" }, { pitch: "C4", startBeat: 2 }, { pitch: "E4", startBeat: 2 },
      { pitch: "G2", startBeat: 3, role: "root" }, { pitch: "C4", startBeat: 3 }, { pitch: "E4", startBeat: 3 }
    ],
    exerciseTitle: "하행 베이스 만들기",
    exerciseInstruction: "C, B, A, G처럼 베이스가 내려가도록 노트를 배치하세요.",
    exerciseNotes: ["C3", "B2", "A2", "G2"],
    quizzes: [
      quiz("q1", "G/B의 의미는?", ["G 코드에 B 베이스", "B 코드에 G 베이스", "G와 B만 연주"], "G 코드에 B 베이스", "슬래시 뒤의 음은 베이스를 뜻합니다."),
      quiz("q2", "C-G/B-Am의 베이스 흐름은?", ["C-B-A", "C-G-A", "E-B-C"], "C-B-A", "슬래시 코드 덕분에 순차 하행이 생깁니다.")
    ]
  },
  {
    slug: "tensions-add-sus",
    title: "텐션, add, sus 코드",
    description: "add9, sus2, sus4, maj9 같은 실전 색채를 피아노롤로 확인합니다.",
    concepts: ["add9", "sus2", "sus4", "maj9", "m9"],
    content: "텐션은 분위기를 만들지만 너무 많이 쓰면 흐려질 수 있습니다. 처음에는 add9와 sus를 필요한 곳에만 써보세요.",
    dawPractice: "C, Cadd9, Csus2, Csus4, Cmaj9를 차례로 찍고 색채를 비교하세요.",
    chords: [chord("C", "add9"), chord("G", "sus4"), chord("A", "m7"), chord("F", "maj9")],
    exerciseTitle: "Cadd9 만들기",
    exerciseInstruction: "C, E, G에 D를 더해 Cadd9 색채를 만들어보세요.",
    exerciseChords: [chord("C", "add9")],
    exerciseNotes: ["C4", "E4", "G4", "D5"],
    quizzes: [
      quiz("q1", "Cadd9에 추가되는 대표 음은?", ["D", "F", "Bb"], "D", "C에서 9th는 한 옥타브 위의 D입니다."),
      quiz("q2", "sus4는 보통 어떤 음을 대신 쓰나?", ["3도 대신 4도", "5도 대신 7도", "루트 대신 9도"], "3도 대신 4도", "sus는 3도를 잠시 보류해 모호한 느낌을 만듭니다.")
    ]
  },
  {
    slug: "secondary-dominants",
    title: "세컨더리 도미넌트",
    description: "다음 코드로 강하게 접근하는 V7을 잠깐 빌려옵니다.",
    concepts: ["V7/vi", "V7/V", "외부음", "해결"],
    content: "C major에서 Am으로 가기 직전 E7을 넣으면 G#이라는 외부음이 생기지만 Am으로 해결되어 자연스럽게 들립니다.",
    dawPractice: "C-E7-Am-D7-G-C를 찍고 E7과 D7이 어디로 해결되는지 들어보세요.",
    chords: [chord("C", "major"), chord("E", "7"), chord("A", "minor"), chord("D", "7"), chord("G", "major"), chord("C", "major")],
    exerciseTitle: "V7/vi 넣기",
    exerciseInstruction: "C와 Am 사이에 E7 구성음을 배치해 Am으로 끌어당겨보세요.",
    exerciseChords: [chord("C", "major"), chord("E", "7"), chord("A", "minor")],
    quizzes: [
      quiz("q1", "C key에서 Am으로 가는 세컨더리 도미넌트는?", ["E7", "D7", "Bb"], "E7", "Am의 V7은 E7입니다."),
      quiz("q2", "E7 안의 C major 밖 음은?", ["G#", "E", "B"], "G#", "G#은 C major 밖 음이지만 A로 해결됩니다.")
    ]
  },
  {
    slug: "modal-interchange",
    title: "모달 인터체인지",
    description: "같은 으뜸음의 마이너 쪽에서 코드를 빌려 드라마틱한 색을 넣습니다.",
    concepts: ["borrowed chord", "bIII", "iv minor", "bVI", "bVII"],
    content: "C major에 C minor 쪽 코드인 Fm, Ab, Bb를 빌려오면 밝은 진행에 어두운 색을 넣을 수 있습니다.",
    dawPractice: "C-F-Fm-C와 C-Ab-Bb-C를 찍어 borrowed chord의 색을 들어보세요.",
    chords: [chord("C", "major"), chord("F", "major"), chord("F", "minor"), chord("C", "major")],
    exerciseTitle: "iv minor 넣기",
    exerciseInstruction: "C-F-Fm-C에서 Fm의 Ab가 G로 해결되는 느낌을 확인하세요.",
    quizzes: [
      quiz("q1", "C major에서 빌려온 iv minor는?", ["Fm", "F", "Gm"], "Fm", "C minor 쪽의 iv는 Fm입니다."),
      quiz("q2", "C-Ab-Bb-C에서 Ab는?", ["bVI", "V", "ii"], "bVI", "C 기준 Ab는 낮아진 6도 위 코드입니다.")
    ]
  },
  {
    slug: "modes",
    title: "모드",
    description: "Dorian, Lydian, Mixolydian처럼 스케일 색채를 작곡 도구로 씁니다.",
    concepts: ["Dorian", "Lydian", "Mixolydian", "특징음"],
    content: "모드는 전부 외우기보다 한 코드 루프 위에서 특징음을 들어보면 빠르게 감각이 생깁니다.",
    dawPractice: "Dm7 위에 D Dorian, Cmaj7 위에 C Lydian, G 위에 G Mixolydian 멜로디를 얹어보세요.",
    chords: [chord("D", "m7"), chord("G", "7")],
    notes: ["D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"],
    exerciseTitle: "D Dorian 멜로디",
    exerciseInstruction: "Dm7 루프 위에 B를 포함한 D Dorian 음을 찍어보세요.",
    quizzes: [
      quiz("q1", "D Dorian의 특징음은?", ["B", "Bb", "F#"], "B", "Dorian은 마이너 느낌에 장6도가 들어갑니다."),
      quiz("q2", "C Lydian의 특징음은?", ["F#", "Bb", "Eb"], "F#", "Lydian은 #4가 떠 있는 밝은 느낌을 만듭니다.")
    ]
  },
  {
    slug: "reharmonization",
    title: "리하모니제이션",
    description: "같은 멜로디에 다른 코드를 붙여 감정을 바꿉니다.",
    concepts: ["멜로디 음", "코드톤", "텐션", "대리코드"],
    content: "멜로디 E는 C에서는 3도, Am에서는 5도, Fmaj7에서는 maj7입니다. 밑의 코드가 감정을 바꿉니다.",
    dawPractice: "E-D-C-G 멜로디 아래 C-G-Am-F, Am7-Dm7-G7-Cmaj7을 각각 붙여보세요.",
    chords: [chord("A", "m7"), chord("D", "m7"), chord("G", "7"), chord("C", "maj7")],
    notes: ["E5", "D5", "C5", "G4"],
    exerciseTitle: "같은 멜로디 다른 코드",
    exerciseInstruction: "E-D-C-G 멜로디 아래 다른 코드톤을 배치해 색이 바뀌는지 들어보세요.",
    exerciseChords: [chord("A", "m7"), chord("D", "m7"), chord("G", "7"), chord("C", "maj7")],
    quizzes: [
      quiz("q1", "C 코드에서 E는?", ["3도", "5도", "9th"], "3도", "C-E-G에서 E는 3도입니다."),
      quiz("q2", "Dm9 코드에서 E는?", ["9th", "루트", "5도"], "9th", "Dm의 9th는 E입니다.")
    ]
  },
  {
    slug: "genre-vocabulary",
    title: "장르별 화성 어휘",
    description: "팝, R&B, 로파이, EDM, 힙합, 시네마틱에 자주 쓰는 진행을 비교합니다.",
    concepts: ["팝 진행", "R&B 7th", "로파이 루프", "시네마틱 bVI"],
    content: "장르에서는 이론적으로 맞는 코드보다 바로 그 스타일처럼 들리는 선택지가 중요합니다.",
    dawPractice: "Pop I-V-vi-IV, Lo-fi IVmaj7-iii7-vi7-V7, Cinematic I-bVI-bVII-I를 비교하세요.",
    chords: [chord("F", "maj7"), chord("E", "m7"), chord("A", "m7"), chord("G", "7")],
    exerciseTitle: "장르 루프 만들기",
    exerciseInstruction: "lo-fi 느낌으로 Fmaj7-Em7-Am7-G7을 찍어보세요.",
    quizzes: [
      quiz("q1", "Pop basic 대표 진행은?", ["I-V-vi-IV", "I-bVI-bVII-I", "viiø-III7-vi"], "I-V-vi-IV", "팝에서 매우 널리 쓰이는 기본 진행입니다."),
      quiz("q2", "시네마틱 진행에 자주 쓰는 borrowed degree는?", ["bVI", "ii", "iii"], "bVI", "bVI는 크고 드라마틱한 색을 만듭니다.")
    ]
  },
  {
    slug: "melody-and-chords",
    title: "멜로디와 코드의 관계",
    description: "멜로디 음이 코드톤인지 텐션인지 구분해 안정과 색채를 조절합니다.",
    concepts: ["코드톤", "텐션", "패싱톤", "강박/약박"],
    content: "강박에는 코드톤이 안정적이고, 약박에는 텐션이나 지나가는 음을 쓰기 좋습니다.",
    dawPractice: "Cmaj7 위에 C E G B만 쓰다가 D A와 패싱톤을 추가해보세요.",
    chords: [chord("C", "maj7")],
    notes: ["C4", "D4", "E4", "G4", "A4", "G4", "E4", "D4"],
    exerciseTitle: "Cmaj7 위 멜로디",
    exerciseInstruction: "Cmaj7 위에서 코드톤과 텐션을 섞어 짧은 멜로디를 만드세요.",
    quizzes: [
      quiz("q1", "Cmaj7 위의 D는?", ["9th", "3도", "5도"], "9th", "D는 C에서 9th 텐션입니다."),
      quiz("q2", "Cmaj7 위에서 가장 안정적인 음 묶음은?", ["C E G B", "F Ab Bb", "C# D# F#"], "C E G B", "코드 구성음은 안정적으로 들립니다.")
    ]
  },
  {
    slug: "arrangement-expansion",
    title: "코드 진행을 편곡으로 확장하기",
    description: "같은 진행을 패드, 피아노, 베이스, 아르페지오로 나눠 편곡합니다.",
    concepts: ["패드", "피아노 컴핑", "베이스", "아르페지오", "탑라인"],
    content: "화성학은 코드 이름에서 끝나지 않습니다. 같은 진행도 악기 역할을 나누면 완전히 다르게 들립니다.",
    dawPractice: "Am-F-C-G를 롱코드, 피아노 컴핑, 아르페지오, 신스 스탭 코드로 각각 만들어보세요.",
    chords: [chord("A", "minor"), chord("F", "major"), chord("C", "major"), chord("G", "major")],
    exerciseTitle: "편곡용 레이어 만들기",
    exerciseInstruction: "Am-F-C-G에서 베이스는 루트, 위쪽은 코드톤으로 분리해 찍어보세요.",
    quizzes: [
      quiz("q1", "베이스의 주 역할은?", ["저역과 움직임 담당", "항상 텐션만 연주", "퀴즈 점수 저장"], "저역과 움직임 담당", "베이스는 곡의 방향과 저역을 잡아줍니다."),
      quiz("q2", "아르페지오는?", ["코드톤을 분산해 연주", "코드를 삭제", "키를 바꾸지 못하게 고정"], "코드톤을 분산해 연주", "아르페지오는 코드 구성음을 시간축으로 펼칩니다.")
    ]
  }
];

export const curriculum: Lesson[] = lessonSpecs.map((spec, index) => {
  const notes = spec.timedNotes
    ? notesFromTimedSpecs(spec.slug, spec.timedNotes)
    : spec.notes
      ? notesFromPitches(spec.slug, spec.notes, 0.5, rolesFromSingleChord(spec.notes, spec.chords))
      : progressionToPianoRollNotes(spec.chords);
  const expectedNotes = spec.exerciseTimedNotes
    ? notesFromTimedSpecs(`${spec.slug}-exercise`, spec.exerciseTimedNotes)
    : spec.exerciseNotes
      ? notesFromPitches(`${spec.slug}-exercise`, spec.exerciseNotes, 1, rolesFromSingleChord(spec.exerciseNotes, spec.exerciseChords))
      : spec.exerciseChords
        ? progressionToPianoRollNotes(spec.exerciseChords)
        : notes;
  return {
    id: `lesson-${index + 1}`,
    slug: spec.slug,
    order: index + 1,
    title: spec.title,
    description: spec.description,
    concepts: spec.concepts,
    content: spec.content,
    dawPractice: spec.dawPractice,
    examples: [
      {
        id: `${spec.slug}-example`,
        title: `${spec.title} 예제`,
        description: spec.dawPractice,
        key: "C",
        chords: spec.chords,
        notes
      }
    ],
    listeningDrills: buildListeningDrills(spec.slug, notes, expectedNotes, index),
    commonMistakes: buildCommonMistakes(spec),
    projectCheckpoint: buildProjectCheckpoint(spec.slug),
    exercises: [
      {
        id: `${spec.slug}-exercise`,
        title: spec.exerciseTitle,
        instruction: spec.exerciseInstruction,
        type: index === 0 ? "build-scale" : index < 5 ? "build-chord" : "build-progression",
        hints: buildExerciseHints(spec),
        expectedNotes,
        expectedChords: spec.exerciseChords ?? spec.chords
      }
    ],
    quizzes: spec.quizzes
  };
});

export function getLessonBySlug(slug: string) {
  return curriculum.find((lesson) => lesson.slug === slug);
}
