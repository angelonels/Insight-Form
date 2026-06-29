import { useMutation } from "@tanstack/react-query";

import { useAuthenticatedApiClient } from "../../../lib/api/use-api-client.js";
import { aiFormCreationApi, type GenerateFormDraftInput } from "../api/ai-form-creation-api.js";

export function useGenerateFormDraft() {
  const api = useAuthenticatedApiClient();
  return useMutation({
    mutationFn: (body: GenerateFormDraftInput) => aiFormCreationApi.generateDraft(api, body),
  });
}

export function useAcceptGeneratedDraft() {
  const api = useAuthenticatedApiClient();
  return useMutation({
    mutationFn: (draftId: string) => aiFormCreationApi.acceptDraft(api, draftId),
  });
}
