import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { forms } from "./forms.schema.js";
import { insightSnapshots } from "./insights.schema.js";

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    insightSnapshotId: uuid("insight_snapshot_id").references(() => insightSnapshots.id),
    reportType: text("report_type").notNull(),
    status: text("status").notNull(),
    title: text("title").notNull(),
    contentMarkdown: text("content_markdown"),
    modelProvider: text("model_provider"),
    modelName: text("model_name"),
    promptVersion: text("prompt_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    errorMessage: text("error_message"),
  },
  (table) => ({
    formCreatedAtIdx: index("reports_form_id_created_at_idx").on(table.formId, table.createdAt.desc()),
    typeCheck: check("reports_report_type_check", sql`${table.reportType} in ('executive_summary', 'feedback_report')`),
    statusCheck: check("reports_status_check", sql`${table.status} in ('generating', 'ready', 'failed')`),
  }),
);
