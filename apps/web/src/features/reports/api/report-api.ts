import type { ApiClient } from "../../../lib/api/index.js";
import type { Report, ReportType } from "../types/report.types.js";

export const reportApi = {
  list: (api: ApiClient, formId: string) => api.get<Report[]>(`/api/forms/${formId}/reports`),
  create: (api: ApiClient, formId: string, body: { reportType: ReportType; title?: string }) =>
    api.post<{ reportId: string; status: "generating" }, typeof body>(`/api/forms/${formId}/reports`, body),
  detail: (api: ApiClient, formId: string, reportId: string) => api.get<Report>(`/api/forms/${formId}/reports/${reportId}`),
  update: (api: ApiClient, formId: string, reportId: string, body: { title?: string; contentMarkdown?: string }) =>
    api.patch<Report, typeof body>(`/api/forms/${formId}/reports/${reportId}`, body),
  regenerate: (api: ApiClient, formId: string, reportId: string) =>
    api.post<{ reportId: string; status: "queued" }>(`/api/forms/${formId}/reports/${reportId}/regenerate`),
  exportMarkdown: (api: ApiClient, formId: string, reportId: string) =>
    api.post<{ reportId: string; format: "markdown"; contentMarkdown: string }>(`/api/forms/${formId}/reports/${reportId}/export`),
};
