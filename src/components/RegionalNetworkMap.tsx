/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadKakaoMap } from "../lib/loadKakaoMap";
import type { RegionalNetworkSummary } from "../types/regionalNetwork";

type MapOverlay = {
  setMap: (map: unknown | null) => void;
};

const companyTypeMeta = [
  { label: "배출기업", color: "#2563eb", short: "배" },
  { label: "중간처리기업", color: "#0d9488", short: "중" },
  { label: "수요기업", color: "#65a30d", short: "수" },
] as const;

const regionalIndustrialAnchors: Record<string, Array<{ latitude: number; longitude: number }>> = {
  gyeonggi: [
    { latitude: 37.1995, longitude: 126.8312 },
    { latitude: 37.3219, longitude: 126.8309 },
    { latitude: 36.9921, longitude: 127.1129 },
    { latitude: 37.3801, longitude: 126.8031 },
    { latitude: 37.272, longitude: 127.435 },
    { latitude: 37.2411, longitude: 127.1776 },
  ],
  chungnam: [
    { latitude: 36.8151, longitude: 127.1139 },
    { latitude: 36.7898, longitude: 127.0018 },
    { latitude: 36.8896, longitude: 126.645 },
    { latitude: 36.7845, longitude: 126.4503 },
    { latitude: 36.4465, longitude: 127.119 },
    { latitude: 36.1872, longitude: 127.0987 },
  ],
  seoul: [
    { latitude: 37.4954, longitude: 126.8874 },
    { latitude: 37.4569, longitude: 126.8955 },
    { latitude: 37.5509, longitude: 126.8495 },
    { latitude: 37.5633, longitude: 127.0369 },
    { latitude: 37.5264, longitude: 126.8962 },
  ],
  incheon: [
    { latitude: 37.4112, longitude: 126.7315 },
    { latitude: 37.5455, longitude: 126.6759 },
    { latitude: 37.507, longitude: 126.7218 },
    { latitude: 37.3824, longitude: 126.6564 },
  ],
  busan: [
    { latitude: 35.2122, longitude: 128.9806 },
    { latitude: 35.104, longitude: 128.9747 },
    { latitude: 35.1526, longitude: 128.991 },
    { latitude: 35.2446, longitude: 129.2223 },
  ],
  gyeongbuk: [
    { latitude: 36.1195, longitude: 128.3446 },
    { latitude: 36.019, longitude: 129.3435 },
    { latitude: 35.8251, longitude: 128.7415 },
    { latitude: 35.8562, longitude: 129.2247 },
    { latitude: 36.1398, longitude: 128.1136 },
  ],
  jeonbuk: [
    { latitude: 35.8242, longitude: 127.148 },
    { latitude: 35.9483, longitude: 126.9576 },
    { latitude: 35.9676, longitude: 126.7369 },
    { latitude: 35.9047, longitude: 127.1622 },
    { latitude: 35.5699, longitude: 126.856 },
  ],
  chungbuk: [
    { latitude: 36.6424, longitude: 127.489 },
    { latitude: 36.991, longitude: 127.9259 },
    { latitude: 37.1326, longitude: 128.1909 },
    { latitude: 36.9403, longitude: 127.6905 },
    { latitude: 36.8554, longitude: 127.4356 },
  ],
};

