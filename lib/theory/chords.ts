import type { ChordQuality, ChordSymbol, NoteName } from "@/types/music";
import { transposeNote } from "@/lib/theory/notes";
import { getMajorScale, getNaturalMinorScale } from "@/lib/theory/scales";

const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  "7": [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
  add9: [0, 4, 7, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14]
};

function chordSuffix(quality: ChordQuality): string {
  if (quality === "major") return "";
  if (quality === "minor") return "m";
  if (quality === "diminished") return "dim";
  return quality;
}

export function buildChord(root: NoteName, quality: ChordQuality): ChordSymbol {
  const safeQuality = QUALITY_INTERVALS[quality] ? quality : "major";
  return {
    name: `${root}${chordSuffix(safeQuality)}`,
    root,
    quality: safeQuality,
    notes: QUALITY_INTERVALS[safeQuality].map((interval) => transposeNote(root, interval))
  };
}

export function getDiatonicTriads(key: string): ChordSymbol[] {
  const minor = key.endsWith("m");
  const scale = minor ? getNaturalMinorScale(key.replace("m", "") as NoteName) : getMajorScale(key as NoteName);
  const qualities: ChordQuality[] = minor
    ? ["minor", "diminished", "major", "minor", "minor", "major", "major"]
    : ["major", "minor", "minor", "major", "major", "minor", "diminished"];
  return scale.map((note, index) => buildChord(note, qualities[index]));
}

export function getSeventhChords(key: string): ChordSymbol[] {
  const minor = key.endsWith("m");
  const scale = minor ? getNaturalMinorScale(key.replace("m", "") as NoteName) : getMajorScale(key as NoteName);
  const qualities: ChordQuality[] = minor
    ? ["m7", "m7b5", "maj7", "m7", "m7", "maj7", "7"]
    : ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"];
  return scale.map((note, index) => buildChord(note, qualities[index]));
}
