import type { PianoRollNote } from "@/types/music";

export const DEFAULT_TICKS_PER_BEAT = 480;

type MidiExportOptions = {
  bpm?: number;
  ticksPerBeat?: number;
};

type MidiEvent = {
  tick: number;
  order: number;
  bytes: number[];
};

export function notesToMidiFile(notes: PianoRollNote[], options: MidiExportOptions = {}) {
  const ticksPerBeat = Math.round(options.ticksPerBeat ?? DEFAULT_TICKS_PER_BEAT);
  const bpm = clamp(Math.round(options.bpm ?? 90), 20, 300);
  const track = [
    ...tempoEvent(bpm),
    ...timeSignatureEvent(),
    ...encodeNoteEvents(notes, ticksPerBeat),
    ...encodeVariableLength(0),
    0xff,
    0x2f,
    0x00
  ];

  return new Uint8Array([
    ...ascii("MThd"),
    ...uint32(6),
    ...uint16(0),
    ...uint16(1),
    ...uint16(ticksPerBeat),
    ...ascii("MTrk"),
    ...uint32(track.length),
    ...track
  ]);
}

export function buildMidiFileName(source = "daw-harmony-loop") {
  const safe = source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const base = safe || "daw-harmony-loop";
  return base.endsWith(".mid") ? base : `${base}.mid`;
}

function tempoEvent(bpm: number) {
  const microsecondsPerQuarter = Math.round(60_000_000 / bpm);
  return [...encodeVariableLength(0), 0xff, 0x51, 0x03, ...uint24(microsecondsPerQuarter)];
}

function timeSignatureEvent() {
  return [...encodeVariableLength(0), 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08];
}

function encodeNoteEvents(notes: PianoRollNote[], ticksPerBeat: number) {
  const events: MidiEvent[] = [];

  notes.forEach((note) => {
    if (!Number.isFinite(note.midi)) return;
    const midi = clamp(Math.round(note.midi), 0, 127);
    const startTick = Math.max(0, Math.round(note.startBeat * ticksPerBeat));
    const durationTicks = Math.max(1, Math.round(note.duration * ticksPerBeat));
    const velocity = velocityToMidi(note.velocity);

    events.push({ tick: startTick, order: 1, bytes: [0x90, midi, velocity] });
    events.push({ tick: startTick + durationTicks, order: 0, bytes: [0x80, midi, 0x00] });
  });

  events.sort((left, right) => left.tick - right.tick || left.order - right.order || left.bytes[1] - right.bytes[1]);

  let previousTick = 0;
  return events.flatMap((event) => {
    const delta = event.tick - previousTick;
    previousTick = event.tick;
    return [...encodeVariableLength(delta), ...event.bytes];
  });
}

function velocityToMidi(velocity?: number) {
  if (velocity === undefined) return 90;
  const scaled = velocity <= 1 ? velocity * 127 : velocity;
  return clamp(Math.round(scaled), 1, 127);
}

function encodeVariableLength(value: number) {
  let buffer = value & 0x7f;
  const bytes = [buffer];

  value >>= 7;
  while (value > 0) {
    buffer = (value & 0x7f) | 0x80;
    bytes.unshift(buffer);
    value >>= 7;
  }

  return bytes;
}

function ascii(value: string) {
  return Array.from(value, (char) => char.charCodeAt(0));
}

function uint16(value: number) {
  return [(value >> 8) & 0xff, value & 0xff];
}

function uint24(value: number) {
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function uint32(value: number) {
  return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
