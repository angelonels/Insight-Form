import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("postgres://insightform:insightform@localhost:5432/insightform"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required").default("redis://localhost:6379"),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_JWT_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  BEDROCK_AWS_REGION: z.string().optional(),
  BEDROCK_AWS_ACCESS_KEY_ID: z.string().optional(),
  BEDROCK_AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_DEFAULT_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  BEDROCK_CHAT_MODEL_ID: z.string().optional(),
  BEDROCK_SMALL_CHAT_MODEL_ID: z.string().optional(),
  BEDROCK_LARGE_CHAT_MODEL_ID: z.string().optional(),
  BEDROCK_SMALL_CHAT_MAX_TOKENS: z.coerce.number().int().positive().default(1024),
  BEDROCK_LARGE_CHAT_MAX_TOKENS: z.coerce.number().int().positive().default(4096),
  BEDROCK_EMBEDDING_MODEL_ID: z.string().default("amazon.titan-embed-text-v2:0"),
  BEDROCK_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1024),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  PUBLIC_APP_URL: z.string().url().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
});

const parsedEnv = envSchema.parse(process.env);
const smallChatModelId = parsedEnv.BEDROCK_SMALL_CHAT_MODEL_ID ?? parsedEnv.BEDROCK_CHAT_MODEL_ID ?? "meta.llama3-8b-instruct-v1:0";
const largeChatModelId = parsedEnv.BEDROCK_LARGE_CHAT_MODEL_ID ?? "moonshotai.kimi-k2.5";

export const env = {
  ...parsedEnv,
  CLERK_PUBLISHABLE_KEY:
    parsedEnv.CLERK_PUBLISHABLE_KEY ?? parsedEnv.VITE_CLERK_PUBLISHABLE_KEY ?? parsedEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  BEDROCK_AWS_REGION: parsedEnv.BEDROCK_AWS_REGION ?? parsedEnv.AWS_DEFAULT_REGION ?? "ap-south-1",
  BEDROCK_AWS_ACCESS_KEY_ID: parsedEnv.BEDROCK_AWS_ACCESS_KEY_ID ?? parsedEnv.AWS_ACCESS_KEY_ID,
  BEDROCK_AWS_SECRET_ACCESS_KEY: parsedEnv.BEDROCK_AWS_SECRET_ACCESS_KEY ?? parsedEnv.AWS_SECRET_ACCESS_KEY,
  BEDROCK_CHAT_MODEL_ID: parsedEnv.BEDROCK_CHAT_MODEL_ID ?? smallChatModelId,
  BEDROCK_SMALL_CHAT_MODEL_ID: smallChatModelId,
  BEDROCK_LARGE_CHAT_MODEL_ID: largeChatModelId,
};

export const corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
