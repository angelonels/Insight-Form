import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./src/shared/database/migrations",
  schema: "./src/shared/database/schema/index.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});

