import { index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { forms } from "./forms.schema.js";

export const publishedForms = pgTable(
  "published_forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    schema: jsonb("schema").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    formVersionIdx: index("published_forms_form_id_version_idx").on(table.formId, table.version.desc()),
    formVersionUnique: unique("published_forms_form_id_version_unique").on(table.formId, table.version),
  }),
);
