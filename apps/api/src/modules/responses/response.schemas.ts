import { z } from "zod";

export const responseParamsSchema = z.object({
  formId: z.string().uuid(),
  responseId: z.string().uuid(),
});

export const responseFormParamsSchema = z.object({
  formId: z.string().uuid(),
});
