import type { z } from "zod";
import { toJsonSchema } from "@langchain/core/utils/json_schema";

import { AiInferenceFailedError, AiOutputValidationError } from "../../shared/errors/app-error.js";
import { parseAiJsonOutput } from "./ai-json-output-parser.js";
import type { AiModelProfile } from "./ai-model-config.js";
import { createBedrockChatModel } from "./bedrock-chat-model.js";

export type GenerateStructuredOutputInput<TSchema extends z.ZodTypeAny> = {
  system: string;
  prompt: string;
  schema: TSchema;
  schemaName?: string;
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

type BedrockChatModel = ReturnType<typeof createBedrockChatModel>;

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
  constructor(private readonly modelFactory: typeof createBedrockChatModel = createBedrockChatModel) {}

  async generateStructuredOutput<TSchema extends z.ZodTypeAny>(input: GenerateStructuredOutputInput<TSchema>) {
    try {
      const model = this.modelFactory({
        modelProfile: input.modelProfile,
        modelId: input.modelId,
      });

      return await this.generateWithNativeStructuredOutput(model, input);
    } catch (error) {
      if (error instanceof AiInferenceFailedError) {
        throw error;
      }
    }

    return this.generateWithTextRepair(input);
  }

  async generateText(input: GenerateTextInput) {
    try {
      const model = this.modelFactory({
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

  private async generateWithNativeStructuredOutput<TSchema extends z.ZodTypeAny>(
    model: BedrockChatModel,
    input: GenerateStructuredOutputInput<TSchema>,
  ) {
    const structuredModel = model.withStructuredOutput(input.schema, {
      name: input.schemaName ?? "insightform_structured_output",
    });

    const output = await structuredModel.invoke([
      ["system", input.system],
      ["human", input.prompt],
    ]);

    return input.schema.parse(output);
  }

  private async generateWithTextRepair<TSchema extends z.ZodTypeAny>(input: GenerateStructuredOutputInput<TSchema>) {
    const result = await this.generateText({
      system: input.system,
      prompt: buildJsonOnlyPrompt(input),
      modelProfile: input.modelProfile,
      modelId: input.modelId,
    });

    try {
      return parseAiJsonOutput(result.text, input.schema);
    } catch (error) {
      if (!(error instanceof AiOutputValidationError)) {
        throw error;
      }

      let lastError: unknown = error;

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const repaired = await this.generateText({
          system: input.system,
          prompt: `The previous response was invalid JSON or did not match the schema.

Original task:
${input.prompt}

Expected JSON schema:
${describeSchema(input.schema)}

Invalid response:
${result.text}

Return exactly one corrected JSON value. Do not include Markdown fences, explanation, comments, or trailing text.`,
          modelProfile: input.modelProfile,
          modelId: input.modelId,
        });

        try {
          return parseAiJsonOutput(repaired.text, input.schema);
        } catch (repairError) {
          lastError = repairError;
        }
      }

      throw lastError;
    }
  }
}

function buildJsonOnlyPrompt<TSchema extends z.ZodTypeAny>(input: GenerateStructuredOutputInput<TSchema>) {
  return `${input.prompt}

Return exactly one JSON value matching this schema. Do not include Markdown fences, explanation, comments, or trailing text.

Expected JSON schema:
${describeSchema(input.schema)}`;
}

function describeSchema(schema: z.ZodTypeAny) {
  try {
    return JSON.stringify(toJsonSchema(schema), null, 2);
  } catch {
    return "The output must satisfy the server-provided Zod schema.";
  }
}
