export function buildImproveQuestionPrompt(input: { formContext: unknown; question: unknown }) {
  return `Improve this survey question while preserving respondent intent.

Form context:
${JSON.stringify(input.formContext, null, 2)}

Question:
${JSON.stringify(input.question, null, 2)}

Return an issue, suggested neutral question text, suggested config, and explanation.`;
}
