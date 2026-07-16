import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Filter,
  Check,
  Clock,
  X,
  Sparkles,
  RefreshCw,
  PauseCircle,
  FileText,
} from "lucide-react";
import { Badge, BtnPrimary, BtnSecondary, Card, PageHeader } from "../components/ui-kit";

export const Route = createFileRoute("/participation")({
  head: () => ({ meta: [{ title: "기업 참여 진행 현황 · LIUM" }] }),
  component: Participation,
});

const cases = [
  {
    id: "C-2024-0142",
    emitter: "포스코퓨처엠 광양",
    waste: "슬래그",
    step: 3,
    parties: [
      { role: "배출기업", name: "포스코퓨처엠 광양", status: "accept" },
      { role: "중간처리", name: "한국순환자원", status: "review" },
      { role: "수요기업", name: "삼표시멘트 삼척", status: "review" },
    ],
    startedAt: "2025-12-04",
  },
  {
    id: "C-2024-0138",
    emitter: "LG화학 여수",
    waste: "폐플라스틱",
    step: 2,
    parties: [
      { role: "배출기업", name: "LG화학 여수", status: "accept" },
      { role: "중간처리", name: "그린사이클", status: "accept" },
      { role: "수요기업", name: "SK지오센트릭", status: "reject" },
    ],
    startedAt: "2025-11-18",
  },
];

const timeline = [
  { label: "AI 추천 완료", done: true, date: "2025-12-04" },
  { label: "산통부 검토 완료", done: true, date: "2025-12-11" },
  { label: "기업 응답", done: true, date: "진행중" },
  { label: "최종 승인", done: false, date: "예정" },
];

const partyStatus: Record<string, { tone: any; label: string; icon: any }> = {
  accept: { tone: "success", label: "수락", icon: Check },
  review: { tone: "warning", label: "검토중", icon: Clock },
  reject: { tone: "danger", label: "거절", icon: X },
};

function Participation() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Screen · 기업 워크플로우"
        title="기업 참여 진행 현황"
        description="기업 응답을 기다리는 중입니다. AI 추천 이후 승인 단계를 실시간으로 확인해 주세요."
        actions={
          <BtnSecondary>
            <Filter className="h-4 w-4" strokeWidth={1.75} /> 고급 필터
          </BtnSecondary>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <FilterSelect label="상태" options={["전체", "진행중", "완료", "보류"]} />
          <FilterSelect
            label="기업명"
            options={["전체", "포스코퓨처엠", "LG화학", "현대제철"]}
          />
          <FilterSelect
            label="폐기물 종류"
            options={["전체", "슬래그", "폐플라스틱", "폐용매"]}
          />
          <FilterSelect
            label="기간"
            options={["최근 30일", "최근 90일", "이번 분기", "올해"]}
          />
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
              검색
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                placeholder="컨소시엄 ID"
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[13px] outline-none"
              />
            </div>
          </div>
        </div>
      </Card>

      {cases.map((c) => (
        <Card key={c.id} className="mb-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-semibold text-muted-foreground">
                {c.id}
              </div>
              <div className="text-[16px] font-bold">
                {c.emitter} · {c.waste}
              </div>
              <div className="text-[11px] text-muted-foreground">시작일 {c.startedAt}</div>
            </div>
            <Badge tone="info">진행중 · Step {c.step}/4</Badge>
          </div>

          {/* Timeline */}
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
                          (active
                            ? "bg-lime text-lime-foreground"
                            : "bg-secondary text-muted-foreground")
                        }
                      >
                        {active ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                      </div>
                      {i < timeline.length - 1 && (
                        <div
                          className={
                            "h-0.5 flex-1 rounded-full " +
                            (i < c.step - 1 ? "bg-lime" : "bg-border")
                          }
                        />
                      )}
                    </div>
                    <div
                      className={
                        "mt-2 text-[12px] font-semibold " +
                        (current ? "text-foreground" : "text-foreground/70")
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

          {/* Parties */}
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
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    응답 요청 2025-12-11
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium hover:bg-secondary">
              <FileText className="h-3.5 w-3.5" strokeWidth={1.75} /> 거절 사유 보기
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium hover:bg-secondary">
              <PauseCircle className="h-3.5 w-3.5" strokeWidth={1.75} /> 보류
            </button>
            <BtnSecondary className="h-9">
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} /> 다시 요청
            </BtnSecondary>
            <BtnPrimary className="h-9">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} /> AI 차순위 추천
            </BtnPrimary>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</label>
      <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
