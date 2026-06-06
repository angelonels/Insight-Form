export function buildGenerateKeyFindingsPrompt(input: { metrics: unknown; analyses: unknown[] }) {
  return `Generate grounded survey insight findings from these metrics and response analyses.

Metrics:
${JSON.stringify(input.metrics, null, 2)}

Analyses:
${JSON.stringify(input.analyses, null, 2)}

Return key findings and recommended actions only when supported by the evidence.`;
}
