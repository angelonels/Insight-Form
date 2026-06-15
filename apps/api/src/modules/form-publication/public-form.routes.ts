import { Router } from "express";

import { asyncHandler } from "../../shared/http/async-handler.js";
import { parseBody, parseParams } from "../../shared/http/parse-request.js";
import { noContent, ok } from "../../shared/http/response.js";
import { PublicFormModule } from "./public-form.module.js";
import {
  publicEventBodySchema,
  publicSlugParamsSchema,
  submitPublicResponseBodySchema,
} from "./public-form.schemas.js";

export function createPublicFormRouter() {
  const router = Router();
  const publicForms = new PublicFormModule();

  router.get(
    "/:publicSlug",
    asyncHandler(async (request, response) => {
      const { publicSlug } = parseParams(request, publicSlugParamsSchema);
      ok(response, await publicForms.getPublicForm(publicSlug));
    }),
  );

  router.post(
    "/:publicSlug/events",
    asyncHandler(async (request, response) => {
      const { publicSlug } = parseParams(request, publicSlugParamsSchema);
      const body = parseBody(request, publicEventBodySchema);
      await publicForms.trackEvent(publicSlug, body);
      noContent(response);
    }),
  );

  router.post(
    "/:publicSlug/submit",
    asyncHandler(async (request, response) => {
      const { publicSlug } = parseParams(request, publicSlugParamsSchema);
      const body = parseBody(request, submitPublicResponseBodySchema);
      ok(
        response,
        await publicForms.submit(publicSlug, {
          ...body,
          userAgent: request.header("user-agent"),
          ip: request.ip,
        }),
      );
    }),
  );

  return router;
}
