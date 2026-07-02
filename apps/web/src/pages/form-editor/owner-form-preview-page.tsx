import { useParams } from "react-router-dom";

import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { useFormDetail } from "../../features/forms/hooks/use-forms.js";
import { FormPreview } from "../../features/public-form/components/form-preview.js";

export function OwnerFormPreviewPage() {
  const { formId = "" } = useParams();
  const form = useFormDetail(formId);

  return (
    <section className="grid gap-8">
      <PageHeader description="See the form the way respondents will see it before you publish or share it." eyebrow="Preview" title="Preview form" />
      {form.isPending ? <LoadingState rows={2} /> : null}
      {form.isError ? <ErrorState error={form.error} title="Could not load preview" /> : null}
      {form.isSuccess ? <FormPreview draft={form.data} /> : null}
    </section>
  );
}
