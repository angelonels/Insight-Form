import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../lib/api/query-keys.js";
import { useAuthenticatedApiClient } from "../../../lib/api/use-api-client.js";
import { insightApi } from "../api/insight-api.js";
import type { InsightSnapshot } from "../types/insight.types.js";

export function useInsights(formId: string) {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.insights.detail(formId),
    queryFn: () => insightApi.get(api, formId),
    enabled: Boolean(formId),
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 4_000 : false),
  });
}

export function useDropoffAnalytics(formId: string) {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.insights.dropoff(formId),
    queryFn: () => insightApi.dropoff(api, formId),
    enabled: Boolean(formId),
  });
}

export function useGenerateInsights(formId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => insightApi.generate(api, formId),
    onMutate: async () => {
      const detailKey = queryKeys.insights.detail(formId);
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previous = queryClient.getQueryData<InsightSnapshot>(detailKey);
      queryClient.setQueryData<InsightSnapshot>(detailKey, (current) =>
        current
          ? { ...current, status: "processing" }
          : {
              id: `processing-${formId}`,
              formId,
              status: "processing",
              totalResponses: 0,
              sentimentBreakdown: {},
              overviewMetrics: {},
              questionMetrics: [],
              keyFindings: [],
              recommendedActions: [],
              dropoffSummary: {},
              generatedAt: null,
              clusters: [],
            },
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.insights.detail(formId), context.previous);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.insights.detail(formId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    },
  });
}

export function useAskResponses(formId: string) {
  const api = useAuthenticatedApiClient();
  return useMutation({
    mutationFn: (question: string) => insightApi.ask(api, formId, question),
  });
}
