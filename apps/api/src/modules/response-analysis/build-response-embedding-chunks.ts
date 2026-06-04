import type { ResponseAnalysisOutput } from "./response-analysis.repository.js";

export type RawAnswerForEmbedding = {
  id: string;
  questionType: string;
  questionText: string;
  answer: unknown;
};

export type ResponseTextChunk = {
  answerId?: string | null;
  contentKind: "long_answer" | "response_summary" | "pain_point" | "feature_request";
  content: string;
};

function readAnswerValue(answer: unknown) {
  if (!answer || typeof answer !== "object" || !("value" in answer)) {
    return undefined;
  }

  const value = answer.value;
  return typeof value === "string" ? value : undefined;
}

export function buildResponseEmbeddingTextChunks(input: {
  answers: RawAnswerForEmbedding[];
  analysis: ResponseAnalysisOutput;
}): ResponseTextChunk[] {
  const chunks: ResponseTextChunk[] = [];

  for (const answer of input.answers) {
    const value = readAnswerValue(answer.answer);
    if (answer.questionType === "long_answer" && value && value.trim().length > 0) {
      chunks.push({
        answerId: answer.id,
        contentKind: "long_answer",
        content: `${answer.questionText}\n${value}`,
      });
    }
  }

  chunks.push({
    contentKind: "response_summary",
    content: input.analysis.summary,
  });

  for (const painPoint of input.analysis.painPoints) {
    chunks.push({
      contentKind: "pain_point",
      content: painPoint,
    });
  }

  for (const featureRequest of input.analysis.featureRequests) {
    chunks.push({
      contentKind: "feature_request",
      content: featureRequest,
    });
  }

  return chunks;
}
