import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Network,
  ListChecks,
  Leaf,
  Landmark,
  FileBarChart,
  Search,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/consortium", label: "산업공생 컨소시엄 후보 추천", icon: Network },
  { to: "/participation", label: "기업 참여 진행 현황", icon: ListChecks },
  { to: "/carbon", label: "탄소감축 / 환경성과 분석", icon: Leaf },
  { to: "/policy", label: "자원순환 정책 운영 대시보드", icon: Landmark },
  { to: "/report", label: "정책 성과 리포트", icon: FileBarChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#1B1F23]">
            <span className="text-[11px] font-bold text-lime">L</span>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight">LIUM</div>
            <div className="text-[10px] text-muted-foreground">AI Industrial Symbiosis</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition " +
                      (active
                        ? "bg-lime text-lime-foreground shadow-[inset_0_0_0_1px_rgba(27,31,35,0.06)]"
                        : "text-foreground/70 hover:bg-secondary hover:text-foreground")
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-4 py-4">
          <div className="rounded-xl border border-border bg-secondary/60 p-3">
            <div className="text-[11px] font-semibold text-foreground">
              데이터로 연결하고, AI로 순환합니다.
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              LIUM v2.4 · MOTIE 산업통상자원부
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen w-full flex-1 flex-col lg:pl-[260px]">
        {/* Top nav */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/90 px-6 backdrop-blur">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                type="search"
                placeholder="기업명, 지역, 폐기물 종류 검색"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-lg text-foreground/70 hover:bg-secondary">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-foreground/70 hover:bg-secondary">
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <div className="mx-2 h-6 w-px bg-border" />
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1B1F23] text-[11px] font-bold text-lime">
                산통
              </div>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-[12px] font-semibold">산통부 계정</div>
                <div className="text-[10px] text-muted-foreground">Policy Analyst</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
