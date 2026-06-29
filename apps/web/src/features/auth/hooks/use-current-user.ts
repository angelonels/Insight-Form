import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../lib/api/query-keys.js";
import { useAuthenticatedApiClient } from "../../../lib/api/use-api-client.js";
import { userApi } from "../api/user-api.js";

export function useCurrentUser() {
  const api = useAuthenticatedApiClient();

  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => userApi.getCurrent(api),
  });
}

export function useSyncCurrentUser() {
  const api = useAuthenticatedApiClient();
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: () =>
      userApi.syncCurrent(api, {
        email: user?.primaryEmailAddress?.emailAddress,
        displayName: user?.fullName ?? user?.username ?? null,
        imageUrl: user?.imageUrl ?? null,
      }),
    onSuccess: (currentUser) => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
}
