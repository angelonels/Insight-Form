import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowClockwise, ChatText } from "@phosphor-icons/react";
import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { EmptyState } from "../../components/feedback/empty-state.js";
import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { StatusBadge } from "../../components/feedback/status-badge.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { Card } from "../../components/ui/card.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table.js";
import { routes } from "../../app/routes.js";
import { formatDuration, formatRelativeTime } from "../../lib/date/format-date.js";
import { useFormDetail } from "../../features/forms/hooks/use-forms.js";
import { useResponseList } from "../../features/responses/hooks/use-responses.js";
import type { ResponseCard, Sentiment } from "../../features/responses/types/response.types.js";

const filters: Array<{ label: string; value: string }> = [
  { label: "All", value: "all" },
  { label: "Positive", value: "positive" },
  { label: "Neutral", value: "neutral" },
  { label: "Negative", value: "negative" },
  { label: "Mixed", value: "mixed" },
  { label: "Needs follow-up", value: "follow-up" },
];

const columnHelper = createColumnHelper<ResponseCard>();

export function ResponseInboxPage() {
  const { formId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("filter") ?? "all";
  const responseFilters =
    activeFilter === "follow-up"
      ? { followUpNeeded: true }
      : activeFilter === "all"
        ? {}
        : { sentiment: activeFilter as Sentiment };
  const form = useFormDetail(formId);
  const responses = useResponseList(formId, responseFilters);
  const columns = useMemo(
    () => [
      columnHelper.accessor("summary", {
        header: "Response",
        cell: ({ row }) => (
          <Link className="block max-w-xl" to={routes.responseDetail(formId, row.original.id)}>
            <span className="font-medium text-foreground">Response #{responses.data ? responses.data.length - row.index : row.index + 1}</span>
            <span className="mt-1 line-clamp-2 block text-muted-foreground">
              {row.original.summary ?? "Summary is being prepared. Open the response to read the answers."}
            </span>
          </Link>
        ),
      }),
      columnHelper.accessor("sentiment", {
        header: "Sentiment",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={row.original.sentiment ?? "processing"} />
            {row.original.followUpNeeded ? <StatusBadge status="needs_review" /> : null}
          </div>
        ),
      }),
      columnHelper.accessor("respondentEmail", {
        header: "Respondent",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() ?? "Anonymous"}</span>,
      }),
      columnHelper.accessor("completionTimeSeconds", {
        header: "Duration",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{formatDuration(getValue())}</span>,
      }),
      columnHelper.accessor("submittedAt", {
        header: "Submitted",
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatRelativeTime(getValue())}</span>,
      }),
    ],
    [formId, responses.data],
  );
  const table = useReactTable({
    data: responses.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="grid gap-8">
      <PageHeader
        action={
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium" to={routes.formEditor(formId)}>
            Back to editor
          </Link>
        }
        description={form.data?.title ? `Review submitted answers for ${form.data.title}.` : "Review submitted answers and summaries."}
        eyebrow="Response inbox"
        title="Responses"
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            onClick={() => setSearchParams(filter.value === "all" ? {} : { filter: filter.value })}
            type="button"
            variant={activeFilter === filter.value ? "default" : "outline"}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {responses.isPending ? <LoadingState rows={4} /> : null}
      {responses.isError ? <ErrorState error={responses.error} title="Could not load responses" /> : null}
      {responses.isSuccess && responses.data.length === 0 ? (
        <EmptyState
          description="Share your public form link to start collecting responses. Summaries appear after people submit answers."
          icon={<ChatText className="size-5" aria-hidden="true" />}
          title="No responses match this view"
        />
      ) : null}
      {responses.isSuccess && responses.data.length > 0 ? (
        <>
          <Card className="hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="grid gap-4 md:hidden">
            {responses.data.map((response, index) => (
              <Link key={response.id} to={routes.responseDetail(formId, response.id)}>
                <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={response.sentiment ?? "processing"} />
                        {response.followUpNeeded ? <StatusBadge status="needs_review" /> : null}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold">Response #{responses.data.length - index}</h2>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {response.summary ?? "Summary is being prepared. Open the response to read the answers."}
                      </p>
                    </div>
                    <dl className="grid gap-1 text-sm text-muted-foreground md:text-right">
                      <div>{formatRelativeTime(response.submittedAt)}</div>
                      <div>{formatDuration(response.completionTimeSeconds)}</div>
                      <div>{response.respondentEmail ?? "Anonymous"}</div>
                    </dl>
                  </div>
                  {response.topics.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {response.topics.map((topic) => (
                        <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground" key={topic}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : null}
      <Button onClick={() => responses.refetch()} type="button" variant="ghost">
        <ArrowClockwise className="size-4" aria-hidden="true" />
        Refresh responses
      </Button>
    </section>
  );
}
