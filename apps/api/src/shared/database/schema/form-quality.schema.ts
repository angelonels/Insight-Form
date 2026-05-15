import { boolean, check, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { forms } from "./forms.schema.js";

export const formQualityChecks = pgTable(
  "form_quality_checks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    score: integer("score"),
    summary: text("summary"),
    modelProvider: text("model_provider"),
    modelName: text("model_name"),
    promptVersion: text("prompt_version"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
  },
  (table) => ({
    formCreatedAtIdx: index("form_quality_checks_form_id_created_at_idx").on(table.formId, table.createdAt.desc()),
    statusCheck: check("form_quality_checks_status_check", sql`${table.status} in ('processing', 'completed', 'failed')`),
    scoreCheck: check("form_quality_checks_score_check", sql`${table.score} is null or (${table.score} >= 0 and ${table.score} <= 100)`),
  }),
);

export const formQualityIssues = pgTable(
  "form_quality_issues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    qualityCheckId: uuid("quality_check_id")
      .notNull()
      .references(() => formQualityChecks.id, { onDelete: "cascade" }),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id"),
    questionId: uuid("question_id"),
    severity: text("severity").notNull(),
    issueType: text("issue_type").notNull(),
    problem: text("problem").notNull(),
    whyItMatters: text("why_it_matters").notNull(),
    suggestedFix: jsonb("suggested_fix"),
    status: text("status").default("open").notNull(),
    isSafeAutoFix: boolean("is_safe_auto_fix").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    qualityCheckIdx: index("form_quality_issues_quality_check_id_idx").on(table.qualityCheckId),
    formStatusIdx: index("form_quality_issues_form_id_status_idx").on(table.formId, table.status),
    severityCheck: check("form_quality_issues_severity_check", sql`${table.severity} in ('high', 'medium', 'low')`),
    statusCheck: check("form_quality_issues_status_check", sql`${table.status} in ('open', 'applied', 'ignored')`),
  }),
);
