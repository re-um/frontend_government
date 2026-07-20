import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, Leaf, Recycle, TrendingDown, Building2, Info } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BtnPrimary, BtnSecondary, Card, Kpi, PageHeader, SectionTitle } from "../components/ui-kit";
import { monthlyCarbon, wasteMix } from "../lib/mockData";

export const Route = createFileRoute("/carbon")({
  head: () => ({ meta: [{ title: "탄소감축 / 환경성과 분석 · Re:um" }] }),
  component: CarbonPage,
});

const pieColors = ["#1B1F23", "#A3E635", "#22D3EE", "#F59E0B", "#94A3B8"];

function CarbonPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Screen · 환경성과"
        title="탄소감축 / 환경성과 분석"
        description="AI 분석이 완료되었습니다. 지역·기간·폐기물별 감축 성과를 확인해 주세요."
        actions={
          <>
            <BtnSecondary>
              <Download className="h-4 w-4" strokeWidth={1.75} /> PDF 다운로드
            </BtnSecondary>
            <BtnPrimary>
              <FileText className="h-4 w-4" strokeWidth={1.75} /> 보고서 생성
            </BtnPrimary>
          </>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FilterSelect
            label="지역"
            options={["전체", "울산", "여수", "포항", "당진", "광양", "강원"]}
          />
          <FilterSelect
            label="기간"
            options={["최근 6개월", "올해", "지난 1년", "지난 2년"]}
          />
          <FilterSelect
            label="폐기물 종류"
            options={["전체", "슬래그", "폐플라스틱", "폐용매", "촉매"]}
          />
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="예상 탄소감축"
          value="128,400"
          unit="tCO₂e"
          delta="+14.6%"
          icon={<Leaf className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="lime"
        />
        <Kpi
          label="재활용 전환량"
          value="842K"
          unit="톤"
          delta="+9.3%"
          icon={<Recycle className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
        <Kpi
          label="감축률"
          value="24.8"
          unit="%"
          delta="+2.1%p"
          icon={<TrendingDown className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          tone="cyan"
        />
        <Kpi
          label="분석 기업 수"
          value="1,284"
          unit="개사"
          delta="+8.2%"
          icon={<Building2 className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="월별 탄소감축량" description="tCO₂e" />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={monthlyCarbon} margin={{ top: 10, right: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Bar dataKey="감축" fill="#1B1F23" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="재활용 전환량 추이" description="톤" />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <LineChart data={monthlyCarbon} margin={{ top: 10, right: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Line type="monotone" dataKey="재활용" stroke="#22D3EE" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle title="폐기물 유형별 비중" />
          <div className="h-[240px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={wasteMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {wasteMix.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-bold tracking-tight">폐기물 흐름 다이어그램</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">배출 → 중간처리 → 수요</p>
            </div>
            <FlowInfo />
          </div>
          <FlowDiagram />
        </Card>
      </div>

      <Card>
        <SectionTitle title="환경성과 요약" description="AI가 분석한 주요 성과 지표입니다." />
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            "포스코-삼표 슬래그 순환 컨소시엄이 전체 감축량의 12.4%를 기여했습니다.",
            "울산권 폐용매 재생 클러스터는 전년 대비 재활용 전환량이 32% 증가했습니다.",
            "강원권 참여 기업 수는 목표 대비 71% 수준으로 확보가 필요합니다.",
            "정책 성과 리포트 자동 생성에 필요한 데이터 완전성은 96%입니다.",
          ].map((t, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-[13px]"
            >
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime text-[11px] font-bold text-lime-foreground">
                {i + 1}
              </div>
              <span className="text-foreground/85">{t}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function FlowDiagram() {
  const stages = [
    { title: "배출기업", value: "128", unit: "개사", color: "bg-[#1B1F23] text-lime" },
    { title: "중간처리", value: "42", unit: "개사", color: "bg-cyan text-[#0E3B44]" },
    { title: "수요기업", value: "96", unit: "개사", color: "bg-lime text-lime-foreground" },
  ];
  return (
    <div className="mt-4 flex h-[200px] items-center justify-between gap-3">
      {stages.map((s, i) => (
        <div key={s.title} className="flex flex-1 items-center gap-3">
          <div className="flex flex-1 flex-col items-center rounded-2xl border border-border bg-card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {s.title}
            </div>
            <div
              className={"mt-3 grid h-14 w-14 place-items-center rounded-2xl " + s.color}
            >
              <span className="num text-[16px]">{s.value}</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">{s.unit}</div>
          </div>
          {i < stages.length - 1 && (
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="text-[10px] font-semibold">flow</div>
              <div className="mt-1 h-0.5 w-10 bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FlowInfo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary"
        aria-label="다이어그램 설명"
      >
        <Info className="h-4 w-4" strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-20 w-[300px] rounded-xl border border-border bg-card p-4 text-left shadow-lg">
          <div className="text-[12px] font-bold">다이어그램 설명</div>
          <p className="mt-2 text-[12px] leading-relaxed text-foreground/80">
            산업공생 프로세스는 <span className="font-semibold">배출기업</span>에서 발생한 폐자원이
            <span className="font-semibold"> 중간처리기업</span>을 거쳐 <span className="font-semibold">수요기업</span>의
            원료로 재투입되는 3단계 순환 구조입니다.
          </p>
          <ul className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
            <li>• 노드 숫자는 각 단계 참여기업 수를 의미합니다.</li>
            <li>• 화살표는 실제 물류 흐름 방향을 나타냅니다.</li>
            <li>• 색상은 각 단계 역할(배출/처리/수요)을 구분합니다.</li>
          </ul>
        </div>
      )}
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
