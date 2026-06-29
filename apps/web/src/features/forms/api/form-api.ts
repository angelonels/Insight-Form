import type { ApiClient } from "../../../lib/api/index.js";
import type { EditableFormDraft, FormCard, FormDetail, PublishResult } from "../types/form.types.js";

export const formApi = {
  list: (api: ApiClient) => api.get<FormCard[]>("/api/forms"),
  createBlank: (api: ApiClient, body: { title: string; description?: string | null }) =>
    api.post<FormDetail, typeof body>("/api/forms", body),
  detail: (api: ApiClient, formId: string) => api.get<FormDetail>(`/api/forms/${formId}`),
  updateMetadata: (api: ApiClient, formId: string, body: { title?: string; description?: string | null }) =>
    api.patch<FormCard, typeof body>(`/api/forms/${formId}`, body),
  replaceDraft: (
    api: ApiClient,
    formId: string,
    body: { draft: EditableFormDraft; expectedDraftVersion: number },
  ) => api.put<FormDetail, typeof body>(`/api/forms/${formId}/draft`, body),
  delete: (api: ApiClient, formId: string) => api.delete<void>(`/api/forms/${formId}`),
  publish: (api: ApiClient, formId: string) => api.post<PublishResult>(`/api/forms/${formId}/publish`),
  close: (api: ApiClient, formId: string) => api.post<FormCard>(`/api/forms/${formId}/close`),
};
