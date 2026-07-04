import { GeneratedMarkdown } from "../../../components/generated-content/generated-markdown.js";
import type { Report } from "../types/report.types.js";

export function ReportPreview({ report }: { report: Report }) {
  const markdown = report.contentMarkdown || "Report content is still being generated.";

  return (
    <article className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      <header className="rounded-xl border border-border bg-card p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {report.reportType.replace("_", " ")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{report.title}</h1>
      </header>
      <section className="min-w-0 rounded-xl border border-border bg-card p-5 leading-7 shadow-sm">
        <GeneratedMarkdown variant="report">{markdown}</GeneratedMarkdown>
      </section>
    </article>
  );
}
