import type { ReactNode } from "react";

import { Button } from "./button.js";

export function Drawer({
  children,
  onOpenChange,
  open,
  title,
}: {
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="absolute bottom-0 left-0 right-0 max-h-[86dvh] overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-soft md:left-auto md:top-0 md:h-full md:max-h-none md:w-[420px] md:rounded-none">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold" id="drawer-title">
            {title}
          </h2>
          <Button aria-label="Close drawer" onClick={() => onOpenChange(false)} size="sm" type="button" variant="ghost">
            Close
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
