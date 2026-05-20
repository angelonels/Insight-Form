import cors from "cors";
import type { Express } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "node:crypto";
import { pinoHttp } from "pino-http";

import { corsAllowedOrigins } from "../config/env.js";
import { logger } from "../logger/logger.js";

export function registerSecurityMiddleware(app: Express) {
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: corsAllowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 600,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(
    pinoHttp({
      logger,
      genReqId: (request) => request.headers["x-request-id"]?.toString() ?? crypto.randomUUID(),
    }),
  );
}
