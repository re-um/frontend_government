import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Check,
  Clock,
  X,
  Sparkles,
  RefreshCw,
  PauseCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { Badge, BtnPrimary, BtnSecondary, Card, Modal, PageHeader } from "../components/ui-kit";
import { rejectionReasons } from "../lib/mockData";

export const Route = createFileRoute("/participation")({
  head: () => ({ meta: [{ title: "기업 참여 진행 현황 · Re:um" }] }),
  component: Participation,
});

type Status = "accept" | "review" | "reject" | "hold";
interface Party { role: string; name: string; status: Status }
interface Case {
  id: string;
  emitter: string;
  waste: string;
  step: number;
  parties: Party[];
  startedAt: string;
}

const initialCases: Case[] = [
  {
    id: "C-2024-0142",
    emitter: "한화솔루션 여수",
    waste: "폐합성수지 (PP)",
    step: 3,
    parties: [
      { role: "배출기업", name: "한화솔루션 여수", status: "accept" },
      { role: "중간처리", name: "한국플라스틱순환", status: "review" },
      { role: "수요기업", name: "코오롱인더스트리 김천", status: "review" },
    ],
    startedAt: "2025-12-04",
  },
  {
    id: "C-2024-0138",
    emitter: "LG화학 여수",
    waste: "폐합성수지 (HDPE)",
    step: 2,
    parties: [
      { role: "배출기업", name: "LG화학 여수", status: "accept" },
      { role: "중간처리", name: "그린사이클", status: "accept" },
      { role: "수요기업", name: "SK지오센트릭", status: "reject" },
    ],
    startedAt: "2025-11-18",
  },
  {
    id: "C-2024-0127",
    emitter: "SK케미칼 울산",
    waste: "폐합성수지 (PET)",
    step: 1,
    parties: [
      { role: "배출기업", name: "SK케미칼 울산", status: "accept" },
      { role: "중간처리", name: "케이알폴리머", status: "hold" },
      { role: "수요기업", name: "효성티앤씨 울산", status: "review" },
    ],
    startedAt: "2025-12-10",
  },
  {
    id: "C-2024-0151",
    emitter: "롯데케미칼 대산",
    waste: "폐합성수지 (LDPE)",
    step: 4,
    parties: [
      { role: "배출기업", name: "롯데케미칼 대산", status: "accept" },
      { role: "중간처리", name: "동양리사이클링", status: "accept" },
      { role: "수요기업", name: "율촌화학", status: "accept" },
    ],
    startedAt: "2025-12-18",
  },
  {
    id: "C-2024-0149",
    emitter: "삼성전자 기흥",
    waste: "폐합성수지 (ABS)",
    step: 2,
    parties: [
      { role: "배출기업", name: "삼성전자 기흥", status: "accept" },
      { role: "중간처리", name: "에코폴리머", status: "review" },
      { role: "수요기업", name: "동진엔지니어링", status: "review" },
    ],
    startedAt: "2025-12-15",
  },
  {
    id: "C-2024-0145",
    emitter: "금호석유화학 울산",
    waste: "폐합성수지 (PP)",
    step: 2,
    parties: [
      { role: "배출기업", name: "금호석유화학 울산", status: "accept" },
      { role: "중간처리", name: "울산자원순환", status: "hold" },
      { role: "수요기업", name: "현대EP", status: "review" },
    ],
    startedAt: "2025-11-30",
  },
  {
    id: "C-2024-0121",
    emitter: "GS칼텍스 여수",
    waste: "폐합성수지 (HDPE)",
    step: 3,
    parties: [
      { role: "배출기업", name: "GS칼텍스 여수", status: "accept" },
      { role: "중간처리", name: "그린사이클", status: "accept" },
      { role: "수요기업", name: "대한유화", status: "reject" },
    ],
    startedAt: "2025-10-25",
  },
  {
    id: "C-2024-0116",
    emitter: "효성화학 용연",
    waste: "폐합성수지 (PET)",
    step: 4,
    parties: [
      { role: "배출기업", name: "효성화학 용연", status: "accept" },
      { role: "중간처리", name: "케이알폴리머", status: "accept" },
      { role: "수요기업", name: "효성티앤씨 울산", status: "accept" },
    ],
    startedAt: "2025-09-12",
  },
  {
    id: "C-2024-0108",
    emitter: "SK지오센트릭 울산",
    waste: "폐합성수지 (LDPE)",
    step: 3,
    parties: [
      { role: "배출기업", name: "SK지오센트릭 울산", status: "accept" },
      { role: "중간처리", name: "리뉴폴리머", status: "review" },
      { role: "수요기업", name: "동원시스템즈", status: "accept" },
    ],
    startedAt: "2025-07-20",
  },
  {
    id: "C-2024-0097",
    emitter: "코오롱인더스트리 구미",
    waste: "폐합성수지 (ABS)",
    step: 1,
    parties: [
      { role: "배출기업", name: "코오롱인더스트리 구미", status: "review" },
      { role: "중간처리", name: "경북에코플라스틱", status: "review" },
      { role: "수요기업", name: "LG전자 창원", status: "review" },
    ],
    startedAt: "2025-02-14",
  },
];

