export type GenreReference = {
  genre: string;
  label: string;
  lessonSlug: string;
  bpm: string;
  progression: string;
  useCase: string;
  checklist: string[];
};

export const genreReferenceLibrary: GenreReference[] = [
  {
    genre: "pop",
    label: "Pop",
    lessonSlug: "roman-numerals",
    bpm: "90-120",
    progression: "I - V - vi - IV",
    useCase: "후렴, 훅, 밝은 탑라인",
    checklist: ["루트 움직임을 먼저 확인", "탑노트가 크게 튀지 않게 정리", "마지막 IV에서 I로 돌아오는 느낌 듣기"]
  },
  {
    genre: "rnb",
    label: "R&B",
    lessonSlug: "secondary-dominants",
    bpm: "65-95",
    progression: "Imaj7 - viiø - III7 - vi9",
    useCase: "세컨더리 도미넌트와 9th 색채",
    checklist: ["7th를 빠뜨리지 않기", "III7이 vi로 끌어당기는지 확인", "멜로디 강박은 코드톤으로 시작"]
  },
  {
    genre: "lofi",
    label: "Lo-fi",
    lessonSlug: "tensions-add-sus",
    bpm: "70-88",
    progression: "IVmaj7 - iii7 - vi7 - V7",
    useCase: "반복 루프, 로즈 피아노, 부드러운 패드",
    checklist: ["7th를 길게 유지", "중역 보이싱을 가깝게 배치", "V7의 긴장을 너무 세게 만들지 않기"]
  },
  {
    genre: "edm",
    label: "EDM",
    lessonSlug: "genre-vocabulary",
    bpm: "120-128",
    progression: "IVadd9 - I - V - vi",
    useCase: "드롭 전개, 넓은 신스 코드",
    checklist: ["add9 상단음을 밝게 유지", "베이스는 루트 중심", "코드 길이를 일정하게 맞추기"]
  },
  {
    genre: "hiphop",
    label: "Hip-hop",
    lessonSlug: "genre-vocabulary",
    bpm: "70-100",
    progression: "vi - IV - III7",
    useCase: "짧고 어두운 반복 루프",
    checklist: ["3마디 루프의 반복감을 활용", "III7이 다음 루프로 당기는지 듣기", "멜로디는 짧은 응답으로 제한"]
  },
  {
    genre: "cinematic",
    label: "Cinematic",
    lessonSlug: "arrangement-expansion",
    bpm: "70-100",
    progression: "i - VI - VII - i",
    useCase: "패드, 스트링, 큰 전개",
    checklist: ["베이스를 길게 유지", "패드는 낮은 velocity로 넓게", "아르페지오 레이어를 따로 분리"]
  }
];
