import pino from "pino";

import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: [
    "req.headers.authorization",
    "request.headers.authorization",
    "CLERK_SECRET_KEY",
    "CLERK_JWT_KEY",
    "BEDROCK_AWS_ACCESS_KEY_ID",
    "BEDROCK_AWS_SECRET_ACCESS_KEY",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ],
});