export function RegionalNetworkMap({
  regions,
  selectedRegionCode,
  onSelectRegion,
  onBackToRegions,
}: {
  regions: RegionalNetworkSummary[];
  selectedRegionCode?: string;
  onSelectRegion: (regionCode: string) => void;
  onBackToRegions: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<MapOverlay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        await loadKakaoMap();
        if (cancelled || !containerRef.current) return;

        const kakao = window.kakao;
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(36.35, 127.85),
          level: 13,
        });
        map.setZoomable(true);
        map.setDraggable(true);
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
        mapRef.current = map;
        setIsLoading(false);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "지역별 지도를 불러오지 못했습니다.",
        );
        setIsLoading(false);
      }
    }

    initializeMap();
    return () => {
      cancelled = true;
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading) return;
    const kakao = window.kakao;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    const bounds = new kakao.maps.LatLngBounds();
    const maxCompanies = Math.max(1, ...regions.map((region) => region.totalCompanies));

    if (!selectedRegionCode)
      regions.forEach((region) => {
        const selected = region.regionCode === selectedRegionCode;
        const unconnectedRatio = region.unconnectedCompanies / Math.max(region.totalCompanies, 1);
        const markerSize = 52 + (region.totalCompanies / maxCompanies) * 14;
        const content = document.createElement("button");
        content.type = "button";
        content.setAttribute(
          "aria-label",
          `${region.regionName}, 기업 ${region.totalCompanies}개, 컨소시엄 ${region.consortiumCount}개, 연계 필요 ${region.unconnectedCompanies}개`,
        );
        Object.assign(content.style, {
          width: `${markerSize}px`,
          minHeight: `${markerSize}px`,
          padding: "5px 4px",
          borderRadius: "14px",
          border: selected
            ? "3px solid #0f172a"
            : unconnectedRatio >= 0.28
              ? "2px solid #f97316"
              : "2px solid #10b981",
          background: selected
            ? "#ecfccb"
            : unconnectedRatio >= 0.28
              ? "rgba(255,247,237,.96)"
              : "rgba(255,255,255,.96)",
          boxShadow: selected
            ? "0 0 0 4px rgba(163,230,53,.28), 0 8px 20px rgba(15,23,42,.18)"
            : "0 5px 14px rgba(15,23,42,.14)",
          color: "#0f172a",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "center",
          transform: selected ? "scale(1.08)" : "scale(1)",
          transition: "transform .2s ease, box-shadow .2s ease",
        });
        content.innerHTML = `
        <strong style="display:block;font-size:9px;line-height:1.15;margin-bottom:2px;white-space:nowrap">${region.regionName}</strong>
        <span style="display:block;font-size:7px;line-height:1.35;color:#475569">기업 <b style="color:#0f172a">${region.totalCompanies}</b> · 컨소 <b style="color:#0f172a">${region.consortiumCount}</b></span>
        <span style="display:block;font-size:7px;line-height:1.35;color:${unconnectedRatio >= 0.28 ? "#c2410c" : "#475569"}">연계 필요 <b>${region.unconnectedCompanies}</b></span>
      `;
        content.addEventListener("click", () => onSelectRegion(region.regionCode));

        const position = new kakao.maps.LatLng(region.latitude, region.longitude);
        bounds.extend(position);
        const overlay = new kakao.maps.CustomOverlay({
          map,
          position,
          content,
          xAnchor: 0.5,
          yAnchor: 0.5,
          zIndex: selected ? 20 : 10,
        });
        overlaysRef.current.push(overlay);
      });

    const selectedRegion = regions.find((region) => region.regionCode === selectedRegionCode);

    if (selectedRegion) {
      const companyBounds = new kakao.maps.LatLngBounds();
      createRegionalCompanyPoints(selectedRegion).forEach((company) => {
        const content = document.createElement("button");
        content.type = "button";
        content.title = `${company.name} · ${company.type.label}`;
        content.setAttribute(
          "aria-label",
          `${company.name}, ${company.type.label}, ${company.status}`,
        );
        Object.assign(content.style, {
          width: "23px",
          height: "23px",
          padding: "0",
          borderRadius: "50%",
          border: "2px solid #ffffff",
          background: company.type.color,
          boxShadow: "0 3px 9px rgba(15,23,42,.3)",
          color: "#ffffff",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "8px",
          fontWeight: "800",
          lineHeight: "19px",
          textAlign: "center",
          position: "relative",
        });
        content.textContent = company.type.short;

        const tooltip = document.createElement("span");
        Object.assign(tooltip.style, {
          display: "none",
          position: "absolute",
          left: "50%",
          bottom: "28px",
          transform: "translateX(-50%)",
          width: "max-content",
          maxWidth: "160px",
          padding: "5px 7px",
          borderRadius: "7px",
          background: "#0f172a",
          color: "#ffffff",
          fontSize: "9px",
          fontWeight: "600",
          lineHeight: "1.35",
          whiteSpace: "nowrap",
          boxShadow: "0 5px 14px rgba(15,23,42,.25)",
          pointerEvents: "none",
        });
        tooltip.textContent = `${company.name} · ${company.status}`;
        content.appendChild(tooltip);
        content.addEventListener("mouseenter", () => {
          tooltip.style.display = "block";
        });
        content.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });
        content.addEventListener("focus", () => {
          tooltip.style.display = "block";
        });
        content.addEventListener("blur", () => {
          tooltip.style.display = "none";
        });

        const companyPosition = new kakao.maps.LatLng(company.latitude, company.longitude);
        companyBounds.extend(companyPosition);
        const overlay = new kakao.maps.CustomOverlay({
          map,
          position: companyPosition,
          content,
          xAnchor: 0.5,
          yAnchor: 0.5,
          zIndex: 12,
        });
        overlaysRef.current.push(overlay);
      });

      map.setBounds(companyBounds, 60, 60, 60, 60);
    } else if (regions.length > 1) {
      map.setBounds(bounds, 70, 70, 70, 70);
    } else if (regions.length === 1) {
      map.setCenter(new kakao.maps.LatLng(regions[0].latitude, regions[0].longitude));
      map.setLevel(9);
    }
  }, [isLoading, onSelectRegion, regions, selectedRegionCode]);

  return (
    <div className="relative min-h-125 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div ref={containerRef} className="absolute inset-0" />
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
          지역별 네트워크 지도를 불러오는 중입니다...
        </div>
      )}
      {errorMessage && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50 p-6 text-center text-sm font-medium text-red-600">
          {errorMessage}
        </div>
      )}
      {selectedRegionCode && !isLoading && !errorMessage && (
        <button
          type="button"
          onClick={onBackToRegions}
          className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-bold text-slate-700 shadow-md backdrop-blur transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          전국 지역 현황
        </button>
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[10px] text-slate-600 shadow-sm">
        {selectedRegionCode
          ? "배 배출기업 · 중 중간처리기업 · 수 수요기업"
          : "마커 크기: 전체 기업 수 · 주황 테두리: 연계 필요 비율 높음"}
      </div>
    </div>
  );
}

