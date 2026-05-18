import { Outlet } from "react-router-dom";

export function PublicFormShell() {
  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-foreground">
      <div className="mx-auto max-w-2xl">
        <Outlet />
      </div>
    </main>
  );
}

