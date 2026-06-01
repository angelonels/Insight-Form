import { z } from "zod";

import { editableFormDraftSchema, questionConfigSchema, questionTypeSchema } from "../../shared/types/form-schema.js";

export const generatedFormDraftOutputSchema = editableFormDraftSchema.extend({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
});

export const generateFormDraftBodySchema = z.object({
  prompt: z.string().min(10).max(4_000),
  guidedOptions: z.record(z.unknown()).default({}),
});

export const generatedDraftParamsSchema = z.object({
  draftId: z.string().uuid(),
});

export const formAiParamsSchema = z.object({
  formId: z.string().uuid(),
});

export const improveQuestionBodySchema = z.object({
  questionId: z.string().uuid(),
});

export const improveQuestionOutputSchema = z.object({
  issue: z.string().min(1).max(1000),
  suggestedQuestionText: z.string().min(1).max(500),
  suggestedConfig: questionConfigSchema.default({}),
  explanation: z.string().min(1).max(1500),
});

export const qualityIssueOutputSchema = z.object({
  sectionId: z.string().uuid().nullable().optional(),
  questionId: z.string().uuid().nullable().optional(),
  severity: z.enum(["high", "medium", "low"]),
  issueType: z.string().min(1).max(100),
  problem: z.string().min(1).max(1000),
  whyItMatters: z.string().min(1).max(1000),
  suggestedFix: z
    .object({
      questionText: z.string().max(500).optional(),
      helpText: z.string().max(500).nullable().optional(),
      type: questionTypeSchema.optional(),
      config: questionConfigSchema.optional(),
    })
    .partial()
    .nullable()
    .optional(),
  isSafeAutoFix: z.boolean().default(false),
});

export const qualityCheckOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(1).max(1500),
  issues: z.array(qualityIssueOutputSchema).max(100),
});

export const qualityIssueParamsSchema = formAiParamsSchema.extend({
  issueId: z.string().uuid().optional(),
});

export const qualityIssueBodySchema = z.object({
  issueId: z.string().uuid(),
});
