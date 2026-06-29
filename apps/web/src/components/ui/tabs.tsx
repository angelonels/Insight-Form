import type { ReactNode } from "react";

import { cn } from "../../lib/utils/cn.js";

export function Tabs({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4", className)}>{children}</div>;
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-1 border-b border-border-subtle", className)}>{children}</div>;
}

export function TabButton({
  active,
  children,
  className,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "relative px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
        active ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary" : "hover:text-foreground",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
