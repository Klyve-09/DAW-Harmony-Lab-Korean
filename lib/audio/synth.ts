import type { ChordSymbol, PianoRollNote } from "@/types/music";
import { createNotePlaybackPlan, createPlaybackPlan, createProgressionPlaybackPlan, type PlaybackEvent, type PlaybackPlan } from "@/lib/audio/playback";

let toneModule: typeof import("tone") | null = null;
let synth: import("tone").PolySynth | null = null;
let activeRenderedPlayer: import("tone").Player | null = null;
let renderQueue: Promise<unknown> = Promise.resolve();

const MAX_RENDER_CACHE_SIZE = 12;
const renderCache = new Map<string, import("tone").ToneAudioBuffer>();
const pendingRenders = new Map<string, Promise<import("tone").ToneAudioBuffer | null>>();

type PlaybackOptions = {
  shouldStart?: () => boolean;
};

type PreparePlaybackOptions = {
  notes?: PianoRollNote[];
  chords?: ChordSymbol[];
  bpm?: number;
};

const synthOptions = {
  oscillator: { type: "triangle" as const },
  envelope: { attack: 0.015, decay: 0.12, sustain: 0.45, release: 0.25 },
  volume: -10
};

async function getTone() {
  toneModule ??= await import("tone");
  return toneModule;
}

function getSynth(Tone: typeof import("tone")) {
  synth ??= new Tone.PolySynth(Tone.Synth, synthOptions).toDestination();
  return synth;
}

async function ensureAudioStarted(shouldStart: () => boolean = () => true) {
  if (!shouldStart()) return null;
  const Tone = await getTone();
  if (!shouldStart()) return null;
  if (Tone.getContext().state !== "running") {
    await Tone.start();
    if (!shouldStart()) return null;
  }
  Tone.Transport.stop();
  Tone.Transport.cancel(0);
  Tone.Transport.position = 0;
  stopRenderedPlayer();
  const player = getSynth(Tone);
  player.releaseAll();
  return { Tone, player };
}

export function stopAudio() {
  if (!toneModule) return;
  toneModule.Transport.stop();
  toneModule.Transport.cancel(0);
  toneModule.Transport.position = 0;
  stopRenderedPlayer();
  synth?.releaseAll();
}

export async function preparePlayback(options: PreparePlaybackOptions) {
  if (typeof window === "undefined") return;
  const plan = createPlaybackPlan(options);
  if (plan.events.length === 0) return;
  await renderPlaybackPlan(plan);
}

export async function playNotes(notes: PianoRollNote[], bpm = 90, options: PlaybackOptions = {}) {
  const started = await ensureAudioStarted(options.shouldStart);
  if (!started) return 0;
  return playPlaybackPlan(createNotePlaybackPlan(notes, bpm), started, options);
}

export async function playChord(chord: ChordSymbol, bpm = 90) {
  const started = await ensureAudioStarted();
  if (!started) return;
  const { Tone, player } = started;
  Tone.Transport.bpm.value = bpm;
  const notes = chord.notes.map((note, index) => `${note}${index === 0 ? 3 : 4}`);
  player.triggerAttackRelease(notes, "2n");
}

export async function playProgression(chords: ChordSymbol[], bpm = 90, options: PlaybackOptions = {}) {
  const started = await ensureAudioStarted(options.shouldStart);
  if (!started) return 0;
  return playPlaybackPlan(createProgressionPlaybackPlan(chords, bpm), started, options);
}

function playPlaybackPlan(plan: PlaybackPlan, started: { Tone: typeof import("tone"); player: import("tone").PolySynth }, options: PlaybackOptions) {
  const { Tone, player } = started;
  if (plan.events.length === 0) return 0;
  const cachedBuffer = readCachedRender(plan.cacheKey);
  if (cachedBuffer && (!options.shouldStart || options.shouldStart())) {
    playRenderedBuffer(Tone, cachedBuffer);
    return plan.durationMs;
  }

  Tone.Transport.bpm.value = plan.bpm;
  scheduleEvents(Tone, player, plan.events);
  if (options.shouldStart && !options.shouldStart()) {
    return 0;
  }
  Tone.Transport.start();
  scheduleFutureRender(plan);
  return plan.durationMs;
}

