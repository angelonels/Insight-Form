import { AiModelConfig } from "../ai/ai-model-config.js";
import { PromptVersions } from "../ai/ai-prompt-registry.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { enqueueGenerateResponseEmbeddings } from "../jobs/enqueue-response-analysis.js";
import { buildSummarizeResponsePrompt } from "./prompts/summarize-response.prompt.js";
import { ResponseAnalysisRepository } from "./response-analysis.repository.js";
import { responseAnalysisOutputSchema } from "./response-analysis.schemas.js";

export class AnalyzeSubmittedResponseUseCase {
  constructor(
    private readonly repository = new ResponseAnalysisRepository(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { responseId: string }) {
    const { response, answers } = await this.repository.loadResponseWithAnswers(input.responseId);
    const output = await this.ai.generateStructuredOutput({
      system: "You analyze survey responses for InsightForm. Stay grounded in submitted answers.",
      prompt: buildSummarizeResponsePrompt({ answers }),
      schema: responseAnalysisOutputSchema,
      schemaName: "response_analysis",
      modelProfile: "small",
    });

    const analysis = await this.repository.upsert({
      responseId: response.id,
      formId: response.formId,
      output,
      modelProvider: AiModelConfig.provider,
      modelName: AiModelConfig.chatModelId("small"),
      promptVersion: PromptVersions.SummarizeResponse,
    });

    await enqueueGenerateResponseEmbeddings(response.id);
    return analysis;
  }
}
