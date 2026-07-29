export type NetworkParticipationStatus = "participating" | "unconnected";

export type RegionalCompanyType = "supplier" | "processor" | "consumer";

export type RegionalIndustryName = "플라스틱" | "금속" | "화학" | "섬유" | "기타";

export type RegionalIndustrySummary = {
  name: RegionalIndustryName;
  companyCount: number;
  consortiumCount: number;
  unconnectedCount: number;
};

export type RegionalNetworkSummary = {
  regionCode: string;
  regionName: string;
  latitude: number;
  longitude: number;
  totalCompanies: number;
  participatingCompanies: number;
  consortiumCount: number;
  unconnectedCompanies: number;
  supplierCompanies: number;
  processorCompanies: number;
  consumerCompanies: number;
  activeMatches: number;
  completedTransactions: number;
  industries: RegionalIndustrySummary[];
};

export type RegionalNetworkFilters = {
  regionCode: string;
  industry: RegionalIndustryName | "all";
  companyType: RegionalCompanyType | "all";
  status: NetworkParticipationStatus | "consortium" | "all";
};
