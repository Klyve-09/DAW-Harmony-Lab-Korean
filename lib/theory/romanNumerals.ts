import type { ChordQuality, ChordSymbol, NoteName } from "@/types/music";
import { buildChord } from "@/lib/theory/chords";
import { getMajorScale, getNaturalMinorScale } from "@/lib/theory/scales";
import { transposeNote } from "@/lib/theory/notes";

const DEGREE_INDEX: Record<string, number> = {
  I: 0,
  II: 1,
  III: 2,
  IV: 3,
  V: 4,
  VI: 5,
  VII: 6
};

function parseRoman(roman: string): { accidental: number; degree: number; quality: ChordQuality } {
  const accidental = roman.startsWith("b") ? -1 : roman.startsWith("#") ? 1 : 0;
  const body = roman.replace(/^[b#]/, "");
  const match = body.match(/^(vii|VII|iii|III|vi|VI|iv|IV|ii|II|v|V|i|I)(.*)$/);
  const degreeText = match?.[1] ?? "I";
  const suffix = match?.[2] ?? "";
  const degree = DEGREE_INDEX[degreeText.toUpperCase()] ?? 0;
  const isLower = degreeText === degreeText.toLowerCase();
  let quality: ChordQuality = isLower ? "minor" : "major";
  if (suffix.includes("maj9")) quality = "maj9";
  else if (suffix.includes("maj7")) quality = "maj7";
  else if (suffix.includes("m7b5") || suffix.includes("ø")) quality = "m7b5";
  else if (suffix.includes("add9")) quality = "add9";
  else if (suffix.includes("sus2")) quality = "sus2";
  else if (suffix.includes("sus4")) quality = "sus4";
  else if (suffix.includes("m9") || (isLower && suffix.includes("9"))) quality = "m9";
  else if (suffix.includes("m7") || (isLower && suffix.includes("7"))) quality = "m7";
  else if (suffix.includes("7")) quality = "7";
  else if (suffix.includes("°")) quality = "diminished";
  return { accidental, degree, quality };
}

export function transposeProgression(romanNumerals: string[], key: string): ChordSymbol[] {
  const minor = key.endsWith("m");
  const root = key.replace("m", "") as NoteName;
  const scale = minor ? getNaturalMinorScale(root) : getMajorScale(root);
  return romanNumerals.map((roman) => {
    const parsed = parseRoman(roman);
    const rootNote = transposeNote(scale[parsed.degree], parsed.accidental, parsed.accidental < 0);
    return buildChord(rootNote, parsed.quality);
  });
}
