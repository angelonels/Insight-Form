import express from "express";

import { errorHandler } from "./shared/errors/error-handler.middleware.js";
import { registerSecurityMiddleware } from "./shared/security/register-security-middleware.js";
import { logger } from "./shared/logger/logger.js";
import { createAiFormAuthoringRouter } from "./modules/ai-form-authoring/ai-form-authoring.routes.js";
import { createAnalyticsRouter } from "./modules/analytics/analytics.routes.js";
import { createFormRouter } from "./modules/forms/form.routes.js";
import { createPublicFormRouter } from "./modules/form-publication/public-form.routes.js";
import { createInsightsRouter } from "./modules/insights/insights.routes.js";
import { createReportRouter } from "./modules/reports/report.routes.js";
import { createResponseRouter } from "./modules/responses/response.routes.js";
import { createUserRouter } from "./modules/users/user.routes.js";

export function createApp() {
  const app = express();

  registerSecurityMiddleware(app);

  app.get("/health", (_request, response) => {
    response.status(200).json({
      data: {
        status: "ok",
        service: "insightform-api",
      },
    });
  });

  app.get("/", (_request, response) => {
    response.status(200).json({
      data: {
        status: "ok",
        service: "insightform-api",
      },
    });
  });

  const registerApiRoutes = (prefix: string) => {
    app.use(prefix || "/", createUserRouter());
    app.use(prefix || "/", createAiFormAuthoringRouter());
    app.use(`${prefix}/forms`, createFormRouter());
    app.use(`${prefix}/forms/:formId/analytics`, createAnalyticsRouter());
    app.use(`${prefix}/forms/:formId/insights`, createInsightsRouter());
    app.use(`${prefix}/forms/:formId/reports`, createReportRouter());
    app.use(`${prefix}/forms/:formId/responses`, createResponseRouter());
    app.use(`${prefix}/public/forms`, createPublicFormRouter());
  };

  registerApiRoutes("/api");
  registerApiRoutes("");

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });

  app.use(errorHandler(logger));

  return app;
}
