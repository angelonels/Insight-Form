import type { EditableFormDraft } from "../../shared/types/form-schema.js";

export type FormStatus = "draft" | "published" | "closed";
export type QualityStatus = "not_checked" | "passed" | "needs_review";
export type InsightStatus = "not_ready" | "processing" | "ready" | "failed";

export type Form = {
  id: string;
  ownerUserId: string;
  title: string;
  description: string | null;
  status: FormStatus;
  qualityStatus: QualityStatus;
  insightStatus: InsightStatus;
  isDemo: boolean;
  currentDraftVersion: number;
  latestPublishedVersion: number | null;
  publicSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  closedAt: Date | null;
};

export type FormDetail = Form & EditableFormDraft;
