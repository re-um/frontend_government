import type {
  RegionalIndustryName,
  RegionalCompanyType,
  RegionalNetworkFilters,
  RegionalNetworkSummary,
} from "../types/regionalNetwork";

const companyNameStems = [
  "세림",
  "대영",
  "우진",
  "한결",
  "동명",
  "신화",
  "태성",
  "청우",
  "미래",
  "정산",
  "에코원",
  "그린테크",
  "다온",
  "성진",
  "한성",
  "유림",
  "동우",
  "제일",
  "새한",
  "하이텍",
];

const companySuffixes: Record<RegionalCompanyType, Record<RegionalIndustryName, string[]>> = {
  supplier: {
    플라스틱: ["패키징", "폴리머", "플라텍", "합성수지"],
    금속: ["정공", "금속", "스틸", "메탈"],
    화학: ["케미칼", "화학", "정밀화학", "코팅"],
    섬유: ["텍스타일", "섬유", "화이버", "원사"],
    기타: ["산업", "제조", "테크", "엔지니어링"],
  },
  processor: {
    플라스틱: ["리사이클링", "자원순환", "에코리소스", "재생원료"],
    금속: ["자원", "리메탈", "순환자원", "리커버리"],
    화학: ["에코케미", "환경자원", "리제너레이션", "그린케미"],
    섬유: ["리텍스", "섬유자원", "에코화이버", "순환소재"],
    기타: ["환경", "리소스", "자원개발", "순환산업"],
  },
  consumer: {
    플라스틱: ["첨단소재", "컴파운드", "산업소재", "프로덕츠"],
    금속: ["모빌리티", "부품", "정밀소재", "테크"],
    화학: ["신소재", "바이오소재", "솔루션", "머티리얼즈"],
    섬유: ["패브릭", "어패럴", "소재", "텍스"],
    기타: ["건재", "산업", "테크놀로지", "솔루션"],
  },
};

export function getRegionalMockCompanyName(
  regionCode: string,
  index: number,
  industry: RegionalIndustryName,
  companyType: RegionalCompanyType,
) {
  const regionOffset = [...regionCode].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const stem = companyNameStems[(index * 7 + regionOffset) % companyNameStems.length];
  const suffixes = companySuffixes[companyType][industry];
  const suffix = suffixes[(index * 3 + regionOffset) % suffixes.length];
  const modifier = ["", "테크", "산업"][Math.floor(index / 20)] ?? "솔루션";
  return `${stem}${suffix}${modifier}`;
}

const industries = (values: Array<[RegionalIndustryName, number, number, number]>) =>
  values.map(([name, companyCount, consortiumCount, unconnectedCount]) => ({
    name,
    companyCount,
    consortiumCount,
    unconnectedCount,
  }));

export const regionalNetworkData: RegionalNetworkSummary[] = [
  {
    regionCode: "gyeonggi",
    regionName: "경기도",
    latitude: 37.4138,
    longitude: 127.5183,
    totalCompanies: 42,
    participatingCompanies: 29,
    consortiumCount: 8,
    unconnectedCompanies: 13,
    supplierCompanies: 17,
    processorCompanies: 10,
    consumerCompanies: 15,
    activeMatches: 12,
    completedTransactions: 7,
    industries: industries([
      ["플라스틱", 18, 3, 5],
      ["금속", 8, 2, 3],
      ["화학", 7, 1, 2],
      ["섬유", 5, 1, 2],
      ["기타", 4, 1, 1],
    ]),
  },
  {
    regionCode: "chungnam",
    regionName: "충청남도",
    latitude: 36.6588,
    longitude: 126.6728,
    totalCompanies: 37,
    participatingCompanies: 26,
    consortiumCount: 5,
    unconnectedCompanies: 11,
    supplierCompanies: 15,
    processorCompanies: 9,
    consumerCompanies: 13,
    activeMatches: 8,
    completedTransactions: 4,
    industries: industries([
      ["플라스틱", 14, 2, 3],
      ["금속", 8, 1, 4],
      ["화학", 7, 1, 2],
      ["섬유", 3, 0, 1],
      ["기타", 5, 1, 1],
    ]),
  },
  {
    regionCode: "seoul",
    regionName: "서울특별시",
    latitude: 37.5665,
    longitude: 126.978,
    totalCompanies: 35,
    participatingCompanies: 29,
    consortiumCount: 3,
    unconnectedCompanies: 6,
    supplierCompanies: 10,
    processorCompanies: 7,
    consumerCompanies: 18,
    activeMatches: 7,
    completedTransactions: 6,
    industries: industries([
      ["플라스틱", 12, 1, 2],
      ["금속", 6, 0, 1],
      ["화학", 5, 1, 1],
      ["섬유", 7, 1, 1],
      ["기타", 5, 0, 1],
    ]),
  },
  {
    regionCode: "incheon",
    regionName: "인천광역시",
    latitude: 37.4563,
    longitude: 126.7052,
    totalCompanies: 32,
    participatingCompanies: 24,
    consortiumCount: 3,
    unconnectedCompanies: 8,
    supplierCompanies: 14,
    processorCompanies: 8,
    consumerCompanies: 10,
    activeMatches: 9,
    completedTransactions: 5,
    industries: industries([
      ["플라스틱", 13, 1, 3],
      ["금속", 8, 1, 2],
      ["화학", 5, 1, 1],
      ["섬유", 2, 0, 1],
      ["기타", 4, 0, 1],
    ]),
  },
  {
    regionCode: "busan",
    regionName: "부산광역시",
    latitude: 35.1796,
    longitude: 129.0756,
    totalCompanies: 34,
    participatingCompanies: 27,
    consortiumCount: 3,
    unconnectedCompanies: 7,
    supplierCompanies: 13,
    processorCompanies: 8,
    consumerCompanies: 13,
    activeMatches: 8,
    completedTransactions: 6,
    industries: industries([
      ["플라스틱", 11, 1, 2],
      ["금속", 9, 1, 2],
      ["화학", 6, 0, 1],
      ["섬유", 4, 1, 1],
      ["기타", 4, 0, 1],
    ]),
  },
  {
    regionCode: "gyeongbuk",
    regionName: "경상북도",
    latitude: 36.4919,
    longitude: 128.8889,
    totalCompanies: 38,
    participatingCompanies: 30,
    consortiumCount: 4,
    unconnectedCompanies: 8,
    supplierCompanies: 16,
    processorCompanies: 9,
    consumerCompanies: 13,
    activeMatches: 10,
    completedTransactions: 7,
    industries: industries([
      ["플라스틱", 13, 1, 2],
      ["금속", 10, 1, 3],
      ["화학", 7, 1, 1],
      ["섬유", 5, 1, 1],
      ["기타", 3, 0, 1],
    ]),
  },
  {
    regionCode: "jeonbuk",
    regionName: "전라북도",
    latitude: 35.7175,
    longitude: 127.153,
    totalCompanies: 31,
    participatingCompanies: 25,
    consortiumCount: 3,
    unconnectedCompanies: 6,
    supplierCompanies: 12,
    processorCompanies: 8,
    consumerCompanies: 11,
    activeMatches: 7,
    completedTransactions: 5,
    industries: industries([
      ["플라스틱", 12, 1, 2],
      ["금속", 6, 1, 1],
      ["화학", 5, 0, 1],
      ["섬유", 4, 1, 1],
      ["기타", 4, 0, 1],
    ]),
  },
  {
    regionCode: "chungbuk",
    regionName: "충청북도",
    latitude: 36.6357,
    longitude: 127.4917,
    totalCompanies: 35,
    participatingCompanies: 26,
    consortiumCount: 2,
    unconnectedCompanies: 9,
    supplierCompanies: 14,
    processorCompanies: 9,
    consumerCompanies: 12,
    activeMatches: 8,
    completedTransactions: 5,
    industries: industries([
      ["플라스틱", 14, 1, 4],
      ["금속", 7, 0, 2],
      ["화학", 7, 1, 1],
      ["섬유", 3, 0, 1],
      ["기타", 4, 0, 1],
    ]),
  },
];

