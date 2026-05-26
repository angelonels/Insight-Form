import { z } from "zod";

import { ValidationError } from "../../shared/errors/app-error.js";
import type { PublicAnswerInput, PublishedFormSchema, PublishedQuestion } from "../../shared/types/form-schema.js";

export type NormalizedAnswer = {
  questionId: string;
  questionText: string;
  questionType: string;
  answer: Record<string, unknown>;
};

const textTypes = new Set(["short_answer", "long_answer", "email"]);
const optionTypes = new Set(["multiple_choice", "dropdown"]);

function hasValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

function getOptions(question: PublishedQuestion) {
  return question.config.options ?? [];
}

function normalizeAnswer(question: PublishedQuestion, value: unknown): Record<string, unknown> {
  if (textTypes.has(question.type)) {
    if (typeof value !== "string") {
      throw new Error("Expected text answer.");
    }

    const limit = question.type === "long_answer" ? 5_000 : 500;
    if (value.length > limit) {
      throw new Error(`Answer must be at most ${limit} characters.`);
    }

    if (question.type === "email") {
      z.string().email().parse(value);
    }

    return { value };
  }

  if (question.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("Expected numeric answer.");
    }

    return { value };
  }

  if (question.type === "rating_scale") {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new Error("Expected rating answer.");
    }

    const min = typeof question.config.min === "number" ? question.config.min : 1;
    const max = typeof question.config.max === "number" ? question.config.max : 5;
    if (value < min || value > max) {
      throw new Error(`Rating must be between ${min} and ${max}.`);
    }

    return { value };
  }

  if (optionTypes.has(question.type)) {
    if (typeof value !== "string") {
      throw new Error("Expected selected option id.");
    }

    const option = getOptions(question).find((item) => item.id === value);
    if (!option) {
      throw new Error("Selected option does not exist.");
    }

    return {
      selectedOptionId: option.id,
      selectedOptionLabel: option.label,
    };
  }

  if (question.type === "checkbox") {
    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
      throw new Error("Expected selected option ids.");
    }

    const options = getOptions(question);
    const selectedOptions = value.map((optionId) => {
      const option = options.find((item) => item.id === optionId);
      if (!option) {
        throw new Error("Selected option does not exist.");
      }
      return option;
    });

    return {
      selectedOptionIds: selectedOptions.map((option) => option.id),
      selectedOptionLabels: selectedOptions.map((option) => option.label),
    };
  }

  throw new Error("Unsupported question type.");
}

export function validatePublicAnswers(schema: PublishedFormSchema, answers: PublicAnswerInput[]): NormalizedAnswer[] {
  const questions = schema.sections.flatMap((section) => section.questions);
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const answerByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const normalized: NormalizedAnswer[] = [];

  for (const answer of answers) {
    if (!questionById.has(answer.questionId)) {
      throw new ValidationError({
        code: "INVALID_RESPONSE_ANSWER",
        message: "Cannot submit answer for an unknown question.",
        details: { questionId: answer.questionId },
      });
    }
  }

  for (const question of questions) {
    const answer = answerByQuestionId.get(question.id);

    if (!answer || !hasValue(answer.value)) {
      if (question.isRequired) {
        throw new ValidationError({
          code: "INVALID_RESPONSE_ANSWER",
          message: "Required question is missing an answer.",
          details: { questionId: question.id },
        });
      }

      continue;
    }

    try {
      normalized.push({
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.type,
        answer: normalizeAnswer(question, answer.value),
      });
    } catch (error) {
      throw new ValidationError({
        code: "INVALID_RESPONSE_ANSWER",
        message: error instanceof Error ? error.message : "Invalid answer.",
        details: { questionId: question.id },
      });
    }
  }

  return normalized;
}
