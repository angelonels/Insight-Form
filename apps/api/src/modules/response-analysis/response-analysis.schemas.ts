import { z } from "zod";

export const responseAnalysisOutputSchema = z.object({
  summary: z.string().min(1).max(2000),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
  topics: z.array(z.string().min(1).max(100)).max(20).default([]),
  painPoints: z.array(z.string().min(1).max(300)).max(20).default([]),
  featureRequests: z.array(z.string().min(1).max(300)).max(20).default([]),
  followUpNeeded: z.boolean().default(false),
  followUpReason: z.string().max(1000).nullable().optional(),
});
