import { relations } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./users.schema.js";

export const forms = pgTable(
  "forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").default("draft").notNull(),
    qualityStatus: text("quality_status").default("not_checked").notNull(),
    insightStatus: text("insight_status").default("not_ready").notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    currentDraftVersion: integer("current_draft_version").default(1).notNull(),
    latestPublishedVersion: integer("latest_published_version"),
    publicSlug: text("public_slug").unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => ({
    ownerUpdatedAtIdx: index("forms_owner_user_id_updated_at_idx").on(table.ownerUserId, table.updatedAt.desc()),
    statusIdx: index("forms_status_idx").on(table.status),
    statusCheck: check("forms_status_check", sql`${table.status} in ('draft', 'published', 'closed')`),
    qualityStatusCheck: check(
      "forms_quality_status_check",
      sql`${table.qualityStatus} in ('not_checked', 'passed', 'needs_review')`,
    ),
    insightStatusCheck: check(
      "forms_insight_status_check",
      sql`${table.insightStatus} in ('not_ready', 'processing', 'ready', 'failed')`,
    ),
  }),
);

export const formSections = pgTable(
  "form_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    formPositionIdx: index("form_sections_form_id_position_idx").on(table.formId, table.position),
    formPositionUnique: unique("form_sections_form_id_position_unique").on(table.formId, table.position),
  }),
);

export const formQuestions = pgTable(
  "form_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => formSections.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    helpText: text("help_text"),
    type: text("type").notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    position: integer("position").notNull(),
    config: jsonb("config").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sectionPositionIdx: index("form_questions_section_id_position_idx").on(table.sectionId, table.position),
    sectionPositionUnique: unique("form_questions_section_id_position_unique").on(table.sectionId, table.position),
    typeCheck: check(
      "form_questions_type_check",
      sql`${table.type} in (
        'short_answer',
        'long_answer',
        'email',
        'number',
        'multiple_choice',
        'checkbox',
        'dropdown',
        'rating_scale'
      )`,
    ),
  }),
);

export const formsRelations = relations(forms, ({ one, many }) => ({
  owner: one(users, {
    fields: [forms.ownerUserId],
    references: [users.id],
  }),
  sections: many(formSections),
}));

export const formSectionsRelations = relations(formSections, ({ one, many }) => ({
  form: one(forms, {
    fields: [formSections.formId],
    references: [forms.id],
  }),
  questions: many(formQuestions),
}));

export const formQuestionsRelations = relations(formQuestions, ({ one }) => ({
  section: one(formSections, {
    fields: [formQuestions.sectionId],
    references: [formSections.id],
  }),
}));
