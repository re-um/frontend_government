export const policyOptions = ["전체 정책", "자원순환 실증", "탄소중립 산업전환", "순환경제 클러스터"] as const;
export const policyPeriods = ["이번 분기", "최근 6개월", "올해", "지난 1년"] as const;
export const policyRegions = ["전체", "울산", "여수", "포항", "당진", "광양", "강원"] as const;

export const policyProjects = [
  { name: "산업부 자원순환 실증사업", key: "자원순환 실증", stage: "운영중", progress: 72 },
  { name: "탄소중립 산업전환 지원", key: "탄소중립 산업전환", stage: "접수중", progress: 34 },
  { name: "환경부 순환경제 클러스터", key: "순환경제 클러스터", stage: "심사중", progress: 58 },
  { name: "중소·중견 감축 설비 지원", key: "기타", stage: "예정", progress: 8 },
];

const baseParticipation = [
  { region: "울산", value: 92 },
  { region: "여수", value: 84 },
  { region: "포항", value: 78 },
  { region: "당진", value: 72 },
  { region: "광양", value: 68 },
  { region: "강원", value: 38 },
];

export function calculatePolicyPerformance(policy: string, period: string, region: string) {
  const periodFactor =
    period === "이번 분기" ? 0.28 : period === "최근 6개월" ? 0.52 : period === "올해" ? 0.78 : 1;
  const regionIndex = policyRegions.indexOf(region as (typeof policyRegions)[number]);
  const regionFactor = region === "전체" ? 1 : 0.1 + Math.max(0, regionIndex - 1) * 0.012;
  const policyFactor = policy === "전체 정책" ? 1 : 0.27;
  const projects = (policy === "전체 정책"
    ? policyProjects
    : policyProjects.filter((project) => project.key === policy)
  ).map((project) => ({
    ...project,
    progress: Math.min(100, Math.round(project.progress * (0.76 + periodFactor * 0.24))),
  }));
  const operatingPolicies = policy === "전체 정책" ? Math.max(4, Math.round(12 * periodFactor)) : 1;
  const participants = Math.max(1, Math.round(1284 * periodFactor * regionFactor * policyFactor));
  const executionRate = Math.min(
    96,
    55 + periodFactor * 13.4 + (region === "전체" ? 0 : regionIndex * 1.8) +
      (policy === "전체 정책" ? 0 : 3.2),
  );
  const budget = Math.max(1, Math.round(1842 * periodFactor * regionFactor * policyFactor));
  const regionalParticipation = baseParticipation
    .filter((item) => region === "전체" || item.region === region)
    .map((item, index) => ({
      ...item,
      value: Math.min(100, Math.round(item.value * (0.82 + periodFactor * 0.18) + (policy === "전체 정책" ? 0 : index + 2))),
    }));
  const scope = `${policy} · ${period} · ${region === "전체" ? "전 지역" : region}`;
  const executionGap = Math.max(0, 100 - executionRate);
  const policyActions: Record<string, string> = {
    "전체 정책": "진행률이 낮은 중소·중견 감축 설비 지원사업에 전담 점검반을 배정하고 사업 간 잔여 예산을 재조정해야 합니다.",
    "자원순환 실증": "실증 종료 전에 재생원료 품질인증과 장기 수요처 계약을 병행해 사업화 전환 지연을 막아야 합니다.",
    "탄소중립 산업전환": "설비투자 증빙 검토를 단축하고 집행이 느린 참여기업에는 단계별 보조금 지급 일정을 다시 제시해야 합니다.",
    "순환경제 클러스터": "지자체 협약과 입주기업 심사를 병렬로 진행하고 21일을 초과한 심사 대기 건을 우선 처리해야 합니다.",
  };
  const regionActions: Record<string, string> = {
    전체: "강원·광양 권역을 우선관리 대상으로 지정해 권역 간 참여율 격차를 줄이는 조치가 필요합니다.",
    울산: "목표를 초과한 실증 과제를 후속 상용화 사업으로 전환하고 수요기업을 추가 확보하는 것이 효과적입니다.",
    여수: "석유화학단지 내 공동 수거체계를 확대하고 울산 수요처와의 광역 물류 연계를 검토해야 합니다.",
    포항: "재생원료 품질 편차를 줄이기 위한 공동 선별·검사 설비 지원을 우선 편성해야 합니다.",
    당진: "산단 내 소규모 배출기업을 묶는 공동 회수 계약을 도입해 최소 공급물량을 확보해야 합니다.",
    광양: "처리기업 대비 수요기업이 부족하므로 재생원료 구매 확약 기업을 추가 모집해야 합니다.",
    강원: "참여율이 가장 낮아 찾아가는 기업 설명회와 초기 운송비 보조를 결합한 신규 모집이 필요합니다.",
  };
  const periodActions: Record<string, string> = {
    "이번 분기": "이번 분기 내 담당기관·완료일·점검지표를 확정해야 합니다.",
    "최근 6개월": "최근 6개월의 중간평가 결과를 다음 교부금 지급 조건에 반영해야 합니다.",
    올해: "연말 불용액 발생 전 집행계획을 재승인하고 성과 미달 과제의 예산을 조정해야 합니다.",
    "지난 1년": "연간 성과평가를 토대로 차년도 공고의 지원요건과 권역별 배분 기준을 개편해야 합니다.",
  };
  const insights = [
    `${scope} 기준 참여기업은 ${participants.toLocaleString()}개사이며 집행률은 ${executionRate.toFixed(1)}%입니다.`,
    `예산 ${budget.toLocaleString()}억 원이 집행되어 계획 대비 안정적인 추진 흐름을 보이고 있습니다.`,
    `${policyActions[policy]} ${regionActions[region]} 현재 미집행 격차는 ${executionGap.toFixed(1)}%p입니다. ${periodActions[period]}`,
  ];
  return { projects, operatingPolicies, participants, executionRate, budget, regionalParticipation, scope, insights };
}
