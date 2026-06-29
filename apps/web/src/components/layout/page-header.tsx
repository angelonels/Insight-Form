import type { ReactNode } from "react";

import { cn } from "../../lib/utils/cn.js";

export function PageHeader({
  action,
  className,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className={cn("flex flex-col justify-between gap-5 border-b border-border-subtle pb-7 md:flex-row md:items-end", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1.5 text-sm font-medium text-primary">{eyebrow}</p> : null}
        <h1 className="font-editorial text-3xl font-medium leading-[1.05] tracking-[-0.025em] text-foreground sm:text-[2.35rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{action}</div> : null}
    </div>
  );
}
