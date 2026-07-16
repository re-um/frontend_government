import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, Sparkles, ArrowUpRight } from "lucide-react";
import { Badge, BtnPrimary, BtnSecondary, Card, PageHeader, SectionTitle } from "../components/ui-kit";
import { supportPrograms } from "../lib/mockData";

export const Route = createFileRoute("/support/")({
  head: () => ({ meta: [{ title: "추천 지원사업 및 정책 · LIUM" }] }),
  component: SupportList,
});

const statusTone: Record<string, any> = {
  접수중: "success",
  예정: "info",
  마감임박: "warning",
};

function SupportList() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Screen · 정부 지원사업"
        title="추천 지원사업 및 정책"
        description="지원사업 적합성을 분석했습니다. 컨소시엄 참여기업에게 매칭되는 정부 지원사업 목록입니다."
        actions={
          <>
            <BtnSecondary>
              <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} /> Excel 다운로드
            </BtnSecondary>
            <BtnSecondary>
              <Download className="h-4 w-4" strokeWidth={1.75} /> PDF 다운로드
            </BtnSecondary>
            <BtnPrimary>
              <FileText className="h-4 w-4" strokeWidth={1.75} /> 리포트 생성
            </BtnPrimary>
          </>
        }
      />

      <Card className="mb-6 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">지원사업명</th>
                <th className="px-5 py-3 text-left font-semibold">적합도</th>
                <th className="px-5 py-3 text-left font-semibold">마감일</th>
                <th className="px-5 py-3 text-left font-semibold">상태</th>
                <th className="px-5 py-3 text-right font-semibold">상세보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {supportPrograms.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-4">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.ministry} · {p.scale}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-lime"
                          style={{ width: p.fit + "%" }}
                        />
                      </div>
                      <span className="num text-[13px]">{p.fit}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.deadline}</td>
                  <td className="px-5 py-4">
                    <Badge tone={statusTone[p.status] ?? "neutral"}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to="/support/$id"
                      params={{ id: p.id }}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium hover:bg-secondary"
                    >
                      상세보기 <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="AI 추천 근거" />
          <ul className="space-y-3 text-[13px]">
            {[
              "산업부 자원순환 실증사업은 LIUM 추천 컨소시엄과 매칭도 94%로 최상위입니다.",
              "환경부 순환경제 클러스터는 지역 기반 참여율이 높은 지자체에서 우선 매칭됩니다.",
              "마감 30일 이내 지원사업이 총 2건으로 신속한 신청 준비가 필요합니다.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-[11px] font-bold text-lime-foreground">
                  {i + 1}
                </div>
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-[#1B1F23] text-white">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
            <Sparkles className="h-4 w-4 text-lime" strokeWidth={2} /> 정책 요약
          </div>
          <p className="text-[13px] leading-relaxed text-white/85">
            현재 접수 중인 4개 지원사업 중 3개는 산업통상자원부, 1개는 환경부 소관입니다.
            AI 매칭 결과 참여기업의 평균 적합도는 84.7점이며, 실증형 사업 비중이 62%로 높습니다.
            추천 컨소시엄 3건에 대해 지원사업 연계를 우선 검토해 주세요.
          </p>
        </Card>
      </div>
    </div>
  );
}
