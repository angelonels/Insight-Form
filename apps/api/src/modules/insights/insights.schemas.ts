import { z } from "zod";

export const insightsFormParamsSchema = z.object({
  formId: z.string().uuid(),
});

export const askResponsesBodySchema = z.object({
  question: z.string().min(3).max(1000),
});

export const insightAiOutputSchema = z.object({
  keyFindings: z.array(z.object({ title: z.string(), summary: z.string(), evidenceCount: z.number().int().min(0) })).default([]),
  recommendedActions: z.array(z.object({ title: z.string(), rationale: z.string(), priority: z.enum(["high", "medium", "low"]) })).default([]),
});

export const askResponsesOutputSchema = z.object({
  answer: z.string().min(1),
});
