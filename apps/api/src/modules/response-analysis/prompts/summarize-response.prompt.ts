export function buildSummarizeResponsePrompt(input: { answers: unknown[] }) {
  return `Analyze this submitted form response.

Answers:
${JSON.stringify(input.answers, null, 2)}

Return a concise summary, sentiment, topics, pain points, feature requests, and whether follow-up is needed.`;
}
