/* eslint-disable prettier/prettier */
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { loadKakaoMap } from "../lib/loadKakaoMap";

type CompanyType =
  | "emitter"
  | "processor"
  | "consumer";

type MatchStatus =
  | "approved"
  | "active"
  | "pending";

export interface KakaoMapCompany {
  id: string;
  name: string;
  type: CompanyType;
  region: string;
  material: string;
  monthlyAmount: number;
  connections: number;
  approvedMatches: number;
  status: MatchStatus;
  description: string;
  latitude: number;
  longitude: number;
}

export interface KakaoMapMatch {
  id: string;
  source: string;
  target: string;
  material: string;
  amount: number;
  score: number;
  roi: number;
  carbonReduction: number;
  status: MatchStatus;
}

type KakaoNetworkMapProps = {
  companies: KakaoMapCompany[];
  matches: KakaoMapMatch[];
  visibleCompanyIds: Set<string>;
  selectedCompany: KakaoMapCompany | null;
  selectedMatch: KakaoMapMatch | null;
  onSelectCompany: (
    company: KakaoMapCompany,
  ) => void;
  onSelectMatch: (
    match: KakaoMapMatch,
  ) => void;
};

type MapOverlay = {
  setMap: (map: unknown | null) => void;
};

const companyTypeLabel: Record<
  CompanyType,
  string
> = {
  emitter: "배출기업",
  processor: "중간처리기업",
  consumer: "수요기업",
};

const companyTypeShortLabel: Record<
  CompanyType,
  string
> = {
  emitter: "배",
  processor: "중",
  consumer: "수",
};

const companyColors: Record<
  CompanyType,
  {
    border: string;
    background: string;
    text: string;
  }
> = {
  emitter: {
    border: "#2563eb",
    background: "#dbeafe",
    text: "#1d4ed8",
  },
  processor: {
    border: "#ea580c",
    background: "#ffedd5",
    text: "#c2410c",
  },
  consumer: {
    border: "#16a34a",
    background: "#dcfce7",
    text: "#15803d",
  },
};

const statusColors: Record<
  MatchStatus,
  string
> = {
  approved: "#7c3aed",
  active: "#16a34a",
  pending: "#64748b",
};

export function KakaoNetworkMap({
  companies,
  matches,
  visibleCompanyIds,
  selectedCompany,
  selectedMatch,
  onSelectCompany,
  onSelectMatch,
}: KakaoNetworkMapProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const overlaysRef =
    useRef<MapOverlay[]>([]);

  const [errorMessage, setErrorMessage] =
    useState("");
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        await loadKakaoMap();

        if (
          cancelled ||
          !containerRef.current
        ) {
          return;
        }

        const kakao = window.kakao;

        const map = new kakao.maps.Map(
          containerRef.current,
          {
            center: new kakao.maps.LatLng(
              36.25,
              127.9,
            ),
            level: 13,
          },
        );

        map.setZoomable(true);
        map.setDraggable(true);

        mapRef.current = map;

        const zoomControl =
          new kakao.maps.ZoomControl();

        map.addControl(
          zoomControl,
          kakao.maps.ControlPosition.RIGHT,
        );

        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "지도를 불러오지 못했습니다.",
          );
          setIsLoading(false);
        }
      }
    }

    initializeMap();

    return () => {
      cancelled = true;

      overlaysRef.current.forEach(
        (overlay) => {
          overlay.setMap(null);
        },
      );

      overlaysRef.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || isLoading) {
      return;
    }

    const kakao = window.kakao;

    overlaysRef.current.forEach(
      (overlay) => {
        overlay.setMap(null);
      },
    );

    overlaysRef.current = [];

    const visibleCompanies =
      companies.filter((company) =>
        visibleCompanyIds.has(company.id),
      );

    const visibleMatches =
      matches.filter(
        (match) =>
          visibleCompanyIds.has(
            match.source,
          ) &&
          visibleCompanyIds.has(
            match.target,
          ),
      );

    const companyById = new Map(
      companies.map((company) => [
        company.id,
        company,
      ]),
    );

    const bounds =
      new kakao.maps.LatLngBounds();

    visibleMatches.forEach((match) => {
      const source = companyById.get(
        match.source,
      );
      const target = companyById.get(
        match.target,
      );

      if (!source || !target) {
        return;
      }

      const sourcePosition =
        new kakao.maps.LatLng(
          source.latitude,
          source.longitude,
        );

      const targetPosition =
        new kakao.maps.LatLng(
          target.latitude,
          target.longitude,
        );

      const isSelected =
        selectedMatch?.id === match.id;

      const polyline =
        new kakao.maps.Polyline({
          map,
          path: [
            sourcePosition,
            targetPosition,
          ],
          strokeWeight: isSelected
            ? 8
            : match.status === "approved"
              ? 6
              : 4,
          strokeColor:
            statusColors[match.status],
          strokeOpacity:
            selectedMatch && !isSelected
              ? 0.18
              : 0.75,
          strokeStyle:
            match.status === "pending"
              ? "shortdash"
              : "solid",
        });

      kakao.maps.event.addListener(
        polyline,
        "click",
        () => {
          onSelectMatch(match);
        },
      );

      overlaysRef.current.push(polyline);
    });

    visibleCompanies.forEach(
      (company) => {
        const position =
          new kakao.maps.LatLng(
            company.latitude,
            company.longitude,
          );

        bounds.extend(position);

        const content =
          createCompanyOverlayElement({
            company,
            selected:
              selectedCompany?.id ===
              company.id,
            onClick: () => {
              onSelectCompany(company);
            },
          });

        const overlay =
          new kakao.maps.CustomOverlay({
            map,
            position,
            content,
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex:
              selectedCompany?.id ===
              company.id
                ? 20
                : 10,
          });

        overlaysRef.current.push(overlay);
      },
    );

    if (visibleCompanies.length > 0 && !selectedCompany && !selectedMatch) {
      map.setBounds(bounds, 80, 80, 80, 80);
    }
  }, [
    companies,
    matches,
    visibleCompanyIds,
    selectedCompany,
    selectedMatch,
    onSelectCompany,
    onSelectMatch,
    isLoading,
  ]);

  const zoomIn = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.setLevel(
      Math.max(map.getLevel() - 1, 1),
      {
        animate: true,
      },
    );
  };

  const zoomOut = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.setLevel(
      Math.min(map.getLevel() + 1, 14),
      {
        animate: true,
      },
    );
  };

  const resetMap = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const kakao = window.kakao;
    const bounds =
      new kakao.maps.LatLngBounds();

    companies
      .filter((company) =>
        visibleCompanyIds.has(company.id),
      )
      .forEach((company) => {
        bounds.extend(
          new kakao.maps.LatLng(
            company.latitude,
            company.longitude,
          ),
        );
      });

    if (
      companies.some((company) =>
        visibleCompanyIds.has(company.id),
      )
    ) {
      map.setBounds(bounds, 80, 80, 80, 80);
      return;
    }

    map.setCenter(
      new kakao.maps.LatLng(
        36.25,
        127.9,
      ),
    );
    map.setLevel(13);
  };

  if (errorMessage) {
    return (
      <div className="flex min-h-180 items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-180 w-full overflow-hidden bg-slate-100">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
      />

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
            지도를 불러오는 중입니다.
          </div>
        </div>
      )}

      <div className="absolute right-4 top-4 z-20 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <MapControlButton
          label="확대"
          onClick={zoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </MapControlButton>

        <MapControlButton
          label="축소"
          onClick={zoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </MapControlButton>

        <MapControlButton
          label="전체 보기"
          onClick={resetMap}
        >
          <RotateCcw className="h-4 w-4" />
        </MapControlButton>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-[11px] text-slate-600 shadow-sm backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-blue-600 bg-blue-100" />
          배출기업
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-orange-600 bg-orange-100" />
          중간처리기업
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-green-600 bg-green-100" />
          수요기업
        </span>
      </div>
    </div>
  );
}