const scaled = (value: number, ratio: number) =>
  ratio === 0 ? 0 : Math.max(0, Math.round(value * ratio));

export function filterRegionalNetworkData(
  data: RegionalNetworkSummary[],
  filters: RegionalNetworkFilters,
) {
  return data
    .filter((region) => filters.regionCode === "all" || region.regionCode === filters.regionCode)
    .map((region) => {
      const selectedIndustry =
        filters.industry === "all"
          ? null
          : region.industries.find((industry) => industry.name === filters.industry);
      const industryRatio = selectedIndustry
        ? selectedIndustry.companyCount / region.totalCompanies
        : 1;
      const typeCount =
        filters.companyType === "supplier"
          ? region.supplierCompanies
          : filters.companyType === "processor"
            ? region.processorCompanies
            : filters.companyType === "consumer"
              ? region.consumerCompanies
              : region.totalCompanies;
      const typeRatio = typeCount / region.totalCompanies;
      const statusRatio =
        filters.status === "participating"
          ? region.participatingCompanies / region.totalCompanies
          : filters.status === "unconnected"
            ? region.unconnectedCompanies / region.totalCompanies
            : filters.status === "consortium"
              ? Math.min(1, (region.consortiumCount * 3) / Math.max(region.totalCompanies, 1))
              : 1;
      const ratio = industryRatio * typeRatio * statusRatio;
      const totalCompanies = scaled(region.totalCompanies, ratio);
      const unconnectedCompanies =
        filters.status === "participating" || filters.status === "consortium"
          ? 0
          : filters.status === "unconnected"
            ? totalCompanies
            : scaled(region.unconnectedCompanies, industryRatio * typeRatio);
      const participatingCompanies = Math.max(0, totalCompanies - unconnectedCompanies);

      return {
        ...region,
        totalCompanies,
        participatingCompanies,
        unconnectedCompanies,
        consortiumCount: scaled(region.consortiumCount, ratio),
        supplierCompanies:
          filters.companyType === "all"
            ? scaled(region.supplierCompanies, industryRatio * statusRatio)
            : filters.companyType === "supplier"
              ? totalCompanies
              : 0,
        processorCompanies:
          filters.companyType === "all"
            ? scaled(region.processorCompanies, industryRatio * statusRatio)
            : filters.companyType === "processor"
              ? totalCompanies
              : 0,
        consumerCompanies:
          filters.companyType === "all"
            ? scaled(region.consumerCompanies, industryRatio * statusRatio)
            : filters.companyType === "consumer"
              ? totalCompanies
              : 0,
        activeMatches: scaled(region.activeMatches, ratio),
        completedTransactions: scaled(region.completedTransactions, ratio),
        industries: region.industries
          .filter((industry) => filters.industry === "all" || industry.name === filters.industry)
          .map((industry) => ({
            ...industry,
            companyCount: scaled(industry.companyCount, typeRatio * statusRatio),
            consortiumCount: scaled(industry.consortiumCount, typeRatio * statusRatio),
            unconnectedCount:
              filters.status === "participating" || filters.status === "consortium"
                ? 0
                : filters.status === "unconnected"
                  ? scaled(industry.companyCount, typeRatio)
                  : scaled(industry.unconnectedCount, typeRatio),
          })),
      };
    })
    .filter((region) => region.totalCompanies > 0);
}
