import type { PianoRollNote } from "@/types/music";

export type PianoRollNoteRole = NonNullable<PianoRollNote["role"]>;

export const pianoRollNoteRoles = ["root", "third", "fifth", "seventh", "tension", "passing", "outside", "chordTone"] as const satisfies readonly PianoRollNoteRole[];

export const pianoRollNoteRoleLabels: Record<PianoRollNoteRole, string> = {
  root: "루트",
  third: "3도",
  fifth: "5도",
  seventh: "7도",
  tension: "텐션",
  passing: "패싱톤",
  outside: "외부음",
  chordTone: "코드톤"
};

export const pianoRollNoteRoleClasses: Record<PianoRollNoteRole, string> = {
  root: "bg-[#ffcc00]",
  third: "bg-[#b8ff4d]",
  fifth: "bg-[#7dd3fc]",
  seventh: "bg-[#c084fc]",
  tension: "bg-[#5cd6ff]",
  passing: "bg-[#f59e0b]",
  outside: "bg-[#ff5c5c]",
  chordTone: "bg-[#86efac]"
};

export function isPianoRollNoteRole(value: unknown): value is PianoRollNoteRole {
  return typeof value === "string" && (pianoRollNoteRoles as readonly string[]).includes(value);
}
