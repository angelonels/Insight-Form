import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../../shared/http/async-handler.js";
import { parseParams } from "../../shared/http/parse-request.js";
import { ok } from "../../shared/http/response.js";
import { getRequiredUserId } from "../auth/request-auth-context.js";
import { requireCurrentUser } from "../users/require-current-user.middleware.js";
import { AnalyticsRepository } from "./analytics.repository.js";

const analyticsParamsSchema = z.object({
  formId: z.string().uuid(),
});

export function createAnalyticsRouter() {
  const router = Router({ mergeParams: true });
  const analytics = new AnalyticsRepository();

  router.use(...requireCurrentUser);

  router.get(
    "/dropoff",
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, analyticsParamsSchema);
      ok(response, await analytics.calculateDropoff(formId, getRequiredUserId(request)));
    }),
  );

  return router;
}
