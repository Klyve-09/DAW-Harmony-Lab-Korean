import type { GeneratedProgression } from "@/types/music";
import { transposeProgression } from "@/lib/theory/romanNumerals";

type Template = {
  genre: string;
  mood: string;
  complexity: string;
  romanNumerals: string[];
  description: string;
};

const TEMPLATES: Template[] = [
  {
    genre: "pop",
    mood: "bright",
    complexity: "basic",
    romanNumerals: ["I", "V", "vi", "IV"],
    description: "팝에서 가장 익숙한 안정-상승형 진행입니다. 멜로디를 얹기 쉽습니다."
  },
  {
    genre: "lofi",
    mood: "chill",
    complexity: "intermediate",
    romanNumerals: ["IVmaj7", "iii7", "vi7", "V7"],
    description: "7th 색채와 느슨한 해결감이 있는 로파이 루프입니다."
  },
  {
    genre: "rnb",
    mood: "dreamy",
    complexity: "advanced",
    romanNumerals: ["Imaj7", "viiø", "III7", "vi9"],
    description: "세컨더리 도미넌트 느낌으로 vi를 강하게 끌어당기는 R&B 진행입니다."
  },
  {
    genre: "cinematic",
    mood: "dark",
    complexity: "intermediate",
    romanNumerals: ["I", "bVI", "bVII", "I"],
    description: "bVI, bVII borrowed chord가 영화적인 큰 움직임을 만듭니다."
  },
  {
    genre: "edm",
    mood: "bright",
    complexity: "basic",
    romanNumerals: ["IVadd9", "I", "V", "vi"],
    description: "add9와 넓은 보이싱으로 밝고 넓게 펼치기 좋은 EDM 진행입니다."
  },
  {
    genre: "hiphop",
    mood: "tense",
    complexity: "basic",
    romanNumerals: ["vi", "IV", "III7"],
    description: "짧고 어두운 마이너 루프에 도미넌트 긴장을 더했습니다."
  }
];

const MINOR_TEMPLATES: Template[] = [
  {
    genre: "pop",
    mood: "bright",
    complexity: "basic",
    romanNumerals: ["i", "VI", "III", "VII"],
    description: "마이너 키에서 가장 익숙한 i-VI-III-VII 루프입니다. 어둡지만 후렴에 쓰기 쉽습니다."
  },
  {
    genre: "lofi",
    mood: "chill",
    complexity: "intermediate",
    romanNumerals: ["iv7", "VII7", "IIImaj7", "VImaj7"],
    description: "마이너 키의 부드러운 7th 루프입니다. 패드와 로즈 피아노에 잘 맞습니다."
  },
  {
    genre: "rnb",
    mood: "dreamy",
    complexity: "advanced",
    romanNumerals: ["i9", "iv9", "VII7", "IIImaj7"],
    description: "m9 색채와 VII7의 느슨한 당김을 섞은 R&B 마이너 진행입니다."
  },
  {
    genre: "cinematic",
    mood: "dark",
    complexity: "intermediate",
    romanNumerals: ["i", "VI", "VII", "i"],
    description: "VI와 VII가 큰 스케일감을 만드는 시네마틱 마이너 진행입니다."
  },
  {
    genre: "edm",
    mood: "bright",
    complexity: "basic",
    romanNumerals: ["VIadd9", "III", "VII", "i"],
    description: "밝은 add9 상단음과 마이너 토닉을 오가는 EDM용 진행입니다."
  },
  {
    genre: "hiphop",
    mood: "tense",
    complexity: "basic",
    romanNumerals: ["i", "VI", "V7"],
    description: "짧은 마이너 루프에 V7 긴장을 더한 힙합용 진행입니다."
  }
];

export const generatorOptions = {
  keys: ["C", "D", "E", "F", "G", "A", "B", "Am", "Dm", "Em"],
  moods: ["bright", "sad", "dreamy", "dark", "tense", "chill"],
  genres: ["pop", "rnb", "lofi", "edm", "hiphop", "cinematic"],
  complexities: ["basic", "intermediate", "advanced"]
};

export function generateProgression(key: string, genre: string, mood: string, complexity: string): GeneratedProgression {
  const templates = key.endsWith("m") ? MINOR_TEMPLATES : TEMPLATES;
  const exact = templates.find((item) => item.genre === genre && item.mood === mood && item.complexity === complexity);
  const genreMatch = templates.find((item) => item.genre === genre && item.complexity === complexity);
  const template = exact ?? genreMatch ?? templates.find((item) => item.genre === genre) ?? templates[0];
  const fallback =
    exact === undefined
      ? {
          requested: { genre, mood, complexity },
          used: { genre: template.genre, mood: template.mood, complexity: template.complexity }
        }
      : undefined;
  return {
    id: crypto.randomUUID(),
    key,
    genre,
    mood,
    complexity,
    chords: transposeProgression(template.romanNumerals, key),
    romanNumerals: template.romanNumerals,
    description: template.description,
    createdAt: new Date().toISOString(),
    ...(fallback ? { fallback } : {})
  };
}
