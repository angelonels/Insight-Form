import { JobNames, QueueNames } from "./job-names.js";
import { enqueueJob } from "./queue.js";

export async function enqueueGenerateReport(reportId: string) {
  await enqueueJob(QueueNames.Reports, JobNames.GenerateReport, { reportId });
}
