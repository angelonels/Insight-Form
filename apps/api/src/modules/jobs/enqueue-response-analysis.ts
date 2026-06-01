import { enqueueJob } from "./queue.js";
import { JobNames, QueueNames } from "./job-names.js";

export async function enqueueAnalyzeSubmittedResponse(responseId: string) {
  await enqueueJob(QueueNames.AiAnalysis, JobNames.AnalyzeSubmittedResponse, { responseId });
}

export async function enqueueGenerateResponseEmbeddings(responseId: string) {
  await enqueueJob(QueueNames.Embeddings, JobNames.GenerateResponseEmbeddings, { responseId });
}
