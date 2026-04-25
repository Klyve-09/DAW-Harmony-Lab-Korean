import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children, sidebar = true }: { children: React.ReactNode; sidebar?: boolean }) {
  return (
    <div className="min-h-[100dvh] bg-[#121212]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-sm focus:bg-[#b8ff4d] focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-black"
      >
        본문으로 바로가기
      </a>
      <Header />
      <div className="mx-auto flex max-w-[1500px] flex-col md:flex-row">
        {sidebar ? <Sidebar /> : null}
        <main id="main-content" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
