import { AiModelConfig } from "../ai/ai-model-config.js";
import { PromptVersions } from "../ai/ai-prompt-registry.js";
import { LangChainBedrockChatGateway, type AiChatGateway } from "../ai/langchain-model-factory.js";
import { generateReportContent } from "./generate-report-content.js";
import { ReportRepository } from "./report.repository.js";

export class GenerateReportJob {
  constructor(
    private readonly reports = new ReportRepository(),
    private readonly ai: AiChatGateway = new LangChainBedrockChatGateway(),
  ) {}

  async execute(input: { reportId: string }) {
    const { report } = await this.reports.loadReportContext(input.reportId);
    const isExecutive = report.reportType === "executive_summary";
    const output = await generateReportContent({
      reportId: input.reportId,
      reports: this.reports,
      ai: this.ai,
    });

    return this.reports.markReady({
      reportId: report.id,
      title: output.title,
      contentMarkdown: output.contentMarkdown,
      modelProvider: AiModelConfig.provider,
      modelName: AiModelConfig.chatModelId("large"),
      promptVersion: isExecutive
        ? PromptVersions.GenerateExecutiveSummaryReport
        : PromptVersions.GenerateFeedbackReport,
    });
  }
}
