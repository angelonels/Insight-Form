import { CheckCircle } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";

import { routes } from "../../app/routes.js";

export function PublicFormThankYouPage() {
  const { publicSlug = "" } = useParams();

  return (
    <section className="rounded-2xl border border-border bg-card p-8 text-center shadow-panel">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success">
        <CheckCircle className="size-7" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold">Thank you for your response.</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Your answers were submitted and will be included in the owner&apos;s response analysis.
      </p>
      <Link className="mt-6 inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted" to={routes.publicForm(publicSlug)}>
        Back to form
      </Link>
    </section>
  );
}
