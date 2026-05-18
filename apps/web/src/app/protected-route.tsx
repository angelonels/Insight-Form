import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

export function ProtectedRoute({ children }: PropsWithChildren) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to continue</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            InsightForm keeps your forms, responses, insights, and reports in your account.
          </p>
          <SignInButton mode="modal">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}

