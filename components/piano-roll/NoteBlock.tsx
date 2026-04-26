import type { PianoRollNote } from "@/types/music";

const roleClass: Record<NonNullable<PianoRollNote["role"]>, string> = {
  root: "bg-[#ffcc00] text-black",
  third: "bg-[#b8ff4d] text-black",
  fifth: "bg-[#7dd3fc] text-black",
  seventh: "bg-[#c084fc] text-black",
  tension: "bg-[#5cd6ff] text-black",
  passing: "bg-[#f59e0b] text-black",
  outside: "bg-[#ff5c5c] text-black",
  chordTone: "bg-[#86efac] text-black"
};

const roleLabel: Record<NonNullable<PianoRollNote["role"]>, string> = {
  root: "루트",
  third: "3도",
  fifth: "5도",
  seventh: "7도",
  tension: "텐션",
  passing: "패싱톤",
  outside: "외부음",
  chordTone: "코드톤"
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
  const metadata = [note.scaleDegree ? `${note.scaleDegree}도` : "", note.voice ? `${note.voice} voice` : ""].filter(Boolean).join(", ");
  const label = `${note.pitch}, ${roleLabel[note.role ?? "chordTone"]}, ${note.startBeat + 1}박${metadata ? `, ${metadata}` : ""}`;

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
