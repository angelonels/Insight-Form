import { FileText, Plus } from "@phosphor-icons/react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "../../components/feedback/empty-state.js";
import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { StatusBadge } from "../../components/feedback/status-badge.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { routes } from "../../app/routes.js";
import { formatRelativeTime } from "../../lib/date/format-date.js";
import { useFormDetail } from "../../features/forms/hooks/use-forms.js";
import { useCreateReport, useReportList } from "../../features/reports/hooks/use-reports.js";
import { reportTypeLabels, type ReportType } from "../../features/reports/types/report.types.js";

export function ReportsListPage() {
  const { formId = "" } = useParams();
  const form = useFormDetail(formId);
  const reports = useReportList(formId);
  const createReport = useCreateReport(formId);
  const navigate = useNavigate();

  function handleCreate(reportType: ReportType) {
    createReport.mutate(
      { reportType },
      {
        onSuccess: (result) => navigate(routes.reportDetail(formId, result.reportId)),
      },
    );
  }

  return (
    <section className="grid gap-8">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <Button isLoading={createReport.isPending} onClick={() => handleCreate("executive_summary")} type="button">
              <Plus className="size-4" aria-hidden="true" />
              Executive summary
            </Button>
            <Button isLoading={createReport.isPending} onClick={() => handleCreate("feedback_report")} type="button" variant="outline">
              Feedback report
            </Button>
          </div>
        }
        description={form.data ? `Create report drafts from ${form.data.title} insights.` : "Create report drafts from ready insights."}
        eyebrow="Reports"
        title="Share the readout"
      />

      {createReport.isError ? <ErrorState error={createReport.error} title="Could not create report" /> : null}
      {reports.isPending ? <LoadingState rows={3} /> : null}
      {reports.isError ? <ErrorState error={reports.error} title="Could not load reports" /> : null}
      {reports.isSuccess && reports.data.length === 0 ? (
        <EmptyState
          description="Generate insights first, then create an executive summary or a feedback report."
          icon={<FileText className="size-5" aria-hidden="true" />}
          title="No reports yet"
        />
      ) : null}
      {reports.isSuccess && reports.data.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-raised shadow-subtle">
          {reports.data.map((report) => (
            <Link className="block border-b border-border-subtle p-5 transition-colors last:border-b-0 hover:bg-surface/70" key={report.id} to={routes.reportDetail(formId, report.id)}>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={report.status} />
                      <span className="text-xs font-medium text-primary">{reportTypeLabels[report.reportType]}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold">{report.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{report.contentMarkdown ? "Ready to review, copy, or export." : "Generation is in progress."}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatRelativeTime(report.updatedAt)}</p>
                </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
