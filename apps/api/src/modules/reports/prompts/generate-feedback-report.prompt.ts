export function buildGenerateFeedbackReportPrompt(input: { insight: unknown; clusters: unknown[] }) {
  return `Generate a product or event feedback report in Markdown from this InsightForm insight snapshot.

Insight:
${JSON.stringify(input.insight, null, 2)}

Clusters:
${JSON.stringify(input.clusters, null, 2)}

Required sections:
- Response overview
- Sentiment summary
- Themes and evidence
- Recommended actions`;
}
