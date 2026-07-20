export type ConsortiumStatus = "recommended" | "review" | "approved" | "rejected" | "waiting";

export interface Consortium {
  id: string;
  emitter: { name: string; region: string; waste: string };
  processor: { name: string; region: string };
  demander: { name: string; region: string };
  aiScore: number;
  status: ConsortiumStatus;
  expectedRoi: string;
  carbonReduction: string;
  recycling: string;
  rationale: string[];
  policy: { name: string; matched: boolean }[];
}

export const consortiums: Consortium[] = [
  {
    id: "C-2024-0142",
    emitter: { name: "포스코퓨처엠 광양", region: "전라남도 광양시", waste: "슬래그 (철강)" },
    processor: { name: "한국순환자원", region: "경상남도 창원시" },
    demander: { name: "삼표시멘트 삼척", region: "강원도 삼척시" },
    aiScore: 96,
    status: "recommended",
    expectedRoi: "18.4%",
    carbonReduction: "12,480 tCO₂e",
    recycling: "84,200 t",
    rationale: [
      "3사 물류 반경이 220km 이내로 운송비 절감이 예상됩니다.",
      "슬래그 시멘트 대체 수요가 전년 대비 22% 증가한 지역입니다.",
      "환경부 순환자원 지정 품목에 해당하여 정책 적합성이 높습니다.",
    ],
    policy: [
      { name: "산업부 자원순환 실증사업", matched: true },
      { name: "탄소중립 산업전환 지원", matched: true },
      { name: "환경부 순환경제 클러스터", matched: false },
    ],
  },
  {
    id: "C-2024-0138",
    emitter: { name: "LG화학 여수", region: "전라남도 여수시", waste: "폐플라스틱 (HDPE)" },
    processor: { name: "그린사이클", region: "충청남도 서산시" },
    demander: { name: "SK지오센트릭", region: "울산광역시" },
    aiScore: 92,
    status: "review",
    expectedRoi: "15.2%",
    carbonReduction: "9,120 tCO₂e",
    recycling: "42,800 t",
    rationale: [
      "고순도 HDPE 재생 원료 수요가 반경 300km 내에 집중되어 있습니다.",
      "SK지오센트릭 열분해유 생산 라인 증설 계획과 연계 가능합니다.",
      "AI 매칭 모델 상위 5% 신뢰도로 분류되었습니다.",
    ],
    policy: [
      { name: "산업부 자원순환 실증사업", matched: true },
      { name: "탄소중립 산업전환 지원", matched: true },
      { name: "환경부 순환경제 클러스터", matched: true },
    ],
  },
  {
    id: "C-2024-0131",
    emitter: { name: "현대제철 당진", region: "충청남도 당진시", waste: "고로 슬래그" },
    processor: { name: "동양환경산업", region: "충청남도 아산시" },
    demander: { name: "쌍용C&E 동해", region: "강원도 동해시" },
    aiScore: 89,
    status: "approved",
    expectedRoi: "14.6%",
    carbonReduction: "16,200 tCO₂e",
    recycling: "112,400 t",
    rationale: [
      "당진-동해 해상 물류 연계 시 운송비 31% 절감이 가능합니다.",
      "시멘트 대체재 활용 시 CO₂ 감축이 톤당 0.82t 예상됩니다.",
    ],
    policy: [
      { name: "산업부 자원순환 실증사업", matched: true },
      { name: "탄소중립 산업전환 지원", matched: true },
    ],
  },
  {
    id: "C-2024-0127",
    emitter: { name: "S-OIL 온산", region: "울산광역시 울주군", waste: "황산화물 촉매" },
    processor: { name: "케이알에코", region: "울산광역시" },
    demander: { name: "롯데정밀화학", region: "울산광역시" },
    aiScore: 87,
    status: "waiting",
    expectedRoi: "12.8%",
    carbonReduction: "6,320 tCO₂e",
    recycling: "18,500 t",
    rationale: [
      "울산 국가산단 내부 순환으로 운송 배출을 최소화합니다.",
      "촉매 재생 기술 특허 보유 기업 매칭이 완료되었습니다.",
    ],
    policy: [
      { name: "산업부 자원순환 실증사업", matched: true },
      { name: "환경부 순환경제 클러스터", matched: true },
    ],
  },
  {
    id: "C-2024-0119",
    emitter: { name: "삼성전자 기흥", region: "경기도 용인시", waste: "폐용매 (IPA)" },
    processor: { name: "에코솔벤트", region: "경기도 평택시" },
    demander: { name: "동진쎄미켐", region: "인천광역시" },
    aiScore: 84,
    status: "rejected",
    expectedRoi: "9.4%",
    carbonReduction: "3,140 tCO₂e",
    recycling: "12,600 t",
    rationale: [
      "반도체 공정용 IPA 재생 순도 기준 충족이 확인되었습니다.",
      "수요기업 재검토 요청에 따라 후속 매칭이 필요합니다.",
    ],
    policy: [{ name: "환경부 순환경제 클러스터", matched: true }],
  },
];

