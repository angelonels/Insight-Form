import type { z } from "zod";

import { AiOutputValidationError } from "../../shared/errors/app-error.js";

function stripMarkdownFence(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

export function parseAiJsonOutput<TSchema extends z.ZodTypeAny>(text: string, schema: TSchema): z.infer<TSchema> {
  try {
    return schema.parse(JSON.parse(stripMarkdownFence(text)));
  } catch (error) {
    throw new AiOutputValidationError("AI returned invalid structured output.", error);
  }
}
