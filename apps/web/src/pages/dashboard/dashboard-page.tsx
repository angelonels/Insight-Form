import { Link } from "react-router-dom";

export function DashboardPage() {
  return (
    <section className="grid gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Forms</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, publish, collect, analyze, ask, and report from one workflow.
          </p>
        </div>
        <div className="flex gap-3">
          <Link className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" to="/app/forms/new/ai">
            Create with AI
          </Link>
          <button className="rounded-md border border-border px-4 py-2 text-sm font-medium">
            Create blank form
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-xl font-semibold">No forms yet.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Create a form manually or use AI to generate one in seconds.
        </p>
      </div>
    </section>
  );
}

