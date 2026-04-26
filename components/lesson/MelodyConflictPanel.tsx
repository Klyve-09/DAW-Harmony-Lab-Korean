import type { ChordSymbol, PianoRollNote } from "@/types/music";

function pitchClass(pitch: string) {
  return pitch.replace(/[0-9]/g, "");
}

function classify(note: PianoRollNote, chord: ChordSymbol) {
  const noteName = pitchClass(note.pitch);
  if (chord.notes.includes(noteName)) return { label: "코드톤", tone: "text-[#b8ff4d]", advice: "강박에 길게 둬도 안정적입니다." };
  if (["D", "A", "B", "F#", "Bb"].includes(noteName)) return { label: "텐션", tone: "text-[#5cd6ff]", advice: "색채는 좋지만 다음 음으로 해결되는지 들어보세요." };
  return { label: "외부음", tone: "text-[#ff5c5c]", advice: "약박에 짧게 쓰거나 가까운 코드톤으로 해결하세요." };
}

export function MelodyConflictPanel({ notes, chord }: { notes: PianoRollNote[]; chord?: ChordSymbol }) {
  if (!chord) return null;
  const melody = notes.slice(0, 8).map((note) => ({ note, result: classify(note, chord), strongBeat: Number.isInteger(note.startBeat) }));

  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-5" aria-label="멜로디 코드 충돌 분석">
      <p className="text-xs font-semibold uppercase tracking-normal text-[#5cd6ff]">Melody check</p>
      <h2 className="mt-1 text-base font-semibold">멜로디-코드 충돌 분석</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {chord.name} 위에서 각 멜로디 음이 코드톤인지, 텐션인지, 외부음인지 확인합니다. 강박의 긴 음일수록 안정도가 더 중요합니다.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {melody.map(({ note, result, strongBeat }) => (
          <div key={note.id} className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{note.pitch}</span>
              <span className={`text-xs font-semibold ${result.tone}`}>{result.label}</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">{strongBeat ? "강박" : "약박"} · {result.advice}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
