import { ChatBedrockConverse } from "@langchain/aws";

import { env } from "../../shared/config/env.js";
import { AiInferenceFailedError } from "../../shared/errors/app-error.js";
import { AiModelConfig, type AiModelProfile } from "./ai-model-config.js";

export function createBedrockChatModel(input: { modelProfile?: AiModelProfile; modelId?: string } = {}) {
  if (!env.BEDROCK_AWS_ACCESS_KEY_ID || !env.BEDROCK_AWS_SECRET_ACCESS_KEY) {
    throw new AiInferenceFailedError("AWS Bedrock credentials are not configured.");
  }

  return new ChatBedrockConverse({
    model: input.modelId ?? AiModelConfig.chatModelId(input.modelProfile),
    region: env.BEDROCK_AWS_REGION,
    temperature: 0.2,
    maxTokens: AiModelConfig.chatMaxTokens(input.modelProfile),
    credentials: {
      accessKeyId: env.BEDROCK_AWS_ACCESS_KEY_ID,
      secretAccessKey: env.BEDROCK_AWS_SECRET_ACCESS_KEY,
    },
  });
}
