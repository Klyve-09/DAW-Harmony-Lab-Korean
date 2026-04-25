import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="p-4">
        <section className="rounded-sm border border-[#333333] bg-[#1f1f1f] p-6">
          <h1 className="text-2xl font-semibold">레슨을 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-zinc-400">존재하지 않는 주소입니다. 커리큘럼 목록에서 다시 선택하세요.</p>
          <Link href="/lessons" className="mt-5 inline-block rounded-sm bg-[#b8ff4d] px-4 py-3 text-sm font-semibold text-black">
            레슨 목록으로 이동
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
