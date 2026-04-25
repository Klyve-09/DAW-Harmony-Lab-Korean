import type { NoteName } from "@/types/music";
import { transposeNote } from "@/lib/theory/notes";

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10];

export function getMajorScale(root: NoteName): NoteName[] {
  return MAJOR_STEPS.map((step) => transposeNote(root, step));
}

export function getNaturalMinorScale(root: NoteName): NoteName[] {
  return NATURAL_MINOR_STEPS.map((step) => transposeNote(root, step));
}

export function getScaleForKey(key: string): NoteName[] {
  const minor = key.endsWith("m");
  const root = key.replace("m", "") as NoteName;
  return minor ? getNaturalMinorScale(root) : getMajorScale(root);
}
