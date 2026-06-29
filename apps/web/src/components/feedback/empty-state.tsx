import type { ReactNode } from "react";

import { cn } from "../../lib/utils/cn.js";

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  className?: string;
  description: string;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm", className)}>
      {icon ? <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">{icon}</div> : null}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
