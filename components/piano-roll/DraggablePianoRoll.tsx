"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PianoRollNote } from "@/types/music";
import { midiToNoteName } from "@/lib/theory/notes";
import { getScalePitchClasses, isMidiInScale } from "@/lib/theory/scaleHighlight";
import { PianoKeyboard } from "@/components/piano-roll/PianoKeyboard";
import { NoteBlock } from "@/components/piano-roll/NoteBlock";
import { RoleLegend } from "@/components/piano-roll/RoleLegend";
import { pianoRollNoteRoleLabels, pianoRollNoteRoles, type PianoRollNoteRole } from "@/lib/pianoRoll/noteRoles";
import { getEditableBeatCount, getEditableMidiRange } from "@/lib/pianoRoll/grid";

const ROW_HEIGHT = 22;
const BEAT_WIDTH = 64;
const STEP_WIDTH = BEAT_WIDTH / 2;
const durationOptions = [0.5, 1, 2, 4];

export function DraggablePianoRoll({
  value,
  onChange,
  expectedNotes,
  scaleKey
}: {
  value: PianoRollNote[];
  onChange: (notes: PianoRollNote[]) => void;
  expectedNotes?: PianoRollNote[];
  scaleKey?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const undoStack = useRef<PianoRollNote[][]>([]);
  const redoStack = useRef<PianoRollNote[][]>([]);
  const activeDragCleanup = useRef<(() => void) | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string>();
  const [historySizes, setHistorySizes] = useState({ undo: 0, redo: 0 });
  const selectedNote = value.find((note) => note.id === selectedId);
  const expectedCount = expectedNotes?.length;
  const beats = getEditableBeatCount(value, expectedNotes);
  const range = useMemo(() => getEditableMidiRange(value, expectedNotes), [expectedNotes, value]);
  const minMidi = Math.min(...range);
  const maxMidi = Math.max(...range);
  const scalePitchClasses = getScalePitchClasses(scaleKey, expectedNotes ?? value);

  useEffect(
    () => () => {
      const cleanup = activeDragCleanup.current;
      activeDragCleanup.current = undefined;
      cleanup?.();
    },
    []
  );

  function clearActiveDrag() {
    const cleanup = activeDragCleanup.current;
    activeDragCleanup.current = undefined;
    cleanup?.();
  }

  function updateSelected(updater: (note: PianoRollNote) => PianoRollNote) {
    if (!selectedId) return;
    commitChange(value.map((note) => (note.id === selectedId ? updater(note) : note)));
  }

  function pushHistory(snapshot = value) {
    undoStack.current = [...undoStack.current.slice(-19), snapshot.map((note) => ({ ...note }))];
  }

  function syncHistorySizes() {
    setHistorySizes({ undo: undoStack.current.length, redo: redoStack.current.length });
  }

  function commitChange(next: PianoRollNote[]) {
    pushHistory();
    redoStack.current = [];
    syncHistorySizes();
    onChange(next);
  }

  function undo() {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current = [...redoStack.current.slice(-19), value.map((note) => ({ ...note }))];
    setSelectedId(undefined);
    syncHistorySizes();
    onChange(previous);
  }

  function redo() {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current = [...undoStack.current.slice(-19), value.map((note) => ({ ...note }))];
    setSelectedId(undefined);
    syncHistorySizes();
    onChange(next);
  }

  function getGridPosition(event: { clientX: number; clientY: number }) {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top));
    const step = Math.max(0, Math.min(beats * 2 - 1, Math.floor(x / STEP_WIDTH)));
    const beat = step / 2;
    const row = Math.max(0, Math.min(range.length - 1, Math.floor(y / ROW_HEIGHT)));
    const midi = maxMidi - row;
    return { beat, midi, pitch: midiToNoteName(midi) };
  }

  function addNote(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const position = getGridPosition(event);
    if (!position) return;
    const id = crypto.randomUUID();
    const next = [
      ...value,
      { id, pitch: position.pitch, midi: position.midi, startBeat: position.beat, duration: 1, velocity: 0.75, role: "chordTone" as const }
    ];
    setSelectedId(id);
    commitChange(next);
  }

  function moveNote(id: string, event: React.PointerEvent<HTMLButtonElement>) {
    clearActiveDrag();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(id);
    pushHistory();
    redoStack.current = [];
    syncHistorySizes();
    const onMove = (moveEvent: PointerEvent) => {
      const position = getGridPosition(moveEvent);
      if (!position) return;
      onChange(
        value.map((note) =>
          note.id === id ? { ...note, midi: position.midi, pitch: position.pitch, startBeat: position.beat, duration: Math.min(note.duration, Math.max(0.5, beats - position.beat)) } : note
        )
      );
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", clearActiveDrag);
    };
    activeDragCleanup.current = cleanup;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", clearActiveDrag);
  }

  function deleteSelected() {
    if (!selectedNote) return;
    commitChange(value.filter((note) => note.id !== selectedId));
    setSelectedId(undefined);
  }

  function shiftSelectedOctave(direction: -1 | 1) {
    updateSelected((note) => {
      const midi = Math.max(minMidi, Math.min(maxMidi, note.midi + direction * 12));
      return { ...note, midi, pitch: midiToNoteName(midi) };
    });
  }

  function setSelectedDuration(duration: number) {
    updateSelected((note) => ({ ...note, duration: Math.min(duration, Math.max(0.5, beats - note.startBeat)) }));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelected();
      return;
    }
    if (event.key === "ArrowUp" && event.shiftKey) {
      event.preventDefault();
      shiftSelectedOctave(1);
      return;
    }
    if (event.key === "ArrowDown" && event.shiftKey) {
      event.preventDefault();
      shiftSelectedOctave(-1);
      return;
    }
    if (["1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault();
      setSelectedDuration(durationOptions[Number(event.key) - 1]);
    }
  }

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} className="outline-none focus-visible:ring-2 focus-visible:ring-[#5cd6ff]">
      <div className="mb-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-1">
          <p className="text-xs text-zinc-400">
            빈 칸 탭/클릭: 추가 · 노트 드래그: 이동 · Delete 삭제 · Ctrl+Z/Y 실행취소/다시실행 · Shift+↑/↓ 옥타브
          </p>
          <RoleLegend />
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500" aria-live="polite">
            <span>
              노트 {value.length}개{expectedCount ? ` / 목표 ${expectedCount}개` : ""}
            </span>
            <span>{selectedNote ? `선택: ${selectedNote.pitch}, ${selectedNote.startBeat + 1}박` : "선택 없음"}</span>
            {scaleKey ? <span>{scaleKey} scale 하이라이트</span> : null}
            <span className="sm:hidden">가로로 밀어 더 넓은 박자를 볼 수 있습니다.</span>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              aria-label="실습 피아노롤 실행 취소"
              onClick={undo}
              disabled={historySizes.undo === 0}
              className="min-h-9 rounded-sm border border-[#444] px-3 py-1 text-xs text-zinc-200 transition hover:border-[#5cd6ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
            >
              Undo
            </button>
            <button
              type="button"
              aria-label="실습 피아노롤 다시 실행"
              onClick={redo}
              disabled={historySizes.redo === 0}
              className="min-h-9 rounded-sm border border-[#444] px-3 py-1 text-xs text-zinc-200 transition hover:border-[#5cd6ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
            >
              Redo
            </button>
            <button
              type="button"
              aria-label="선택한 노트 한 옥타브 내리기"
              onClick={() => shiftSelectedOctave(-1)}
              disabled={!selectedNote || selectedNote.midi <= minMidi}
              className="min-h-9 rounded-sm border border-[#444] px-3 py-1 text-xs text-zinc-200 transition hover:border-[#5cd6ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
            >
              -12
            </button>
            <button
              type="button"
              aria-label="선택한 노트 한 옥타브 올리기"
              onClick={() => shiftSelectedOctave(1)}
              disabled={!selectedNote || selectedNote.midi >= maxMidi}
              className="min-h-9 rounded-sm border border-[#444] px-3 py-1 text-xs text-zinc-200 transition hover:border-[#5cd6ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
            >
              +12
            </button>
            <button
              type="button"
              aria-label="선택한 노트 삭제"
              onClick={deleteSelected}
              disabled={!selectedNote}
              className="min-h-9 rounded-sm border border-[#444] px-3 py-1 text-xs text-zinc-200 transition hover:border-[#ff5c5c] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600"
            >
              삭제
            </button>
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {durationOptions.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                disabled={!selectedNote}
                className={`min-h-8 rounded-sm border px-2 text-[11px] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#333333] disabled:text-zinc-600 ${
                  selectedNote?.duration === duration ? "border-[#b8ff4d] bg-[#26301d] text-[#d7ff98]" : "border-[#444] text-zinc-300 hover:border-[#5cd6ff]"
                }`}
              >
                {duration}박
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedNote ? (
        <div className="mb-2 grid gap-2 rounded-sm border border-[#333333] bg-[#181818] p-3 text-xs text-zinc-300 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="grid gap-1">
            <span className="text-zinc-500">역할</span>
            <select
              value={selectedNote.role ?? "chordTone"}
              onChange={(event) => updateSelected((note) => ({ ...note, role: event.target.value as PianoRollNoteRole }))}
              className="min-h-9 rounded-sm border border-[#444] bg-[#262626] px-2 text-sm"
            >
              {pianoRollNoteRoles.map((role) => (
                <option key={role} value={role}>
                  {pianoRollNoteRoleLabels[role]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-zinc-500">세기 {Math.round((selectedNote.velocity ?? 0.75) * 100)}%</span>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={Math.round((selectedNote.velocity ?? 0.75) * 100)}
              onChange={(event) => updateSelected((note) => ({ ...note, velocity: Number(event.target.value) / 100 }))}
              className="h-9"
            />
          </label>
        </div>
      ) : null}
      <div className="flex overflow-x-auto rounded-sm border border-[#333333] bg-[#1f1f1f]">
        <PianoKeyboard midiRange={range} />
        <div
          ref={gridRef}
          onPointerDown={addNote}
          className="roll-grid relative touch-none"
          style={{ width: beats * BEAT_WIDTH, minWidth: beats * BEAT_WIDTH, height: range.length * ROW_HEIGHT }}
          aria-label="드래그 가능한 미니 피아노롤"
        >
          {range.map((midi, row) => {
            const inScale = isMidiInScale(midiToNoteName(midi), scalePitchClasses);
            return (
              <div
                key={`scale-${midi}`}
                aria-hidden="true"
                className={`pointer-events-none absolute left-0 right-0 ${inScale ? "bg-[#b8ff4d]/[0.045]" : "bg-[#ff5c5c]/[0.03]"}`}
                style={{ top: row * ROW_HEIGHT, height: ROW_HEIGHT }}
              />
            );
          })}
          {value.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-sm border border-[#444] bg-[#181818]/90 px-3 py-2 text-center text-xs leading-5 text-zinc-300">
              첫 노트는 빈 칸을 눌러 추가하세요. 반 박 단위로 배치됩니다.
            </div>
          ) : null}
          {value.map((note) => {
            if (note.midi < minMidi || note.midi > maxMidi) return null;
            return (
              <NoteBlock
                key={note.id}
                note={note}
                selected={note.id === selectedId}
                top={(maxMidi - note.midi) * ROW_HEIGHT + 2}
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
