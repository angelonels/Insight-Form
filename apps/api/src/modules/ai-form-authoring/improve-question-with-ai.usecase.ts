import { NotFoundError } from "../../shared/errors/app-error.js";
import { FormRepository } from "../forms/form.repository.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { improveQuestionOutputSchema } from "./ai-form-authoring.schemas.js";
import { buildImproveQuestionPrompt } from "./prompts/improve-question.prompt.js";

export class ImproveQuestionWithAiUseCase {
  constructor(
    private readonly forms = new FormRepository(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { userId: string; formId: string; questionId: string }) {
    const form = await this.forms.getDetail(input.formId, input.userId);
    const question = form.sections.flatMap((section) => section.questions).find((item) => item.id === input.questionId);

    if (!question) {
      throw new NotFoundError({ code: "QUESTION_NOT_FOUND", message: "Question not found." });
    }

    return this.ai.generateStructuredOutput({
      system: "You improve survey questions with neutral wording, clear answer options, and no unsupported assumptions.",
      prompt: buildImproveQuestionPrompt({
        formContext: form,
        question,
      }),
      schema: improveQuestionOutputSchema,
      modelProfile: "small",
    });
  }
}
