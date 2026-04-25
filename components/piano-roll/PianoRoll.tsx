import type { PianoRollNote } from "@/types/music";
import { midiToNoteName } from "@/lib/theory/notes";
import { PianoKeyboard } from "@/components/piano-roll/PianoKeyboard";
import { NoteBlock } from "@/components/piano-roll/NoteBlock";

const ROW_HEIGHT = 22;
const BEAT_WIDTH = 64;

function getMidiRange(min = 48, max = 72) {
  return Array.from({ length: max - min + 1 }, (_, index) => max - index);
}

export function PianoRoll({ notes, beats = 4, title }: { notes: PianoRollNote[]; beats?: number; title?: string }) {
  const midiRange = getMidiRange();
  const minMidi = Math.min(...midiRange);
  const maxMidi = Math.max(...midiRange);

  return (
    <section className="overflow-hidden rounded-sm border border-[#333333] bg-[#1f1f1f]" aria-label={title ?? "피아노롤"}>
      {title ? <div className="border-b border-[#333333] px-3 py-2 text-sm font-semibold">{title}</div> : null}
      <div className="flex overflow-x-auto">
        <PianoKeyboard midiRange={midiRange} />
        <div
          className="roll-grid relative"
          style={{ width: beats * BEAT_WIDTH, height: midiRange.length * ROW_HEIGHT, minWidth: beats * BEAT_WIDTH }}
        >
          {Array.from({ length: beats }).map((_, index) => (
            <div key={index} className="absolute top-0 h-full border-l border-[#454545]" style={{ left: index * BEAT_WIDTH }}>
              <span className="ml-1 text-[10px] text-zinc-500">{index + 1}</span>
            </div>
          ))}
          {midiRange.map((midi, row) => {
            const black = midiToNoteName(midi).includes("#");
            return black ? <div key={midi} className="absolute left-0 right-0 bg-black/20" style={{ top: row * ROW_HEIGHT, height: ROW_HEIGHT }} /> : null;
          })}
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
        </div>
      </div>
    </section>
  );
}
