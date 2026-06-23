import { buildStructuredTaskPrompt } from "../../ai/structured-task-prompt.js";

export function buildAnswerQuestionAboutResponsesPrompt(input: {
  question: string;
  evidence: unknown[];
}) {
  return buildStructuredTaskPrompt({
    task: "Answer this user question using only the supplied response evidence.",
    context: [
      { label: "Question", value: input.question },
      { label: "Evidence", value: input.evidence },
    ],
    rules: [
      "Use only the supplied evidence.",
      "Mention uncertainty when evidence is limited.",
      "Do not name internal ids, embeddings, chunks, vectors, retrieval, or model behavior.",
      "If evidence is insufficient, answer exactly: I could not find enough response evidence to support that conclusion.",
    ],
  });
}
