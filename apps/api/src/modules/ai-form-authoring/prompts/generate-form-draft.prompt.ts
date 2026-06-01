export function buildGenerateFormDraftPrompt(input: { prompt: string; guidedOptions: Record<string, unknown> }) {
  return `Create an InsightForm survey draft from this brief.

Brief:
${input.prompt}

Guided options:
${JSON.stringify(input.guidedOptions, null, 2)}

Requirements:
- 8 to 12 questions.
- 2 to 4 sections.
- Use a mix of rating_scale, multiple_choice, checkbox, short_answer, and long_answer where appropriate.
- Keep wording neutral and concise.
- Include options for choice questions.
- Use positions starting at 1 within each section.`;
}
