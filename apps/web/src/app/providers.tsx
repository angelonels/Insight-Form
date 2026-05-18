import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "./query-client.js";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export function AppProviders({ children }: PropsWithChildren) {
  const app = (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  if (!clerkPublishableKey) {
    return app;
  }

  return <ClerkProvider publishableKey={clerkPublishableKey}>{app}</ClerkProvider>;
}

