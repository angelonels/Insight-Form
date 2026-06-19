import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildImproveQuestionPrompt(input: { formContext: unknown; question: unknown }) {
  return buildStructuredTaskPrompt({
    task: "Improve this survey question while preserving respondent intent.",
    context: [
      { label: "Form context", value: input.formContext },
      { label: "Question", value: input.question },
    ],
    rules: [
      "Preserve the original question's intent.",
      "Use neutral wording and avoid assumptions.",
      "Keep answer options clear and respondent-friendly.",
      "Do not change the question type unless the current type prevents a good answer.",
    ],
  });
}
