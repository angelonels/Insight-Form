import { ConflictError } from "../../shared/errors/app-error.js";
import { AiModelConfig } from "../ai/ai-model-config.js";
import { BedrockEmbeddingGateway, type EmbeddingGateway } from "../ai/bedrock-embedding-gateway.js";
import { buildResponseEmbeddingTextChunks } from "./build-response-embedding-chunks.js";
import { ResponseAnalysisRepository } from "./response-analysis.repository.js";
import { responseAnalysisOutputSchema } from "./response-analysis.schemas.js";
import { ResponseEmbeddingRepository } from "./response-embedding.repository.js";

export class GenerateResponseEmbeddingsUseCase {
  constructor(
    private readonly analyses = new ResponseAnalysisRepository(),
    private readonly embeddings = new ResponseEmbeddingRepository(),
    private readonly embeddingGateway: EmbeddingGateway = new BedrockEmbeddingGateway(),
  ) {}

  async execute(input: { responseId: string }) {
    const { response, answers } = await this.analyses.loadResponseWithAnswers(input.responseId);
    const analysis = await this.analyses.findByResponseId(input.responseId);

    if (!analysis) {
      throw new ConflictError({
        code: "RESPONSE_ANALYSIS_REQUIRED",
        message: "Response analysis must exist before embeddings are generated.",
      });
    }

    const chunks = buildResponseEmbeddingTextChunks({
      answers,
      analysis: responseAnalysisOutputSchema.parse(analysis),
    });

    const embeddingResults = await this.embeddingGateway.embedTexts({ texts: chunks.map((chunk) => chunk.content) });

    await this.embeddings.replaceForResponse(
      response.id,
      AiModelConfig.embeddingModelId,
      chunks.map((chunk, index) => ({
        formId: response.formId,
        responseId: response.id,
        answerId: chunk.answerId,
        contentKind: chunk.contentKind,
        content: chunk.content,
        embedding: embeddingResults[index]?.embedding ?? [],
        modelProvider: embeddingResults[index]?.modelProvider ?? AiModelConfig.provider,
        modelName: embeddingResults[index]?.modelName ?? AiModelConfig.embeddingModelId,
        embeddingDimensions: embeddingResults[index]?.dimensions ?? AiModelConfig.embeddingDimensions,
      })),
    );

    return {
      responseId: response.id,
      embeddedChunks: chunks.length,
    };
  }
}
