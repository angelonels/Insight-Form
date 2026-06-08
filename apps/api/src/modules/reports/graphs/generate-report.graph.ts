import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { AiChatGateway } from "../../ai/langchain-model-factory.js";
import { buildGenerateExecutiveSummaryReportPrompt } from "../prompts/generate-executive-summary-report.prompt.js";
import { buildGenerateFeedbackReportPrompt } from "../prompts/generate-feedback-report.prompt.js";
import type { ReportRepository } from "../report.repository.js";
import { reportOutputSchema } from "../report.schemas.js";
import { validateReportMarkdownSections } from "../validate-report-output.js";

const GenerateReportAnnotation = Annotation.Root({
  reportId: Annotation<string>(),
  report: Annotation<unknown | undefined>(),
  insight: Annotation<unknown | undefined>(),
  clusters: Annotation<unknown[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  output: Annotation<{ title: string; contentMarkdown: string } | undefined>(),
});

export async function runGenerateReportGraph(input: { reportId: string; reports: ReportRepository; ai: AiChatGateway }) {
  const graph = new StateGraph(GenerateReportAnnotation)
    .addNode("load_report_context", async () => {
      const context = await input.reports.loadReportContext(input.reportId);
      return {
        report: context.report,
        insight: context.insight,
        clusters: context.clusters,
      };
    })
    .addNode("ensure_insights_snapshot_ready", async (state) => ({ insight: state.insight }))
    .addNode("build_report_outline", async (state) => ({ report: state.report }))
    .addNode("generate_report_sections", async (state) => {
      const report = state.report as { reportType?: string } | undefined;
      const isExecutive = report?.reportType === "executive_summary";
      const output = await input.ai.generateStructuredOutput({
        system: "Generate InsightForm reports in Markdown with only evidence-supported claims.",
        prompt: isExecutive
          ? buildGenerateExecutiveSummaryReportPrompt({ insight: state.insight, clusters: state.clusters })
          : buildGenerateFeedbackReportPrompt({ insight: state.insight, clusters: state.clusters }),
        schema: reportOutputSchema,
        modelProfile: "large",
      });
      return { output };
    })
    .addNode("verify_report_evidence", async (state) => {
      const output = reportOutputSchema.parse(state.output);
      const report = state.report as { reportType?: string } | undefined;
      validateReportMarkdownSections(report?.reportType ?? "feedback_report", output.contentMarkdown);
      return { output };
    })
    .addNode("persist_report", async (state) => ({ output: state.output }))
    .addEdge(START, "load_report_context")
    .addEdge("load_report_context", "ensure_insights_snapshot_ready")
    .addEdge("ensure_insights_snapshot_ready", "build_report_outline")
    .addEdge("build_report_outline", "generate_report_sections")
    .addEdge("generate_report_sections", "verify_report_evidence")
    .addEdge("verify_report_evidence", "persist_report")
    .addEdge("persist_report", END)
    .compile();

  const result = await graph.invoke({ reportId: input.reportId });
  return reportOutputSchema.parse(result.output);
}
