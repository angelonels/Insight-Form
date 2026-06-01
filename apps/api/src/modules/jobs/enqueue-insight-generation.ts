import { JobNames, QueueNames } from "./job-names.js";
import { enqueueJob } from "./queue.js";

export async function enqueueGenerateInsightSnapshot(formId: string) {
  await enqueueJob(QueueNames.Insights, JobNames.GenerateInsightSnapshot, { formId });
}
