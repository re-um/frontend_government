import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Sparkles,
  TrendingUp,
  Truck,
  Cog,
  Coins,
  Leaf,
  Recycle,
  Trash2,
} from "lucide-react";
import { Badge, BtnPrimary, BtnSecondary, Card, PageHeader } from "../components/ui-kit";
import { consortiums } from "../lib/mockData";

export const Route = createFileRoute("/consortium/$id")({
  head: () => ({ meta: [{ title: "컨소시엄 상세보기 · LIUM" }] }),
  loader: ({ params }): (typeof consortiums)[number] => {
    const c = consortiums.find((x) => x.id === params.id) ?? consortiums[0];
    if (!c) throw notFound();
    return c;
  },
  component: ConsortiumDetail,
});

const statusMap: Record<string, { tone: any; label: string }> = {
  recommended: { tone: "lime", label: "추천" },
  review: { tone: "info", label: "검토중" },
  approved: { tone: "success", label: "승인" },
  waiting: { tone: "warning", label: "대기" },
  rejected: { tone: "danger", label: "거절" },
};

function ConsortiumDetail() {
  const c = Route.useLoaderData();
  const router = useRouter();
  const s = statusMap[c.status];

  return (
    <div className="mx-auto max-w-[1400px]">
      <button
        onClick={() => router.history.back()}
        className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> 컨소시엄 목록
      </button>

      <PageHeader
        eyebrow={c.id}
        title={`${c.emitter.name} × ${c.demander.name}`}
        description="추천 가능한 산업공생 컨소시엄을 찾았습니다. AI 분석 근거와 예상 성과를 확인해 주세요."
        actions={
          <>
            <BtnSecondary>추천 보류</BtnSecondary>
            <BtnPrimary>
              <Sparkles className="h-4 w-4" strokeWidth={1.75} /> 기업에게 추천 전달
            </BtnPrimary>
          </>
        }
      />

      {/* Top card */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              기업 정보
            </div>
            <div className="mt-3 space-y-3">
              <PartyRow role="배출기업" name={c.emitter.name} region={c.emitter.region} />
              <PartyRow role="중간처리" name={c.processor.name} region={c.processor.region} />
              <PartyRow role="수요기업" name={c.demander.name} region={c.demander.region} />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              AI 추천 점수
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="num text-[42px] leading-none">{c.aiScore}</span>
              <span className="text-[13px] text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-lime" style={{ width: c.aiScore + "%" }} />
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              AI 매칭 모델 상위 5% 신뢰도 구간
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              현재 상태
            </div>
            <div className="mt-3">
              <Badge tone={s.tone}>{s.label}</Badge>
            </div>
            <div className="mt-3 text-[12px] text-muted-foreground">
              폐기물 <span className="font-medium text-foreground">{c.emitter.waste}</span>
            </div>
            <div className="mt-1 text-[12px] text-muted-foreground">
              마지막 업데이트 <span className="font-medium text-foreground">2026-01-14</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Two column */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 text-[13px] font-bold">컨소시엄 구성 정보</div>
          <div className="space-y-4">
            <FlowRow index={1} party="배출기업" name={c.emitter.name} sub={c.emitter.waste} />
            <FlowRow index={2} party="중간처리기업" name={c.processor.name} sub="재처리 · 정제" />
            <FlowRow index={3} party="수요기업" name={c.demander.name} sub="재활용 원료 수요" />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2 text-[13px] font-bold">
            <Sparkles className="h-4 w-4 text-lime-foreground" strokeWidth={2} />
            AI 추천 근거
          </div>
          <ul className="space-y-3">
            {c.rationale.map((r, i) => (
              <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-[11px] font-bold text-lime-foreground">
                  {i + 1}
                </div>
                <span className="text-foreground/85">{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Analysis */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2 text-[13px] font-bold">
            <TrendingUp className="h-4 w-4" strokeWidth={2} /> 경제성 분석
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Coins className="h-4 w-4" strokeWidth={1.75} />} label="Expected ROI" value={c.expectedRoi} />
            <Stat icon={<Truck className="h-4 w-4" strokeWidth={1.75} />} label="운송비 절감" value="₩ 4.2억" />
            <Stat icon={<Cog className="h-4 w-4" strokeWidth={1.75} />} label="처리비용 절감" value="₩ 2.8억" />
            <Stat icon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />} label="예상 수익" value="₩ 12.6억" />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2 text-[13px] font-bold">
            <Leaf className="h-4 w-4" strokeWidth={2} /> 환경성과 분석
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Stat icon={<Leaf className="h-4 w-4" strokeWidth={1.75} />} label="탄소감축" value={c.carbonReduction} />
            <Stat icon={<Recycle className="h-4 w-4" strokeWidth={1.75} />} label="재활용 전환량" value={c.recycling} />
            <Stat icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />} label="매립 감소" value="24,600 t" />
          </div>
        </Card>
      </div>

      {/* Policy fit + AI opinion */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 text-[13px] font-bold">정책 적합성</div>
          <ul className="space-y-3">
            {c.policy.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={
                      "grid h-6 w-6 place-items-center rounded-md " +
                      (p.matched ? "bg-lime text-lime-foreground" : "bg-secondary text-muted-foreground")
                    }
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] font-medium">{p.name}</span>
                </div>
                <Badge tone={p.matched ? "success" : "neutral"}>
                  {p.matched ? "적합" : "미확인"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-[#1B1F23] text-white">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
            <Sparkles className="h-4 w-4 text-lime" strokeWidth={2} /> AI 종합 의견
          </div>
          <p className="text-[13px] leading-relaxed text-white/85">
            본 컨소시엄은 물류 반경, 기술 적합성, 정책 적합성 세 축에서 모두 상위 10% 구간에 위치합니다.
            AI 분석이 완료되었습니다. 배출–중간처리–수요 3자 간 폐자원 흐름의 안정성이 확인되었으며,
            산업통상자원부 자원순환 실증사업과의 연계 시 추가 인센티브 확보가 가능합니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/support"
              className="inline-flex h-9 items-center rounded-md bg-lime px-3 text-[12px] font-semibold text-lime-foreground hover:brightness-95"
            >
              연계 지원사업 보기
            </Link>
            <button className="inline-flex h-9 items-center rounded-md border border-white/20 bg-white/5 px-3 text-[12px] font-medium text-white hover:bg-white/10">
              분석 리포트 다운로드
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PartyRow({ role, name, region }: { role: string; name: string; region: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {role}
      </div>
      <div className="mt-0.5 text-[14px] font-semibold">{name}</div>
      <div className="text-[11px] text-muted-foreground">{region}</div>
    </div>
  );
}

function FlowRow({
  index,
  party,
  name,
  sub,
}: {
  index: number;
  party: string;
  name: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#1B1F23] text-[11px] font-bold text-lime">
        {String(index).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {party}
        </div>
        <div className="truncate text-[14px] font-semibold">{name}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="num mt-1.5 text-[18px]">{value}</div>
    </div>
  );
}
