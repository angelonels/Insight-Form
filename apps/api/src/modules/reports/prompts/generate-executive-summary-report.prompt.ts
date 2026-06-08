export function buildGenerateExecutiveSummaryReportPrompt(input: { insight: unknown; clusters: unknown[] }) {
  return `Generate an executive summary report in Markdown from this InsightForm insight snapshot.

Insight:
${JSON.stringify(input.insight, null, 2)}

Clusters:
${JSON.stringify(input.clusters, null, 2)}

Required sections:
- Response overview
- Key findings
- Recommended actions
- Evidence notes`;
}
