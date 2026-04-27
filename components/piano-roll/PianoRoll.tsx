import type { PianoRollNote } from "@/types/music";
import { midiToNoteName } from "@/lib/theory/notes";
import { buildVoiceLeadingSegments, type VoiceLeadingMode } from "@/lib/learning/voiceLeading";
import { getScalePitchClasses, isMidiInScale } from "@/lib/theory/scaleHighlight";
import { PianoKeyboard } from "@/components/piano-roll/PianoKeyboard";
import { NoteBlock } from "@/components/piano-roll/NoteBlock";
import { RoleLegend } from "@/components/piano-roll/RoleLegend";

const ROW_HEIGHT = 22;
const BEAT_WIDTH = 64;

function getMidiRange(min = 48, max = 72) {
  return Array.from({ length: max - min + 1 }, (_, index) => max - index);
}

export function PianoRoll({
  notes,
  beats = 4,
  title,
  playheadBeat,
  markers,
  scaleKey,
  showVoiceLeading = false,
  voiceLeadingMode = "role"
}: {
  notes: PianoRollNote[];
  beats?: number;
  title?: string;
  playheadBeat?: number;
  markers?: string[];
  scaleKey?: string;
  showVoiceLeading?: boolean;
  voiceLeadingMode?: VoiceLeadingMode;
}) {
  const midiRange = getMidiRange();
  const minMidi = Math.min(...midiRange);
  const maxMidi = Math.max(...midiRange);
  const clampedPlayheadBeat = playheadBeat === undefined ? undefined : Math.min(beats, Math.max(0, playheadBeat));
  const scalePitchClasses = getScalePitchClasses(scaleKey, notes);
  const voiceSegments = showVoiceLeading ? buildVoiceLeadingSegments(notes, { mode: voiceLeadingMode }) : [];

  return (
    <section className="overflow-hidden rounded-sm border border-[#333333] bg-[#1f1f1f]" aria-label={title ?? "피아노롤"}>
      <div className="space-y-2 border-b border-[#333333] px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title ? <div className="text-sm font-semibold">{title}</div> : <div />}
          {scaleKey ? <span className="rounded-sm border border-[#444] px-2 py-1 text-xs text-zinc-400">{scaleKey} scale</span> : null}
        </div>
        <RoleLegend />
      </div>
      <div className="flex overflow-x-auto">
        <PianoKeyboard midiRange={midiRange} />
        <div
          className="roll-grid relative"
          style={{ width: beats * BEAT_WIDTH, height: midiRange.length * ROW_HEIGHT, minWidth: beats * BEAT_WIDTH }}
        >
          {Array.from({ length: beats }).map((_, index) => (
            <div key={index} className="absolute top-0 h-full border-l border-[#454545]" style={{ left: index * BEAT_WIDTH }}>
              <span className="ml-1 text-[10px] text-zinc-500">{markers?.[index] ?? index + 1}</span>
            </div>
          ))}
          {midiRange.map((midi, row) => {
            const black = midiToNoteName(midi).includes("#");
            const inScale = isMidiInScale(midiToNoteName(midi), scalePitchClasses);
            return (
              <div
                key={midi}
                className={`absolute left-0 right-0 ${black ? "bg-black/20" : ""} ${inScale ? "bg-[#b8ff4d]/[0.055]" : "bg-[#ff5c5c]/[0.035]"}`}
                style={{ top: row * ROW_HEIGHT, height: ROW_HEIGHT }}
              />
            );
          })}
          {voiceSegments.length > 0 ? (
            <svg
              className="pointer-events-none absolute inset-0 z-10"
              width={beats * BEAT_WIDTH}
              height={midiRange.length * ROW_HEIGHT}
              aria-hidden="true"
            >
              {voiceSegments.map((segment) => {
                const x1 = (segment.from.startBeat + segment.from.duration) * BEAT_WIDTH;
                const y1 = (maxMidi - segment.from.midi) * ROW_HEIGHT + ROW_HEIGHT / 2;
                const x2 = segment.to.startBeat * BEAT_WIDTH;
                const y2 = (maxMidi - segment.to.midi) * ROW_HEIGHT + ROW_HEIGHT / 2;
                const wideLeap = Math.abs(segment.semitones) > 7;
                return (
                  <line
                    key={segment.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={wideLeap ? "#ff5c5c" : "#5cd6ff"}
                    strokeOpacity={wideLeap ? 0.75 : 0.42}
                    strokeWidth={wideLeap ? 2 : 1.4}
                  />
                );
              })}
            </svg>
          ) : null}
          {notes.map((note) => {
            if (note.midi < minMidi || note.midi > maxMidi) return null;
            const row = maxMidi - note.midi;
            return (
              <NoteBlock
                key={note.id}
                note={note}
                top={row * ROW_HEIGHT + 2}
                left={note.startBeat * BEAT_WIDTH + 2}
                width={Math.max(18, note.duration * BEAT_WIDTH - 4)}
              />
            );
          })}
          {clampedPlayheadBeat !== undefined ? (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 z-30 h-full w-0.5 bg-[#ffcc00] shadow-[0_0_10px_rgba(255,204,0,0.75)]"
              style={{ left: clampedPlayheadBeat * BEAT_WIDTH }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
