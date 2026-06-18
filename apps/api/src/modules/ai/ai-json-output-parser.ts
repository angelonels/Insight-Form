import type { z } from "zod";

import { AiOutputValidationError } from "../../shared/errors/app-error.js";

function stripMarkdownFence(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function findBalancedJsonCandidate(text: string) {
  const source = stripMarkdownFence(text);
  const objectStart = source.indexOf("{");
  const arrayStart = source.indexOf("[");
  const start =
    objectStart < 0
      ? arrayStart
      : arrayStart < 0
        ? objectStart
        : Math.min(objectStart, arrayStart);

  if (start < 0) {
    return source;
  }

  const opening = source[start];
  const closing = opening === "{" ? "}" : "]";
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{" || char === "[") {
      stack.push(char);
      continue;
    }

    if (char === "}" || char === "]") {
      const expectedOpening = char === "}" ? "{" : "[";
      if (stack.at(-1) !== expectedOpening) {
        return source;
      }

      stack.pop();

      if (stack.length === 0 && char === closing) {
        return source.slice(start, index + 1);
      }
    }
  }

  return source;
}

export function parseAiJsonOutput<TSchema extends z.ZodTypeAny>(text: string, schema: TSchema): z.infer<TSchema> {
  try {
    return schema.parse(JSON.parse(findBalancedJsonCandidate(text)));
  } catch (error) {
    throw new AiOutputValidationError("AI returned invalid structured output.", error);
  }
}
