import { createClerkClient } from "@clerk/backend";

import { env } from "../../shared/config/env.js";
import { UnauthorizedError, ValidationError } from "../../shared/errors/app-error.js";
import type { AuthContext } from "../auth/auth.types.js";
import { EnsureDemoFormUseCase } from "../demo/ensure-demo-form.usecase.js";
import type { SyncUserInput, UserRepository } from "./user.repository.js";

export type SyncCurrentUserInput = {
  auth: AuthContext;
  profile?: {
    email?: string;
    displayName?: string | null;
    imageUrl?: string | null;
  };
};

async function fetchClerkProfile(clerkUserId: string): Promise<Partial<SyncUserInput>> {
  if (!env.CLERK_SECRET_KEY || env.NODE_ENV === "test" || (env.NODE_ENV === "development" && env.ENABLE_TEST_AUTH)) {
    return {};
  }

  const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  const clerkUser = await clerk.users.getUser(clerkUserId);
  const primaryEmail = clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId);

  return {
    email: primaryEmail?.emailAddress,
    displayName: clerkUser.fullName ?? clerkUser.username ?? null,
    imageUrl: clerkUser.imageUrl ?? null,
  };
}

export class SyncCurrentUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly ensureDemoForm = new EnsureDemoFormUseCase(),
  ) {}

  async execute(input: SyncCurrentUserInput) {
    const clerkProfile = await fetchClerkProfile(input.auth.clerkUserId);
    const profile = {
      email: input.profile?.email ?? input.auth.email ?? clerkProfile.email,
      displayName: input.profile?.displayName ?? input.auth.displayName ?? clerkProfile.displayName,
      imageUrl: input.profile?.imageUrl ?? input.auth.imageUrl ?? clerkProfile.imageUrl,
    };

    if (!input.auth.clerkUserId) {
      throw new UnauthorizedError();
    }

    if (!profile.email) {
      throw new ValidationError({
        code: "USER_EMAIL_REQUIRED",
        message: "A verified Clerk email is required to sync the current user.",
      });
    }

    const user = await this.users.upsertFromClerk({
      clerkUserId: input.auth.clerkUserId,
      email: profile.email,
      displayName: profile.displayName,
      imageUrl: profile.imageUrl,
    });

    await this.ensureDemoForm.execute({ userId: user.id });

    return user;
  }
}
