import type { ChordSymbol, PianoRollNote } from "@/types/music";

export const SYNTH_PATCH_VERSION = "triangle-poly-v1";
export const RENDER_TAIL_SECONDS = 0.35;
export const NOTE_DEFAULT_VELOCITY = 0.7;
export const PROGRESSION_VELOCITY = 0.75;

export type PlaybackKind = "notes" | "progression";

export type PlaybackEvent = {
  notes: string[];
  startSeconds: number;
  durationSeconds: number;
  velocity: number;
};

export type PlaybackPlan = {
  kind: PlaybackKind;
  bpm: number;
  events: PlaybackEvent[];
  durationMs: number;
  renderDurationSeconds: number;
  cacheKey: string;
};

export function getPlaybackDurationBeats({ notes, chords }: { notes?: PianoRollNote[]; chords?: ChordSymbol[] }) {
  if (notes?.length) {
    return Math.max(...notes.map((note) => note.startBeat + note.duration));
  }

  return chords?.length ?? 0;
}

export function createPlaybackPlan({
  notes,
  chords,
  bpm = 90
}: {
  notes?: PianoRollNote[];
  chords?: ChordSymbol[];
  bpm?: number;
}): PlaybackPlan {
  return notes?.length ? createNotePlaybackPlan(notes, bpm) : createProgressionPlaybackPlan(chords ?? [], bpm);
}

export function createNotePlaybackPlan(notes: PianoRollNote[], bpm = 90): PlaybackPlan {
  const normalizedBpm = normalizeBpm(bpm);
  const beatSeconds = getBeatSeconds(normalizedBpm);
  const durationBeats = getPlaybackDurationBeats({ notes });
  const durationMs = Math.ceil(durationBeats * beatSeconds * 1000);
  const events = notes.map((note) => ({
    notes: [note.pitch],
    startSeconds: roundTime(note.startBeat * beatSeconds),
    durationSeconds: roundTime(note.duration * beatSeconds),
    velocity: note.velocity ?? NOTE_DEFAULT_VELOCITY
  }));
  const keyParts = notes.map((note) => [
    note.pitch,
    roundTime(note.startBeat),
    roundTime(note.duration),
    note.velocity ?? NOTE_DEFAULT_VELOCITY
  ]);

  return {
    kind: "notes",
    bpm: normalizedBpm,
    events,
    durationMs,
    renderDurationSeconds: getRenderDurationSeconds(durationMs, events.length),
    cacheKey: createPlaybackCacheKey("notes", normalizedBpm, keyParts)
  };
}

export function createProgressionPlaybackPlan(chords: ChordSymbol[], bpm = 90): PlaybackPlan {
  const normalizedBpm = normalizeBpm(bpm);
  const beatSeconds = getBeatSeconds(normalizedBpm);
  const durationMs = Math.ceil(chords.length * beatSeconds * 1000);
  const events = chords.map((chord, index) => ({
    notes: chord.notes.map((note, noteIndex) => `${note}${noteIndex === 0 ? 3 : 4}`),
    startSeconds: roundTime(index * beatSeconds),
    durationSeconds: roundTime(0.85 * beatSeconds),
    velocity: PROGRESSION_VELOCITY
  }));
  const keyParts = chords.map((chord) => [chord.name, chord.root, chord.quality, chord.notes]);

  return {
    kind: "progression",
    bpm: normalizedBpm,
    events,
    durationMs,
    renderDurationSeconds: getRenderDurationSeconds(durationMs, events.length),
    cacheKey: createPlaybackCacheKey("progression", normalizedBpm, keyParts)
  };
}

export function createPlaybackCacheKey(kind: PlaybackKind, bpm: number, keyParts: unknown[]) {
  return JSON.stringify(["daw-prerender", SYNTH_PATCH_VERSION, kind, normalizeBpm(bpm), keyParts]);
}

function getBeatSeconds(bpm: number) {
  return 60 / bpm;
}

function normalizeBpm(bpm: number) {
  return Number.isFinite(bpm) && bpm > 0 ? bpm : 90;
}

function getRenderDurationSeconds(durationMs: number, eventCount: number) {
  return eventCount > 0 ? roundTime(durationMs / 1000 + RENDER_TAIL_SECONDS) : 0;
}

function roundTime(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
