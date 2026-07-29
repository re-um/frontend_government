/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadKakaoMap } from "../lib/loadKakaoMap";
import type { RegionalNetworkSummary } from "../types/regionalNetwork";

type MapOverlay = {
  setMap: (map: unknown | null) => void;
};

export function RegionalNetworkMap({
  regions,
  selectedRegionCode,
  onSelectRegion,
}: {
  regions: RegionalNetworkSummary[];
  selectedRegionCode?: string;
  onSelectRegion: (regionCode: string) => void;
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

    if (regions.length > 1) map.setBounds(bounds, 70, 70, 70, 70);
    if (regions.length === 1) {
      map.setCenter(new kakao.maps.LatLng(regions[0].latitude, regions[0].longitude));
      map.setLevel(8);
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
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[10px] text-slate-600 shadow-sm">
        마커 크기: 전체 기업 수 · 주황 테두리: 연계 필요 비율 높음
      </div>
    </div>
  );
}
