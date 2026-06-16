import { z } from "zod";
import {
  editableFormDraftSchema,
  editableFormQuestionSchema,
  editableFormSectionSchema,
  questionConfigSchema,
  questionOptionSchema,
  questionTypeSchema,
} from "@insightform/shared";
import type {
  EditableFormDraft as SharedEditableFormDraft,
  PublishedFormSchema as SharedPublishedFormSchema,
  PublicAnswerInput as SharedPublicAnswerInput,
  QuestionType as SharedQuestionType,
} from "@insightform/shared";

export type QuestionType = SharedQuestionType;

export const optionSchema = questionOptionSchema;
export const editableQuestionSchema = editableFormQuestionSchema;
export const editableSectionSchema = editableFormSectionSchema;
export {
  editableFormDraftSchema,
  questionConfigSchema,
  questionTypeSchema,
};

export const publishedQuestionSchema = editableQuestionSchema.extend({
  id: z.string().uuid(),
});

export const publishedSectionSchema = editableSectionSchema.extend({
  id: z.string().uuid(),
  questions: z.array(publishedQuestionSchema).max(50),
});

export const publishedFormSchema = z.object({
  formId: z.string().uuid(),
  version: z.number().int().min(1),
  title: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  sections: z.array(publishedSectionSchema).min(1).max(20),
});

export type EditableFormDraft = SharedEditableFormDraft;
export type PublishedFormSchema = SharedPublishedFormSchema;
export type PublishedQuestion = z.infer<typeof publishedQuestionSchema>;

export const publicAnswerInputSchema = z.object({
  questionId: z.string().uuid(),
  value: z.unknown(),
});

export type PublicAnswerInput = SharedPublicAnswerInput;
