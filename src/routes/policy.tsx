import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Sparkles, MapPin, TrendingUp, Building2, Landmark, BellRing, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Badge, BtnPrimary, Card, Kpi, PageHeader, SectionTitle } from "../components/ui-kit";
import { policyAlerts } from "../lib/mockData";
import { calculatePolicyPerformance, policyOptions, policyPeriods, policyRegions } from "../lib/policyData";

export const Route = createFileRoute("/policy")({
  head: () => ({ meta: [{ title: "자원순환 정책 운영 대시보드 · Re:um" }] }),
  component: PolicyDashboard,
});

function PolicyDashboard() {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState("전체 정책");
  const [period, setPeriod] = useState("이번 분기");
  const [region, setRegion] = useState("전체");
  const analytics = useMemo(
    () => calculatePolicyPerformance(policy, period, region),
    [policy, period, region],
  );
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Screen · Policy Operations"
        title="자원순환 정책 운영 대시보드"
        description="정책 기간·지역별 정책 성과를 확인해 주세요. AI가 정책 인사이트를 제안합니다."
        actions={
          <BtnPrimary
            onClick={() => navigate({ to: "/policy-report", search: { policy, period, region } })}
          >
            <FileText className="h-4 w-4" strokeWidth={1.75} /> 정책 운영 리포트 생성
          </BtnPrimary>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FilterSelect
            label="정책"
            options={[...policyOptions]}
            value={policy}
            onChange={setPolicy}
          />
          <FilterSelect
            label="기간"
            options={[...policyPeriods]}
            value={period}
            onChange={setPeriod}
          />
          <FilterSelect
            label="지역"
            options={[...policyRegions]}
            value={region}
            onChange={setRegion}
          />
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="운영 정책 수"
          value={analytics.operatingPolicies.toLocaleString()}
          unit="건"
          delta="+2건"
          icon={<Landmark className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
        <Kpi
          label="참여 기업"
          value={analytics.participants.toLocaleString()}
          unit="개사"
          delta="+8.2%"
          icon={<Building2 className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="lime"
        />
        <Kpi
          label="집행률"
          value={analytics.executionRate.toFixed(1)}
          unit="%"
          delta="+3.6%p"
          icon={<TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="cyan"
        />
        <Kpi
          label="예산 집행 규모"
          value={analytics.budget.toLocaleString()}
          unit="억 원"
          delta="+14.2%"
          icon={<TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="지원사업 진행 현황" />
          <ul className="space-y-3">
            {analytics.projects.map((p) => (
              <li key={p.name} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">{p.name}</div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">
                    {p.stage}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-lime"
                      style={{ width: p.progress + "%" }}
                    />
                  </div>
                  <span className="num w-10 text-right text-[12px]">{p.progress}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle title="권역별 참여율" description="주요 산업단지" />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart
                data={analytics.regionalParticipation}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="region"
                  type="category"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Bar dataKey="value" fill="#1B1F23" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI 정책 알림 */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-lime text-lime-foreground">
              <BellRing className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[14px] font-bold">AI 정책 알림</div>
              <div className="text-[11px] text-muted-foreground">이상 신호와 이행 이슈를 실시간으로 감지합니다.</div>
            </div>
          </div>
          <Badge tone="lime">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} /> Live
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {policyAlerts.map((a) => {
            const iconMap = { danger: AlertTriangle, warning: AlertTriangle, success: CheckCircle2 } as const;
            const cls =
              a.tone === "danger"
                ? "border-[#FCA5A5] bg-[#FEF2F2]"
                : a.tone === "warning"
                  ? "border-[#FCD34D] bg-[#FEFCE8]"
                  : "border-[#86EFAC] bg-[#F0FDF4]";
            const Icon = iconMap[a.tone];
            return (
              <div key={a.title} className={"rounded-xl border p-4 " + cls}>
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  <span className="text-[10px] font-semibold text-muted-foreground">{a.at}</span>
                </div>
                <div className="mt-2 text-[13px] font-bold">{a.title}</div>
                <div className="mt-1 text-[12px] leading-relaxed text-foreground/80">{a.message}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="지역 참여 현황" description="지도에서 지역을 호버해 상세 참여율을 확인하세요." />
          <KoreaMap />
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
            <Sparkles className="h-4 w-4 text-[#65A30D]" strokeWidth={2} /> AI 정책 인사이트
          </div>
          <ul className="space-y-3 text-[13px]">
            {analytics.insights.map((t, i) => (
              <li key={i} className="flex gap-2 text-foreground/85">
                <span className="num text-[#65A30D]">0{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function KoreaMap() {
  const regions = [
    { top: "22%", left: "48%", label: "당진", value: 72 },
    { top: "18%", left: "72%", label: "강원", value: 38 },
    { top: "44%", left: "30%", label: "인천", value: 54 },
    { top: "52%", left: "58%", label: "포항", value: 78 },
    { top: "62%", left: "72%", label: "울산", value: 92 },
    { top: "74%", left: "42%", label: "광양", value: 68 },
    { top: "80%", left: "52%", label: "여수", value: 84 },
  ];
  const [hovered, setHovered] = useState<string | null>(null);
  // Color intensity by value: green → red gradient bucketed.
  function toneFor(v: number) {
    if (v >= 85) return { bg: "#A3E635", fg: "#1B1F23", ring: "rgba(163,230,53,0.35)" };
    if (v >= 70) return { bg: "#4ADE80", fg: "#052E16", ring: "rgba(74,222,128,0.30)" };
    if (v >= 55) return { bg: "#FDE047", fg: "#713F12", ring: "rgba(253,224,71,0.30)" };
    return { bg: "#F87171", fg: "#7F1D1D", ring: "rgba(248,113,113,0.30)" };
  }
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_30%_20%,#F5F6F8_0%,#EEF0F3_60%,#E5E7EB_100%)]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <path
          d="M160 40 L220 60 L260 120 L280 180 L260 240 L280 300 L220 340 L180 360 L140 320 L120 260 L100 200 L120 120 Z"
          fill="none"
          stroke="#1B1F23"
          strokeWidth="1.2"
          strokeDasharray="3 4"
        />
      </svg>
      {/* Legend */}
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-[10px] font-semibold shadow-sm backdrop-blur">
        <span className="text-muted-foreground">참여율</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#F87171" }} />낮음</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#FDE047" }} />중간</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#4ADE80" }} />높음</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#A3E635" }} />최상</span>
      </div>

      {regions.map((d) => {
        const t = toneFor(d.value);
        const active = hovered === d.label;
        return (
          <div
            key={d.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform"
            style={{ top: d.top, left: d.left, transform: `translate(-50%,-50%) scale(${active ? 1.1 : 1})` }}
            onMouseEnter={() => setHovered(d.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="relative cursor-pointer">
              <div
                className="absolute inset-0 -z-10 animate-ping rounded-full opacity-40"
                style={{ background: t.ring, animationDuration: "2.4s" }}
              />
              <div
                className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold shadow-md ring-2 ring-white"
                style={{ background: t.bg, color: t.fg }}
              >
                {d.value}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                <MapPin className="h-3 w-3" strokeWidth={2} /> {d.label}
              </div>

              {active && (
                <div className="absolute left-1/2 top-[calc(100%+18px)] z-10 w-[180px] -translate-x-1/2 rounded-xl border border-border bg-card p-3 text-left shadow-lg">
                  <div className="text-[11px] font-semibold text-muted-foreground">{d.label} 산업단지</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="num text-[20px]">{d.value}</span>
                    <span className="text-[11px] text-muted-foreground">/ 100 참여율</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: d.value + "%", background: t.bg }} />
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    참여기업 {Math.round(d.value * 3.2)}개사 · 전월 대비 +{(d.value / 12).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FilterSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
