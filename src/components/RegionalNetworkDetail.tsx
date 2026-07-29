import { useState } from "react";
import { Building2, Link2Off, Network, X } from "lucide-react";
import type { RegionalNetworkSummary } from "../types/regionalNetwork";

type DetailAction = "companies" | "consortiums" | "unconnected";

export function RegionalNetworkDetail({
  region,
  onClose,
}: {
  region: RegionalNetworkSummary;
  onClose: () => void;
}) {
  const [activeAction, setActiveAction] = useState<DetailAction | null>(null);
  const actionText =
    activeAction === "companies"
      ? `${region.regionName} 기업 ${region.totalCompanies}개가 목록 필터에 적용되었습니다.`
      : activeAction === "consortiums"
        ? `${region.regionName} 컨소시엄 ${region.consortiumCount}개가 목록 필터에 적용되었습니다.`
        : activeAction === "unconnected"
          ? `${region.regionName} 연계 필요 기업 ${region.unconnectedCompanies}개가 목록 필터에 적용되었습니다.`
          : "";

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

      {actionText && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] leading-5 text-emerald-800">
          {actionText}
        </div>
      )}
    </div>
  );
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
