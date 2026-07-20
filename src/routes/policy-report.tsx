import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, FileText, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BtnPrimary, Card } from "../components/ui-kit";
import {
  calculatePolicyPerformance,
  policyOptions,
  policyPeriods,
  policyRegions,
} from "../lib/policyData";

export const Route = createFileRoute("/policy-report")({
  validateSearch: (search: Record<string, unknown>) => ({
    policy: typeof search.policy === "string" && (policyOptions as readonly string[]).includes(search.policy) ? search.policy : "전체 정책",
    period: typeof search.period === "string" && (policyPeriods as readonly string[]).includes(search.period) ? search.period : "이번 분기",
    region: typeof search.region === "string" && (policyRegions as readonly string[]).includes(search.region) ? search.region : "전체",
  }),
  head: () => ({ meta: [{ title: "자원순환 정책 운영 성과 리포트 · Re:um" }] }),
  component: PolicyReport,
});

function PolicyReport() {
  const navigate = useNavigate();
  const { policy, period, region } = Route.useSearch();
  const analytics = calculatePolicyPerformance(policy, period, region);
  const update = (next: Partial<{ policy: string; period: string; region: string }>) =>
    navigate({ to: "/policy-report", search: { policy, period, region, ...next }, replace: true });

  return (
    <div className="mx-auto max-w-[960px]">
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Policy report conditions</div>
            <h2 className="mt-1 text-[16px] font-bold">정책 리포트 분석 조건</h2>
          </div>
          <button type="button" onClick={() => update({ policy: "전체 정책", period: "이번 분기", region: "전체" })} className="text-[12px] font-semibold text-foreground/70 hover:text-foreground">조건 초기화</button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FilterSelect label="정책" options={policyOptions} value={policy} onChange={(value) => update({ policy: value })} />
          <FilterSelect label="기간" options={policyPeriods} value={period} onChange={(value) => update({ period: value })} />
          <FilterSelect label="지역" options={policyRegions} value={region} onChange={(value) => update({ region: value })} />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="bg-[#1B1F23] px-10 py-10 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-lime">MOTIE · Policy Operations Report</div>
          <h1 className="mt-3 text-[28px] font-bold">자원순환 정책 운영 성과 리포트</h1>
          <p className="mt-3 text-[13px] text-white/70">{analytics.scope} 조건을 기준으로 예산·집행·참여 성과를 분석한 정책 운영 보고서입니다.</p>
          <div className="mt-6 flex flex-wrap gap-6 text-[12px]">
            <div><div className="text-white/60">정책</div><div className="mt-1 font-semibold">{policy}</div></div>
            <div><div className="text-white/60">보고 기간</div><div className="mt-1 font-semibold">{period}</div></div>
            <div><div className="text-white/60">대상 지역</div><div className="mt-1 font-semibold">{region === "전체" ? "전 지역" : region}</div></div>
          </div>
        </div>

        <div className="space-y-8 px-10 py-10">
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Executive summary</div>
            <h2 className="mt-1 text-[18px] font-bold">핵심 정책 운영 지표</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <ReportKpi label="운영 정책" value={analytics.operatingPolicies.toLocaleString()} unit="건" />
              <ReportKpi label="참여 기업" value={analytics.participants.toLocaleString()} unit="개사" />
              <ReportKpi label="집행률" value={analytics.executionRate.toFixed(1)} unit="%" />
              <ReportKpi label="예산 집행" value={analytics.budget.toLocaleString()} unit="억 원" />
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-[18px] font-bold">권역별 참여율</h2>
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer>
                <BarChart data={analytics.regionalParticipation} margin={{ top: 8, right: 12, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="region" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#1B1F23" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-[18px] font-bold">지원사업 진행 현황</h2>
            <div className="mt-4 space-y-3">
              {analytics.projects.map((project) => (
                <div key={project.name} className="rounded-xl border border-border p-4">
                  <div className="flex justify-between gap-3"><span className="font-semibold">{project.name}</span><span className="text-[12px] text-muted-foreground">{project.stage} · {project.progress}%</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-lime" style={{ width: `${project.progress}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /><h2 className="text-[18px] font-bold">AI 정책 진단</h2></div>
            <ul className="mt-4 space-y-3">{analytics.insights.map((text, index) => <li key={text} className="flex gap-3 rounded-xl bg-secondary/40 p-4 text-[13px]"><span className="num text-muted-foreground">0{index + 1}</span><span>{text}</span></li>)}</ul>
          </section>

          <div className="flex justify-center border-t border-border pt-8">
            <BtnPrimary className="h-12 px-8"><Download className="h-4 w-4" /> PDF 다운로드</BtnPrimary>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReportKpi({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <div className="rounded-xl border border-border p-4"><div className="text-[11px] text-muted-foreground">{label}</div><div className="mt-2"><span className="num text-[22px]">{value}</span> <span className="text-[11px] text-muted-foreground">{unit}</span></div></div>;
}

function FilterSelect({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <div><label className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</label><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
}
