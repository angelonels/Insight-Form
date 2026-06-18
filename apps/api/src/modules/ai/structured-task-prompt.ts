type StructuredTaskPromptInput = {
  task: string;
  context: Array<{ label: string; value: unknown }>;
  rules?: string[];
};

export function buildStructuredTaskPrompt(input: StructuredTaskPromptInput) {
  const context = input.context
    .map(
      ({ label, value }) =>
        `${label}:\n${typeof value === "string" ? value : JSON.stringify(value, null, 2)}`,
    )
    .join("\n\n");
  const rules = input.rules?.length
    ? `\n\nRules:\n${input.rules.map((rule) => `- ${rule}`).join("\n")}`
    : "";

  return `${input.task}\n\n${context}${rules}`;
}
