import type { PianoRollNote } from "@/types/music";

export type VoiceLeadingSegment = {
  id: string;
  from: PianoRollNote;
  to: PianoRollNote;
  semitones: number;
};

const structuralRoles: Array<PianoRollNote["role"]> = ["root", "third", "fifth", "seventh", "tension"];

function structuralLane(note: PianoRollNote, fallbackIndex: number) {
  if (note.role === "root" || note.voice === "bass") return "0-root";
  if (note.role === "third") return "1-third";
  if (note.role === "fifth") return "2-fifth";
  if (note.role === "seventh") return "3-seventh";
  if (note.role === "tension") return "4-tension";
  return `9-${fallbackIndex}`;
}

function isStructuralNote(note: PianoRollNote) {
  if (note.id.startsWith("layer-")) return false;
  return structuralRoles.includes(note.role);
}

export function buildVoiceLeadingSegments(notes: PianoRollNote[]): VoiceLeadingSegment[] {
  const grouped = new Map<number, PianoRollNote[]>();
  notes.filter(isStructuralNote).forEach((note) => {
    if (Math.abs(note.startBeat - Math.round(note.startBeat)) > 0.01) return;
    const beat = Math.round(note.startBeat);
    grouped.set(beat, [...(grouped.get(beat) ?? []), note]);
  });

  const beats = [...grouped.keys()].sort((left, right) => left - right);
  const segments: VoiceLeadingSegment[] = [];

  beats.forEach((beat, beatIndex) => {
    const nextBeat = beats[beatIndex + 1];
    if (nextBeat === undefined) return;
    const current = [...(grouped.get(beat) ?? [])].sort((left, right) => structuralLane(left, 0).localeCompare(structuralLane(right, 0)));
    const next = [...(grouped.get(nextBeat) ?? [])].sort((left, right) => structuralLane(left, 0).localeCompare(structuralLane(right, 0)));

    current.forEach((from, index) => {
      const lane = structuralLane(from, index);
      const to = next.find((candidate, candidateIndex) => structuralLane(candidate, candidateIndex) === lane);
      if (!to) return;
      segments.push({
        id: `${from.id}->${to.id}-${index}`,
        from,
        to,
        semitones: to.midi - from.midi
      });
    });
  });

  return segments;
}

export function summarizeVoiceLeading(notes: PianoRollNote[]) {
  const segments = buildVoiceLeadingSegments(notes);
  const leaps = segments.filter((segment) => Math.abs(segment.semitones) > 7);
  const commonTones = segments.filter((segment) => segment.semitones === 0);
  return {
    segments,
    leaps,
    commonTones,
    maxLeap: segments.reduce((max, segment) => Math.max(max, Math.abs(segment.semitones)), 0)
  };
}
