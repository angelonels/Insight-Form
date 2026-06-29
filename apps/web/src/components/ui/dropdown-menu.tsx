import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "../../lib/utils/cn.js";

export function DropdownMenu({
  align = "right",
  children,
  trigger,
}: {
  align?: "left" | "right";
  children: ReactNode;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} type="button">
        {trigger}
      </button>
      {open ? (
        <div
          className={cn(
            "absolute top-full z-30 mt-2 min-w-48 rounded-lg border border-border bg-card p-1 shadow-panel",
            align === "right" ? "right-0" : "left-0",
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownMenuItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-md px-3 py-2 text-sm hover:bg-muted", className)}>{children}</div>;
}
