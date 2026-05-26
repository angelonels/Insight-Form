import type { Form, FormDetail } from "./form.entity.js";

export function mapFormCard(
  form: Form & {
    responseCount?: number;
    completionRate?: number | null;
    lastResponseAt?: Date | null;
  },
) {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status,
    qualityStatus: form.qualityStatus,
    insightStatus: form.insightStatus,
    isDemo: form.isDemo,
    responseCount: form.responseCount ?? 0,
    completionRate: form.completionRate ?? null,
    lastResponseAt: form.lastResponseAt?.toISOString() ?? null,
    publicSlug: form.publicSlug,
    updatedAt: form.updatedAt.toISOString(),
  };
}

export function mapFormDetail(form: FormDetail) {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status,
    qualityStatus: form.qualityStatus,
    insightStatus: form.insightStatus,
    isDemo: form.isDemo,
    currentDraftVersion: form.currentDraftVersion,
    latestPublishedVersion: form.latestPublishedVersion,
    publicSlug: form.publicSlug,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
    publishedAt: form.publishedAt?.toISOString() ?? null,
    closedAt: form.closedAt?.toISOString() ?? null,
    sections: form.sections,
  };
}
