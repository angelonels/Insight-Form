import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildGenerateExecutiveSummaryReportPrompt(input: {
  insight: unknown;
  clusters: unknown[];
}) {
  return buildStructuredTaskPrompt({
    task: "Generate an executive summary report in Markdown from this InsightForm insight snapshot.",
    context: [
      { label: "Insight snapshot", value: input.insight },
      { label: "Response clusters", value: input.clusters },
    ],
    rules: [
      "Include sections named Response overview, Key findings, Recommended actions, and Evidence notes.",
    ],
  });
}
