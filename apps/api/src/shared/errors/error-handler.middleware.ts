import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import type { Logger } from "pino";

import { AppError } from "./app-error.js";

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error, request, response, _next) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
              message: issue.message,
          })),
          requestId: request.id,
        },
      });
      return;
    }

    if (error instanceof AppError) {
      response.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId: request.id,
        },
      });
      return;
    }

    logger.error({ error }, "Unhandled API error");

    response.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
        requestId: request.id,
      },
    });
  };
}
