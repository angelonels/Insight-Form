import { check, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { forms } from "./forms.schema.js";
import { publishedForms } from "./published-forms.schema.js";

export const formResponses = pgTable(
  "form_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    publishedFormId: uuid("published_form_id")
      .notNull()
      .references(() => publishedForms.id, { onDelete: "cascade" }),
    respondentEmail: text("respondent_email"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    completionTimeSeconds: integer("completion_time_seconds"),
    respondentFingerprint: text("respondent_fingerprint"),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    metadata: jsonb("metadata").default({}).notNull(),
  },
  (table) => ({
    formSubmittedAtIdx: index("form_responses_form_id_submitted_at_idx").on(table.formId, table.submittedAt.desc()),
    completionTimeCheck: check(
      "form_responses_completion_time_seconds_check",
      sql`${table.completionTimeSeconds} is null or ${table.completionTimeSeconds} >= 0`,
    ),
  }),
);

export const responseAnswers = pgTable(
  "response_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponses.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").notNull(),
    questionText: text("question_text").notNull(),
    questionType: text("question_type").notNull(),
    answer: jsonb("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    responseIdx: index("response_answers_response_id_idx").on(table.responseId),
  }),
);
