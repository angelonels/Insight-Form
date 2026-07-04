import { ArrowClockwise, ArrowLeft, Copy, DownloadSimple, FloppyDisk } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { StatusBadge } from "../../components/feedback/status-badge.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { Card } from "../../components/ui/card.js";
import { Input } from "../../components/ui/input.js";
import { Textarea } from "../../components/ui/textarea.js";
import { routes } from "../../app/routes.js";
import { ReportPreview } from "../../features/reports/components/report-preview.js";
import { useExportReport, useRegenerateReport, useReportDetail, useUpdateReport } from "../../features/reports/hooks/use-reports.js";

export function ReportPreviewPage() {
  const { formId = "", reportId = "" } = useParams();
  const report = useReportDetail(formId, reportId);
  const updateReport = useUpdateReport(formId, reportId);
  const regenerateReport = useRegenerateReport(formId, reportId);
  const exportReport = useExportReport(formId, reportId);
  const [title, setTitle] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (report.data) {
      setTitle(report.data.title);
      setContentMarkdown(report.data.contentMarkdown ?? "");
    }
  }, [report.data]);

  function handleSave() {
    updateReport.mutate(
      { title, contentMarkdown },
      {
        onSuccess: () => toast.success("Report saved."),
        onError: () => toast.error("Could not save report."),
      },
    );
  }

  function handleCopy() {
    const text = contentMarkdown || report.data?.contentMarkdown || "";
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyState("copied");
        toast.success("Report copied.");
      })
      .catch(() => {
        setCopyState("failed");
        toast.error("Could not copy report.");
      });
  }

  function handleExport() {
    exportReport.mutate(undefined, {
      onSuccess: (result) => {
        const blob = new Blob([result.contentMarkdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title || "insightform-report"}.md`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Report exported.");
      },
      onError: () => toast.error("Could not export report."),
    });
  }

  return (
    <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8">
      <PageHeader
        action={
          <>
            <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium" to={routes.reports(formId)}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Reports
            </Link>
            <Button isLoading={updateReport.isPending} onClick={handleSave} type="button" variant="outline">
              <FloppyDisk className="size-4" aria-hidden="true" />
              Save
            </Button>
            <Button onClick={handleCopy} type="button" variant="outline">
              <Copy className="size-4" aria-hidden="true" />
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
            </Button>
            <Button isLoading={exportReport.isPending} onClick={handleExport} type="button" variant="outline">
              <DownloadSimple className="size-4" aria-hidden="true" />
              Export
            </Button>
            <Button
              isLoading={regenerateReport.isPending}
              onClick={() =>
                regenerateReport.mutate(undefined, {
                  onSuccess: () => toast.success("Report refresh started."),
                  onError: () => toast.error("Could not refresh report."),
                })
              }
              type="button"
            >
              <ArrowClockwise className="size-4" aria-hidden="true" />
              Refresh report
            </Button>
          </>
        }
        description="Edit the report before copying or downloading it."
        eyebrow="Report"
        title={report.data?.title ?? "Report"}
      />

      {report.isPending ? <LoadingState rows={3} /> : null}
      {report.isError ? <ErrorState error={report.error} title="Could not load report" /> : null}
      {updateReport.isError ? <ErrorState error={updateReport.error} title="Could not save report" /> : null}
      {regenerateReport.isError ? <ErrorState error={regenerateReport.error} title="Could not refresh report" /> : null}
      {exportReport.isError ? <ErrorState error={exportReport.error} title="Could not export report" /> : null}

      {report.isSuccess ? (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Card className="grid min-w-0 gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Edit report</h2>
              <StatusBadge status={report.data.status} />
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Title
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Report text
              <Textarea className="min-h-[520px] text-sm" value={contentMarkdown} onChange={(event) => setContentMarkdown(event.target.value)} />
            </label>
          </Card>
          <ReportPreview report={{ ...report.data, title, contentMarkdown }} />
        </div>
      ) : null}
    </section>
  );
}
