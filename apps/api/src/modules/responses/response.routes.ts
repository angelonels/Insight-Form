import { Router } from "express";

import { asyncHandler } from "../../shared/http/async-handler.js";
import { parseParams } from "../../shared/http/parse-request.js";
import { ok } from "../../shared/http/response.js";
import { getRequiredUserId } from "../auth/request-auth-context.js";
import { requireCurrentUser } from "../users/require-current-user.middleware.js";
import { ResponseRepository } from "./response.repository.js";
import { responseFormParamsSchema, responseParamsSchema } from "./response.schemas.js";

export function createResponseRouter() {
  const router = Router({ mergeParams: true });
  const responses = new ResponseRepository();

  router.use(...requireCurrentUser);

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, responseFormParamsSchema);
      ok(response, await responses.listForForm(formId, getRequiredUserId(request)));
    }),
  );

  router.get(
    "/:responseId",
    asyncHandler(async (request, response) => {
      const { formId, responseId } = parseParams(request, responseParamsSchema);
      ok(response, await responses.getDetail(formId, getRequiredUserId(request), responseId));
    }),
  );

  router.post(
    "/:responseId/regenerate-analysis",
    asyncHandler(async (request, response) => {
      const { formId, responseId } = parseParams(request, responseParamsSchema);
      ok(response, await responses.regenerateAnalysis(formId, getRequiredUserId(request), responseId));
    }),
  );

  return router;
}
