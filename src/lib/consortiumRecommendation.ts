export type ConsortiumRecommendationAction = "held" | "sent";

export type ConsortiumRecommendationRecord = {
  action: ConsortiumRecommendationAction;
  updatedAt: string;
};

const STORAGE_KEY = "reum-consortium-recommendations";

export function getConsortiumRecommendation(
  consortiumId: string,
): ConsortiumRecommendationRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const records = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      ConsortiumRecommendationRecord
    >;
    return records[consortiumId] ?? null;
  } catch {
    return null;
  }
}

export function saveConsortiumRecommendation(
  consortiumId: string,
  action: ConsortiumRecommendationAction,
): ConsortiumRecommendationRecord {
  const record = { action, updatedAt: new Date().toISOString() };

  if (typeof window !== "undefined") {
    let records: Record<string, ConsortiumRecommendationRecord> = {};
    try {
      records = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
        string,
        ConsortiumRecommendationRecord
      >;
    } catch {
      records = {};
    }

    records[consortiumId] = record;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  return record;
}