export const supportPrograms = [
  {
    id: "P-2024-014",
    name: "탄소중립 산업전환 실증 지원사업",
    ministry: "산업통상자원부",
    fit: 94,
    deadline: "2026-03-15",
    status: "접수중",
    scale: "최대 45억 원",
    target: "산업공생 컨소시엄 참여기업",
    period: "2026.03.15 – 2026.04.30",
    conditions: [
      "3개 이상 기업이 참여하는 컨소시엄",
      "탄소감축 목표 연 5,000 tCO₂e 이상",
      "실증 기간 24개월 이내 완료",
    ],
    reason:
      "본 사업은 LIUM이 추천한 컨소시엄 구성 조건과 일치도가 94%로 산정되었습니다. 특히 폐기물 재활용 전환 목표가 정책 KPI와 부합합니다.",
    summary:
      "산업 부문 탄소중립 전환을 가속하기 위한 실증형 R&D 사업으로, 폐자원 순환 및 공정 저탄소화 과제를 지원합니다.",
  },
  {
    id: "P-2024-011",
    name: "자원순환 클러스터 조성 지원",
    ministry: "환경부",
    fit: 88,
    deadline: "2026-02-28",
    status: "접수중",
    scale: "최대 22억 원",
    target: "중간처리기업 및 재활용 수요기업",
    period: "2026.02.28 – 2026.04.15",
    conditions: ["지자체 협약 체결", "폐기물 처리 실적 3년 이상"],
    reason: "지역 기반 순환자원 처리 역량 강화 목표와 매칭도가 높습니다.",
    summary: "권역별 자원순환 클러스터 조성을 통한 산업생태계 구축을 지원합니다.",
  },
  {
    id: "P-2024-008",
    name: "중소·중견 탄소감축 설비 지원",
    ministry: "산업통상자원부",
    fit: 81,
    deadline: "2026-04-10",
    status: "예정",
    scale: "최대 12억 원",
    target: "중소·중견 배출기업",
    period: "2026.04.10 – 2026.05.30",
    conditions: ["연 매출 3,000억 원 이하", "감축 계획서 제출"],
    reason: "배출기업 규모와 감축 계획 이력 기준에 부합합니다.",
    summary: "중소·중견 배출기업 대상 저탄소 설비 도입 자금을 지원합니다.",
  },
  {
    id: "P-2024-006",
    name: "순환경제 실증 R&D",
    ministry: "환경부",
    fit: 76,
    deadline: "2026-01-31",
    status: "마감임박",
    scale: "최대 8억 원",
    target: "재활용 기술 보유 중간처리기업",
    period: "2025.12.15 – 2026.01.31",
    conditions: ["재활용 기술 특허 보유", "실증 파트너 1개사 이상"],
    reason: "중간처리기업의 기술 보유 요건과 부합합니다.",
    summary: "순환경제 실증을 위한 기술 개발 및 상용화를 지원합니다.",
  },
];

export const monthlyCarbon = [
  { month: "1월", 감축: 4800, 재활용: 32000 },
  { month: "2월", 감축: 5200, 재활용: 34500 },
  { month: "3월", 감축: 6100, 재활용: 38200 },
  { month: "4월", 감축: 7400, 재활용: 41000 },
  { month: "5월", 감축: 8800, 재활용: 44800 },
  { month: "6월", 감축: 10200, 재활용: 48600 },
  { month: "7월", 감축: 11600, 재활용: 52400 },
  { month: "8월", 감축: 12800, 재활용: 55200 },
];

export const wasteMix = [
  { name: "철강 슬래그", value: 34 },
  { name: "폐플라스틱", value: 24 },
  { name: "폐용매", value: 14 },
  { name: "촉매/화학", value: 12 },
  { name: "기타", value: 16 },
];

export const regionalParticipation = [
  { region: "울산", value: 92 },
  { region: "여수", value: 84 },
  { region: "포항", value: 78 },
  { region: "당진", value: 72 },
  { region: "광양", value: 68 },
  { region: "인천", value: 54 },
  { region: "강원", value: 38 },
];

export const rejectionReasons: Record<string, { by: string; reason: string; at: string }[]> = {
  "C-2024-0138": [
    {
      by: "SK지오센트릭",
      reason:
        "열분해유 생산 라인 증설 일정이 2026년 하반기로 조정되어 즉시 원료 인수가 어렵습니다. 차년도 재검토 요청드립니다.",
      at: "2025-12-14 14:22",
    },
  ],
};

export type NotificationKind = "response" | "recommendation" | "policy" | "system";
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  at: string;
  to?: string;
  unread?: boolean;
}

export const notifications: AppNotification[] = [
  {
    id: "N-01",
    kind: "response",
    title: "기업 응답 도착",
    message: "SK지오센트릭이 C-2024-0138에 대해 거절 사유를 등록했습니다.",
    at: "방금 전",
    to: "/participation",
    unread: true,
  },
  {
    id: "N-02",
    kind: "recommendation",
    title: "AI 차순위 추천 준비 완료",
    message: "LG화학 여수 컨소시엄에 대한 대체 수요기업 3곳을 추천합니다.",
    at: "5분 전",
    to: "/consortium",
    unread: true,
  },
  {
    id: "N-03",
    kind: "policy",
    title: "정책 마감 임박",
    message: "환경부 순환경제 R&D 접수가 12일 남았습니다.",
    at: "1시간 전",
    to: "/support",
    unread: true,
  },
  {
    id: "N-04",
    kind: "system",
    title: "탄소감축 리포트 생성 완료",
    message: "12월 정책 성과 리포트가 준비되었습니다.",
    at: "어제",
    to: "/report",
  },
];

export const policyAlerts = [
  {
    tone: "danger" as const,
    title: "강원권 참여율 급감",
    message: "최근 30일 참여율이 38%로 하락했습니다. 신규 매칭 캠페인이 필요합니다.",
    at: "오늘",
  },
  {
    tone: "warning" as const,
    title: "환경부 클러스터 심사 지연",
    message: "3건이 심사 대기 상태로 평균 대기 시간이 21일을 초과했습니다.",
    at: "어제",
  },
  {
    tone: "success" as const,
    title: "울산권 실증 목표 초과 달성",
    message: "탄소감축 KPI 대비 112% 달성. 후속 실증 편성이 권고됩니다.",
    at: "3일 전",
  },
];
