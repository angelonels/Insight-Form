import type { InputHTMLAttributes } from "react";

import { cn } from "../../lib/utils/cn.js";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-raised px-3 text-sm text-foreground shadow-subtle transition-colors duration-150",
        "placeholder:text-muted-foreground/70 hover:border-primary/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
