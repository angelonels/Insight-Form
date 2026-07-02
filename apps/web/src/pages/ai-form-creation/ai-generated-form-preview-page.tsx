import { ArrowClockwise, ArrowRight } from "@phosphor-icons/react";
import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "../../components/feedback/empty-state.js";
import { ErrorState } from "../../components/feedback/error-state.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { routes } from "../../app/routes.js";
import { useAcceptGeneratedDraft } from "../../features/ai-form-creation/hooks/use-ai-form-creation.js";
import type { EditableFormDraft } from "../../features/forms/types/form.types.js";
import { FormPreview } from "../../features/public-form/components/form-preview.js";

export function AiGeneratedFormPreviewPage() {
  const { generatedDraftId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const acceptDraft = useAcceptGeneratedDraft();
  const schema = useMemo(() => readDraftSchema(generatedDraftId, location.state), [generatedDraftId, location.state]);

  function handleAccept() {
    acceptDraft.mutate(generatedDraftId, {
      onSuccess: (result) => navigate(routes.formEditor(result.formId)),
    });
  }

  if (!schema) {
    return (
      <EmptyState
        action={
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" to={routes.aiFormCreation}>
            Create another draft
          </Link>
        }
        description="This draft is no longer available in this browser session. Create a fresh one to keep going."
        icon={<ArrowClockwise className="size-5" aria-hidden="true" />}
        title="Draft preview expired"
      />
    );
  }

  return (
    <section className="grid gap-8">
      <PageHeader
        action={
          <>
            <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium" to={routes.aiFormCreation}>
              Regenerate
            </Link>
            <Button isLoading={acceptDraft.isPending} onClick={handleAccept} type="button">
              Use this form
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </>
        }
        description="Review the draft before opening it in the editor. Nothing is published until you choose to publish."
        eyebrow="Generated draft"
        title="Review the draft"
      />
      {acceptDraft.isError ? <ErrorState error={acceptDraft.error} title="Could not accept this draft" /> : null}
      <FormPreview draft={schema} />
    </section>
  );
}

function readDraftSchema(generatedDraftId: string, state: unknown): EditableFormDraft | null {
  if (typeof state === "object" && state && "schema" in state) {
    return (state as { schema: EditableFormDraft }).schema;
  }

  const stored = sessionStorage.getItem(`generated-draft:${generatedDraftId}`);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as EditableFormDraft;
  } catch {
    return null;
  }
}
