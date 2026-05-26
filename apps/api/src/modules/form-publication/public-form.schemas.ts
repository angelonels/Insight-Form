import { z } from "zod";

import { publicAnswerInputSchema } from "../../shared/types/form-schema.js";

export const publicSlugParamsSchema = z.object({
  publicSlug: z.string().min(1).max(120),
});

export const publicEventBodySchema = z.object({
  eventType: z.enum(["form_opened", "form_started", "section_reached", "question_focused", "form_submitted"]),
  publishedFormId: z.string().uuid().optional(),
  sectionId: z.string().uuid().nullable().optional(),
  questionId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const submitPublicResponseBodySchema = z.object({
  publishedFormId: z.string().uuid(),
  answers: z.array(publicAnswerInputSchema).max(200),
  respondentEmail: z.string().email().nullable().optional(),
  completionTimeSeconds: z.number().int().min(0).nullable().optional(),
  respondentFingerprint: z.string().max(300).nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
});
