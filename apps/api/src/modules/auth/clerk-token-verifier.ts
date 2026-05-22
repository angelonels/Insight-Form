import { verifyToken } from "@clerk/backend";

import { env } from "../../shared/config/env.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";
import type { AuthContext } from "./auth.types.js";

function readStringClaim(claims: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export async function verifyClerkBearerToken(token: string): Promise<AuthContext> {
  if (!env.CLERK_SECRET_KEY && !env.CLERK_JWT_KEY) {
    throw new UnauthorizedError({
      message: "Clerk credentials are not configured.",
    });
  }

  const claims = (await verifyToken(token, {
    secretKey: env.CLERK_SECRET_KEY,
    jwtKey: env.CLERK_JWT_KEY,
  })) as Record<string, unknown>;

  const clerkUserId = readStringClaim(claims, ["sub", "clerk_user_id", "user_id"]);
  if (!clerkUserId) {
    throw new UnauthorizedError({
      message: "Invalid Clerk token.",
    });
  }

  return {
    clerkUserId,
    email: readStringClaim(claims, ["email", "primary_email_address", "email_address"]),
    displayName: readStringClaim(claims, ["name", "full_name", "display_name"]),
    imageUrl: readStringClaim(claims, ["image_url", "picture"]),
    claims,
  };
}
