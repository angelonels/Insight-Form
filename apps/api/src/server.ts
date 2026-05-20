import "dotenv/config";

import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./shared/config/env.js";
import { logger } from "./shared/logger/logger.js";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "InsightForm API listening");
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, "Shutting down API server");
  server.close((error) => {
    if (error) {
      logger.error({ error }, "Failed to close API server cleanly");
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

