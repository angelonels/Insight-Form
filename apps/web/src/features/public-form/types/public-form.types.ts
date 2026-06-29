export type { PublicAnswerInput, PublicFormState } from "@insightform/shared";

import type { FormQuestion } from "@insightform/shared";

export type PublicAnswerMap = Record<string, unknown>;

export type PublicQuestionProps = {
  error?: string;
  onChange: (value: unknown) => void;
  onFocus?: () => void;
  question: FormQuestion & { id: string };
  value: unknown;
};
