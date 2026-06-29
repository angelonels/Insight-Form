import type { ApiClient } from "../../../lib/api/index.js";
import type { GeneratedFormDraftResult } from "../../forms/types/form.types.js";

export type GenerateFormDraftInput = {
  prompt: string;
  guidedOptions: Record<string, unknown>;
};

export const aiFormCreationApi = {
  generateDraft: (api: ApiClient, body: GenerateFormDraftInput) =>
    api.post<GeneratedFormDraftResult, GenerateFormDraftInput>("/api/ai/form-drafts/generate", body),
  acceptDraft: (api: ApiClient, draftId: string) => api.post<{ formId: string }>(`/api/ai/form-drafts/${draftId}/accept`),
};
