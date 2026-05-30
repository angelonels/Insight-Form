import { AiInferenceFailedError } from "../../shared/errors/app-error.js";
import { AiModelConfig } from "./ai-model-config.js";
import { createBedrockEmbeddingModel } from "./bedrock-embedding-model.js";

export type EmbeddingResult = {
  embedding: number[];
  modelProvider: string;
  modelName: string;
  dimensions: number;
};

export interface EmbeddingGateway {
  embedText(input: { text: string }): Promise<EmbeddingResult>;
  embedTexts(input: { texts: string[] }): Promise<EmbeddingResult[]>;
}

export class BedrockEmbeddingGateway implements EmbeddingGateway {
  async embedText(input: { text: string }) {
    try {
      const model = createBedrockEmbeddingModel();
      const embedding = await model.embedQuery(input.text);
      return {
        embedding,
        modelProvider: AiModelConfig.provider,
        modelName: AiModelConfig.embeddingModelId,
        dimensions: embedding.length,
      };
    } catch (error) {
      if (error instanceof AiInferenceFailedError) {
        throw error;
      }
      throw new AiInferenceFailedError("Embedding generation failed.", error);
    }
  }

  async embedTexts(input: { texts: string[] }) {
    try {
      const model = createBedrockEmbeddingModel();
      const embeddings = await model.embedDocuments(input.texts);
      return embeddings.map((embedding) => ({
        embedding,
        modelProvider: AiModelConfig.provider,
        modelName: AiModelConfig.embeddingModelId,
        dimensions: embedding.length,
      }));
    } catch (error) {
      if (error instanceof AiInferenceFailedError) {
        throw error;
      }
      throw new AiInferenceFailedError("Embedding generation failed.", error);
    }
  }
}
