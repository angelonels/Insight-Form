import type { NextFunction, Request, Response } from "express";

import { env } from "../../shared/config/env.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";
import { verifyClerkBearerToken } from "./clerk-token-verifier.js";

function readBearerToken(request: Request) {
  const header = request.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
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

    const token = readBearerToken(request);
    if (!token) {
      throw new UnauthorizedError();
    }

    request.auth = await verifyClerkBearerToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
