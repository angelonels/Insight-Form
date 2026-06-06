import { Router } from "express";

import { asyncHandler } from "../../shared/http/async-handler.js";
import { parseBody, parseParams } from "../../shared/http/parse-request.js";
import { ok } from "../../shared/http/response.js";
import { getRequiredUserId } from "../auth/request-auth-context.js";
import { requireCurrentUser } from "../users/require-current-user.middleware.js";
import { AskResponsesUseCase } from "./ask-responses.usecase.js";
import { GenerateInsightSnapshotUseCase } from "./generate-insight-snapshot.usecase.js";
import { GetInsightsUseCase } from "./get-insights.usecase.js";
import { askResponsesBodySchema, insightsFormParamsSchema } from "./insights.schemas.js";

export function createInsightsRouter() {
  const router = Router({ mergeParams: true });
  const generateInsights = new GenerateInsightSnapshotUseCase();
  const getInsights = new GetInsightsUseCase();
  const askResponses = new AskResponsesUseCase();

  router.use(...requireCurrentUser);

  router.post(
    "/generate",
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, insightsFormParamsSchema);
      ok(response, await generateInsights.execute({ formId, userId: getRequiredUserId(request) }));
    }),
  );

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, insightsFormParamsSchema);
      ok(response, await getInsights.execute({ formId, userId: getRequiredUserId(request) }));
    }),
  );

  router.post(
    "/ask",
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, insightsFormParamsSchema);
      const { question } = parseBody(request, askResponsesBodySchema);
      ok(response, await askResponses.execute({ formId, question, userId: getRequiredUserId(request) }));
    }),
  );

  return router;
}
