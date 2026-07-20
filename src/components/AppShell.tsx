import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Network,
  ListChecks,
  Leaf,
  Landmark,
  FileBarChart,
  FileText,
  Search,
  Bell,
  Settings,
  ChevronDown,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { consortiums, supportPrograms, notifications as seedNotifications, type AppNotification } from "../lib/mockData";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/consortium/", label: "산업공생 컨소시엄 후보 추천", icon: Network },
  { to: "/participation", label: "기업 참여 진행 현황", icon: ListChecks },
  { to: "/carbon", label: "탄소감축 / 환경성과 분석", icon: Leaf },
  { to: "/report", label: "폐합성수지 환경성과 리포트", icon: FileBarChart },
  { to: "/policy", label: "자원순환 정책 운영 대시보드", icon: Landmark },
  { to: "/policy-report", label: "정책 운영 성과 리포트", icon: FileText },
  { to: "/support/", label: "추천 지원사업 및 정책", icon: FileText },
] as const;

function ReumLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="#14181D" />
      {/* Circular loop */}
      <path
        d="M12 20a8 8 0 1 1 4.5 7.2"
        stroke="#A3E635"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow head */}
      <path
        d="M14.6 26.9l2.6 1.5-1.5 2.6"
        stroke="#A3E635"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* AI node dot */}
      <circle cx="27" cy="14" r="2.6" fill="#22D3EE" />
    </svg>
  );
}

type SearchHit = { to: string; label: string; sub: string; params?: Record<string, string> };

function useGlobalIndex(): SearchHit[] {
  return useMemo(() => {
    const hits: SearchHit[] = [];
    for (const c of consortiums) {
      hits.push({
        to: "/consortium/$id",
        params: { id: c.id },
        label: `${c.emitter.name} · ${c.emitter.waste}`,
        sub: `${c.id} · ${c.emitter.region} → ${c.demander.region}`,
      });
    }
    for (const p of supportPrograms) {
      hits.push({
        to: "/support/$id",
        params: { id: p.id },
        label: p.name,
        sub: `${p.ministry} · ${p.scale}`,
      });
    }
    for (const n of navItems) {
      hits.push({ to: n.to, label: n.label, sub: "메뉴" });
    }
    return hits;
  }, []);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>(seedNotifications);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    const normalizedPath = pathname.replace(/\/$/, "");
    const normalizedTarget = to.replace(/\/$/, "");
    return normalizedPath === normalizedTarget || normalizedPath.startsWith(normalizedTarget + "/");
  };
  const index = useGlobalIndex();
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.trim().toLowerCase();
    return index
      .filter((h) => h.label.toLowerCase().includes(s) || h.sub.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, index]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const unreadCount = notifs.filter((n) => n.unread).length;

  function openNotification(n: AppNotification) {
    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    setNotifOpen(false);
    if (n.to) navigate({ to: n.to });
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((x) => ({ ...x, unread: false })));
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar (dark) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] shrink-0 flex-col border-r border-black/40 bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <ReumLogo />
          <div className="leading-tight">
            <div className="flex items-baseline gap-0.5 text-[17px] font-bold tracking-tight text-white">
              <span>Re</span>
              <span className="text-lime">:</span>
              <span>um</span>
            </div>
            <div className="text-[10px] text-white/50">AI Industrial Symbiosis</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
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
                        ? "bg-lime text-lime-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                        : "text-white/70 hover:bg-white/5 hover:text-white")
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

        <div className="border-t border-white/10 px-4 py-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] font-semibold text-white">다시 순환하고, 다시 연결합니다.</div>
            <div className="mt-1 text-[10px] text-white/50">Re:um v2.4 · MOTIE 산업통상자원부</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen w-full flex-1 flex-col lg:pl-[260px]">
        {/* Top nav */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/90 px-6 backdrop-blur">
          <div className="flex flex-1 items-center gap-3">
            <div ref={searchRef} className="relative w-full max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="기업명, 컨소시엄 ID, 지원사업 검색"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5"
              />
              {searchOpen && q.trim() && (
                <div className="absolute left-0 right-0 top-12 z-30 max-h-[420px] overflow-auto rounded-xl border border-border bg-card shadow-lg">
                  {results.length === 0 ? (
                    <div className="p-4 text-[13px] text-muted-foreground">검색 결과가 없습니다.</div>
                  ) : (
                    <ul className="py-1">
                      {results.map((h, i) => (
                        <li key={i}>
                          <button
                            onClick={() => {
                              setSearchOpen(false);
                              setQ("");
                              navigate({ to: h.to as any, params: h.params as any });
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary"
                          >
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-foreground/70">
                              <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-semibold">{h.label}</div>
                              <div className="truncate text-[11px] text-muted-foreground">{h.sub}</div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative grid h-9 w-9 place-items-center rounded-lg text-foreground/70 hover:bg-secondary"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 z-30 w-[380px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="text-[13px] font-bold">알림 센터</div>
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      모두 읽음으로
                    </button>
                  </div>
                  <ul className="max-h-[420px] divide-y divide-border overflow-auto">
                    {notifs.map((n) => (
                      <li key={n.id}>
                        <button
                          onClick={() => openNotification(n)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-secondary"
                        >
                          <NotifIcon kind={n.kind} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-[13px] font-semibold">{n.title}</div>
                              {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />}
                            </div>
                            <div className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
                              {n.message}
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground">{n.at}</div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-foreground/70 hover:bg-secondary">
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <div className="mx-2 h-6 w-px bg-border" />
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#14181D] text-[11px] font-bold text-lime">산통</div>
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

function NotifIcon({ kind }: { kind: AppNotification["kind"] }) {
  const map = {
    response: { Icon: MessageSquare, cls: "bg-[#CFFAFE] text-[#155E75]" },
    recommendation: { Icon: Sparkles, cls: "bg-lime text-lime-foreground" },
    policy: { Icon: AlertTriangle, cls: "bg-[#FEF3C7] text-[#92400E]" },
    system: { Icon: CheckCircle2, cls: "bg-secondary text-foreground/70" },
  } as const;
  const { Icon, cls } = map[kind];
  return (
    <div className={"grid h-9 w-9 shrink-0 place-items-center rounded-lg " + cls}>
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </div>
  );
}
