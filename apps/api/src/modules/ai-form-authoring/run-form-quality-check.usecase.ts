import { AiModelConfig } from "../ai/ai-model-config.js";
import { PromptVersions } from "../ai/ai-prompt-registry.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { FormModule } from "../forms/form.module.js";
import { qualityCheckOutputSchema } from "./ai-form-authoring.schemas.js";
import { FormQualityCheckRepository } from "./form-quality-check.repository.js";
import { buildFormQualityCheckPrompt } from "./prompts/form-quality-check.prompt.js";

export class RunFormQualityCheckUseCase {
  constructor(
    private readonly forms = new FormModule(),
    private readonly qualityChecks = new FormQualityCheckRepository(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { userId: string; formId: string }) {
    const form = await this.forms.getDetail(input.formId, input.userId);
    const output = await this.ai.generateStructuredOutput({
      system:
        "You run an InsightForm Quality Check. Be specific, grounded in the Form Draft, and conservative with automatic fixes.",
      prompt: buildFormQualityCheckPrompt({ formContext: form }),
      schema: qualityCheckOutputSchema,
      schemaName: "form_quality_check",
      modelProfile: "large",
    });

    return this.qualityChecks.saveCompleted({
      formId: input.formId,
      output,
      modelProvider: AiModelConfig.provider,
      modelName: AiModelConfig.chatModelId("large"),
      promptVersion: PromptVersions.FormQualityCheck,
    });
  }
}
