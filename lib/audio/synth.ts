import type { ChordSymbol, PianoRollNote } from "@/types/music";

let toneModule: typeof import("tone") | null = null;
let synth: import("tone").PolySynth | null = null;

async function getTone() {
  toneModule ??= await import("tone");
  return toneModule;
}

function getSynth(Tone: typeof import("tone")) {
  synth ??= new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.015, decay: 0.12, sustain: 0.45, release: 0.25 },
    volume: -10
  }).toDestination();
  return synth;
}

async function ensureAudioStarted() {
  const Tone = await getTone();
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }
  Tone.Transport.stop();
  Tone.Transport.cancel(0);
  Tone.Transport.position = 0;
  const player = getSynth(Tone);
  player.releaseAll();
  return { Tone, player };
}

export function stopAudio() {
  if (!toneModule) return;
  toneModule.Transport.stop();
  toneModule.Transport.cancel(0);
  toneModule.Transport.position = 0;
  synth?.releaseAll();
}

export async function playNotes(notes: PianoRollNote[], bpm = 90) {
  const { Tone, player } = await ensureAudioStarted();
  Tone.Transport.bpm.value = bpm;
  const beatSeconds = 60 / bpm;
  if (notes.length === 0) return 0;
  notes.forEach((note) => {
    Tone.Transport.scheduleOnce((time) => {
      player.triggerAttackRelease(note.pitch, note.duration * beatSeconds, time, note.velocity ?? 0.7);
    }, note.startBeat * beatSeconds);
  });
  Tone.Transport.start();
  const endBeat = Math.max(...notes.map((note) => note.startBeat + note.duration));
  return Math.ceil(endBeat * beatSeconds * 1000);
}

export async function playChord(chord: ChordSymbol, bpm = 90) {
  const { Tone, player } = await ensureAudioStarted();
  Tone.Transport.bpm.value = bpm;
  const notes = chord.notes.map((note, index) => `${note}${index === 0 ? 3 : 4}`);
  player.triggerAttackRelease(notes, "2n");
}

export async function playProgression(chords: ChordSymbol[], bpm = 90) {
  const { Tone, player } = await ensureAudioStarted();
  Tone.Transport.bpm.value = bpm;
  const beatSeconds = 60 / bpm;
  if (chords.length === 0) return 0;
  chords.forEach((chord, index) => {
    const notes = chord.notes.map((note, noteIndex) => `${note}${noteIndex === 0 ? 3 : 4}`);
    Tone.Transport.scheduleOnce((time) => {
      player.triggerAttackRelease(notes, 0.85 * beatSeconds, time, 0.75);
    }, index * beatSeconds);
  });
  Tone.Transport.start();
  return Math.ceil(chords.length * beatSeconds * 1000);
}
