import type { Request } from "express";

import { UnauthorizedError } from "../../shared/errors/app-error.js";
import type { AuthContext } from "./auth.types.js";

export function getAuthContext(request: Request): AuthContext {
  if (!request.auth) {
    throw new UnauthorizedError();
  }

  return request.auth;
}

export function getRequiredUserId(request: Request): string {
  const auth = getAuthContext(request);
  if (!auth.userId) {
    throw new UnauthorizedError({
      message: "Current user is not synced.",
    });
  }

  return auth.userId;
}
