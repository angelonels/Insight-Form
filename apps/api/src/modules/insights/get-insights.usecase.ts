import { InsightRepository } from "./insight.repository.js";

export class GetInsightsUseCase {
  constructor(private readonly insights = new InsightRepository()) {}

  async execute(input: { formId: string; userId: string }) {
    return this.insights.latest(input.formId, input.userId);
  }
}
