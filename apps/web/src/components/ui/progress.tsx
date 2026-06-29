import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "../../lib/utils/cn.js";

export function Progress({ className, value }: { className?: string; value: number }) {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <ProgressPrimitive.Root className={cn("h-2 overflow-hidden rounded-full bg-muted", className)} value={normalizedValue}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-primary transition-transform duration-300"
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