const timeline = [
  { label: "AI 추천 완료", date: "2025-12-04" },
  { label: "산통부 검토 완료", date: "2025-12-11" },
  { label: "기업 응답", date: "진행중" },
  { label: "최종 승인", date: "예정" },
];

const partyStatus: Record<Status, { tone: any; label: string; icon: any }> = {
  accept: { tone: "success", label: "수락", icon: Check },
  review: { tone: "warning", label: "검토중", icon: Clock },
  reject: { tone: "danger", label: "거절", icon: X },
  hold: { tone: "neutral", label: "보류", icon: PauseCircle },
};

const alternativeSuggestions: Record<string, string[]> = {
  "C-2024-0138": ["한화솔루션 여수", "롯데케미칼 대산", "GS칼텍스 여수"],
  "C-2024-0121": ["한화솔루션 울산", "롯데케미칼 대산", "코오롱인더스트리 김천"],
  default: ["코오롱인더스트리 김천", "율촌화학", "효성티앤씨 울산"],
};

const TABS = [
  { key: "all", label: "전체" },
  { key: "accept", label: "수락" },
  { key: "review", label: "검토중" },
  { key: "reject", label: "거절" },
  { key: "hold", label: "보류" },
] as const;

function Participation() {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [companyFilter, setCompanyFilter] = useState("전체");
  const [wasteFilter, setWasteFilter] = useState("전체");
  const [periodFilter, setPeriodFilter] = useState("전체");
  const [rejectModal, setRejectModal] = useState<Case | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ caseId: string; suggestions: string[] } | null>(null);
  const companyOptions = ["전체", ...cases.map((c) => c.emitter)];

  const filtered = useMemo(() => {
    const latestStartedAt = cases.reduce(
      (latest, c) => Math.max(latest, new Date(`${c.startedAt}T00:00:00`).getTime()),
      0,
    );

    return cases.filter((c) => {
      const matchesTab =
        tab === "all" ||
        c.parties.some((p) => p.status === tab);
      const caseStatus = c.parties.some((p) => p.status === "hold")
        ? "보류"
        : c.step >= 4 || c.parties.every((p) => p.status === "accept")
          ? "완료"
          : "진행중";
      const matchesStatus = statusFilter === "전체" || caseStatus === statusFilter;
      const matchesCompany =
        companyFilter === "전체" ||
        c.emitter.includes(companyFilter) ||
        c.parties.some((p) => p.name.includes(companyFilter));
      const matchesWaste = wasteFilter === "전체" || c.waste.includes(wasteFilter);

      const startedAt = new Date(`${c.startedAt}T00:00:00`);
      const referenceDate = new Date(latestStartedAt);
      let matchesPeriod = true;
      if (periodFilter === "최근 30일" || periodFilter === "최근 90일") {
        const days = periodFilter === "최근 30일" ? 30 : 90;
        const cutoff = new Date(referenceDate);
        cutoff.setDate(cutoff.getDate() - days);
        matchesPeriod = startedAt >= cutoff && startedAt <= referenceDate;
      } else if (periodFilter === "이번 분기") {
        const quarterStartMonth = Math.floor(referenceDate.getMonth() / 3) * 3;
        const quarterStart = new Date(referenceDate.getFullYear(), quarterStartMonth, 1);
        matchesPeriod = startedAt >= quarterStart && startedAt <= referenceDate;
      } else if (periodFilter === "올해") {
        matchesPeriod = startedAt.getFullYear() === referenceDate.getFullYear();
      }

      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.emitter.toLowerCase().includes(q) ||
        c.waste.toLowerCase().includes(q) ||
        c.parties.some((p) => p.name.toLowerCase().includes(q));
      return (
        matchesTab &&
        matchesStatus &&
        matchesCompany &&
        matchesWaste &&
        matchesPeriod &&
        matchesQuery
      );
    });
  }, [cases, tab, query, statusFilter, companyFilter, wasteFilter, periodFilter]);

  const hasActiveFilters =
    tab !== "all" ||
    query !== "" ||
    statusFilter !== "전체" ||
    companyFilter !== "전체" ||
    wasteFilter !== "전체" ||
    periodFilter !== "전체";

  function resetFilters() {
    setTab("all");
    setQuery("");
    setStatusFilter("전체");
    setCompanyFilter("전체");
    setWasteFilter("전체");
    setPeriodFilter("전체");
  }

  function counts(status: Status | "all") {
    if (status === "all") return cases.length;
    return cases.filter((c) => c.parties.some((p) => p.status === status)).length;
  }

  function runAiReroll(c: Case) {
    setAiLoading(c.id);
    setTimeout(() => {
      const suggestions = alternativeSuggestions[c.id] ?? alternativeSuggestions.default;
      setAiResult({ caseId: c.id, suggestions });
      setAiLoading(null);
      toast.success("AI 차순위 추천이 준비되었습니다.", {
        description: `${suggestions.length}개의 대체 파트너를 확인해 주세요.`,
      });
    }, 900);
  }

  function applySuggestion(caseId: string, name: string) {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              parties: c.parties.map((p) =>
                p.status === "reject" ? { ...p, name, status: "review" as Status } : p
              ),
            }
          : c
      )
    );
    setAiResult(null);
    toast.success(`${name}에 참여 요청을 보냈습니다.`);
  }

  function holdCase(c: Case) {
    setCases((prev) =>
      prev.map((x) =>
        x.id === c.id
          ? { ...x, parties: x.parties.map((p) => (p.status === "review" ? { ...p, status: "hold" } : p)) }
          : x
      )
    );
    toast("컨소시엄이 보류 상태로 변경되었습니다.");
  }

  function requestAgain(c: Case) {
    toast.success(`${c.id} 참여 요청을 재발송했습니다.`);
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Screen · 기업 워크플로우"
        title="기업 참여 진행 현황"
        description="기업 응답을 기다리는 중입니다. AI 추천 이후 승인 단계를 실시간으로 확인해 주세요."
      />

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition " +
                (active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground/70 hover:bg-secondary")
              }
            >
              {t.label}
              <span
                className={
                  "num rounded-full px-1.5 text-[10px] " +
                  (active ? "bg-white/15 text-white" : "bg-secondary text-foreground/60")
                }
              >
                {counts(t.key as any)}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <FilterSelect
            label="상태"
            options={["전체", "진행중", "완료", "보류"]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterSelect
            label="기업명"
            options={companyOptions}
            value={companyFilter}
            onChange={setCompanyFilter}
          />
          <FilterSelect
            label="폐합성수지 종류"
            options={["전체", "HDPE", "PP", "LDPE", "PET", "ABS"]}
            value={wasteFilter}
            onChange={setWasteFilter}
          />
          <FilterSelect
            label="기간"
            options={["전체", "최근 30일", "최근 90일", "이번 분기", "올해"]}
            value={periodFilter}
            onChange={setPeriodFilter}
          />
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">검색</label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ID · 기업 · 폐기물"
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[13px] outline-none"
              />
            </div>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[11px] text-muted-foreground">
              검색 결과 {filtered.length}건
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[12px] font-semibold text-foreground/70 hover:text-foreground"
            >
              조건 초기화
            </button>
          </div>
        )}
      </Card>

      {filtered.length === 0 && (
        <Card className="mb-6 text-center text-[13px] text-muted-foreground">
          조건에 맞는 컨소시엄이 없습니다.
        </Card>
      )}

      {filtered.map((c) => (
        <Card key={c.id} className="mb-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-semibold text-muted-foreground">{c.id}</div>
              <div className="text-[16px] font-bold">
                {c.emitter} · {c.waste}
              </div>
              <div className="text-[11px] text-muted-foreground">시작일 {c.startedAt}</div>
            </div>
            <Badge tone="info">진행중 · Step {c.step}/4</Badge>
          </div>

          <div className="mb-6 rounded-xl border border-border p-4">
            <div className="grid grid-cols-4 gap-2">
              {timeline.map((t, i) => {
                const active = i < c.step;
                const current = i === c.step - 1;
                return (
                  <div key={t.label} className="relative">
                    <div className="flex items-center gap-2">
                      <div
                        className={
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold " +
                          (active ? "bg-lime text-lime-foreground" : "bg-secondary text-muted-foreground")
                        }
                      >
                        {active ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                      </div>
                      {i < timeline.length - 1 && (
                        <div
                          className={"h-0.5 flex-1 rounded-full " + (i < c.step - 1 ? "bg-lime" : "bg-border")}
                        />
                      )}
                    </div>
                    <div
                      className={
                        "mt-2 text-[12px] font-semibold " + (current ? "text-foreground" : "text-foreground/70")
                      }
                    >
                      {t.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{t.date}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {c.parties.map((p) => {
              const s = partyStatus[p.status];
              const Icon = s.icon;
              return (
                <div key={p.role} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {p.role}
                    </div>
                    <Badge tone={s.tone}>
                      <Icon className="h-3 w-3" strokeWidth={2.5} /> {s.label}
                    </Badge>
                  </div>
                  <div className="mt-2 text-[14px] font-semibold">{p.name}</div>
                  <div className="mt-2 text-[11px] text-muted-foreground">응답 요청 2025-12-11</div>
                </div>
              );
            })}
          </div>

          {aiResult?.caseId === c.id && (
            <div className="mt-5 rounded-xl border border-lime/60 bg-lime/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-[12px] font-bold">
                <Sparkles className="h-4 w-4" strokeWidth={2} /> AI 차순위 추천
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {aiResult.suggestions.map((n) => (
                  <button
                    key={n}
                    onClick={() => applySuggestion(c.id, n)}
                    className="rounded-lg border border-border bg-card p-3 text-left hover:bg-secondary"
                  >
                    <div className="text-[13px] font-semibold">{n}</div>
                    <div className="text-[11px] text-muted-foreground">클릭하여 참여 요청 보내기</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
            {c.parties.some((p) => p.status === "reject") && (
              <button
                onClick={() => setRejectModal(c)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-danger/30 bg-danger/5 px-3 text-[12px] font-medium text-danger hover:bg-danger/10"
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={1.75} /> 거절 사유 보기
              </button>
            )}
            <button
              onClick={() => holdCase(c)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium hover:bg-secondary"
            >
              <PauseCircle className="h-3.5 w-3.5" strokeWidth={1.75} /> 보류
            </button>
            <BtnSecondary className="h-9" onClick={() => requestAgain(c)}>
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} /> 다시 요청
            </BtnSecondary>
            <BtnPrimary
              className="h-9"
              disabled={aiLoading === c.id}
              onClick={() => runAiReroll(c)}
            >
              {aiLoading === c.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
              ) : (
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              AI 차순위 추천
            </BtnPrimary>
          </div>
        </Card>
      ))}

      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="거절 사유 상세"
        description={rejectModal ? `${rejectModal.id} · ${rejectModal.emitter}` : undefined}
        footer={
          <>
            <BtnSecondary onClick={() => setRejectModal(null)}>닫기</BtnSecondary>
            <BtnPrimary
              onClick={() => {
                if (rejectModal) runAiReroll(rejectModal);
                setRejectModal(null);
              }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} /> AI 차순위 추천 실행
            </BtnPrimary>
          </>
        }
      >
        {rejectModal &&
          (rejectionReasons[rejectModal.id] ?? [
            {
              by: rejectModal.parties.find((p) => p.status === "reject")?.name ?? "참여기업",
              reason: "현재 등록된 거절 사유가 없습니다. 기업에 사유 등록을 요청해 주세요.",
              at: "-",
            },
          ]).map((r, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-semibold">{r.by}</div>
                <div className="text-[11px] text-muted-foreground">{r.at}</div>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">{r.reason}</p>
            </div>
          ))}
      </Modal>
    </div>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
