import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildGenerateKeyFindingsPrompt(input: { metrics: unknown; analyses: unknown[] }) {
  return buildStructuredTaskPrompt({
    task: "Generate grounded survey insight findings and recommended actions.",
    context: [
      { label: "Metrics", value: input.metrics },
      { label: "Response analyses", value: input.analyses },
    ],
    rules: [
      "Only include claims supported by the supplied analyses.",
      "evidenceCount must approximate the number of analyses supporting each finding.",
      "Use plain product language, not analytics jargon.",
      "Prefer specific actions over vague advice.",
      "If evidence is thin, return fewer findings instead of guessing.",
    ],
  });
}
