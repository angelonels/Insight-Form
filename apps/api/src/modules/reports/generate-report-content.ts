import type { AiChatGateway } from "../ai/langchain-model-factory.js";
import { buildGenerateExecutiveSummaryReportPrompt } from "./prompts/generate-executive-summary-report.prompt.js";
import { buildGenerateFeedbackReportPrompt } from "./prompts/generate-feedback-report.prompt.js";
import type { ReportRepository } from "./report.repository.js";
import { reportOutputSchema } from "./report.schemas.js";
import { validateReportMarkdownSections } from "./validate-report-output.js";

export async function generateReportContent(input: {
  reportId: string;
  reports: ReportRepository;
  ai: AiChatGateway;
}) {
  const { report, insight, clusters } = await input.reports.loadReportContext(input.reportId);
  const isExecutive = report.reportType === "executive_summary";
  const output = await input.ai.generateStructuredOutput({
    system: "Generate InsightForm Reports in Markdown with only evidence-supported claims.",
    prompt: isExecutive
      ? buildGenerateExecutiveSummaryReportPrompt({ insight, clusters })
      : buildGenerateFeedbackReportPrompt({ insight, clusters }),
    schema: reportOutputSchema,
    schemaName: isExecutive ? "executive_summary_report" : "feedback_report",
    modelProfile: "large",
  });

  validateReportMarkdownSections(report.reportType, output.contentMarkdown);
  return output;
}
