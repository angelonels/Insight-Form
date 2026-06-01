export type AnalyzeSubmittedResponsePayload = {
  responseId: string;
};

export type GenerateResponseEmbeddingsPayload = {
  responseId: string;
};

export type GenerateInsightSnapshotPayload = {
  formId: string;
};

export type GenerateReportPayload = {
  reportId: string;
};

export type JobPayloadMap = {
  "response-analysis.analyze-submitted-response": AnalyzeSubmittedResponsePayload;
  "response-analysis.generate-response-embeddings": GenerateResponseEmbeddingsPayload;
  "insights.generate-insight-snapshot": GenerateInsightSnapshotPayload;
  "insights.create-response-clusters": GenerateInsightSnapshotPayload;
  "reports.generate-report": GenerateReportPayload;
};
