import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../../shared/errors/app-error.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { getAuthContext } from "../auth/request-auth-context.js";
import { SyncCurrentUserUseCase } from "./sync-current-user.usecase.js";
import { UserRepository } from "./user.repository.js";

const userRepository = new UserRepository();
const syncCurrentUser = new SyncCurrentUserUseCase(userRepository);

async function resolveCurrentUser(request: Request, _response: Response, next: NextFunction) {
  try {
    const auth = getAuthContext(request);
    const existingUser = auth.userId
      ? await userRepository.findById(auth.userId)
      : await userRepository.findByClerkUserId(auth.clerkUserId);

    if (existingUser) {
      request.auth = { ...auth, userId: existingUser.id };
      next();
      return;
    }

    if (!auth.email) {
      throw new UnauthorizedError({
        message: "Current user is not synced.",
      });
    }

    const user = await syncCurrentUser.execute({ auth });
    request.auth = { ...auth, userId: user.id };
    next();
  } catch (error) {
    next(error);
  }
}

export const requireCurrentUser = [requireAuth, resolveCurrentUser];
