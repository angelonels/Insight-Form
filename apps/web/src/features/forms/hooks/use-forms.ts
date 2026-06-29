import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../lib/api/query-keys.js";
import { useAuthenticatedApiClient } from "../../../lib/api/use-api-client.js";
import type { EditableFormDraft } from "../types/form.types.js";
import { formApi } from "../api/form-api.js";

export function useFormList() {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.forms.list,
    queryFn: () => formApi.list(api),
  });
}

export function useFormDetail(formId: string) {
  const api = useAuthenticatedApiClient();
  return useQuery({
    queryKey: queryKeys.forms.detail(formId),
    queryFn: () => formApi.detail(api, formId),
    enabled: Boolean(formId),
  });
}

export function useCreateBlankForm() {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { title: string; description?: string | null }) => formApi.createBlank(api, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
}

export function useSaveFormDraft(formId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { draft: EditableFormDraft; expectedDraftVersion: number }) =>
      formApi.replaceDraft(api, formId, body),
    onSuccess: (form) => {
      queryClient.setQueryData(queryKeys.forms.detail(formId), form);
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.list });
    },
  });
}

export function usePublishForm(formId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => formApi.publish(api, formId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    },
  });
}

export function useCloseForm(formId: string) {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => formApi.close(api, formId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    },
  });
}
