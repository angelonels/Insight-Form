import { BarChart3, FilePlus2 } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/app" className="text-lg font-semibold">
            InsightForm
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/app/forms/new/ai"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <FilePlus2 className="size-4" />
              Create with AI
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium"
            >
              <BarChart3 className="size-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

