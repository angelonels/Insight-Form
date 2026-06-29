import type { ReactNode } from "react";

import { ApiError } from "../../lib/api/index.js";
import { cn } from "../../lib/utils/cn.js";

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function ErrorState({
  action,
  className,
  error,
  title = "Could not load this view",
}: {
  action?: ReactNode;
  className?: string;
  error?: unknown;
  title?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-destructive/25 bg-destructive/5 p-5", className)} role="alert">
      <h2 className="font-semibold text-destructive">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-foreground">{getErrorMessage(error)}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
