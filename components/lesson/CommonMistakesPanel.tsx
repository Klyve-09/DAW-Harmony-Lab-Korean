import type { CommonMistake } from "@/types/lesson";

export function CommonMistakesPanel({ mistakes }: { mistakes: CommonMistake[] }) {
  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-5">
      <h2 className="text-base font-semibold">자주 틀리는 점</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {mistakes.map((mistake) => (
          <article key={mistake.title} className="rounded-sm border border-[#333333] bg-[#181818] p-3">
            <h3 className="text-sm font-semibold text-[#ffcc00]">{mistake.title}</h3>
            <p className="mt-2 text-xs leading-5 text-zinc-400">{mistake.symptom}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-300">{mistake.fix}</p>
            <p className="mt-3 rounded-sm border border-[#3a3a3a] bg-[#202020] px-2 py-2 text-xs leading-5 text-zinc-400">{mistake.miniDrill}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
