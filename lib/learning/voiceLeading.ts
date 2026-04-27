import type { PianoRollNote } from "@/types/music";

export type VoiceLeadingSegment = {
  id: string;
  from: PianoRollNote;
  to: PianoRollNote;
  semitones: number;
};

export type VoiceLeadingMode = "role" | "position";

export type VoiceLeadingOptions = {
  includeDerivedLayers?: boolean;
  mode?: VoiceLeadingMode;
};

const structuralRoles: Array<PianoRollNote["role"]> = ["root", "third", "fifth", "seventh", "tension"];

function structuralLane(note: PianoRollNote) {
  if (note.role === "root") return "0-root";
  if (note.role === "third") return "1-third";
  if (note.role === "fifth") return "2-fifth";
  if (note.role === "seventh") return "3-seventh";
  if (note.role === "tension") return "4-tension";
  return undefined;
}

function isDerivedLayerNote(note: PianoRollNote) {
  return note.id.startsWith("layer-");
}

function isEligibleNote(note: PianoRollNote, { includeDerivedLayers = false, mode = "role" }: VoiceLeadingOptions) {
  if (!includeDerivedLayers && isDerivedLayerNote(note)) return false;
  if (mode === "position") return true;
  return structuralRoles.includes(note.role);
}

function notesByStructuralLane(notes: PianoRollNote[]) {
  const lanes = new Map<string, PianoRollNote>();
  [...notes]
    .sort((left, right) => {
      const laneCompare = (structuralLane(left) ?? "").localeCompare(structuralLane(right) ?? "");
      if (laneCompare !== 0) return laneCompare;
      return left.midi - right.midi;
    })
    .forEach((note) => {
      const lane = structuralLane(note);
      if (!lane || lanes.has(lane)) return;
      lanes.set(lane, note);
    });
  return lanes;
}

function pushSegment(segments: VoiceLeadingSegment[], from: PianoRollNote, to: PianoRollNote, lane: string) {
  segments.push({
    id: `${from.id}->${to.id}-${lane}`,
    from,
    to,
    semitones: to.midi - from.midi
  });
}

export function buildVoiceLeadingSegments(notes: PianoRollNote[], options: VoiceLeadingOptions = {}): VoiceLeadingSegment[] {
  const mode = options.mode ?? "role";
  const grouped = new Map<number, PianoRollNote[]>();
  notes.filter((note) => isEligibleNote(note, options)).forEach((note) => {
    if (Math.abs(note.startBeat - Math.round(note.startBeat)) > 0.01) return;
    const beat = Math.round(note.startBeat);
    grouped.set(beat, [...(grouped.get(beat) ?? []), note]);
  });

  const beats = [...grouped.keys()].sort((left, right) => left - right);
  const segments: VoiceLeadingSegment[] = [];

  beats.forEach((beat, beatIndex) => {
    const nextBeat = beats[beatIndex + 1];
    if (nextBeat === undefined) return;
    const current = grouped.get(beat) ?? [];
    const next = grouped.get(nextBeat) ?? [];

    if (mode === "position") {
      const currentByPosition = [...current].sort((left, right) => left.midi - right.midi);
      const nextByPosition = [...next].sort((left, right) => left.midi - right.midi);
      const count = Math.min(currentByPosition.length, nextByPosition.length);
      for (let index = 0; index < count; index += 1) {
        pushSegment(segments, currentByPosition[index], nextByPosition[index], `position-${index}`);
      }
      return;
    }

    const currentByLane = notesByStructuralLane(current);
    const nextByLane = notesByStructuralLane(next);
    currentByLane.forEach((from, lane) => {
      const to = nextByLane.get(lane);
      if (to) pushSegment(segments, from, to, lane);
    });
  });

  return segments;
}

export function summarizeVoiceLeading(notes: PianoRollNote[], options: VoiceLeadingOptions = {}) {
  const segments = buildVoiceLeadingSegments(notes, options);
  const leaps = segments.filter((segment) => Math.abs(segment.semitones) > 7);
  const commonTones = segments.filter((segment) => segment.semitones === 0);
  return {
    segments,
    leaps,
    commonTones,
    maxLeap: segments.reduce((max, segment) => Math.max(max, Math.abs(segment.semitones)), 0)
  };
}
