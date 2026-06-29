export type { QualityCheckResult, QualityIssue } from "@insightform/shared";

import type { QuestionConfig } from "@insightform/shared";

export type QuestionSuggestion = {
  issue: string;
  suggestedQuestionText: string;
  suggestedConfig: QuestionConfig;
  explanation: string;
};
