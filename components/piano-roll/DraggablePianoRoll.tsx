"use client";

import { useMemo, useRef, useState } from "react";
import type { PianoRollNote } from "@/types/music";
import { midiToNoteName } from "@/lib/theory/notes";
import { PianoKeyboard } from "@/components/piano-roll/PianoKeyboard";
import { NoteBlock } from "@/components/piano-roll/NoteBlock";

const ROW_HEIGHT = 22;
const BEAT_WIDTH = 64;
const STEP_WIDTH = BEAT_WIDTH / 2;
const BEATS = 4;
const MIN_MIDI = 48;
const MAX_MIDI = 72;

function midiRange() {
  return Array.from({ length: MAX_MIDI - MIN_MIDI + 1 }, (_, index) => MAX_MIDI - index);
}

export function DraggablePianoRoll({
  value,
  onChange,
  expectedNotes
}: {
  value: PianoRollNote[];
  onChange: (notes: PianoRollNote[]) => void;
  expectedNotes?: PianoRollNote[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const range = useMemo(() => midiRange(), []);
  const selectedNote = value.find((note) => note.id === selectedId);
  const expectedCount = expectedNotes?.length;

  function getGridPosition(event: React.PointerEvent) {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top));
    const step = Math.max(0, Math.min(BEATS * 2 - 1, Math.floor(x / STEP_WIDTH)));
    const beat = step / 2;
    const row = Math.max(0, Math.min(range.length - 1, Math.floor(y / ROW_HEIGHT)));
    const midi = MAX_MIDI - row;
    return { beat, midi, pitch: midiToNoteName(midi) };
  }

  function addNote(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const position = getGridPosition(event);
    if (!position) return;
    const id = crypto.randomUUID();
    const next = [
      ...value,
      { id, pitch: position.pitch, midi: position.midi, startBeat: position.beat, duration: 1, role: "chordTone" as const }
    ];
    setSelectedId(id);
    onChange(next);
  }

  function moveNote(id: string, event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(id);
    const onMove = (moveEvent: PointerEvent) => {
      const synthetic = { clientX: moveEvent.clientX, clientY: moveEvent.clientY } as React.PointerEvent;
      const position = getGridPosition(synthetic);
      if (!position) return;
      onChange(value.map((note) => (note.id === id ? { ...note, midi: position.midi, pitch: position.pitch, startBeat: position.beat } : note)));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function deleteSelected() {
    if (!selectedNote) return;
    onChange(value.filter((note) => note.id !== selectedId));
    setSelectedId(undefined);
  }

  return (
    <div>
      <div className="mb-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-1">
          <p className="text-xs text-zinc-400">빈 칸 탭/클릭: 추가 · 노트 드래그: 이동 · 선택 후 삭제</p>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500" aria-live="polite">
            <span>
              노트 {value.length}개{expectedCount ? ` / 목표 ${expectedCount}개` : ""}
            </span>
            <span>{selectedNote ? `선택: ${selectedNote.pitch}, ${selectedNote.startBeat + 1}박` : "선택 없음"}</span>
            <span className="sm:hidden">가로로 밀어 더 넓은 박자를 볼 수 있습니다.</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="선택한 노트 삭제"
          onClick={deleteSelected}
          disabled={!selectedNote}
          className="min-h-11 rounded-sm border border-[#444] px-3 py-2 text-xs text-zinc-200 transition hover:border-[#ff5c5c] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
        >
          삭제
        </button>
      </div>
      <div className="flex overflow-x-auto rounded-sm border border-[#333333] bg-[#1f1f1f]">
        <PianoKeyboard midiRange={range} />
        <div
          ref={gridRef}
          onPointerDown={addNote}
          className="roll-grid relative touch-none"
          style={{ width: BEATS * BEAT_WIDTH, minWidth: BEATS * BEAT_WIDTH, height: range.length * ROW_HEIGHT }}
          aria-label="드래그 가능한 미니 피아노롤"
        >
          {value.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-sm border border-[#444] bg-[#181818]/90 px-3 py-2 text-center text-xs leading-5 text-zinc-300">
              첫 노트는 빈 칸을 눌러 추가하세요. 반 박 단위로 배치됩니다.
            </div>
          ) : null}
          {value.map((note) => {
            if (note.midi < MIN_MIDI || note.midi > MAX_MIDI) return null;
            return (
              <NoteBlock
                key={note.id}
                note={note}
                selected={note.id === selectedId}
                top={(MAX_MIDI - note.midi) * ROW_HEIGHT + 2}
                left={note.startBeat * BEAT_WIDTH + 2}
                width={Math.max(18, note.duration * BEAT_WIDTH - 4)}
                onPointerDown={(event) => moveNote(note.id, event)}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(note.id);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
