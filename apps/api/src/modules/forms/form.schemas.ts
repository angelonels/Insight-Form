import { z } from "zod";

import { editableFormDraftSchema, editableQuestionSchema, editableSectionSchema } from "../../shared/types/form-schema.js";

export const formIdParamsSchema = z.object({
  formId: z.string().uuid(),
});

export const sectionParamsSchema = formIdParamsSchema.extend({
  sectionId: z.string().uuid(),
});

export const questionParamsSchema = formIdParamsSchema.extend({
  questionId: z.string().uuid(),
});

export const createFormBodySchema = z.object({
  title: z.string().min(1).max(120).default("Untitled form"),
  description: z.string().max(1000).nullable().optional(),
});

export const updateFormMetadataBodySchema = createFormBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});

export const updateDraftBodySchema = editableFormDraftSchema;

export const addSectionBodySchema = editableSectionSchema.omit({ id: true, questions: true }).partial({
  position: true,
});

export const updateSectionBodySchema = editableSectionSchema.omit({ id: true, questions: true }).partial();

export const reorderSectionsBodySchema = z.object({
  sectionIds: z.array(z.string().uuid()).min(1),
});

export const addQuestionBodySchema = editableQuestionSchema.omit({ id: true }).partial({
  position: true,
});

export const updateQuestionBodySchema = editableQuestionSchema.omit({ id: true }).partial();

export const reorderQuestionsBodySchema = z.object({
  sectionId: z.string().uuid(),
  questionIds: z.array(z.string().uuid()).min(1),
});