function createRegionalCompanyPoints(region: RegionalNetworkSummary) {
  const namePrefixes = [
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
  const anchors = regionalIndustrialAnchors[region.regionCode] ?? [
    { latitude: region.latitude, longitude: region.longitude },
  ];

  return Array.from({ length: region.totalCompanies }, (_, index) => {
    const clusterRoll = seededRandom(index + region.totalCompanies * 3.17);
    const anchorIndex =
      clusterRoll < 0.46
        ? 0
        : clusterRoll < 0.72
          ? Math.min(1, anchors.length - 1)
          : Math.floor(seededRandom(index * 5.31 + region.latitude) * anchors.length);
    const anchor = anchors[anchorIndex];
    const isDenseCluster = anchorIndex === 0;
    const isMediumCluster = anchorIndex === 1;
    const maxRadius = isDenseCluster ? 0.006 : isMediumCluster ? 0.012 : 0.019;
    const angle = seededRandom(index * 8.73 + region.longitude) * Math.PI * 2;
    const radius = Math.sqrt(seededRandom(index * 13.19 + region.totalCompanies)) * maxRadius;
    const type =
      index < region.supplierCompanies
        ? companyTypeMeta[0]
        : index < region.supplierCompanies + region.processorCompanies
          ? companyTypeMeta[1]
          : companyTypeMeta[2];
    const industry =
      region.industries[index % Math.max(region.industries.length, 1)]?.name ?? "기타";

    return {
      name: `${namePrefixes[index % namePrefixes.length]}${industry} ${String(index + 1).padStart(2, "0")}`,
      type,
      status: index < region.participatingCompanies ? "참여기업" : "연계 필요 기업",
      latitude: anchor.latitude + Math.sin(angle) * radius,
      longitude: anchor.longitude + Math.cos(angle) * radius,
    };
  });
}

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}
