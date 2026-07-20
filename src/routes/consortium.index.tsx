import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Search, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Badge, BtnSecondary, Card, PageHeader } from "../components/ui-kit";
import { consortiums } from "../lib/mockData";

export const Route = createFileRoute("/consortium/")({
  head: () => ({
    meta: [{ title: "산업공생 컨소시엄 후보 추천 · Re:um" }],
  }),
  component: ConsortiumList,
});

const statusMap: Record<string, { tone: any; label: string }> = {
  recommended: { tone: "lime", label: "추천" },
  review: { tone: "info", label: "검토중" },
  approved: { tone: "success", label: "승인" },
  waiting: { tone: "warning", label: "대기" },
  rejected: { tone: "danger", label: "거절" },
};

function ConsortiumList() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Screen · 산업공생 매칭"
        title="산업공생 컨소시엄 후보 추천"
        description="AI가 배출–중간처리–수요 3자 매칭을 분석해 추천한 컨소시엄 후보 목록입니다."
        actions={
          <>
            <BtnSecondary>
              <Filter className="h-4 w-4" strokeWidth={1.75} />
              고급 필터
            </BtnSecondary>
          </>
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <FilterSelect label="지역" options={["전체", "울산", "여수", "포항", "당진", "광양"]} />
          <FilterSelect
            label="폐합성수지 종류"
            options={["전체", "HDPE", "PP", "LDPE", "PET", "ABS"]}
          />
          <FilterSelect label="AI 점수" options={["전체", "90 이상", "80 이상", "70 이상"]} />
          <FilterSelect
            label="상태"
            options={["전체", "추천", "검토중", "승인", "대기", "거절"]}
          />
          <div className="relative">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">
              검색
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-[calc(50%+5px)] h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              placeholder="기업명 또는 컨소시엄 ID"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-foreground/30"
            />
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">ID</th>
                <th className="px-5 py-3 text-left font-semibold">배출기업</th>
                <th className="px-5 py-3 text-left font-semibold">중간처리기업</th>
                <th className="px-5 py-3 text-left font-semibold">수요기업</th>
                <th className="px-5 py-3 text-left font-semibold">AI 추천점수</th>
                <th className="px-5 py-3 text-left font-semibold">상태</th>
                <th className="px-5 py-3 text-right font-semibold">상세보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {consortiums.map((c) => {
                const s = statusMap[c.status];
                return (
                  <tr key={c.id} className="hover:bg-secondary/40">
                    <td className="px-5 py-4">
                      <div className="font-mono text-[11px] font-semibold">{c.id}</div>
                      <div className="text-[10px] text-muted-foreground">{c.emitter.waste}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Party name={c.emitter.name} region={c.emitter.region} />
                    </td>
                    <td className="px-5 py-4">
                      <Party name={c.processor.name} region={c.processor.region} />
                    </td>
                    <td className="px-5 py-4">
                      <Party name={c.demander.name} region={c.demander.region} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-lime"
                            style={{ width: c.aiScore + "%" }}
                          />
                        </div>
                        <span className="num text-[13px]">{c.aiScore}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to="/consortium/$id"
                        params={{ id: c.id }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium hover:bg-secondary"
                      >
                        상세보기 <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
          <div>총 342건 중 1–5 표시</div>
          <div className="flex items-center gap-1">
            <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card hover:bg-secondary">
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={
                  "h-8 min-w-8 rounded-md px-2 text-[12px] font-semibold " +
                  (n === 1
                    ? "bg-foreground text-white"
                    : "border border-border bg-card text-foreground hover:bg-secondary")
                }
              >
                {n}
              </button>
            ))}
            <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card hover:bg-secondary">
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</label>
      <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none focus:border-foreground/30">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Party({ name, region }: { name: string; region: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-semibold">{name}</div>
      <div className="truncate text-[11px] text-muted-foreground">{region}</div>
    </div>
  );
}
