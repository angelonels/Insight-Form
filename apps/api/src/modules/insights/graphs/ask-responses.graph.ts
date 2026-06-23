import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { EmbeddingGateway } from "../../ai/bedrock-embedding-gateway.js";
import type { AiChatGateway } from "../../ai/langchain-model-factory.js";
import type { ResponseEvidenceRepository } from "../../response-analysis/response-evidence.repository.js";
import { askResponsesOutputSchema } from "../insights.schemas.js";
import { buildAnswerQuestionAboutResponsesPrompt } from "../prompts/answer-question-about-responses.prompt.js";

type EvidenceRow = Record<string, unknown>;

const AskResponsesAnnotation = Annotation.Root({
  formId: Annotation<string>(),
  question: Annotation<string>(),
  embedding: Annotation<number[] | undefined>(),
  evidence: Annotation<EvidenceRow[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  answer: Annotation<string | undefined>(),
});

export async function runAskResponsesGraph(input: {
  formId: string;
  question: string;
  evidence: ResponseEvidenceRepository;
  embeddings: EmbeddingGateway;
  ai: AiChatGateway;
}) {
  const graph = new StateGraph(AskResponsesAnnotation)
    .addNode("retrieve_response_evidence", async (state) => {
      const question = state.question.trim();
      const result = await input.embeddings.embedText({ text: question });
      const rows = await input.evidence.findRelevant(state.formId, result.embedding, 12);
      return {
        question,
        embedding: result.embedding,
        evidence: Array.isArray(rows) ? (rows as EvidenceRow[]) : [],
      };
    })
    .addNode("generate_grounded_answer", async (state) => {
      if (!state.evidence.length) {
        return { answer: "I could not find enough response evidence to support that conclusion." };
      }

      const output = await input.ai.generateStructuredOutput({
        system: "Answer questions about survey responses using only the supplied evidence.",
        prompt: buildAnswerQuestionAboutResponsesPrompt({
          question: state.question,
          evidence: state.evidence,
        }),
        schema: askResponsesOutputSchema,
        schemaName: "answer_about_responses",
        modelProfile: "large",
      });
      return { answer: output.answer };
    })
    .addNode("enforce_evidence_fallback", async (state) => ({
      answer: state.evidence.length
        ? state.answer
        : "I could not find enough response evidence to support that conclusion.",
    }))
    .addEdge(START, "retrieve_response_evidence")
    .addEdge("retrieve_response_evidence", "generate_grounded_answer")
    .addEdge("generate_grounded_answer", "enforce_evidence_fallback")
    .addEdge("enforce_evidence_fallback", END)
    .compile();

  const result = await graph.invoke({ formId: input.formId, question: input.question });
  return {
    answer:
      result.answer ?? "I could not find enough response evidence to support that conclusion.",
    evidence: result.evidence,
  };
}
