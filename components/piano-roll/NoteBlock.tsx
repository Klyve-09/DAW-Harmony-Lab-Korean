import type { PianoRollNote } from "@/types/music";
import { pianoRollNoteRoleClasses, pianoRollNoteRoleLabels } from "@/lib/pianoRoll/noteRoles";

export function NoteBlock({
  note,
  top,
  left,
  width,
  height,
  selected,
  onPointerDown,
  onClick
}: {
  note: PianoRollNote;
  top: number;
  left: number;
  width: number;
  height?: number;
  selected?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const className = `absolute rounded-[3px] border border-black/30 px-1 text-left text-[10px] font-semibold text-black ${
    pianoRollNoteRoleClasses[note.role ?? "chordTone"]
  } ${selected ? "ring-2 ring-white" : ""}`;
  const style = { top, left, width, height: height ?? 18 };
  const metadata = [note.scaleDegree ? `${note.scaleDegree}도` : "", note.voice ? `${note.voice} voice` : ""].filter(Boolean).join(", ");
  const label = `${note.pitch}, ${pianoRollNoteRoleLabels[note.role ?? "chordTone"]}, 시작 ${note.startBeat + 1}박, 길이 ${note.duration}박${metadata ? `, ${metadata}` : ""}`;

  if (!onPointerDown && !onClick) {
    return (
      <div aria-hidden="true" className={className} style={style} title={label}>
        {note.pitch}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={className}
      style={style}
    >
      {note.pitch}
    </button>
  );
}
