import { Router } from "express";

import { parseBody } from "../../shared/http/parse-request.js";
import { ok } from "../../shared/http/response.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { getAuthContext } from "../auth/request-auth-context.js";
import { GetCurrentUserUseCase } from "./get-current-user.usecase.js";
import { mapUser } from "./user.mapper.js";
import { UserRepository } from "./user.repository.js";
import { syncCurrentUserBodySchema } from "./user.schemas.js";
import { SyncCurrentUserUseCase } from "./sync-current-user.usecase.js";

export function createUserRouter() {
  const router = Router();
  const userRepository = new UserRepository();
  const getCurrentUser = new GetCurrentUserUseCase(userRepository);
  const syncCurrentUser = new SyncCurrentUserUseCase(userRepository);

  router.get("/me", requireAuth, async (request, response, next) => {
    try {
      const user = await getCurrentUser.execute(getAuthContext(request));
      ok(response, mapUser(user));
    } catch (error) {
      next(error);
    }
  });

  router.post("/me/sync", requireAuth, async (request, response, next) => {
    try {
      const profile = parseBody(request, syncCurrentUserBodySchema);
      const user = await syncCurrentUser.execute({
        auth: getAuthContext(request),
        profile,
      });
      request.auth = { ...request.auth!, userId: user.id };
      ok(response, mapUser(user));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
