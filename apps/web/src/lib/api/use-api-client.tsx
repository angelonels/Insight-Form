import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

import { isTestAuthEnabled } from "../../app/providers.js";
import { ApiClient } from "./api-client.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const testAuthHeaders = {
  "x-test-clerk-user-id": "clerk_test_owner",
  "x-test-user-id": "00000000-0000-4000-8000-000000010000",
  "x-test-user-email": "owner@example.com",
};

export function useAuthenticatedApiClient() {
  const { getToken } = useAuth();
  const testAuth = isTestAuthEnabled();

  return useMemo(
    () => new ApiClient(apiBaseUrl, testAuth ? undefined : () => getToken(), testAuth ? testAuthHeaders : undefined),
    [getToken, testAuth],
  );
}
