import { BedrockEmbeddings } from "@langchain/aws";

import { env } from "../../shared/config/env.js";
import { AiInferenceFailedError } from "../../shared/errors/app-error.js";

export function createBedrockEmbeddingModel() {
  if (!env.BEDROCK_AWS_ACCESS_KEY_ID || !env.BEDROCK_AWS_SECRET_ACCESS_KEY) {
    throw new AiInferenceFailedError("AWS Bedrock credentials are not configured.");
  }

  return new BedrockEmbeddings({
    model: env.BEDROCK_EMBEDDING_MODEL_ID,
    region: env.BEDROCK_AWS_REGION,
    dimensions: env.BEDROCK_EMBEDDING_DIMENSIONS,
    credentials: {
      accessKeyId: env.BEDROCK_AWS_ACCESS_KEY_ID,
      secretAccessKey: env.BEDROCK_AWS_SECRET_ACCESS_KEY,
    },
  });
}
