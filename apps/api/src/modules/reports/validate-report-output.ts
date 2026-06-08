import { AiOutputValidationError } from "../../shared/errors/app-error.js";

const requiredSectionsByType = {
  executive_summary: ["response overview", "key findings", "recommended actions", "evidence notes"],
  feedback_report: ["response overview", "sentiment summary", "themes and evidence", "recommended actions"],
} as const;

export function validateReportMarkdownSections(reportType: string, contentMarkdown: string) {
  const requiredSections =
    reportType === "executive_summary" || reportType === "feedback_report"
      ? requiredSectionsByType[reportType]
      : requiredSectionsByType.feedback_report;
  const normalized = contentMarkdown.toLowerCase();
  const missingSections = requiredSections.filter((section) => !normalized.includes(section));

  if (missingSections.length) {
    throw new AiOutputValidationError("Report output is missing required sections.", {
      missingSections,
    });
  }
}
