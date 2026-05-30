import type { z } from "zod";

import { AiInferenceFailedError, AiOutputValidationError } from "../../shared/errors/app-error.js";
import { parseAiJsonOutput } from "./ai-json-output-parser.js";
import type { AiModelProfile } from "./ai-model-config.js";
import { createBedrockChatModel } from "./bedrock-chat-model.js";

export type GenerateStructuredOutputInput<TSchema extends z.ZodTypeAny> = {
  system: string;
  prompt: string;
  schema: TSchema;
  modelProfile?: AiModelProfile;
  modelId?: string;
};

export type GenerateTextInput = {
  system: string;
  prompt: string;
  modelProfile?: AiModelProfile;
  modelId?: string;
};

export interface AiChatGateway {
  generateStructuredOutput<TSchema extends z.ZodTypeAny>(input: GenerateStructuredOutputInput<TSchema>): Promise<z.infer<TSchema>>;
  generateText(input: GenerateTextInput): Promise<{ text: string }>;
}

function extractTextContent(message: unknown) {
  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
  }

  return "";
}

export class LangChainBedrockChatGateway implements AiChatGateway {
  async generateStructuredOutput<TSchema extends z.ZodTypeAny>(input: GenerateStructuredOutputInput<TSchema>) {
    const result = await this.generateText({
      system: input.system,
      prompt: `${input.prompt}\n\nReturn only valid JSON matching the requested schema.`,
      modelProfile: input.modelProfile,
      modelId: input.modelId,
    });
    try {
      return parseAiJsonOutput(result.text, input.schema);
    } catch (error) {
      if (!(error instanceof AiOutputValidationError)) {
        throw error;
      }

      const repaired = await this.generateText({
        system: input.system,
        prompt: `The previous response was invalid JSON or did not match the schema.

Original task:
${input.prompt}

Invalid response:
${result.text}

Return only corrected valid JSON. Do not include Markdown fences.`,
        modelProfile: input.modelProfile,
        modelId: input.modelId,
      });
      return parseAiJsonOutput(repaired.text, input.schema);
    }
  }

  async generateText(input: GenerateTextInput) {
    try {
      const model = createBedrockChatModel({
        modelProfile: input.modelProfile,
        modelId: input.modelId,
      });
      const response = await model.invoke([
        ["system", input.system],
        ["human", input.prompt],
      ]);
      return { text: extractTextContent(response) };
    } catch (error) {
      if (error instanceof AiInferenceFailedError) {
        throw error;
      }
      throw new AiInferenceFailedError("AI inference failed.", error);
    }
  }
}
