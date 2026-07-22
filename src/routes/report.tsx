import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BtnPrimary, Card } from "../components/ui-kit";
import {
  calculatePerformance,
  getPeriodRange,
  performanceMaterials,
  performancePeriods,
  performanceRegions,
} from "../lib/performanceData";

export const Route = createFileRoute("/report")({
  validateSearch: (search: Record<string, unknown>) => ({
    region:
      typeof search.region === "string" &&
      (["전체", ...performanceRegions] as string[]).includes(search.region)
        ? search.region
        : "전체",
    period:
      typeof search.period === "string" &&
      (performancePeriods as readonly string[]).includes(search.period)
        ? search.period
        : "최근 6개월",
    material:
      typeof search.material === "string" &&
      (["전체", ...performanceMaterials] as string[]).includes(search.material)
        ? search.material
        : "전체",
  }),
  head: () => ({ meta: [{ title: "폐합성수지 환경성과 리포트 · Re:um" }] }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const { region, period, material } = Route.useSearch();
  const analytics = calculatePerformance(region, period, material);
  const { startMonth, endMonth } = getPeriodRange(period);
  const reportScope = `${region === "전체" ? "전 지역" : region} · ${
    material === "전체" ? "전체 폐합성수지" : material
  }`;
  const recommended = Math.max(1, Math.round(analytics.companies * 0.27));
  const approved = Math.max(1, Math.round(recommended * 0.42));
  const formatMonth = (value: string) => value.replace("-", ".");

  function updateReportSearch(next: Partial<{ region: string; period: string; material: string }>) {
    navigate({
      to: "/report",
      search: { region, period, material, ...next },
      replace: true,
    });
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Report conditions
            </div>
            <h2 className="mt-1 text-[16px] font-bold">보고서 분석 조건</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              조건을 변경하면 아래 리포트의 지표·차트·AI 진단이 즉시 다시 계산됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateReportSearch({ region: "전체", period: "최근 6개월", material: "전체" })
            }
            className="text-[12px] font-semibold text-foreground/70 hover:text-foreground"
          >
            조건 초기화
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FilterSelect
            label="지역"
            options={["전체", ...performanceRegions]}
            value={region}
            onChange={(value) => updateReportSearch({ region: value })}
          />
          <FilterSelect
            label="기간"
            options={[...performancePeriods]}
            value={period}
            onChange={(value) => updateReportSearch({ period: value })}
          />
          <FilterSelect
            label="폐합성수지 종류"
            options={["전체", ...performanceMaterials]}
            value={material}
            onChange={(value) => updateReportSearch({ material: value })}
          />
        </div>
        <div className="mt-3 rounded-lg bg-secondary/50 px-3 py-2 text-[11px] text-muted-foreground">
          현재 보고서: {reportScope} · {period}
        </div>
      </Card>

      <Card className="mb-6 overflow-hidden !p-0">
        {/* Header band */}
        <div className="bg-[#1B1F23] px-5 py-7 text-white sm:px-10 sm:py-10">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-lime">
            MOTIE · Policy Performance Report
          </div>
          <h1 className="mt-3 text-[28px] font-bold leading-tight">
            폐합성수지 탄소감축·환경성과 리포트
          </h1>
          <p className="mt-3 max-w-xl text-[13px] text-white/70">
            {reportScope} 조건을 기준으로 Re:um이 자동 생성한 {period} 정책 성과 요약입니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-[12px]">
            <div>
              <div className="text-white/60">보고 기간</div>
              <div className="num mt-1 text-white">
                {formatMonth(startMonth)} – {formatMonth(endMonth)}
              </div>
            </div>
            <div>
              <div className="text-white/60">발행일</div>
              <div className="num mt-1 text-white">2026.01.14</div>
            </div>
            <div>
              <div className="text-white/60">주관</div>
              <div className="mt-1 font-semibold text-white">산업통상자원부</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-7 sm:px-10 sm:py-10">
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Executive summary
            </div>
            <h2 className="mt-1 text-[18px] font-bold">핵심 성과 지표</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
              <ReportKpi label="참여 기업" value={analytics.companies.toLocaleString()} unit="개사" />
              <ReportKpi label="추천 컨소시엄" value={recommended.toLocaleString()} unit="건" />
              <ReportKpi label="승인 컨소시엄" value={approved.toLocaleString()} unit="건" />
              <ReportKpi label="예상 탄소감축" value={analytics.carbon.toLocaleString()} unit="tCO₂e" />
              <ReportKpi label="재활용 전환량" value={analytics.recycling.toLocaleString()} unit="톤" />
              <ReportKpi label="감축률" value={analytics.rate.toFixed(1)} unit="%" />
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  지원사업 평균 적합도
                </div>
                <div className="num mt-1 text-[22px]">84.7 / 100</div>
              </div>
              <div className="text-left text-[11px] text-muted-foreground sm:text-right">
                최고 매칭: 탄소중립 산업전환 실증 지원사업 · 94
              </div>
            </div>
          </section>

          <div className="my-8 h-px w-full bg-border" />

          <section>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Trend
            </div>
            <h2 className="mt-1 text-[18px] font-bold">분기 성과 추이</h2>
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer>
                <AreaChart data={analytics.monthly} margin={{ top: 10, right: 10, left: -10 }}>
                  <defs>
                    <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1B1F23" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#1B1F23" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                  <Area type="monotone" dataKey="감축" stroke="#1B1F23" strokeWidth={2} fill="url(#rGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="my-8 h-px w-full bg-border" />

          <section>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              AI Summary
            </div>
            <h2 className="mt-1 text-[18px] font-bold">AI 종합 진단</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-foreground/85">
              {reportScope}의 {period} 분석 결과, 예상 탄소감축량은 {analytics.carbon.toLocaleString()}
              tCO₂e이며 재활용 전환량은 {analytics.recycling.toLocaleString()}톤입니다. 분석에 포함된
              기업은 {analytics.companies.toLocaleString()}개사이고, 전기 대비 성과는
              {analytics.growth.toFixed(1)}% 증가한 것으로 나타났습니다. 선택 조건에 따른 정책–사업–기업
              간 연계 효율성이 안정적으로 개선되고 있습니다.
            </p>
            <ul className="mt-4 space-y-2 text-[13px]">
              {[
                `${region === "전체" ? "전국" : region} 참여기업의 폐합성수지 순환 성과가 전기 대비 ${analytics.growth.toFixed(1)}% 증가했습니다.`,
                `${material === "전체" ? "전체 수지 종류" : material}의 예상 감축량은 ${analytics.carbon.toLocaleString()} tCO₂e입니다.`,
                `${reportScope} 대상 신규 컨소시엄 ${recommended}건 중 ${approved}건의 우선 승인이 권고됩니다.`,
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="num text-muted-foreground">0{i + 1}</span>
                  <span className="text-foreground/85">{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="my-8 h-px w-full bg-border" />

          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <p className="text-center text-[12px] text-muted-foreground">
              폐합성수지 환경성과 리포트를 생성합니다. PDF 다운로드 후 승인 결재를 진행해 주세요.
            </p>
            <BtnPrimary className="h-12 px-8 text-[14px]">
              <Download className="h-4 w-4" strokeWidth={1.75} /> PDF 다운로드
            </BtnPrimary>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-lime-foreground" strokeWidth={2} />
              Re:um AI · Auto-generated report v2.4
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReportKpi({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5">
        <span className="num break-all text-[20px] sm:text-[22px]">{value}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{unit}</span>
      </div>
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
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none focus:border-foreground/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
