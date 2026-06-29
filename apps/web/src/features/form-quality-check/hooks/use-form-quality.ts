import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../lib/api/query-keys.js";
import { useAuthenticatedApiClient } from "../../../lib/api/use-api-client.js";
import { formQualityApi } from "../api/form-quality-api.js";

export function useImproveQuestion(formId: string) {
  const api = useAuthenticatedApiClient();
  return useMutation({
    mutationFn: (questionId: string) => formQualityApi.improveQuestion(api, formId, questionId),
  });
}

export function useRunQualityCheck(formId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => formQualityApi.runQualityCheck(api, formId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.list });
    },
  });
}