function scheduleEvents(Tone: typeof import("tone"), player: import("tone").PolySynth, events: PlaybackEvent[]) {
  events.forEach((event) => {
    Tone.Transport.scheduleOnce((time) => {
      player.triggerAttackRelease(getTriggerNotes(event.notes), event.durationSeconds, time, event.velocity);
    }, event.startSeconds);
  });
}

function playRenderedBuffer(Tone: typeof import("tone"), buffer: import("tone").ToneAudioBuffer) {
  stopRenderedPlayer();
  activeRenderedPlayer = new Tone.Player(buffer).toDestination();
  activeRenderedPlayer.start(Tone.immediate());
}

function stopRenderedPlayer() {
  if (!activeRenderedPlayer) return;
  try {
    activeRenderedPlayer.stop();
  } catch {
    // Player.stop can throw if the source was already stopped; disposal below is enough.
  }
  activeRenderedPlayer.dispose();
  activeRenderedPlayer = null;
}

function readCachedRender(cacheKey: string) {
  const cached = renderCache.get(cacheKey);
  if (!cached) return null;
  markCacheEntryUsed(cacheKey, cached);
  return cached;
}

function setCachedRender(cacheKey: string, buffer: import("tone").ToneAudioBuffer) {
  markCacheEntryUsed(cacheKey, buffer);
  while (renderCache.size > MAX_RENDER_CACHE_SIZE) {
    const oldestKey = renderCache.keys().next().value;
    if (!oldestKey) break;
    renderCache.delete(oldestKey);
  }
}

function scheduleFutureRender(plan: PlaybackPlan) {
  if (typeof window === "undefined" || hasCachedRender(plan.cacheKey) || pendingRenders.has(plan.cacheKey)) return;
  window.setTimeout(() => {
    void renderPlaybackPlan(plan);
  }, plan.durationMs + 120);
}

async function renderPlaybackPlan(plan: PlaybackPlan) {
  const cached = readCachedRender(plan.cacheKey);
  if (cached) return cached;

  const pending = pendingRenders.get(plan.cacheKey);
  if (pending) return pending;

  const nextRender = enqueueRender(async () => {
    try {
      const Tone = await getTone();
      const buffer = await Tone.Offline(({ transport }) => {
        const offlineSynth = new Tone.PolySynth(Tone.Synth, synthOptions).toDestination();
        transport.bpm.value = plan.bpm;
        plan.events.forEach((event) => {
          transport.scheduleOnce((time) => {
            offlineSynth.triggerAttackRelease(getTriggerNotes(event.notes), event.durationSeconds, time, event.velocity);
          }, event.startSeconds);
        });
        transport.start(0);
      }, plan.renderDurationSeconds);
      setCachedRender(plan.cacheKey, buffer);
      return buffer;
    } catch (error) {
      logRenderFailure(error);
      return null;
    } finally {
      pendingRenders.delete(plan.cacheKey);
    }
  });

  pendingRenders.set(plan.cacheKey, nextRender);
  return nextRender;
}

function enqueueRender<T>(render: () => Promise<T>) {
  const next = renderQueue.then(render, render);
  renderQueue = next.catch(() => undefined);
  return next;
}

function getTriggerNotes(notes: string[]) {
  return notes.length === 1 ? notes[0] : notes;
}

function hasCachedRender(cacheKey: string) {
  return renderCache.has(cacheKey);
}

function markCacheEntryUsed(cacheKey: string, buffer: import("tone").ToneAudioBuffer) {
  renderCache.delete(cacheKey);
  renderCache.set(cacheKey, buffer);
}

function logRenderFailure(error: unknown) {
  if (process.env.NODE_ENV === "production") return;
  console.warn("Audio prerender failed; falling back to live playback.", error);
}
