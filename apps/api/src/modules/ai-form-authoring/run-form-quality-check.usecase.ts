import { AiModelConfig } from "../ai/ai-model-config.js";
import { PromptVersions } from "../ai/ai-prompt-registry.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { FormRepository } from "../forms/form.repository.js";
import { FormQualityCheckRepository } from "./form-quality-check.repository.js";
import { runFormQualityCheckGraph } from "./graphs/form-quality-check.graph.js";

export class RunFormQualityCheckUseCase {
  constructor(
    private readonly forms = new FormRepository(),
    private readonly qualityChecks = new FormQualityCheckRepository(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { userId: string; formId: string }) {
    const form = await this.forms.getDetail(input.formId, input.userId);
    const output = await runFormQualityCheckGraph({ form, ai: this.ai });

    return this.qualityChecks.saveCompleted({
      formId: input.formId,
      output,
      modelProvider: AiModelConfig.provider,
      modelName: AiModelConfig.chatModelId("large"),
      promptVersion: PromptVersions.FormQualityCheck,
    });
  }
}
