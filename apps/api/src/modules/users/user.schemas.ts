import { z } from "zod";

export const syncCurrentUserBodySchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().max(200).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});
