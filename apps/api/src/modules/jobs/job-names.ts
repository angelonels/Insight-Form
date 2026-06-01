export const JobNames = {
  AnalyzeSubmittedResponse: "response-analysis.analyze-submitted-response",
  GenerateResponseEmbeddings: "response-analysis.generate-response-embeddings",
  GenerateInsightSnapshot: "insights.generate-insight-snapshot",
  CreateResponseClusters: "insights.create-response-clusters",
  GenerateReport: "reports.generate-report",
} as const;

export const QueueNames = {
  AiAnalysis: "ai-analysis",
  Embeddings: "embeddings",
  Insights: "insights",
  Reports: "reports",
} as const;

