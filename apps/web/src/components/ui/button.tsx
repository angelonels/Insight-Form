import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/utils/cn.js";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default: "border border-primary bg-primary text-primary-foreground shadow-subtle hover:bg-primary/94",
  secondary: "border border-secondary bg-secondary text-secondary-foreground hover:border-primary/15 hover:bg-secondary/72",
  outline: "border border-border bg-raised text-foreground shadow-subtle hover:border-primary/35 hover:bg-secondary/35",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  link: "h-auto p-0 text-primary underline-offset-4 hover:underline",
  destructive: "border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "size-10 p-0",
};

export function buttonStyles({
  className,
  size = "md",
  variant = "default",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:translate-y-px",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({ children, className, disabled, isLoading, size, variant, ...props }: ButtonProps) {
  return (
    <button className={buttonStyles({ className, size, variant })} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className="size-3 animate-pulse rounded-sm border border-current bg-current/15" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
