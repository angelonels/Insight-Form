import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../lib/api/query-keys.js";
import { useAuthenticatedApiClient } from "../../../lib/api/use-api-client.js";
import { reportApi } from "../api/report-api.js";
import type { ReportType } from "../types/report.types.js";

export function useReportList(formId: string) {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.reports.list(formId),
    queryFn: () => reportApi.list(api, formId),
    enabled: Boolean(formId),
    refetchInterval: (query) => (query.state.data?.some((report) => report.status === "generating") ? 4_000 : false),
  });
}

export function useReportDetail(formId: string, reportId: string) {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.reports.detail(formId, reportId),
    queryFn: () => reportApi.detail(api, formId, reportId),
    enabled: Boolean(formId && reportId),
    refetchInterval: (query) => (query.state.data?.status === "generating" ? 4_000 : false),
  });
}

export function useCreateReport(formId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { reportType: ReportType; title?: string }) => reportApi.create(api, formId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.list(formId) });
    },
  });
}

export function useUpdateReport(formId: string, reportId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { title?: string; contentMarkdown?: string }) => reportApi.update(api, formId, reportId, body),
    onSuccess: (report) => {
      queryClient.setQueryData(queryKeys.reports.detail(formId, reportId), report);
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.list(formId) });
    },
  });
}

export function useRegenerateReport(formId: string, reportId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reportApi.regenerate(api, formId, reportId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(formId, reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.list(formId) });
    },
  });
}

export function useExportReport(formId: string, reportId: string) {
  const api = useAuthenticatedApiClient();
  return useMutation({
    mutationFn: () => reportApi.exportMarkdown(api, formId, reportId),
  });
}
