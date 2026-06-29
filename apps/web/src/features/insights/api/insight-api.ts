import type { ApiClient } from "../../../lib/api/index.js";
import type { AskAiAnswer, DropoffAnalytics, InsightSnapshot } from "../types/insight.types.js";

export const insightApi = {
  get: (api: ApiClient, formId: string) => api.get<InsightSnapshot>(`/api/forms/${formId}/insights`),
  generate: (api: ApiClient, formId: string) => api.post<{ formId: string; status: "queued" }>(`/api/forms/${formId}/insights/generate`),
  ask: (api: ApiClient, formId: string, question: string) =>
    api.post<AskAiAnswer, { question: string }>(`/api/forms/${formId}/insights/ask`, { question }),
  dropoff: (api: ApiClient, formId: string) => api.get<DropoffAnalytics>(`/api/forms/${formId}/analytics/dropoff`),
};
