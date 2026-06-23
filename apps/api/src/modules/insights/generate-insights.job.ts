import { AiModelConfig } from "../ai/ai-model-config.js";
import { PromptVersions } from "../ai/ai-prompt-registry.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { createResponseClustersFromAnalyses } from "./create-response-clusters.usecase.js";
import { insightAiOutputSchema } from "./insights.schemas.js";
import { InsightRepository } from "./insight.repository.js";
import { buildGenerateKeyFindingsPrompt } from "./prompts/generate-key-findings.prompt.js";

export class GenerateInsightsJob {
  constructor(
    private readonly insights = new InsightRepository(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { formId: string }) {
    const metrics = await this.insights.calculateDeterministicMetrics(input.formId);
    const analyses = await this.insights.listAnalyses(input.formId);
    const clusters = createResponseClustersFromAnalyses(
      analyses.map((analysis) => ({
        responseId: analysis.responseId,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        topics: analysis.topics,
      })),
    );
    const aiOutput = analyses.length
      ? await this.ai.generateStructuredOutput({
          system: "You generate evidence-backed InsightForm findings. Avoid unsupported claims.",
          prompt: buildGenerateKeyFindingsPrompt({ metrics, analyses }),
          schema: insightAiOutputSchema,
          schemaName: "insight_findings",
          modelProfile: "large",
        })
      : { keyFindings: [], recommendedActions: [] };

    return this.insights.saveReadySnapshot({
      formId: input.formId,
      totalResponses: metrics.totalResponses,
      sentimentBreakdown: metrics.sentimentBreakdown,
      overviewMetrics: metrics.overviewMetrics,
      questionMetrics: metrics.questionMetrics,
      keyFindings: aiOutput.keyFindings,
      recommendedActions: aiOutput.recommendedActions,
      dropoffSummary: metrics.dropoffSummary,
      clusters,
      modelProvider: analyses.length ? AiModelConfig.provider : undefined,
      modelName: analyses.length ? AiModelConfig.chatModelId("large") : undefined,
      promptVersion: analyses.length ? PromptVersions.GenerateKeyFindings : undefined,
    });
  }
}
