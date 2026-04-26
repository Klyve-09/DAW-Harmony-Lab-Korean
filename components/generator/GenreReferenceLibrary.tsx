import Link from "next/link";
import { genreReferenceLibrary } from "@/data/referenceLibrary";

export function GenreReferenceLibrary() {
  return (
    <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-4" aria-label="장르 레퍼런스 라이브러리">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-[#5cd6ff]">Reference</p>
          <h2 className="mt-1 text-base font-semibold">장르 레퍼런스</h2>
        </div>
        <span className="text-xs text-zinc-500">{genreReferenceLibrary.length} styles</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {genreReferenceLibrary.map((item) => (
          <Link key={item.genre} href={`/lessons/${item.lessonSlug}`} className="rounded-sm border border-[#333333] bg-[#181818] p-3 transition hover:border-[#5cd6ff]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{item.label}</span>
              <span className="rounded-sm border border-[#444] px-2 py-1 text-[11px] text-zinc-400">{item.bpm} BPM</span>
            </div>
            <p className="mt-2 text-xs text-[#b8ff4d]">{item.progression}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{item.useCase}</p>
            <ul className="mt-2 space-y-1 text-[11px] leading-4 text-zinc-500">
              {item.checklist.slice(0, 2).map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </section>
  );
}
