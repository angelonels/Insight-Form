import { ArrowClockwise, ChartBar, ChatText, Clock, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "../../components/feedback/empty-state.js";
import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { StatusBadge } from "../../components/feedback/status-badge.js";
import { GeneratedMarkdown } from "../../components/generated-content/generated-markdown.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { Card } from "../../components/ui/card.js";
import { Input } from "../../components/ui/input.js";
import { Progress } from "../../components/ui/progress.js";
import { routes } from "../../app/routes.js";
import { formatPercent } from "../../lib/text/format.js";
import { useFormDetail } from "../../features/forms/hooks/use-forms.js";
import {
  useAskResponses,
  useDropoffAnalytics,
  useGenerateInsights,
  useInsights,
} from "../../features/insights/hooks/use-insights.js";
import type { KeyFinding, RecommendedAction } from "../../features/insights/types/insight.types.js";

const suggestedPrompts = [
  "What are people unhappy about?",
  "What did people like most?",
  "What should we improve first?",
  "Which replies need follow-up?",
];

export function InsightsPage() {
  const { formId = "" } = useParams();
  const form = useFormDetail(formId);
  const insights = useInsights(formId);
  const dropoff = useDropoffAnalytics(formId);
  const generateInsights = useGenerateInsights(formId);
  const askResponses = useAskResponses(formId);
  const [question, setQuestion] = useState("");
  const insightData = insights.data;
  const keyFindings = insightData ? normalizeKeyFindings(insightData.keyFindings as unknown[]) : [];
  const recommendedActions = insightData
    ? normalizeRecommendedActions(insightData.recommendedActions as unknown[])
    : [];

  function ask(value = question) {
    if (value.trim().length < 3) {
      return;
    }

    setQuestion(value);
    askResponses.mutate(value);
  }

  return (
    <section className="grid gap-8">
      <PageHeader
        action={
          <>
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium"
              to={routes.responses(formId)}
            >
              Responses
            </Link>
            <Button
              isLoading={generateInsights.isPending}
              onClick={() => generateInsights.mutate()}
              type="button"
            >
              <Sparkle className="size-4" aria-hidden="true" />
              Prepare insights
            </Button>
          </>
        }
        description={
          form.data
            ? `Turn ${form.data.title} responses into clear themes, next steps, and answers you can trust.`
            : "Turn responses into clear themes, next steps, and answers you can trust."
        }
        eyebrow="Insights"
        title="Understand the answers"
      />

      {insights.isPending ? <LoadingState rows={3} /> : null}
      {insights.isError ? (
        <ErrorState error={insights.error} title="Could not load insights" />
      ) : null}
      {generateInsights.isError ? (
        <ErrorState error={generateInsights.error} title="Could not queue insight generation" />
      ) : null}

      {insights.isSuccess && !insights.data ? (
        <EmptyState
          action={
            <Button
              isLoading={generateInsights.isPending}
              onClick={() => generateInsights.mutate()}
              type="button"
            >
              Prepare insights
            </Button>
          }
          description="Prepare a summary once responses start coming in. You can still inspect individual replies now."
          icon={<ChartBar className="size-5" aria-hidden="true" />}
          title="No insights yet"
        />
      ) : null}

      {insights.isSuccess && insightData ? (
        <>
          <InsightStatusPanel
            isPending={generateInsights.isPending}
            onGenerate={() => generateInsights.mutate()}
            status={insightData.status}
            totalResponses={insightData.totalResponses}
          />

          <dl className="grid grid-cols-3 divide-x divide-border-subtle border-y border-border-subtle py-5">
            <MetricCard label="Responses" value={String(insightData.totalResponses)} />
            <MetricCard
              label="Completion rate"
              value={formatPercent(dropoff.data?.completionRate)}
            />
            <MetricCard label="Themes" value={String(insightData.clusters.length)} />
          </dl>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Mood across replies</h2>
                <StatusBadge status={insightData.status} />
              </div>
              {recordToChartRows(insightData.sentimentBreakdown).length ? (
                <div className="mt-5 h-72">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={recordToChartRows(insightData.sentimentBreakdown)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-muted p-4 text-sm leading-6 text-muted-foreground">
                  Mood appears here after InsightForm has enough response text to summarize.
                </p>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold">Completion flow</h2>
              {dropoff.isPending ? <LoadingState rows={1} /> : null}
              {dropoff.data ? (
                <div className="mt-5 grid gap-4">
                  <Progress
                    value={
                      dropoff.data.completionRate == null ? 0 : dropoff.data.completionRate * 100
                    }
                  />
                  <div className="grid grid-cols-3 divide-x divide-border-subtle text-sm">
                    <Metric label="Opened" value={String(dropoff.data.openedCount)} />
                    <Metric label="Started" value={String(dropoff.data.startedCount)} />
                    <Metric label="Sent" value={String(dropoff.data.submittedCount)} />
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Key findings</h2>
              <div className="mt-4 border-t border-border-subtle">
                {keyFindings.length ? (
                  keyFindings.map((finding) => (
                    <div className="border-b border-border-subtle py-4" key={finding.title}>
                      <h3 className="font-semibold">{finding.title}</h3>
                      {finding.summary ? (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {finding.summary}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Findings appear here after the response summary is ready.
                  </p>
                )}
              </div>
            </Card>

            <AskAiPanel
              ask={ask}
              answer={askResponses.data?.answer}
              error={askResponses.error}
              isPending={askResponses.isPending}
              question={question}
              setQuestion={setQuestion}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {insightData.clusters.map((cluster) => (
              <Card className="p-5" key={cluster.id}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">{cluster.name}</h2>
                  <StatusBadge status={cluster.sentiment} />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{cluster.summary}</p>
                <p className="mt-3 text-sm font-medium">
                  {cluster.responseCount} related response(s)
                </p>
                {cluster.recommendedAction ? (
                  <p className="mt-3 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                    {cluster.recommendedAction}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <h2 className="text-lg font-semibold">Recommended actions</h2>
            <div className="mt-4 border-t border-border-subtle">
              {recommendedActions.length ? (
                recommendedActions.map((action) => (
                  <div className="border-b border-border-subtle py-4" key={action.title}>
                    {action.priority ? <StatusBadge status={action.priority} /> : null}
                    <h3 className={action.priority ? "mt-2 font-semibold" : "font-semibold"}>
                      {action.title}
                    </h3>
                    {action.rationale ? (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {action.rationale}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Actions appear here once the responses have been summarized.
                </p>
              )}
            </div>
          </Card>
        </>
      ) : null}
    </section>
  );
}

function AskAiPanel({
  answer,
  ask,
  error,
  isPending,
  question,
  setQuestion,
}: {
  answer?: string;
  ask: (value?: string) => void;
  error: unknown;
  isPending: boolean;
  question: string;
  setQuestion: (value: string) => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
          <ChatText className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Ask about replies</h2>
          <p className="text-sm text-muted-foreground">
            Answers use the submitted responses for this form.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about the responses..."
        />
        <Button isLoading={isPending} onClick={() => ask()} type="button">
          Ask
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestedPrompts.map((prompt) => (
          <button
            className="rounded-md border border-border-subtle bg-background px-3 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary/40 hover:text-foreground"
            key={prompt}
            onClick={() => ask(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorState className="mt-4" error={error} title="Could not answer that question" />
      ) : null}
      {answer ? (
        <div className="mt-5 rounded-lg bg-secondary p-4 text-secondary-foreground">
          <GeneratedMarkdown>{answer}</GeneratedMarkdown>
        </div>
      ) : null}
    </Card>
  );
}

function InsightStatusPanel({
  isPending,
  onGenerate,
  status,
  totalResponses,
}: {
  isPending: boolean;
  onGenerate: () => void;
  status: "ready" | "processing" | "failed";
  totalResponses: number;
}) {
  if (status === "ready") {
    return null;
  }

  if (status === "failed") {
    return (
      <Card className="flex flex-col justify-between gap-4 border-destructive/25 bg-destructive/5 p-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-semibold text-destructive">Insights need another try</h2>
          <p className="mt-1 text-sm leading-6 text-foreground">
            The last summary attempt did not finish. Your responses are still safe.
          </p>
        </div>
        <Button isLoading={isPending} onClick={onGenerate} type="button" variant="destructive">
          <ArrowClockwise className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="grid gap-3 border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-card text-primary shadow-sm">
            <Clock className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold">Preparing insights</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              InsightForm is summarizing {totalResponses}{" "}
              {totalResponses === 1 ? "response" : "responses"}. You can keep this page open while
              it updates.
            </p>
          </div>
        </div>
        <StatusBadge status="processing" />
      </div>
      <Progress value={64} />
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-4 first:pl-0 last:pr-0">
      <dt className="text-xs text-muted-foreground sm:text-sm">{label}</dt>
      <dd className="mt-2 font-mono text-2xl font-semibold sm:text-3xl">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono font-medium">{value}</p>
    </div>
  );
}

function recordToChartRows(record: Record<string, number>) {
  return Object.entries(record).map(([name, value]) => ({ name, value }));
}

type NormalizedAction = Omit<RecommendedAction, "priority"> & {
  priority?: RecommendedAction["priority"];
};

function normalizeKeyFindings(items: unknown[]): KeyFinding[] {
  return items.flatMap((item, index) => {
    if (typeof item === "string") {
      return [{ title: item, summary: "" }];
    }
    if (item && typeof item === "object") {
      const record = item as Partial<KeyFinding>;
      return [
        {
          title: record.title?.trim() || `Finding ${index + 1}`,
          summary: record.summary ?? "",
          evidenceCount: record.evidenceCount,
        },
      ];
    }
    return [];
  });
}

function normalizeRecommendedActions(items: unknown[]): NormalizedAction[] {
  return items.flatMap((item, index) => {
    if (typeof item === "string") {
      return [{ title: item, rationale: "" }];
    }
    if (item && typeof item === "object") {
      const record = item as Partial<RecommendedAction>;
      return [
        {
          title: record.title?.trim() || `Action ${index + 1}`,
          rationale: record.rationale ?? "",
          priority: record.priority,
        },
      ];
    }
    return [];
  });
}
