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

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(200),
});

export const questionConfigSchema = z
  .object({
    placeholder: z.string().max(500).optional(),
    options: z.array(questionOptionSchema).max(50).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minLabel: z.string().max(120).optional(),
    maxLabel: z.string().max(120).optional(),
  })
  .passthrough();

export const editableFormQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  questionText: z.string().min(1, "Add question text.").max(500),
  helpText: z.string().max(500).nullable().optional(),
  type: questionTypeSchema,
  isRequired: z.boolean().default(false),
  position: z.number().int().min(1),
  config: questionConfigSchema.default({}),
});

export const editableFormSectionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Add a section title.").max(120),
  description: z.string().max(1000).nullable().optional(),
  position: z.number().int().min(1),
  questions: z.array(editableFormQuestionSchema).max(50).default([]),
});

export const editableFormDraftSchema = z.object({
  title: z.string().min(1, "Add a form title.").max(120),
  description: z.string().max(1000).nullable().optional(),
  sections: z.array(editableFormSectionSchema).min(1, "Add at least one section.").max(20),
});
