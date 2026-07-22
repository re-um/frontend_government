import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
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
  Menu,
  X as CloseIcon,
} from "lucide-react";
import { consortiums, supportPrograms, notifications as seedNotifications, type AppNotification } from "../lib/mockData";
import { BtnPrimary, BtnSecondary, Modal } from "./ui-kit";

type AppSettings = {
  notificationsEnabled: boolean;
  refreshMinutes: number;
};

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  refreshMinutes: 0,
};

const SETTINGS_STORAGE_KEY = "reum-app-settings";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [draftSettings, setDraftSettings] = useState<AppSettings>(defaultSettings);
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

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!saved) return;
      const parsed = { ...defaultSettings, ...JSON.parse(saved) } as AppSettings;
      setSettings(parsed);
      setDraftSettings(parsed);
    } catch {
      // 잘못된 로컬 설정값은 기본값을 사용합니다.
    }
  }, []);

  useEffect(() => {
    if (settings.refreshMinutes <= 0) return;
    const timer = window.setInterval(
      () => window.location.reload(),
      settings.refreshMinutes * 60 * 1000,
    );
    return () => window.clearInterval(timer);
  }, [settings.refreshMinutes]);

  const unreadCount = settings.notificationsEnabled ? notifs.filter((n) => n.unread).length : 0;

  function openSettings() {
    setDraftSettings(settings);
    setSettingsOpen(true);
  }

  function saveSettings() {
    setSettings(draftSettings);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(draftSettings));
    setSettingsOpen(false);
    toast.success("설정을 저장했습니다.", {
      description:
        draftSettings.refreshMinutes > 0
          ? `${draftSettings.refreshMinutes}분마다 데이터를 자동으로 새로고침합니다.`
          : "자동 새로고침이 꺼져 있습니다.",
    });
  }

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
      {/* Mobile navigation */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="모바일 메뉴 닫기"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-black/40 bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-200 lg:hidden " +
          (mobileNavOpen ? "translate-x-0" : "-translate-x-full")
        }
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex h-16 items-center gap-2.5 px-5">
          <ReumLogo />
          <div className="flex-1 leading-tight">
            <div className="flex items-baseline gap-0.5 text-[17px] font-bold tracking-tight text-white">
              <span>Re</span><span className="text-lime">:</span><span>um</span>
            </div>
            <div className="text-[10px] text-white/50">AI Industrial Symbiosis</div>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="메뉴 닫기"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
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
                    onClick={() => setMobileNavOpen(false)}
                    className={
                      "group flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium transition " +
                      (active
                        ? "bg-lime text-lime-foreground"
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
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-card/90 px-3 backdrop-blur sm:gap-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-foreground/70 hover:bg-secondary lg:hidden"
            aria-label="메뉴 열기"
            aria-expanded={mobileNavOpen}
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
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
                <div className="fixed left-3 right-3 top-[68px] z-30 overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-[380px] sm:max-w-[calc(100vw-3rem)]">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="text-[13px] font-bold">알림 센터</div>
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      모두 읽음으로
                    </button>
                  </div>
                  {!settings.notificationsEnabled ? (
                    <div className="p-6 text-center">
                      <Bell className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                      <div className="mt-2 text-[13px] font-semibold">알림이 꺼져 있습니다.</div>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          openSettings();
                        }}
                        className="mt-2 text-[12px] font-semibold text-[#65A30D] hover:underline"
                      >
                        설정에서 켜기
                      </button>
                    </div>
                  ) : (
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
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={openSettings}
              className="grid h-9 w-9 place-items-center rounded-lg text-foreground/70 hover:bg-secondary"
              aria-label="환경 설정 열기"
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#14181D] text-[11px] font-bold text-lime">산통</div>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-[12px] font-semibold">산통부 계정</div>
                <div className="text-[10px] text-muted-foreground">Policy Analyst</div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-8">{children}</main>
      </div>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="환경 설정"
        description="알림 및 데이터 갱신 방식을 설정합니다."
        footer={
          <>
            <BtnSecondary type="button" onClick={() => setSettingsOpen(false)}>취소</BtnSecondary>
            <BtnPrimary type="button" onClick={saveSettings}>설정 저장</BtnPrimary>
          </>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div>
              <div className="text-[13px] font-semibold">인앱 알림</div>
              <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                기업 응답, 추천 결과 및 정책 알림을 알림센터에 표시합니다.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draftSettings.notificationsEnabled}
              onClick={() =>
                setDraftSettings((current) => ({
                  ...current,
                  notificationsEnabled: !current.notificationsEnabled,
                }))
              }
              className={
                "relative h-6 w-11 shrink-0 rounded-full transition-colors " +
                (draftSettings.notificationsEnabled ? "bg-[#65A30D]" : "bg-border")
              }
            >
              <span
                className={
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform " +
                  (draftSettings.notificationsEnabled ? "translate-x-5" : "translate-x-0.5")
                }
              />
            </button>
          </div>

          <div className="rounded-xl border border-border p-4">
            <label htmlFor="refresh-interval" className="text-[13px] font-semibold">
              데이터 자동 새로고침
            </label>
            <div className="mt-1 text-[11px] text-muted-foreground">
              선택한 주기마다 현재 화면의 최신 데이터를 다시 불러옵니다.
            </div>
            <select
              id="refresh-interval"
              value={draftSettings.refreshMinutes}
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...current,
                  refreshMinutes: Number(event.target.value),
                }))
              }
              className="mt-3 h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none focus:border-foreground/30"
            >
              <option value={0}>사용 안 함</option>
              <option value={5}>5분마다</option>
              <option value={10}>10분마다</option>
              <option value={30}>30분마다</option>
            </select>
          </div>

          <div className="rounded-xl bg-secondary/50 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            설정은 이 브라우저에 저장되며, 다른 기기에는 자동으로 동기화되지 않습니다.
          </div>
        </div>
      </Modal>
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
