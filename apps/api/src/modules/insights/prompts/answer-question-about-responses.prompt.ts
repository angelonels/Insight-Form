export function buildAnswerQuestionAboutResponsesPrompt(input: { question: string; evidence: unknown[] }) {
  return `Answer this user question using only the supplied response evidence.

Question:
${input.question}

Evidence:
${JSON.stringify(input.evidence, null, 2)}

If the evidence is insufficient, say: I could not find enough response evidence to support that conclusion.`;
}
