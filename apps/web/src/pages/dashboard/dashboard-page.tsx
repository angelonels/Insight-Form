import { ArrowRight, FilePlus, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { EmptyState } from "../../components/feedback/empty-state.js";
import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { Input } from "../../components/ui/input.js";
import { routes } from "../../app/routes.js";
import { FormCard } from "../../features/forms/components/form-card.js";
import { useCreateBlankForm, useFormList } from "../../features/forms/hooks/use-forms.js";

export function DashboardPage() {
  const forms = useFormList();
  const createBlank = useCreateBlankForm();
  const navigate = useNavigate();
  const demoForm = forms.data?.find((form) => form.isDemo);
  const [searchQuery, setSearchQuery] = useState("");
  const visibleForms = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    if (!forms.data || !normalizedQuery) {
      return forms.data ?? [];
    }

    return forms.data.filter((form) =>
      [form.title, form.description, form.status].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [forms.data, searchQuery]);

  function handleCreateBlank() {
    createBlank.mutate(
      { title: "Untitled feedback form", description: "A quick form to collect honest, useful answers." },
      {
        onSuccess: (form) => navigate(routes.formEditor(form.id)),
      },
    );
  }

  return (
    <section className="grid gap-9">
      <PageHeader
        action={
          <>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground shadow-subtle transition-colors hover:bg-primary/92" to={routes.aiFormCreation}>
              <Sparkle className="size-4" weight="regular" aria-hidden="true" />
              Create with AI
            </Link>
            <Button isLoading={createBlank.isPending} onClick={handleCreateBlank} type="button" variant="outline">
              <FilePlus className="size-4" aria-hidden="true" />
              Create blank
            </Button>
          </>
        }
        description="Create forms, collect answers, understand what changed, and share the results."
        title="Forms"
      />

      {forms.isPending ? <LoadingState rows={3} /> : null}
      {forms.isError ? <ErrorState error={forms.error} title="Could not load your forms" /> : null}
      {demoForm ? (
        <div className="grid overflow-hidden rounded-lg border border-border-subtle bg-secondary/35 shadow-subtle lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
          <div className="flex gap-4 p-5 sm:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-subtle">
              <Sparkle className="size-5" weight="regular" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">Sample workflow</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{demoForm.title}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review 100 realistic responses, inspect AI findings, ask a follow-up question, and open the finished report.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2 border-t border-border-subtle bg-raised p-4 sm:flex-row lg:border-l lg:border-t-0">
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground" to={routes.responses(demoForm.id)}>
              Open sample
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            {demoForm.publicSlug ? (
              <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-raised px-4 text-sm font-medium transition-colors hover:border-primary/35 hover:bg-secondary/45" to={routes.publicForm(demoForm.publicSlug)}>
                Public form
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      {forms.isSuccess && forms.data.length === 0 ? (
        <EmptyState
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" to={routes.aiFormCreation}>
                <Sparkle className="size-4" aria-hidden="true" />
                Create with AI
              </Link>
              <Button isLoading={createBlank.isPending} onClick={handleCreateBlank} type="button" variant="outline">
                Create blank form
              </Button>
            </div>
          }
          description="Create a form manually or use AI to draft one in seconds. A sample form appears after your workspace refreshes."
              icon={<Sparkle className="size-5" aria-hidden="true" />}
          title="No forms yet"
        />
      ) : null}
      {forms.isSuccess && forms.data.length > 0 ? (
        <div className="grid gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold">Your forms</h2>
              <p className="mt-1 text-sm text-muted-foreground">{forms.data.length} {forms.data.length === 1 ? "form" : "forms"} in this workspace</p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">Search forms</span>
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" weight="regular" aria-hidden="true" />
              <Input className="pl-9" onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search forms" type="search" value={searchQuery} />
            </label>
          </div>
          {visibleForms.length ? (
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-raised shadow-subtle">
              {visibleForms.map((form) => (
                <FormCard form={form} key={form.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              action={<Button onClick={() => setSearchQuery("")} type="button" variant="outline">Clear search</Button>}
              description="No form title, description, or status matches your search."
              icon={<MagnifyingGlass className="size-5" aria-hidden="true" />}
              title="No matching forms"
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
