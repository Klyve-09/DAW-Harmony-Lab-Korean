import { ExternalLink, Music2 } from "lucide-react";
import { dawImportGuides } from "@/lib/daw/importGuides";

export function DawImportGuide({ bpm }: { bpm: number }) {
  return (
    <details className="border-t border-[#333333] bg-[#181818] px-4 py-3">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-100 marker:content-['']">
        <span className="inline-flex items-center gap-2">
          <Music2 size={15} aria-hidden />
          DAW로 가져오기
        </span>
        <span className="text-xs font-normal text-zinc-500">BPM {bpm}</span>
      </summary>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {dawImportGuides.map((guide) => (
          <article key={guide.id} className="rounded-sm border border-[#333333] bg-[#202020] p-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-100">{guide.name}</h3>
              <a
                href={guide.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-center gap-1 rounded-sm border border-[#444] px-2 text-xs text-zinc-300 transition hover:border-[#5cd6ff]"
              >
                <ExternalLink size={12} aria-hidden />
                {guide.sourceLabel}
              </a>
            </div>
            <ol className="mt-3 space-y-2 text-xs leading-5 text-zinc-300">
              {guide.steps.map((step, index) => (
                <li key={step} className="grid grid-cols-[18px_minmax(0,1fr)] gap-2">
                  <span className="text-[#b8ff4d]">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-sm border border-[#3a3a3a] bg-[#181818] px-2 py-2 text-xs leading-5 text-zinc-400">{guide.check}</p>
          </article>
        ))}
      </div>
    </details>
  );
}
