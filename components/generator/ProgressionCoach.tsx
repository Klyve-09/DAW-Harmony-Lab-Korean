import type { GeneratedProgression } from "@/types/music";

const functionLabels: Record<string, string> = {
  I: "토닉 안정",
  i: "마이너 토닉",
  ii: "서브도미넌트 준비",
  IV: "서브도미넌트 확장",
  V: "도미넌트 긴장",
  vi: "상대단조 감성",
  VI: "넓은 색채",
  VII: "상행 긴장",
  bVI: "차용 색채",
  bVII: "영화적 확장"
};

function romanBase(roman: string) {
  return roman.replace(/maj9|maj7|m7b5|add9|sus2|sus4|m9|m7|7|9|°|ø/g, "");
}

export function ProgressionCoach({ progression }: { progression: GeneratedProgression }) {
  const functions = progression.romanNumerals.map((roman) => functionLabels[romanBase(roman)] ?? "색채 코드");
  const variation =
    progression.genre === "lofi" || progression.genre === "rnb"
      ? "각 코드의 7th를 유지하고 탑노트만 반음 또는 온음으로 가깝게 움직이세요."
      : progression.genre === "cinematic"
        ? "베이스는 루트로 길게 두고 상단 패드만 한 옥타브 위로 복제하세요."
        : "마지막 코드의 탑노트를 한 음 올려 다음 반복으로 돌아오는 힘을 만드세요.";

  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4" aria-label="생성 진행 분석">
      <p className="text-xs font-semibold uppercase tracking-normal text-[#b8ff4d]">Coach</p>
      <h2 className="mt-1 text-base font-semibold">왜 작동하나요?</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {progression.romanNumerals.map((roman, index) => (
          <div key={`${roman}-${index}`} className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">
            <p className="text-sm font-semibold text-[#5cd6ff]">{roman}</p>
            <p className="mt-1 text-xs text-zinc-400">{functions[index]}</p>
            <p className="mt-1 text-[11px] text-zinc-500">{progression.chords[index]?.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 md:grid-cols-3">
        <p className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">분석: {functions.join(" → ")}</p>
        <p className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">변형: {variation}</p>
        <p className="rounded-sm border border-[#333333] bg-[#181818] px-3 py-2">DAW: MIDI로 내보낸 뒤 베이스, 패드, 멜로디 트랙으로 복제해 역할을 나누세요.</p>
      </div>
    </section>
  );
}
