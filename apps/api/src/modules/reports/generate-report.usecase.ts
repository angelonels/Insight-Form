import { enqueueGenerateReport } from "../jobs/enqueue-report-generation.js";
import { ReportRepository } from "./report.repository.js";

export class GenerateReportUseCase {
  constructor(private readonly reports = new ReportRepository()) {}

  async execute(input: { formId: string; userId: string; reportType: "executive_summary" | "feedback_report"; title?: string }) {
    const report = await this.reports.createGenerating({
      formId: input.formId,
      ownerUserId: input.userId,
      reportType: input.reportType,
      title: input.title,
    });
    await enqueueGenerateReport(report.id);
    return { reportId: report.id, status: report.status };
  }
}
