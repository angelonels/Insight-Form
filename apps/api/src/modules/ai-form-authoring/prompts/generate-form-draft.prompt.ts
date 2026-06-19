import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildGenerateFormDraftPrompt(input: {
  prompt: string;
  guidedOptions: Record<string, unknown>;
}) {
  return buildStructuredTaskPrompt({
    task: "Create an InsightForm survey draft from this brief.",
    context: [
      { label: "Brief", value: input.prompt },
      { label: "Guided options", value: input.guidedOptions },
    ],
    rules: [
      "Create a normal user-facing form, not a technical schema explanation.",
      "Use 8 to 12 total questions across 2 to 4 sections.",
      "Use a useful mix of supported question types where appropriate.",
      "Keep wording neutral, concise, and easy for a respondent to answer.",
      "Use section and question positions starting at 1 with no gaps.",
      "Do not include database ids; the server creates ids later.",
      "Choice questions must include 2 to 7 clear, non-overlapping options with stable lowercase ids.",
      "Rating scales should prefer 1 to 5 unless the brief clearly needs another scale.",
      "Ask one thing per question and require an answer only when it is necessary for analysis.",
    ],
  });
}
