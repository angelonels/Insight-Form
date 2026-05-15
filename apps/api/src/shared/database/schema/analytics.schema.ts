import { bigint, check, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { forms } from "./forms.schema.js";
import { publishedForms } from "./published-forms.schema.js";
import { formResponses } from "./responses.schema.js";

export const formEvents = pgTable(
  "form_events",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    publishedFormId: uuid("published_form_id").references(() => publishedForms.id, { onDelete: "cascade" }),
    responseId: uuid("response_id").references(() => formResponses.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    sectionId: uuid("section_id"),
    questionId: uuid("question_id"),
    metadata: jsonb("metadata").default({}).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    formOccurredAtIdx: index("form_events_form_id_occurred_at_idx").on(table.formId, table.occurredAt.desc()),
    publishedFormEventTypeIdx: index("form_events_published_form_id_event_type_idx").on(
      table.publishedFormId,
      table.eventType,
    ),
    eventTypeCheck: check(
      "form_events_event_type_check",
      sql`${table.eventType} in (
        'form_opened',
        'form_started',
        'section_reached',
        'question_focused',
        'form_submitted'
      )`,
    ),
  }),
);
