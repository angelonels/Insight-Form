import { env } from "../../shared/config/env.js";

export const AiModelProfiles = {
  Small: "small",
  Large: "large",
} as const;

export type AiModelProfile = (typeof AiModelProfiles)[keyof typeof AiModelProfiles];

const chatModels = {
  [AiModelProfiles.Small]: env.BEDROCK_SMALL_CHAT_MODEL_ID,
  [AiModelProfiles.Large]: env.BEDROCK_LARGE_CHAT_MODEL_ID,
} as const;

const maxTokens = {
  [AiModelProfiles.Small]: env.BEDROCK_SMALL_CHAT_MAX_TOKENS,
  [AiModelProfiles.Large]: env.BEDROCK_LARGE_CHAT_MAX_TOKENS,
} as const;

export const AiModelConfig = {
  provider: "aws-bedrock",
  defaultChatModelId: env.BEDROCK_CHAT_MODEL_ID,
  chatModels,
  maxTokens,
  chatModelId: (profile: AiModelProfile = AiModelProfiles.Small) => chatModels[profile],
  chatMaxTokens: (profile: AiModelProfile = AiModelProfiles.Small) => maxTokens[profile],
  embeddingModelId: env.BEDROCK_EMBEDDING_MODEL_ID,
  embeddingDimensions: env.BEDROCK_EMBEDDING_DIMENSIONS,
  region: env.BEDROCK_AWS_REGION,
} as const;
