export function buildFormQualityCheckPrompt(input: { formContext: unknown }) {
  return `Review this form for quality, bias, structure, respondent burden, and clarity.

Form:
${JSON.stringify(input.formContext, null, 2)}

Return a score from 0 to 100, a short summary, and concrete issues. Mark isSafeAutoFix true only when the suggested fix changes one question without changing answer semantics.`;
}
