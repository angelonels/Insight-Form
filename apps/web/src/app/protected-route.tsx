import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

import { BrandLogo } from "../components/brand/brand-logo.js";
import { Button } from "../components/ui/button.js";
import { isClerkConfigured, isTestAuthEnabled } from "./providers.js";

export function ProtectedRoute({ children }: PropsWithChildren) {
  if (isTestAuthEnabled()) {
    return <>{children}</>;
  }

  if (!isClerkConfigured()) {
    return (
      <div className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-6 text-center">
        <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <BrandLogo className="mx-auto mb-6 h-10" />
          <h1 className="text-2xl font-semibold text-foreground">Clerk is required</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Add `VITE_CLERK_PUBLISHABLE_KEY` to `apps/web/.env` to open protected InsightForm
            screens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <AuthLoaded>{children}</AuthLoaded>
      </SignedIn>
      <SignedOut>
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <BrandLogo className="mb-2 h-11" />
          <h1 className="text-2xl font-semibold text-foreground">Sign in to continue</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            InsightForm keeps your forms, responses, insights, and reports in your account.
          </p>
          <SignInButton mode="modal">
            <Button type="button">Sign in</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}

function AuthLoaded({ children }: PropsWithChildren) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-6 text-center">
        <div>
          <BrandLogo className="mx-auto h-10 animate-pulse" />
          <p className="mt-4 text-sm text-muted-foreground">Checking your InsightForm session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
