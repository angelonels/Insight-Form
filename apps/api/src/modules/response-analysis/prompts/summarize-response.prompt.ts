import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildSummarizeResponsePrompt(input: { answers: unknown[] }) {
  return buildStructuredTaskPrompt({
    task: "Analyze this submitted Form Response.",
    context: [{ label: "Answers", value: input.answers }],
    rules: [
      "Stay grounded in the submitted answers.",
      "Keep the summary concise and identify follow-up only when evidence supports it.",
    ],
  });
}
