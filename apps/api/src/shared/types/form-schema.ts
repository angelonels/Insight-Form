import { z } from "zod";

export const questionTypeSchema = z.enum([
  "short_answer",
  "long_answer",
  "email",
  "number",
  "multiple_choice",
  "checkbox",
  "dropdown",
  "rating_scale",
]);

export type QuestionType = z.infer<typeof questionTypeSchema>;

export const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(200),
});

export const questionConfigSchema = z
  .object({
    placeholder: z.string().max(500).optional(),
    options: z.array(optionSchema).max(50).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minLabel: z.string().max(120).optional(),
    maxLabel: z.string().max(120).optional(),
  })
  .passthrough();

export const editableQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  questionText: z.string().min(1).max(500),
  helpText: z.string().max(500).nullable().optional(),
  type: questionTypeSchema,
  isRequired: z.boolean().default(false),
  position: z.number().int().min(1),
  config: questionConfigSchema.default({}),
});

export const editableSectionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  position: z.number().int().min(1),
  questions: z.array(editableQuestionSchema).max(50).default([]),
});

export const editableFormDraftSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  sections: z.array(editableSectionSchema).min(1).max(20),
});

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

export type EditableFormDraft = z.infer<typeof editableFormDraftSchema>;
export type PublishedFormSchema = z.infer<typeof publishedFormSchema>;
export type PublishedQuestion = z.infer<typeof publishedQuestionSchema>;

export const publicAnswerInputSchema = z.object({
  questionId: z.string().uuid(),
  value: z.unknown(),
});

export type PublicAnswerInput = z.infer<typeof publicAnswerInputSchema>;
