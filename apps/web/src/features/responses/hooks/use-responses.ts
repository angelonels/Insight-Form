import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, type ResponseFilters } from "../../../lib/api/query-keys.js";
import { useAuthenticatedApiClient } from "../../../lib/api/use-api-client.js";
import { responseApi } from "../api/response-api.js";
import type { ResponseCard, ResponseDetail } from "../types/response.types.js";

export function useResponseList(formId: string, filters: ResponseFilters = {}) {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.responses.list(formId, filters),
    queryFn: async () => {
      const responses = await responseApi.list(api, formId);
      return responses.filter((response) => {
        if (filters.sentiment && response.sentiment !== filters.sentiment) {
          return false;
        }

        if (filters.followUpNeeded && !response.followUpNeeded) {
          return false;
        }

        return true;
      });
    },
    refetchInterval: (query) => {
      const responses = query.state.data as ResponseCard[] | undefined;
      return responses?.some((response) => response.summary == null) ? 5_000 : false;
    },
    enabled: Boolean(formId),
  });
}

export function useResponseDetail(formId: string, responseId: string) {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.responses.detail(formId, responseId),
    queryFn: () => responseApi.detail(api, formId, responseId),
    refetchInterval: (query) => {
      const response = query.state.data as ResponseDetail | undefined;
      return response && !response.analysis ? 3_000 : false;
    },
    enabled: Boolean(formId && responseId),
  });
}

export function useRegenerateResponseAnalysis(formId: string, responseId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => responseApi.regenerateAnalysis(api, formId, responseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.responses.detail(formId, responseId) });
      void queryClient.invalidateQueries({ queryKey: ["forms", formId, "responses"] });
    },
  });
}
