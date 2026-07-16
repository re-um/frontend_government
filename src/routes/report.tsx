import { createFileRoute } from "@tanstack/react-router";
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
import { monthlyCarbon } from "../lib/mockData";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "정책 성과 리포트 · LIUM" }] }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <div className="mx-auto max-w-[960px]">
      <Card className="mb-6 overflow-hidden p-0">
        {/* Header band */}
        <div className="bg-[#1B1F23] px-10 py-10 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-lime">
            MOTIE · Policy Performance Report
          </div>
          <h1 className="mt-3 text-[28px] font-bold leading-tight">
            산업공생 · 자원순환 정책 성과 리포트
          </h1>
          <p className="mt-3 max-w-xl text-[13px] text-white/70">
            데이터로 연결하고, AI로 순환합니다. 본 리포트는 LIUM이 자동 생성한 분기 정책 성과
            요약입니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-[12px]">
            <div>
              <div className="text-white/60">보고 기간</div>
              <div className="num mt-1 text-white">2025.09.01 – 2025.12.31</div>
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

        <div className="px-10 py-10">
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Executive summary
            </div>
            <h2 className="mt-1 text-[18px] font-bold">핵심 성과 지표</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              <ReportKpi label="참여 기업" value="1,284" unit="개사" />
              <ReportKpi label="추천 컨소시엄" value="342" unit="건" />
              <ReportKpi label="승인 컨소시엄" value="86" unit="건" />
              <ReportKpi label="예상 탄소감축" value="128,400" unit="tCO₂e" />
              <ReportKpi label="재활용 전환량" value="842K" unit="톤" />
              <ReportKpi label="평균 ROI" value="14.8" unit="%" />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  지원사업 평균 적합도
                </div>
                <div className="num mt-1 text-[22px]">84.7 / 100</div>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
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
                <AreaChart data={monthlyCarbon} margin={{ top: 10, right: 10, left: -10 }}>
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
              본 보고 기간 동안 산업공생 컨소시엄 승인 건수는 전 분기 대비 22.1% 증가하였으며,
              예상 탄소감축량은 목표 대비 108%를 달성하였습니다. 울산·여수·포항 3대 국가산단이
              전체 감축량의 62%를 견인하였고, 강원권은 목표 대비 71% 수준으로 추가 매칭이 필요합니다.
              평균 지원사업 적합도는 84.7점으로 정책–사업–기업 간 연계 효율성이 개선되고 있음을 확인하였습니다.
            </p>
            <ul className="mt-4 space-y-2 text-[13px]">
              {[
                "울산·여수 국가산단 참여율이 전분기 대비 각각 12.4%p, 9.6%p 증가하였습니다.",
                "포스코-삼표 슬래그 순환 컨소시엄이 최대 감축량(16,200 tCO₂e)을 기록하였습니다.",
                "강원권 배출기업 대상 신규 매칭 캠페인 실행이 권고됩니다.",
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
              정책 성과 리포트를 생성합니다. PDF 다운로드 후 승인 결재를 진행해 주세요.
            </p>
            <BtnPrimary className="h-12 px-8 text-[14px]">
              <Download className="h-4 w-4" strokeWidth={1.75} /> PDF 다운로드
            </BtnPrimary>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-lime-foreground" strokeWidth={2} />
              LIUM AI · Auto-generated report v2.4
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReportKpi({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="num text-[22px]">{value}</span>
        <span className="text-[11px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
