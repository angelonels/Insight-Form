import {
  ArrowSquareOut,
  ChartBar,
  ChatText,
  FileText,
  NotePencil,
  ShareNetwork,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import { StatusBadge } from "../../../components/feedback/status-badge.js";
import { buttonStyles } from "../../../components/ui/button.js";
import { routes } from "../../../app/routes.js";
import { formatRelativeTime } from "../../../lib/date/format-date.js";
import { formatPercent } from "../../../lib/text/format.js";
import type { FormCard as FormCardType } from "../types/form.types.js";

export function FormCard({ form }: { form: FormCardType }) {
  return (
    <article className="group relative border-b border-border-subtle p-4 transition-colors last:border-b-0 hover:bg-surface/70 sm:p-5">
      <Link
        aria-label={`Edit ${form.title}`}
        className="absolute inset-0 z-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        to={routes.formEditor(form.id)}
      />
      <div className="pointer-events-none relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_31rem] xl:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border-subtle bg-surface text-muted-foreground group-hover:text-primary">
            <FileText className="size-4" weight="regular" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words font-semibold">{form.title}</h2>
              <StatusBadge status={form.status} />
              {form.isDemo ? <span className="text-xs font-medium text-primary">Demo</span> : null}
              {form.insightStatus === "ready" ? <span className="text-xs text-muted-foreground">Insights ready</span> : null}
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {form.description || "No description yet. Add context before sharing this form."}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(15rem,1fr)_auto] sm:items-center">
          <dl className="grid grid-cols-[0.75fr_0.9fr_1.35fr] divide-x divide-border-subtle text-sm">
          <Metric label="Responses" value={String(form.responseCount)} />
          <Metric label="Completion" value={formatPercent(form.completionRate)} />
          <Metric label="Updated" value={formatRelativeTime(form.updatedAt)} />
          </dl>
          <div className="flex flex-nowrap gap-1">
            <ActionLink icon={NotePencil} label="Edit" to={routes.formEditor(form.id)} />
            <ActionLink icon={ChatText} label="Responses" to={routes.responses(form.id)} />
            <ActionLink icon={ChartBar} label="Insights" to={routes.insights(form.id)} />
            <ActionLink icon={FileText} label="Reports" to={routes.reports(form.id)} />
            {form.publicSlug ? <ActionLink icon={ArrowSquareOut} label="Public form" to={routes.publicForm(form.publicSlug)} /> : (
              <span aria-label="Not published" className={buttonStyles({ size: "icon", variant: "ghost", className: "text-muted-foreground/45" })}>
                <ShareNetwork className="size-4" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-nowrap font-mono text-xs font-medium text-foreground sm:text-sm">{value}</dd>
    </div>
  );
}

function ActionLink({
  icon: Icon,
  label,
  to,
}: {
  icon: Icon;
  label: string;
  to: string;
}) {
  return (
    <Link aria-label={label} className={buttonStyles({ size: "icon", variant: "ghost", className: "pointer-events-auto" })} title={label} to={to}>
      <Icon className="size-4" weight="regular" aria-hidden="true" />
    </Link>
  );
}
