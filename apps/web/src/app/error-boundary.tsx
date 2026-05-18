import type { PropsWithChildren } from "react";

export function ErrorBoundaryFallback({ children }: PropsWithChildren) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
      {children}
    </div>
  );
}

