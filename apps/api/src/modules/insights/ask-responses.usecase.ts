import { FormOwnership } from "../forms/form-ownership.js";
import { ResponseEvidenceRepository } from "../response-analysis/response-evidence.repository.js";
import { BedrockEmbeddingGateway, type EmbeddingGateway } from "../ai/bedrock-embedding-gateway.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { runAskResponsesGraph } from "./graphs/ask-responses.graph.js";

export class AskResponsesUseCase {
  constructor(
    private readonly ownership = new FormOwnership(),
    private readonly evidence = new ResponseEvidenceRepository(),
    private readonly embeddings: EmbeddingGateway = new BedrockEmbeddingGateway(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { formId: string; userId: string; question: string }) {
    await this.ownership.requireOwner(input.formId, input.userId);
    return runAskResponsesGraph({
      formId: input.formId,
      question: input.question,
      evidence: this.evidence,
      embeddings: this.embeddings,
      ai: this.ai,
    });
  }
}
