import { FormRepository } from "../forms/form.repository.js";
import { BedrockEmbeddingGateway, type EmbeddingGateway } from "../ai/bedrock-embedding-gateway.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { runAskResponsesGraph } from "./graphs/ask-responses.graph.js";

export class AskResponsesUseCase {
  constructor(
    private readonly forms = new FormRepository(),
    private readonly embeddings: EmbeddingGateway = new BedrockEmbeddingGateway(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { formId: string; userId: string; question: string }) {
    await this.forms.getOwnedForm(input.formId, input.userId);
    return runAskResponsesGraph({
      formId: input.formId,
      question: input.question,
      forms: this.forms,
      embeddings: this.embeddings,
      ai: this.ai,
    });
  }
}
