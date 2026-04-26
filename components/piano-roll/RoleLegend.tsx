import type { PianoRollNote } from "@/types/music";

const legendItems: { role: NonNullable<PianoRollNote["role"]>; label: string }[] = [
  { role: "root", label: "루트" },
  { role: "third", label: "3도" },
  { role: "fifth", label: "5도" },
  { role: "seventh", label: "7도" },
  { role: "tension", label: "텐션" },
  { role: "passing", label: "패싱톤" },
  { role: "chordTone", label: "코드톤" },
  { role: "outside", label: "외부음" }
];

const swatchClass: Record<NonNullable<PianoRollNote["role"]>, string> = {
  root: "bg-[#ffcc00]",
  third: "bg-[#b8ff4d]",
  fifth: "bg-[#7dd3fc]",
  seventh: "bg-[#c084fc]",
  tension: "bg-[#5cd6ff]",
  passing: "bg-[#f59e0b]",
  outside: "bg-[#ff5c5c]",
  chordTone: "bg-[#86efac]"
};

export function RoleLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-zinc-400" aria-label="피아노롤 색상 범례">
      {legendItems.map((item) => (
        <span key={item.role} className="inline-flex items-center gap-1.5">
          <span className={`size-2.5 rounded-[2px] ${swatchClass[item.role]}`} aria-hidden />
          {item.label}
        </span>
      ))}
    </div>
  );
}
