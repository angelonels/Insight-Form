import { useMutation, useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../lib/api/query-keys.js";
import { publicFormApi, type SubmitPublicFormBody } from "../api/public-form-api.js";

export function usePublicForm(publicSlug: string) {
  return useQuery({
    queryKey: queryKeys.publicForms.detail(publicSlug),
    queryFn: () => publicFormApi.get(publicSlug),
    enabled: Boolean(publicSlug),
  });
}

export function useSubmitPublicForm(publicSlug: string) {
  return useMutation({
    mutationFn: (body: SubmitPublicFormBody) => publicFormApi.submit(publicSlug, body),
  });
}

export function useTrackPublicFormEvent(publicSlug: string) {
  return useMutation({
    mutationFn: (body: Parameters<typeof publicFormApi.trackEvent>[1]) => publicFormApi.trackEvent(publicSlug, body),
  });
}
