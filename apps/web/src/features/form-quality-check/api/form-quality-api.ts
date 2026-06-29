import type { ApiClient } from "../../../lib/api/index.js";
import type { QualityCheckResult, QuestionSuggestion } from "../types/form-quality-check.types.js";

export const formQualityApi = {
  improveQuestion: (api: ApiClient, formId: string, questionId: string) =>
    api.post<QuestionSuggestion, { questionId: string }>(`/api/forms/${formId}/ai/improve-question`, { questionId }),
  runQualityCheck: (api: ApiClient, formId: string) => api.post<QualityCheckResult>(`/api/forms/${formId}/ai/quality-check`),
  applyQualityFix: (api: ApiClient, formId: string, issueId: string) =>
    api.post<{ issueId: string; status: "applied" }, { issueId: string }>(`/api/forms/${formId}/ai/apply-quality-fix`, {
      issueId,
    }),
  ignoreQualityIssue: (api: ApiClient, formId: string, issueId: string) =>
    api.post<{ issueId: string; status: "ignored" }, { issueId: string }>(`/api/forms/${formId}/ai/ignore-quality-issue`, {
      issueId,
    }),
};
