import type { ApiClient } from "../../../lib/api/index.js";
import type { CurrentUser } from "../types/user.types.js";

export const userApi = {
  getCurrent: (api: ApiClient) => api.get<CurrentUser>("/api/me"),
  syncCurrent: (
    api: ApiClient,
    body: {
      email?: string;
      displayName?: string | null;
      imageUrl?: string | null;
    },
  ) => api.post<CurrentUser, typeof body>("/api/me/sync", body),
};
