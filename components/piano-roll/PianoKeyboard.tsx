import { midiToNoteName } from "@/lib/theory/notes";

export function PianoKeyboard({ midiRange }: { midiRange: number[] }) {
  return (
    <div className="w-16 shrink-0 border-r border-[#333333] bg-[#181818]" aria-hidden>
      {midiRange.map((midi) => {
        const name = midiToNoteName(midi);
        const black = name.includes("#");
        return (
          <div
            key={midi}
            className={`flex h-[22px] items-center justify-end border-b border-[#292929] pr-2 text-[10px] ${
              black ? "bg-[#101010] text-zinc-500" : "bg-[#202020] text-zinc-400"
            }`}
          >
            {name}
          </div>
        );
      })}
    </div>
  );
}
