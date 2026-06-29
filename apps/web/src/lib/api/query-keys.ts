export type ResponseFilters = {
  sentiment?: string;
  followUpNeeded?: boolean;
};

export const queryKeys = {
  currentUser: ["current-user"] as const,
  forms: {
    all: ["forms"] as const,
    list: ["forms", "list"] as const,
    detail: (formId: string) => ["forms", "detail", formId] as const,
  },
  publicForms: {
    detail: (publicSlug: string) => ["public-forms", publicSlug] as const,
  },
  responses: {
    list: (formId: string, filters: ResponseFilters = {}) => ["forms", formId, "responses", filters] as const,
    detail: (formId: string, responseId: string) => ["forms", formId, "responses", responseId] as const,
  },
  insights: {
    detail: (formId: string) => ["forms", formId, "insights"] as const,
    dropoff: (formId: string) => ["forms", formId, "analytics", "dropoff"] as const,
  },
  reports: {
    list: (formId: string) => ["forms", formId, "reports"] as const,
    detail: (formId: string, reportId: string) => ["forms", formId, "reports", reportId] as const,
  },
};
