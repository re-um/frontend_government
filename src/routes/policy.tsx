import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { regionalParticipation, policyAlerts } from "../lib/mockData";

export const Route = createFileRoute("/policy")({
  head: () => ({ meta: [{ title: "자원순환 정책 운영 대시보드 · Re:um" }] }),
  component: PolicyDashboard,
});

const projects = [
  { name: "산업부 자원순환 실증사업", stage: "운영중", progress: 72 },
  { name: "탄소중립 산업전환 지원", stage: "접수중", progress: 34 },
  { name: "환경부 순환경제 클러스터", stage: "심사중", progress: 58 },
  { name: "중소·중견 감축 설비 지원", stage: "예정", progress: 8 },
];

function PolicyDashboard() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Screen · Policy Operations"
        title="자원순환 정책 운영 대시보드"
        description="정책 기간·지역별 정책 성과를 확인해 주세요. AI가 정책 인사이트를 제안합니다."
        actions={
          <BtnPrimary>
            <FileText className="h-4 w-4" strokeWidth={1.75} /> 정책 성과 리포트 생성
          </BtnPrimary>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FilterSelect
            label="정책"
            options={["전체 정책", "자원순환 실증", "탄소중립 산업전환", "순환경제 클러스터"]}
          />
          <FilterSelect
            label="기간"
            options={["이번 분기", "최근 6개월", "올해", "지난 1년"]}
          />
          <FilterSelect
            label="지역"
            options={["전체", "울산", "여수", "포항", "당진", "광양", "강원"]}
          />
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="운영 정책 수"
          value="12"
          unit="건"
          delta="+2건"
          icon={<Landmark className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
        <Kpi
          label="참여 기업"
          value="1,284"
          unit="개사"
          delta="+8.2%"
          icon={<Building2 className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="lime"
        />
        <Kpi
          label="집행률"
          value="68.4"
          unit="%"
          delta="+3.6%p"
          icon={<TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="cyan"
        />
        <Kpi
          label="예산 집행 규모"
          value="1,842"
          unit="억 원"
          delta="+14.2%"
          icon={<TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="지원사업 진행 현황" />
          <ul className="space-y-3">
            {projects.map((p) => (
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
                data={regionalParticipation}
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

        <Card className="bg-[#1B1F23] text-white">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
            <Sparkles className="h-4 w-4 text-lime" strokeWidth={2} /> AI 정책 인사이트
          </div>
          <ul className="space-y-3 text-[13px]">
            {[
              "울산 지역 참여율이 증가했습니다. 후속 실증 과제 편성이 권고됩니다.",
              "강원권 참여기업 확보가 필요합니다. 신규 매칭 캠페인이 필요합니다.",
              "신규 지원사업 연계를 추천합니다. 산업부·환경부 공동 사업 편성이 가능합니다.",
            ].map((t, i) => (
              <li key={i} className="flex gap-2 text-white/85">
                <span className="num text-lime">0{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function MapPlaceholder() {
  const dots = [
    { top: "22%", left: "48%", label: "당진", value: 72 },
    { top: "18%", left: "72%", label: "강원", value: 38 },
    { top: "44%", left: "30%", label: "인천", value: 54 },
    { top: "52%", left: "58%", label: "포항", value: 78 },
    { top: "62%", left: "72%", label: "울산", value: 92 },
    { top: "74%", left: "42%", label: "광양", value: 68 },
    { top: "80%", left: "52%", label: "여수", value: 84 },
  ];
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_30%_20%,#F5F6F8_0%,#EEF0F3_60%,#E5E7EB_100%)]">
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full opacity-40"
        aria-hidden
      >
        <path
          d="M160 40 L220 60 L260 120 L280 180 L260 240 L280 300 L220 340 L180 360 L140 320 L120 260 L100 200 L120 120 Z"
          fill="none"
          stroke="#1B1F23"
          strokeWidth="1.2"
          strokeDasharray="3 4"
        />
      </svg>
      {dots.map((d) => (
        <div
          key={d.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top: d.top, left: d.left }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 animate-ping rounded-full bg-lime opacity-40"
              style={{ animationDuration: "2.4s" }}
            />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-lime text-[10px] font-bold text-lime-foreground shadow-md">
              {d.value}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
              <MapPin className="h-3 w-3" strokeWidth={2} /> {d.label}
            </div>
          </div>
        </div>
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
