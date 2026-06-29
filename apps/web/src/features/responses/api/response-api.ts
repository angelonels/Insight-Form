import type { ApiClient } from "../../../lib/api/index.js";
import type { ResponseCard, ResponseDetail } from "../types/response.types.js";

export const responseApi = {
  list: (api: ApiClient, formId: string) => api.get<ResponseCard[]>(`/api/forms/${formId}/responses`),
  detail: (api: ApiClient, formId: string, responseId: string) =>
    api.get<ResponseDetail>(`/api/forms/${formId}/responses/${responseId}`),
  regenerateAnalysis: (api: ApiClient, formId: string, responseId: string) =>
    api.post<{ responseId: string; status: "queued" }>(`/api/forms/${formId}/responses/${responseId}/regenerate-analysis`),
};
