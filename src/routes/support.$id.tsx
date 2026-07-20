import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Building2, Coins, Calendar, Sparkles, Check } from "lucide-react";
import { Badge, BtnPrimary, BtnSecondary, Card, PageHeader } from "../components/ui-kit";
import { supportPrograms } from "../lib/mockData";

export const Route = createFileRoute("/support/$id")({
  head: () => ({ meta: [{ title: "지원사업 상세보기 · Re:um" }] }),
  loader: ({ params }): (typeof supportPrograms)[number] => {
    const p = supportPrograms.find((x) => x.id === params.id) ?? supportPrograms[0];
    if (!p) throw notFound();
    return p;
  },
  component: SupportDetail,
});

function SupportDetail() {
  const p: (typeof supportPrograms)[number] = Route.useLoaderData();
  const router = useRouter();
  return (
    <div className="mx-auto max-w-[1200px]">
      <button
        onClick={() => router.history.back()}
        className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> 지원사업 목록
      </button>

      <PageHeader
        eyebrow={p.ministry}
        title={p.name}
        description={p.summary}
        actions={
          <>
            <BtnSecondary>참여 조건 확인</BtnSecondary>
            <BtnPrimary>
              <Sparkles className="h-4 w-4" strokeWidth={1.75} /> 참여 조건 확인
            </BtnPrimary>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard icon={<Building2 className="h-4 w-4" strokeWidth={1.75} />} label="지원 대상" value={p.target} />
        <InfoCard icon={<Coins className="h-4 w-4" strokeWidth={1.75} />} label="지원 규모" value={p.scale} />
        <InfoCard icon={<Calendar className="h-4 w-4" strokeWidth={1.75} />} label="신청 기간" value={p.period} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
            <Sparkles className="h-4 w-4" strokeWidth={2} /> AI 추천 이유
          </div>
          <p className="text-[13px] leading-relaxed text-foreground/85">{p.reason}</p>

          <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              적합도 스코어
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="num text-[36px]">{p.fit}</span>
              <span className="text-[13px] text-muted-foreground">/ 100</span>
              <Badge tone="lime">상위 매칭</Badge>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-lime" style={{ width: p.fit + "%" }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-[13px] font-bold">참여 조건</div>
          <ul className="space-y-2.5">
            {p.conditions.map((c) => (
              <li key={c} className="flex gap-2 text-[13px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={2.5} />
                <span className="text-foreground/85">{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="mb-3 text-[13px] font-bold">참여 예상 기업</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { name: "포스코퓨처엠 광양", role: "배출기업" },
            { name: "한국순환자원", role: "중간처리" },
            { name: "삼표시멘트 삼척", role: "수요기업" },
          ].map((e) => (
            <div key={e.name} className="rounded-xl border border-border p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {e.role}
              </div>
              <div className="mt-1 text-[13px] font-semibold">{e.name}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#1B1F23] text-white">
        <div className="mb-2 flex items-center gap-2 text-[13px] font-bold">
          <Sparkles className="h-4 w-4 text-lime" strokeWidth={2} /> AI Summary
        </div>
        <p className="text-[13px] leading-relaxed text-white/85">
          본 지원사업은 컨소시엄 실증형 과제로, Re:um 추천 컨소시엄 3건과 즉시 연계 가능합니다.
          예상 인센티브 규모는 컨소시엄당 평균 12억 원이며, 신청 준비 기간은 45일 내외로 산정됩니다.
          정책 성과 리포트를 생성합니다.
        </p>
      </Card>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="num mt-2 text-[15px] text-foreground">{value}</div>
    </Card>
  );
}
