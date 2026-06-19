import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildFormQualityCheckPrompt(input: { formContext: unknown }) {
  return buildStructuredTaskPrompt({
    task: "Review this form for quality, bias, structure, respondent burden, and clarity.",
    context: [{ label: "Form", value: input.formContext }],
    rules: [
      "Do not invent issues just to fill the list.",
      "Prefer actionable wording fixes over vague criticism.",
      "Keep copy respondent-friendly and non-technical.",
      "Mark isSafeAutoFix true only when a small question patch preserves answer semantics.",
    ],
  });
}
