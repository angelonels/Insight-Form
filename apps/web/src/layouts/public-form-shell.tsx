import { Link, Outlet } from "react-router-dom";

import { BrandLogo } from "../components/brand/brand-logo.js";

export function PublicFormShell() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="border-b border-border-subtle bg-raised/96 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-3xl items-center px-4 sm:px-6">
          <Link aria-label="InsightForm home" className="flex items-center gap-3" to="/">
            <BrandLogo className="h-9" />
            <span>
              <span className="block text-xs font-normal text-muted-foreground">
                Private, focused feedback
              </span>
            </span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12" id="public-form-main">
        <Outlet />
      </main>
    </div>
  );
}
