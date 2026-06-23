import "dotenv/config";

import { Worker } from "bullmq";

import { logger } from "../../shared/logger/logger.js";
import { GenerateInsightsJob } from "../insights/generate-insights.job.js";
import { InsightRepository } from "../insights/insight.repository.js";
import { GenerateReportJob } from "../reports/generate-report.job.js";
import { AnalyzeSubmittedResponseUseCase } from "../response-analysis/analyze-submitted-response.usecase.js";
import { GenerateResponseEmbeddingsUseCase } from "../response-analysis/generate-response-embeddings.usecase.js";
import type {
  AnalyzeSubmittedResponsePayload,
  GenerateInsightSnapshotPayload,
  GenerateReportPayload,
  GenerateResponseEmbeddingsPayload,
} from "./job-payloads.js";
import { JobNames, QueueNames } from "./job-names.js";
import { getRedisConnectionOptions } from "./queue.js";

const analyzeSubmittedResponse = new AnalyzeSubmittedResponseUseCase();
const generateResponseEmbeddings = new GenerateResponseEmbeddingsUseCase();
const generateInsights = new GenerateInsightsJob();
const insightStatuses = new InsightRepository();
const generateReport = new GenerateReportJob();

const workers = [
  new Worker(
    QueueNames.AiAnalysis,
    async (job) => {
      if (job.name !== JobNames.AnalyzeSubmittedResponse) {
        logger.warn({ jobName: job.name }, "Skipping unknown AI analysis job");
        return;
      }

      const payload = job.data as AnalyzeSubmittedResponsePayload;
      await analyzeSubmittedResponse.execute(payload);
    },
    { connection: getRedisConnectionOptions() },
  ),
  new Worker(
    QueueNames.Embeddings,
    async (job) => {
      if (job.name !== JobNames.GenerateResponseEmbeddings) {
        logger.warn({ jobName: job.name }, "Skipping unknown embedding job");
        return;
      }

      const payload = job.data as GenerateResponseEmbeddingsPayload;
      await generateResponseEmbeddings.execute(payload);
    },
    { connection: getRedisConnectionOptions() },
  ),
  new Worker(
    QueueNames.Insights,
    async (job) => {
      if (job.name !== JobNames.GenerateInsightSnapshot) {
        logger.warn({ jobName: job.name }, "Skipping unknown insights job");
        return;
      }

      const payload = job.data as GenerateInsightSnapshotPayload;
      await generateInsights.execute(payload);
    },
    { connection: getRedisConnectionOptions() },
  ),
  new Worker(
    QueueNames.Reports,
    async (job) => {
      if (job.name !== JobNames.GenerateReport) {
        logger.warn({ jobName: job.name }, "Skipping unknown reports job");
        return;
      }

      const payload = job.data as GenerateReportPayload;
      await generateReport.execute(payload);
    },
    { connection: getRedisConnectionOptions() },
  ),
];

for (const worker of workers) {
  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, jobName: job.name, queueName: worker.name }, "Job completed");
  });

  worker.on("failed", async (job, error) => {
    logger.error({ jobId: job?.id, jobName: job?.name, queueName: worker.name, error }, "Job failed");

    const attempts = job?.opts.attempts ?? 1;
    if (worker.name === QueueNames.Insights && job?.name === JobNames.GenerateInsightSnapshot && job.attemptsMade >= attempts) {
      const payload = job.data as GenerateInsightSnapshotPayload;
      try {
        await insightStatuses.markFailed(payload.formId);
      } catch (statusError) {
        logger.error({ formId: payload.formId, error: statusError }, "Failed to mark insight generation as failed");
      }
    }
  });
}

logger.info("InsightForm worker process booted");

async function shutdown() {
  logger.info("Shutting down worker process");
  await Promise.all(workers.map((worker) => worker.close()));
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
