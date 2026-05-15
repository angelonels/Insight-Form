import { index, jsonb, pgTable, text, timestamp, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { forms } from "./forms.schema.js";
import { users } from "./users.schema.js";

export const generatedFormDrafts = pgTable(
  "generated_form_drafts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    guidedOptions: jsonb("guided_options").default({}).notNull(),
    generatedSchema: jsonb("generated_schema").notNull(),
    status: text("status").default("generated").notNull(),
    acceptedFormId: uuid("accepted_form_id").references(() => forms.id),
    modelProvider: text("model_provider"),
    modelName: text("model_name"),
    promptVersion: text("prompt_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCreatedAtIdx: index("generated_form_drafts_user_id_created_at_idx").on(table.userId, table.createdAt.desc()),
    statusCheck: check("generated_form_drafts_status_check", sql`${table.status} in ('generated', 'accepted', 'discarded')`),
  }),
);
