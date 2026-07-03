export function PublicFormClosedPage() {
  return (
    <section className="rounded-2xl border border-border bg-card p-8 text-center shadow-panel">
      <h1 className="text-2xl font-semibold">This form is no longer accepting responses.</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">The owner closed collection for this form.</p>
    </section>
  );
}
