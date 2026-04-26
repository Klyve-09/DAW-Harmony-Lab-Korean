import type { PianoRollNote } from "@/types/music";

export type VoiceLeadingSegment = {
  id: string;
  from: PianoRollNote;
  to: PianoRollNote;
  semitones: number;
};

const voiceRank = {
  bass: 0,
  inner: 1,
  pad: 1,
  arp: 2,
  melody: 2,
  lead: 3
};

function noteLane(note: PianoRollNote, index: number) {
  return note.voice ? `${voiceRank[note.voice]}-${note.voice}` : `${index}-${note.role ?? "note"}`;
}

export function buildVoiceLeadingSegments(notes: PianoRollNote[]): VoiceLeadingSegment[] {
  const grouped = new Map<number, PianoRollNote[]>();
  notes.forEach((note) => {
    const beat = Math.round(note.startBeat);
    grouped.set(beat, [...(grouped.get(beat) ?? []), note]);
  });

  const beats = [...grouped.keys()].sort((left, right) => left - right);
  const segments: VoiceLeadingSegment[] = [];

  beats.forEach((beat, beatIndex) => {
    const nextBeat = beats[beatIndex + 1];
    if (nextBeat === undefined) return;
    const current = [...(grouped.get(beat) ?? [])].sort((left, right) => left.midi - right.midi);
    const next = [...(grouped.get(nextBeat) ?? [])].sort((left, right) => left.midi - right.midi);
    const lanes = Math.min(current.length, next.length);

    for (let index = 0; index < lanes; index += 1) {
      const from = current[index];
      const to = next[index];
      segments.push({
        id: `${from.id}->${to.id}-${index}`,
        from,
        to,
        semitones: to.midi - from.midi
      });
    }
  });

  return segments.sort((left, right) => noteLane(left.from, 0).localeCompare(noteLane(right.from, 0)));
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