function createCompanyOverlayElement({
  company,
  selected,
  onClick,
}: {
  company: KakaoMapCompany;
  selected: boolean;
  onClick: () => void;
}) {
  const colors =
    companyColors[company.type];

  const root =
    document.createElement("button");

  root.type = "button";
  root.setAttribute(
    "aria-label",
    `${company.name} 상세 보기`,
  );

  root.style.cssText = `
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
    font-family: Pretendard, sans-serif;
    transform: ${selected ? "scale(1.12)" : "scale(1)"};
    transition: transform 160ms ease;
  `;

  const circle =
    document.createElement("span");

  const size =
    company.connections >= 4
      ? 32
      : company.connections >= 2
        ? 28
        : 24;

  circle.style.cssText = `
    position: relative;
    display: flex;
    width: ${size}px;
    height: ${size}px;
    align-items: center;
    justify-content: center;
    border: 2px solid ${colors.border};
    border-radius: 9999px;
    background: ${colors.background};
    color: ${colors.text};
    font-size: 11px;
    font-weight: 800;
    box-shadow:
      0 5px 14px rgba(15, 23, 42, 0.18),
      ${selected
        ? "0 0 0 5px rgba(15, 23, 42, 0.16)"
        : "none"};
  `;

  circle.textContent =
    companyTypeShortLabel[company.type];

  const statusDot =
    document.createElement("span");

  const statusColor =
    statusColors[company.status];

  statusDot.style.cssText = `
    position: absolute;
    top: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    border: 2px solid white;
    border-radius: 9999px;
    background: ${statusColor};
  `;

  circle.appendChild(statusDot);

  const label =
    document.createElement("span");

  label.style.cssText = `
    display: block;
    max-width: 140px;
    margin-top: 5px;
    padding: 4px 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.96);
    color: #0f172a;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1);
  `;

  label.textContent = company.name;

  const tooltip =
    document.createElement("span");

  tooltip.style.cssText = `
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    display: none;
    width: max-content;
    max-width: 220px;
    transform: translateX(-50%);
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    background: white;
    color: #334155;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.45;
    text-align: left;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  `;

  tooltip.innerHTML = `
    <strong style="display:block;color:#0f172a;font-size:12px;margin-bottom:3px;">
      ${escapeHtml(company.name)}
    </strong>
    <span>
      ${escapeHtml(companyTypeLabel[company.type])}
      · ${escapeHtml(company.region)}
    </span>
    <br />
    <span>
      ${escapeHtml(company.material)}
      · 월 ${company.monthlyAmount}톤
    </span>
  `;

  root.addEventListener(
    "mouseenter",
    () => {
      root.style.transform =
        selected
          ? "scale(1.15)"
          : "scale(1.08)";
      tooltip.style.display = "block";
    },
  );

  root.addEventListener(
    "mouseleave",
    () => {
      root.style.transform =
        selected
          ? "scale(1.12)"
          : "scale(1)";
      tooltip.style.display = "none";
    },
  );

  root.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    },
  );

  root.appendChild(circle);
  root.appendChild(label);
  root.appendChild(tooltip);

  return root;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function MapControlButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}