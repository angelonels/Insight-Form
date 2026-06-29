import { apiClient } from "../../../lib/api/index.js";
import type { PublicAnswerInput, PublicFormState } from "../types/public-form.types.js";

export type SubmitPublicFormBody = {
  publishedFormId: string;
  answers: PublicAnswerInput[];
  respondentEmail?: string | null;
  completionTimeSeconds?: number | null;
  respondentFingerprint?: string | null;
  metadata?: Record<string, unknown>;
};

export const publicFormApi = {
  get: (publicSlug: string) => apiClient.get<PublicFormState>(`/api/public/forms/${publicSlug}`),
  trackEvent: (
    publicSlug: string,
    body: {
      eventType: "form_opened" | "form_started" | "section_reached" | "question_focused" | "form_submitted";
      publishedFormId?: string;
      sectionId?: string | null;
      questionId?: string | null;
      metadata?: Record<string, unknown>;
    },
  ) => apiClient.post<void, typeof body>(`/api/public/forms/${publicSlug}/events`, body),
  submit: (publicSlug: string, body: SubmitPublicFormBody) =>
    apiClient.post<{ responseId: string; message: string }, SubmitPublicFormBody>(`/api/public/forms/${publicSlug}/submit`, body),
};
