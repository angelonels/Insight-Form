export type {
  EditableFormDraft,
  FormCard,
  FormDetail,
  FormQuestion,
  FormSection,
  FormStatus,
  GeneratedFormDraftResult,
  InsightStatus,
  PublishResult,
  QualityStatus,
  QuestionConfig,
  QuestionOption,
  QuestionType,
} from "@insightform/shared";

import type { QuestionType } from "@insightform/shared";

export const questionTypeLabels: Record<QuestionType, string> = {
  short_answer: "Short answer",
  long_answer: "Long answer",
  email: "Email",
  number: "Number",
  multiple_choice: "Multiple choice",
  checkbox: "Checkboxes",
  dropdown: "Dropdown",
  rating_scale: "Rating scale",
};

export const questionTypes: QuestionType[] = [
  "short_answer",
  "long_answer",
  "email",
  "number",
  "multiple_choice",
  "checkbox",
  "dropdown",
  "rating_scale",
];
