import { AiModelConfig } from "../ai/ai-model-config.js";
import { PromptVersions } from "../ai/ai-prompt-registry.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { generatedFormDraftOutputSchema } from "./ai-form-authoring.schemas.js";
import { GeneratedFormDraftRepository } from "./generated-form-draft.repository.js";
import { buildGenerateFormDraftPrompt } from "./prompts/generate-form-draft.prompt.js";

export class GenerateFormDraftWithAiUseCase {
  constructor(
    private readonly drafts = new GeneratedFormDraftRepository(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { userId: string; prompt: string; guidedOptions: Record<string, unknown> }) {
    const generatedSchema = await this.ai.generateStructuredOutput({
      system:
        "You are a senior survey designer for InsightForm. Produce neutral, useful, respondent-friendly forms.",
      prompt: buildGenerateFormDraftPrompt(input),
      schema: generatedFormDraftOutputSchema,
      schemaName: "generated_form_draft",
      modelProfile: "large",
    });

    const draft = await this.drafts.create({
      userId: input.userId,
      prompt: input.prompt,
      guidedOptions: input.guidedOptions,
      generatedSchema,
      modelProvider: AiModelConfig.provider,
      modelName: AiModelConfig.chatModelId("large"),
      promptVersion: PromptVersions.GenerateFormDraft,
    });

    return {
      generatedDraftId: draft.id,
      schema: generatedSchema,
    };
  }
}
