import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildGenerateFeedbackReportPrompt(input: {
  insight: unknown;
  clusters: unknown[];
}) {
  return buildStructuredTaskPrompt({
    task: "Generate a product or event feedback report in Markdown from this InsightForm insight snapshot.",
    context: [
      { label: "Insight snapshot", value: input.insight },
      { label: "Response clusters", value: input.clusters },
    ],
    rules: [
      "Include sections named Response overview, Sentiment summary, Themes and evidence, and Recommended actions.",
    ],
  });
}
