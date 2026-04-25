import type { PianoRollNote } from "@/types/music";

const roleClass: Record<NonNullable<PianoRollNote["role"]>, string> = {
  root: "bg-[#ffcc00] text-black",
  chordTone: "bg-[#b8ff4d] text-black",
  tension: "bg-[#5cd6ff] text-black",
  outside: "bg-[#ff5c5c] text-black"
};

export function NoteBlock({
  note,
  top,
  left,
  width,
  selected,
  onPointerDown,
  onClick
}: {
  note: PianoRollNote;
  top: number;
  left: number;
  width: number;
  selected?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const className = `absolute h-[18px] rounded-[3px] border border-black/30 px-1 text-left text-[10px] font-semibold ${
    roleClass[note.role ?? "chordTone"]
  } ${selected ? "ring-2 ring-white" : ""}`;
  const style = { top, left, width };
  const label = `${note.pitch}, ${note.startBeat + 1}박`;

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
