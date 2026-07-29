import { useState } from "react";
import { Building2, Link2Off, Network, Users, X } from "lucide-react";
import type { RegionalNetworkSummary } from "../types/regionalNetwork";

type DetailAction = "companies" | "consortiums" | "unconnected";
type RegionalCompanyItem = {
  id: string;
  name: string;
  industry: string;
  type: "배출기업" | "중간처리기업" | "수요기업";
  status: "참여기업" | "연계 필요";
};

type RegionalConsortiumItem = {
  id: string;
  name: string;
  industry: string;
  companyCount: number;
  status: "운영 중" | "구성 중";
};

export function RegionalNetworkDetail({
  region,
  onClose,
}: {
  region: RegionalNetworkSummary;
  onClose: () => void;
}) {
  const [activeAction, setActiveAction] = useState<DetailAction | null>(null);
  const companies = buildRegionalCompanies(region);
  const consortiums = buildRegionalConsortiums(region);
  const visibleCompanies =
    activeAction === "unconnected"
      ? companies.filter((company) => company.status === "연계 필요")
      : companies;

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-emerald-600">지역 네트워크 상세</div>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            {region.regionName} 산업 네트워크
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          aria-label="지역 상세 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
        <DetailRow label="전체 기업" value={`${region.totalCompanies}개`} />
        <DetailRow label="참여기업" value={`${region.participatingCompanies}개`} />
        <DetailRow label="컨소시엄" value={`${region.consortiumCount}개`} />
        <DetailRow label="연계 필요 기업" value={`${region.unconnectedCompanies}개`} accent />
        <DetailRow label="진행 중 매칭" value={`${region.activeMatches}건`} />
        <DetailRow label="완료 거래" value={`${region.completedTransactions}건`} />
      </div>

      <h3 className="mb-2 text-xs font-semibold text-slate-600">산업 분야별 현황</h3>
      <div className="mb-5 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-68 text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-semibold">산업 분야</th>
              <th className="px-2 py-2 text-right font-semibold">기업</th>
              <th className="px-2 py-2 text-right font-semibold">컨소시엄</th>
              <th className="px-3 py-2 text-right font-semibold">연계 필요</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {region.industries.map((industry) => (
              <tr key={industry.name}>
                <td className="px-3 py-2 font-medium text-slate-800">{industry.name}</td>
                <td className="px-2 py-2 text-right">{industry.companyCount}</td>
                <td className="px-2 py-2 text-right">{industry.consortiumCount}</td>
                <td className="px-3 py-2 text-right font-semibold text-orange-600">
                  {industry.unconnectedCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2">
        <ActionButton
          active={activeAction === "companies"}
          onClick={() => setActiveAction("companies")}
          icon={<Building2 className="h-4 w-4" />}
        >
          지역 기업 보기
        </ActionButton>
        <ActionButton
          active={activeAction === "consortiums"}
          onClick={() => setActiveAction("consortiums")}
          icon={<Network className="h-4 w-4" />}
        >
          컨소시엄 보기
        </ActionButton>
        <ActionButton
          active={activeAction === "unconnected"}
          onClick={() => setActiveAction("unconnected")}
          icon={<Link2Off className="h-4 w-4" />}
        >
          연계 필요 기업 보기
        </ActionButton>
      </div>

      {activeAction && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5">
            <div>
              <div className="text-xs font-bold text-slate-900">
                {activeAction === "companies"
                  ? "지역 기업 목록"
                  : activeAction === "consortiums"
                    ? "운영 컨소시엄 목록"
                    : "연계 필요 기업 목록"}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                {region.regionName} ·{" "}
                {activeAction === "consortiums"
                  ? `${consortiums.length}개`
                  : `${visibleCompanies.length}개`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveAction(null)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              aria-label="목록 닫기"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-72 divide-y divide-slate-200 overflow-y-auto">
            {activeAction === "consortiums"
              ? consortiums.map((consortium) => (
                  <ConsortiumListItem key={consortium.id} consortium={consortium} />
                ))
              : visibleCompanies.map((company) => (
                  <CompanyListItem key={company.id} company={company} />
                ))}
            {((activeAction === "consortiums" && consortiums.length === 0) ||
              (activeAction !== "consortiums" && visibleCompanies.length === 0)) && (
              <div className="px-3 py-8 text-center text-xs text-slate-500">
                현재 필터 조건에 해당하는 항목이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyListItem({ company }: { company: RegionalCompanyItem }) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-slate-900">{company.name}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            <SmallBadge>{company.industry}</SmallBadge>
            <SmallBadge>{company.type}</SmallBadge>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${
            company.status === "연계 필요"
              ? "bg-orange-100 text-orange-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {company.status}
        </span>
      </div>
    </div>
  );
}

function ConsortiumListItem({ consortium }: { consortium: RegionalConsortiumItem }) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-slate-900">{consortium.name}</div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
            <span>{consortium.industry}</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              참여기업 {consortium.companyCount}개
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${
            consortium.status === "운영 중"
              ? "bg-violet-100 text-violet-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {consortium.status}
        </span>
      </div>
    </div>
  );
}

function SmallBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
      {children}
    </span>
  );
}

function buildRegionalCompanies(region: RegionalNetworkSummary): RegionalCompanyItem[] {
  const prefixes = [
    "한빛",
    "그린",
    "미래",
    "에코",
    "새론",
    "청명",
    "대성",
    "동아",
    "세진",
    "우림",
    "정우",
    "태광",
  ];
  const industrySuffix: Record<string, string> = {
    플라스틱: "폴리머",
    금속: "메탈",
    화학: "케미칼",
    섬유: "텍스타일",
    기타: "산업",
  };
  const industryPool = region.industries.flatMap((industry) =>
    Array.from({ length: industry.companyCount }, () => industry.name),
  );

  return Array.from({ length: region.totalCompanies }, (_, index) => {
    const industry = industryPool[index % Math.max(industryPool.length, 1)] ?? "기타";
    const type =
      index < region.supplierCompanies
        ? "배출기업"
        : index < region.supplierCompanies + region.processorCompanies
          ? "중간처리기업"
          : "수요기업";

    return {
      id: `${region.regionCode}-company-${index + 1}`,
      name: `${prefixes[index % prefixes.length]}${industrySuffix[industry]} ${String(index + 1).padStart(2, "0")}`,
      industry,
      type,
      status: index < region.participatingCompanies ? "참여기업" : "연계 필요",
    };
  });
}

function buildRegionalConsortiums(region: RegionalNetworkSummary): RegionalConsortiumItem[] {
  const activeIndustries = region.industries.filter((industry) => industry.consortiumCount > 0);

  return Array.from({ length: region.consortiumCount }, (_, index) => {
    const industry = activeIndustries[index % Math.max(activeIndustries.length, 1)]?.name ?? "기타";
    return {
      id: `${region.regionCode}-consortium-${index + 1}`,
      name: `${region.regionName} ${industry} 순환 컨소시엄 ${index + 1}`,
      industry,
      companyCount: 4 + ((index * 3 + region.totalCompanies) % 6),
      status: index < Math.ceil(region.consortiumCount * 0.75) ? "운영 중" : "구성 중",
    };
  });
}

function DetailRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <strong className={accent ? "text-sm text-orange-600" : "text-sm text-slate-900"}>
        {value}
      </strong>
    </div>
  );
}

function ActionButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
