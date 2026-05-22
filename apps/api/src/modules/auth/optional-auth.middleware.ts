import type { NextFunction, Request, Response } from "express";

import { env } from "../../shared/config/env.js";
import { verifyClerkBearerToken } from "./clerk-token-verifier.js";

export async function optionalAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    if (env.NODE_ENV === "test" && request.header("x-test-clerk-user-id")) {
      request.auth = {
        clerkUserId: request.header("x-test-clerk-user-id")!,
        userId: request.header("x-test-user-id") ?? undefined,
        email: request.header("x-test-user-email") ?? "owner@example.com",
      };
      next();
      return;
    }

    const header = request.header("authorization");
    if (header?.startsWith("Bearer ")) {
      request.auth = await verifyClerkBearerToken(header.slice("Bearer ".length).trim());
    }

    next();
  } catch {
    next();
  }
}
