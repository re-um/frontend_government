export const performanceRegions = ["울산", "여수", "포항", "당진", "광양", "강원"] as const;
export const performanceMaterials = ["HDPE", "PP", "LDPE", "PET", "ABS"] as const;
export const performancePeriods = ["최근 6개월", "올해", "지난 1년", "지난 2년"] as const;

const regionWeights = [1.18, 1.12, 0.96, 0.91, 1.04, 0.78];
const materialWeights = [1.14, 1.08, 0.94, 1.02, 0.86];
const recyclingFactors = [7.25, 6.7, 6.05, 5.45, 4.8];

const performanceData = Array.from({ length: 20 }, (_, monthIndex) => {
  const date = new Date(2024, monthIndex, 1);
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return performanceRegions.flatMap((region, regionIndex) =>
    performanceMaterials.map((material, materialIndex) => {
      const 감축 = Math.round(
        (610 + monthIndex * 24) * regionWeights[regionIndex] * materialWeights[materialIndex],
      );
      return {
        month,
        region,
        material,
        감축,
        재활용: Math.round(감축 * recyclingFactors[materialIndex]),
        companies: 3 + ((monthIndex + regionIndex + materialIndex) % 5),
      };
    }),
  );
}).flat();

export function getPeriodRange(period: string) {
  const startMonth =
    period === "최근 6개월"
      ? "2025-03"
      : period === "올해"
        ? "2025-01"
        : period === "지난 1년"
          ? "2024-09"
          : "2024-01";
  return { startMonth, endMonth: "2025-08" };
}

export function calculatePerformance(region: string, period: string, material: string) {
  const { startMonth, endMonth } = getPeriodRange(period);
  const filtered = performanceData.filter(
    (row) =>
      row.month >= startMonth &&
      row.month <= endMonth &&
      (region === "전체" || row.region === region) &&
      (material === "전체" || row.material === material),
  );

  const monthlyMap = new Map<string, { month: string; 감축: number; 재활용: number }>();
  for (const row of filtered) {
    const current = monthlyMap.get(row.month) ?? { month: row.month, 감축: 0, 재활용: 0 };
    current.감축 += row.감축;
    current.재활용 += row.재활용;
    monthlyMap.set(row.month, current);
  }
  const monthly = [...monthlyMap.values()].map((row) => ({
    ...row,
    month: `${row.month.slice(2, 4)}.${row.month.slice(5)}`,
  }));

  const mixMap = new Map<string, number>();
  for (const row of filtered) {
    mixMap.set(row.material, (mixMap.get(row.material) ?? 0) + row.재활용);
  }
  const rawWasteMix = performanceMaterials
    .filter((name) => material === "전체" || name === material)
    .map((name) => ({ name, value: mixMap.get(name) ?? 0 }));
  const mixTotal = rawWasteMix.reduce((sum, item) => sum + item.value, 0);
  const wasteMix = rawWasteMix.map((item) => ({
    name: item.name,
    value: mixTotal === 0 ? 0 : Math.round((item.value / mixTotal) * 1000) / 10,
  }));
  const carbon = filtered.reduce((sum, row) => sum + row.감축, 0);
  const recycling = filtered.reduce((sum, row) => sum + row.재활용, 0);
  const monthCount = Math.max(1, new Set(filtered.map((row) => row.month)).size);
  const companies = Math.round(
    filtered.reduce((sum, row) => sum + row.companies, 0) / monthCount,
  );
  const rate = recycling === 0 ? 0 : (carbon / recycling) * 100;
  const growth =
    6.8 +
    (region === "전체"
      ? 2.4
      : performanceRegions.indexOf(region as (typeof performanceRegions)[number]) * 0.7) +
    (material === "전체"
      ? 1.6
      : performanceMaterials.indexOf(material as (typeof performanceMaterials)[number]) * 0.5);

  return { monthly, wasteMix, carbon, recycling, companies, rate, growth, startMonth, endMonth };
}
