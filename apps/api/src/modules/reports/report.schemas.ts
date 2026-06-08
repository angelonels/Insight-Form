import { z } from "zod";

export const reportFormParamsSchema = z.object({
  formId: z.string().uuid(),
});

export const reportParamsSchema = reportFormParamsSchema.extend({
  reportId: z.string().uuid(),
});

export const createReportBodySchema = z.object({
  reportType: z.enum(["executive_summary", "feedback_report"]),
  title: z.string().min(1).max(160).optional(),
});

export const updateReportBodySchema = z.object({
  title: z.string().min(1).max(160).optional(),
  contentMarkdown: z.string().max(100_000).optional(),
});

export const reportOutputSchema = z.object({
  title: z.string().min(1).max(160),
  contentMarkdown: z.string().min(1),
});
