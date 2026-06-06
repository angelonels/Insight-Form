import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { EmbeddingGateway } from "../../ai/bedrock-embedding-gateway.js";
import type { AiChatGateway } from "../../ai/langchain-model-factory.js";
import type { FormRepository } from "../../forms/form.repository.js";
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
  forms: FormRepository;
  embeddings: EmbeddingGateway;
  ai: AiChatGateway;
}) {
  const graph = new StateGraph(AskResponsesAnnotation)
    .addNode("validate_question", async (state) => ({ question: state.question.trim() }))
    .addNode("embed_question", async (state) => {
      const result = await input.embeddings.embedText({ text: state.question });
      return { embedding: result.embedding };
    })
    .addNode("retrieve_relevant_response_chunks", async (state) => {
      const rows = state.embedding ? await input.forms.vectorSearch(state.formId, state.embedding, 12) : [];
      return { evidence: Array.isArray(rows) ? (rows as EvidenceRow[]) : [] };
    })
    .addNode("load_linked_responses", async (state) => ({ evidence: state.evidence }))
    .addNode("calculate_supporting_counts", async (state) => ({ evidence: state.evidence }))
    .addNode("generate_grounded_answer", async (state) => {
      if (!state.evidence.length) {
        return { answer: "I could not find enough response evidence to support that conclusion." };
      }

      const output = await input.ai.generateStructuredOutput({
        system: "Answer questions about survey responses using only the supplied evidence.",
        prompt: buildAnswerQuestionAboutResponsesPrompt({ question: state.question, evidence: state.evidence }),
        schema: askResponsesOutputSchema,
        modelProfile: "large",
      });
      return { answer: output.answer };
    })
    .addNode("validate_answer_has_evidence", async (state) => ({
      answer: state.evidence.length ? state.answer : "I could not find enough response evidence to support that conclusion.",
    }))
    .addEdge(START, "validate_question")
    .addEdge("validate_question", "embed_question")
    .addEdge("embed_question", "retrieve_relevant_response_chunks")
    .addEdge("retrieve_relevant_response_chunks", "load_linked_responses")
    .addEdge("load_linked_responses", "calculate_supporting_counts")
    .addEdge("calculate_supporting_counts", "generate_grounded_answer")
    .addEdge("generate_grounded_answer", "validate_answer_has_evidence")
    .addEdge("validate_answer_has_evidence", END)
    .compile();

  const result = await graph.invoke({ formId: input.formId, question: input.question });
  return {
    answer: result.answer ?? "I could not find enough response evidence to support that conclusion.",
    evidence: result.evidence,
  };
}
