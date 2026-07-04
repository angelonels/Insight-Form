import { ArrowClockwise, ArrowLeft } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { StatusBadge } from "../../components/feedback/status-badge.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { Card } from "../../components/ui/card.js";
import { routes } from "../../app/routes.js";
import { formatDateTime, formatDuration } from "../../lib/date/format-date.js";
import { formatAnswerValue } from "../../features/responses/utils/format-answer.js";
import { useRegenerateResponseAnalysis, useResponseDetail } from "../../features/responses/hooks/use-responses.js";

export function ResponseDetailPage() {
  const { formId = "", responseId = "" } = useParams();
  const response = useResponseDetail(formId, responseId);
  const regenerate = useRegenerateResponseAnalysis(formId, responseId);
  const summaryActionLabel = response.data?.analysis ? "Refresh summary" : "Prepare summary";

  return (
    <section className="grid gap-8">
      <PageHeader
        action={
          <>
            <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium" to={routes.responses(formId)}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Inbox
            </Link>
            <Button isLoading={regenerate.isPending} onClick={() => regenerate.mutate()} type="button" variant="outline">
              <ArrowClockwise className="size-4" aria-hidden="true" />
              {summaryActionLabel}
            </Button>
          </>
        }
        description="Review the summary and the submitted answers side by side."
        eyebrow="Response"
        title="Submitted response"
      />
      {response.isPending ? <LoadingState rows={3} /> : null}
      {response.isError ? <ErrorState error={response.error} title="Could not load response" /> : null}
      {regenerate.isError ? <ErrorState error={regenerate.error} title="Could not refresh summary" /> : null}
      {response.isSuccess ? (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4">
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Details</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <Meta label="Submitted" value={formatDateTime(response.data.submittedAt)} />
                <Meta label="Duration" value={formatDuration(response.data.completionTimeSeconds)} />
                <Meta label="Email" value={response.data.respondentEmail ?? "Anonymous"} />
              </dl>
            </Card>
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Summary</h2>
              {response.data.analysis ? (
                <div className="mt-4 grid gap-4 text-sm leading-6">
                  <StatusBadge status={response.data.analysis.sentiment} />
                  <p>{response.data.analysis.summary}</p>
                  <TagGroup title="Topics" values={response.data.analysis.topics} />
                  <TagGroup title="Pain points" values={response.data.analysis.painPoints} />
                  <TagGroup title="Feature requests" values={response.data.analysis.featureRequests} />
                  {response.data.analysis.followUpNeeded ? (
                    <p className="rounded-lg bg-warning/15 p-3 text-warning-foreground">{response.data.analysis.followUpReason ?? "Follow-up may be useful."}</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Summary is still being prepared. The submitted answers are available now.</p>
              )}
            </Card>
          </div>
          <Card className="p-5">
            <h2 className="text-lg font-semibold">Answers</h2>
            <div className="mt-4 border-t border-border-subtle">
              {response.data.answers.map((answer) => (
                <div className="border-b border-border-subtle py-4" key={answer.id}>
                  <p className="font-medium">{answer.questionText}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{formatAnswerValue(answer.answer)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function TagGroup({ title, values }: { title: string; values: string[] }) {
  if (!values.length) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground" key={value}>
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
