import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "./query-client.js";
import { Toaster } from "../components/ui/sonner.js";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export function AppProviders({ children }: PropsWithChildren) {
  const app = (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );

  return clerkPublishableKey ? <ClerkProvider publishableKey={clerkPublishableKey}>{app}</ClerkProvider> : app;
}

export function isClerkConfigured() {
  return Boolean(clerkPublishableKey);
}

export function isTestAuthEnabled() {
  return import.meta.env.DEV && import.meta.env.VITE_ENABLE_TEST_AUTH === "true";
}
