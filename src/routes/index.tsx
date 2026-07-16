import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Factory,
  Layers,
  CheckCircle2,
  Leaf,
  Recycle,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  BtnPrimary,
  BtnSecondary,
  Badge,
  Card,
  Kpi,
  PageHeader,
  SectionTitle,
} from "../components/ui-kit";
import { consortiums, monthlyCarbon, supportPrograms } from "../lib/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · LIUM" },
      {
        name: "description",
        content: "LIUM AI 산업공생 플랫폼 통합 대시보드 — KPI, 컨소시엄 추천, 지원사업 요약.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const accepted = 128;
  const waiting = 42;
  const rejected = 11;
  const total = accepted + waiting + rejected;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="MOTIE · Industrial Symbiosis"
        title="통합 대시보드"
        description="AI가 최적의 협력기업 조합을 추천했습니다. 최근 30일 동안의 참여, 승인, 성과 지표를 확인해 주세요."
        actions={
          <>
            <BtnSecondary>
              <FileText className="h-4 w-4" strokeWidth={1.75} />
              데이터 내보내기
            </BtnSecondary>
            <BtnPrimary>
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              리포트 생성
            </BtnPrimary>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          label="참여 기업"
          value="1,284"
          unit="개사"
          delta="+8.2%"
          icon={<Factory className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
        <Kpi
          label="추천 컨소시엄"
          value="342"
          unit="건"
          delta="+12.4%"
          icon={<Layers className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="cyan"
        />
        <Kpi
          label="승인 컨소시엄"
          value="86"
          unit="건"
          delta="+5.1%"
          icon={<CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="lime"
        />
        <Kpi
          label="예상 탄소감축"
          value="128,400"
          unit="tCO₂e"
          delta="+14.6%"
          icon={<Leaf className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
        <Kpi
          label="재활용 전환량"
          value="842K"
          unit="톤"
          delta="+9.3%"
          icon={<Recycle className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
      </div>

      {/* AI Recommendation */}
      <div className="mt-8">
        <SectionTitle
          title="AI 추천 산업공생 컨소시엄 · Top 5"
          description="AI가 최적의 협력기업 조합을 추천했습니다."
          action={
            <Link
              to="/consortium"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground hover:opacity-70"
            >
              전체 보기 <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {consortiums.slice(0, 5).map((c) => (
            <Card key={c.id} className="group cursor-pointer hover:shadow-[var(--shadow-hover)]">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-muted-foreground">{c.id}</div>
                <StatusBadge status={c.status} />
              </div>

              <div className="mt-4 space-y-2.5">
                <PartyRow role="배출기업" name={c.emitter.name} region={c.emitter.region} />
                <PartyRow role="중간처리" name={c.processor.name} region={c.processor.region} />
                <PartyRow role="수요기업" name={c.demander.name} region={c.demander.region} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-border bg-secondary/40 p-3">
                <Metric label="AI Score" value={String(c.aiScore)} />
                <Metric label="Expected ROI" value={c.expectedRoi} />
                <Metric label="탄소감축" value={c.carbonReduction} small />
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground">
                  폐기물: <span className="font-medium text-foreground">{c.emitter.waste}</span>
                </div>
                <Link
                  to="/consortium/$id"
                  params={{ id: c.id }}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground hover:opacity-70"
                >
                  상세보기 <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Participation + Support */}
      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle
            title="기업 참여 현황"
            description="AI 추천 이후 기업 응답 상태입니다."
          />
          <div className="space-y-4">
            <ParticipationBar label="수락" value={accepted} total={total} tone="lime" />
            <ParticipationBar label="검토중" value={waiting} total={total} tone="warning" />
            <ParticipationBar label="거절" value={rejected} total={total} tone="danger" />
          </div>
          <div className="mt-6 border-t border-border pt-4 text-[11px] text-muted-foreground">
            기업 응답을 기다리는 중입니다. 평균 응답 시간 3.4일.
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <SectionTitle
            title="추천 지원사업"
            description="지원사업 적합성을 분석했습니다."
            action={
              <Link
                to="/support"
                className="inline-flex items-center gap-1 text-[12px] font-semibold hover:opacity-70"
              >
                전체 보기 <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            }
          />
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-[13px]">
              <thead className="bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">지원사업명</th>
                  <th className="px-4 py-3 text-left font-semibold">적합도</th>
                  <th className="px-4 py-3 text-left font-semibold">마감일</th>
                  <th className="px-4 py-3 text-right font-semibold">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {supportPrograms.slice(0, 4).map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.ministry}</div>
                    </td>
                    <td className="px-4 py-3">
                      <FitScore value={p.fit} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.deadline}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/support/$id"
                        params={{ id: p.id }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium hover:bg-secondary"
                      >
                        리포트 보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Carbon summary chart */}
      <div className="mt-8">
        <Card>
          <SectionTitle
            title="탄소감축 요약"
            description="최근 8개월 예상 탄소감축량 및 재활용 전환량 추이."
            action={
              <Link
                to="/carbon"
                className="inline-flex items-center gap-1 text-[12px] font-semibold hover:opacity-70"
              >
                상세 분석 <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            }
          />
          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <AreaChart data={monthlyCarbon} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A3E635" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#A3E635" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="감축"
                  stroke="#1B1F23"
                  strokeWidth={2}
                  fill="url(#gLime)"
                />
                <Area
                  type="monotone"
                  dataKey="재활용"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  fill="url(#gCyan)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <div className="mt-8">
        <Card className="flex flex-wrap items-center justify-between gap-4 bg-[#1B1F23] text-white">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-lime">
              Policy report
            </div>
            <div className="mt-1 text-lg font-bold">정책 성과 리포트를 생성합니다.</div>
            <div className="mt-1 text-[12px] text-white/60">
              AI가 최근 분기 데이터를 종합하여 리포트를 자동 생성합니다.
            </div>
          </div>
          <Link
            to="/report"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-lime px-5 text-[13px] font-semibold text-lime-foreground hover:brightness-95"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} /> 리포트 생성
          </Link>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: any; label: string }> = {
    recommended: { tone: "lime", label: "추천" },
    review: { tone: "info", label: "검토중" },
    approved: { tone: "success", label: "승인" },
    waiting: { tone: "warning", label: "대기" },
    rejected: { tone: "danger", label: "거절" },
  };
  const m = map[status] ?? map.recommended;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

function PartyRow({ role, name, region }: { role: string; name: string; region: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {role}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold">{name}</div>
        <div className="truncate text-[11px] text-muted-foreground">{region}</div>
      </div>
    </div>
  );
}

function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={"num mt-1 " + (small ? "text-[13px]" : "text-[16px]")}>{value}</div>
    </div>
  );
}

function ParticipationBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "lime" | "warning" | "danger";
}) {
  const pct = Math.round((value / total) * 100);
  const bar =
    tone === "lime" ? "bg-lime" : tone === "warning" ? "bg-[#F59E0B]" : "bg-[#EF4444]";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12px]">
        <span className="font-medium">{label}</span>
        <span className="num text-muted-foreground">
          <span className="text-foreground">{value}</span> · {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={"h-full rounded-full " + bar} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

function FitScore({ value }: { value: number }) {
  const tone = value >= 90 ? "lime" : value >= 80 ? "info" : "warning";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
        <div
          className={
            "h-full rounded-full " +
            (tone === "lime" ? "bg-lime" : tone === "info" ? "bg-[#22D3EE]" : "bg-[#F59E0B]")
          }
          style={{ width: value + "%" }}
        />
      </div>
      <span className="num text-[12px]">{value}</span>
    </div>
  );
}
