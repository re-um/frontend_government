import { useState } from "react";
import { Building2, Link2Off, Network, Users, X } from "lucide-react";
import { getRegionalMockCompanyName } from "../data/regionalNetworkData";
import type { RegionalNetworkSummary } from "../types/regionalNetwork";

type DetailAction = "companies" | "consortiums" | "unconnected";
type RegionalCompanyItem = {
  id: string;
  name: string;
  industry: string;
  type: "배출기업" | "중간처리기업" | "수요기업";
  status: "참여기업" | "연계 필요";
  material: string;
  monthlyAmount: number;
};

type RegionalConsortiumItem = {
  id: string;
  name: string;
  industry: string;
  companyCount: number;
  status: "운영 중" | "구성 중";
  participantCompanyIds: string[];
};

export function RegionalNetworkDetail({ region }: { region: RegionalNetworkSummary }) {
  const [activeAction, setActiveAction] = useState<DetailAction | null>(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [expandedConsortiumId, setExpandedConsortiumId] = useState<string | null>(null);
  const companies = buildRegionalCompanies(region);
  const consortiums = buildRegionalConsortiums(region);
  const visibleCompanies =
    activeAction === "unconnected"
      ? companies.filter((company) => company.status === "연계 필요")
      : companies;

  return (
    <div>
      <div className="mb-5">
        <div>
          <div className="text-sm font-semibold text-emerald-600">지역 네트워크 상세</div>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {region.regionName} 산업 네트워크
          </h2>
        </div>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
        <DetailRow label="전체 기업" value={`${region.totalCompanies}개`} />
        <DetailRow label="참여기업" value={`${region.participatingCompanies}개`} />
        <DetailRow label="컨소시엄" value={`${region.consortiumCount}개`} />
        <DetailRow label="연계 필요 기업" value={`${region.unconnectedCompanies}개`} accent />
        <DetailRow label="진행 중 매칭" value={`${region.activeMatches}건`} />
        <DetailRow label="완료 거래" value={`${region.completedTransactions}건`} />
      </div>

      <h3 className="mb-2 text-base font-semibold text-slate-600">산업 분야별 현황</h3>
      <div className="mb-5 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-68 text-left text-sm">
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
          onClick={() => {
            setActiveAction("companies");
            setExpandedCompanyId(null);
            setExpandedConsortiumId(null);
          }}
          icon={<Building2 className="h-4 w-4" />}
        >
          지역 기업 보기
        </ActionButton>
        <ActionButton
          active={activeAction === "consortiums"}
          onClick={() => {
            setActiveAction("consortiums");
            setExpandedCompanyId(null);
            setExpandedConsortiumId(null);
          }}
          icon={<Network className="h-4 w-4" />}
        >
          컨소시엄 보기
        </ActionButton>
        <ActionButton
          active={activeAction === "unconnected"}
          onClick={() => {
            setActiveAction("unconnected");
            setExpandedCompanyId(null);
            setExpandedConsortiumId(null);
          }}
          icon={<Link2Off className="h-4 w-4" />}
        >
          연계 필요 기업 보기
        </ActionButton>
      </div>

      {activeAction && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5">
            <div>
              <div className="text-base font-bold text-slate-900">
                {activeAction === "companies"
                  ? "지역 기업 목록"
                  : activeAction === "consortiums"
                    ? "운영 컨소시엄 목록"
                    : "연계 필요 기업 목록"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
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
                  <ConsortiumListItem
                    key={consortium.id}
                    consortium={consortium}
                    companies={companies}
                    expanded={expandedConsortiumId === consortium.id}
                    onToggle={() =>
                      setExpandedConsortiumId((current) =>
                        current === consortium.id ? null : consortium.id,
                      )
                    }
                  />
                ))
              : visibleCompanies.map((company) => (
                  <CompanyListItem
                    key={company.id}
                    company={company}
                    regionName={region.regionName}
                    expanded={expandedCompanyId === company.id}
                    onToggle={() =>
                      setExpandedCompanyId((current) =>
                        current === company.id ? null : company.id,
                      )
                    }
                  />
                ))}
            {((activeAction === "consortiums" && consortiums.length === 0) ||
              (activeAction !== "consortiums" && visibleCompanies.length === 0)) && (
              <div className="px-3 py-8 text-sm text-slate-500">
                현재 필터 조건에 해당하는 항목이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyListItem({
  company,
  regionName,
  expanded,
  onToggle,
}: {
  company: RegionalCompanyItem;
  regionName: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-900">{company.name}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            <SmallBadge>{company.industry}</SmallBadge>
            <SmallBadge>{company.type}</SmallBadge>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
            company.status === "연계 필요"
              ? "bg-orange-100 text-orange-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {company.status}
        </span>
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-slate-100 bg-slate-50 px-3 py-3 text-sm">
          <MiniDetail label="지역" value={regionName} />
          <MiniDetail label="산업 분야" value={company.industry} />
          <MiniDetail label="기업 유형" value={company.type} />
          <MiniDetail label="취급 자원" value={company.material} />
          <MiniDetail label="월 발생·수요량" value={`${company.monthlyAmount}톤`} />
          <MiniDetail label="네트워크 상태" value={company.status} />
        </div>
      )}
    </div>
  );
}

function ConsortiumListItem({
  consortium,
  companies,
  expanded,
  onToggle,
}: {
  consortium: RegionalConsortiumItem;
  companies: RegionalCompanyItem[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const participants = consortium.participantCompanyIds
    .map((companyId) => companies.find((company) => company.id === companyId))
    .filter((company): company is RegionalCompanyItem => Boolean(company));

  return (
    <div className="bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-900">{consortium.name}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span>{consortium.industry}</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              참여기업 {consortium.companyCount}개
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
            consortium.status === "운영 중"
              ? "bg-violet-100 text-violet-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {consortium.status}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-3">
          <div className="mb-2 text-sm font-bold text-slate-700">
            참여기업 {participants.length}개
          </div>
          <div className="grid gap-1.5">
            {participants.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">
                    {company.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {company.industry} · {company.type}
                  </div>
                </div>
                <span className="ml-2 shrink-0 text-xs font-medium text-emerald-600">참여 중</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-400">{label}</div>
      <div className="mt-0.5 font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function SmallBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function buildRegionalCompanies(region: RegionalNetworkSummary): RegionalCompanyItem[] {
  const industryPool = region.industries.flatMap((industry) =>
    Array.from({ length: industry.companyCount }, () => industry.name),
  );

  return Array.from({ length: region.totalCompanies }, (_, index) => {
    const industry = industryPool[index % Math.max(industryPool.length, 1)] ?? "기타";
    const typeCode =
      index < region.supplierCompanies
        ? "supplier"
        : index < region.supplierCompanies + region.processorCompanies
          ? "processor"
          : "consumer";
    const type =
      typeCode === "supplier" ? "배출기업" : typeCode === "processor" ? "중간처리기업" : "수요기업";

    return {
      id: `${region.regionCode}-company-${index + 1}`,
      name: getRegionalMockCompanyName(region.regionCode, index, industry, typeCode),
      industry,
      type,
      status: index < region.participatingCompanies ? "참여기업" : "연계 필요",
      material:
        industry === "플라스틱"
          ? ["폐PP", "폐PE", "폐PET", "재생 PP"][index % 4]
          : `${industry} 순환자원`,
      monthlyAmount: 18 + ((index * 11 + region.totalCompanies) % 73),
    };
  });
}

function buildRegionalConsortiums(region: RegionalNetworkSummary): RegionalConsortiumItem[] {
  const activeIndustries = region.industries.filter((industry) => industry.consortiumCount > 0);

  return Array.from({ length: region.consortiumCount }, (_, index) => {
    const industry = activeIndustries[index % Math.max(activeIndustries.length, 1)]?.name ?? "기타";
    const companyCount = Math.min(
      region.participatingCompanies,
      4 + ((index * 3 + region.totalCompanies) % 6),
    );
    const participantCompanyIds = Array.from(
      { length: companyCount },
      (_, participantIndex) =>
        `${region.regionCode}-company-${((index * 5 + participantIndex) % Math.max(region.participatingCompanies, 1)) + 1}`,
    );

    return {
      id: `${region.regionCode}-consortium-${index + 1}`,
      name: `${region.regionName} ${industry} 순환 컨소시엄 ${index + 1}`,
      industry,
      companyCount,
      status: index < Math.ceil(region.consortiumCount * 0.75) ? "운영 중" : "구성 중",
      participantCompanyIds,
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
      <span className="text-base text-slate-500">{label}</span>
      <strong className={accent ? "text-lg text-orange-600" : "text-lg text-slate-900"}>
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
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
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
