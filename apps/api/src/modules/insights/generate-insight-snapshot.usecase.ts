import { enqueueGenerateInsightSnapshot } from "../jobs/enqueue-insight-generation.js";
import { InsightRepository } from "./insight.repository.js";

export class GenerateInsightSnapshotUseCase {
  constructor(private readonly insights = new InsightRepository()) {}

  async execute(input: { formId: string; userId: string }) {
    await this.insights.markProcessing(input.formId, input.userId);
    await enqueueGenerateInsightSnapshot(input.formId);
    return { formId: input.formId, status: "queued" as const };
  }
}
