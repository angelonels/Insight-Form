export const routes = {
  landing: "/",
  dashboard: "/app",
  aiFormCreation: "/app/forms/new/ai",
  formEditor: (formId: string) => `/app/forms/${formId}/editor`,
  publicForm: (publicSlug: string) => `/f/${publicSlug}`,
} as const;

