import { boolean, check, index, integer, pgTable, text, timestamp, unique, uuid, vector } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { forms } from "./forms.schema.js";
import { responseAnswers, formResponses } from "./responses.schema.js";

export const responseAnalyses = pgTable(
  "response_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponses.id, { onDelete: "cascade" })
      .unique(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    sentiment: text("sentiment").notNull(),
    topics: text("topics").array().default([]).notNull(),
    painPoints: text("pain_points").array().default([]).notNull(),
    featureRequests: text("feature_requests").array().default([]).notNull(),
    followUpNeeded: boolean("follow_up_needed").default(false).notNull(),
    followUpReason: text("follow_up_reason"),
    modelProvider: text("model_provider").notNull(),
    modelName: text("model_name").notNull(),
    promptVersion: text("prompt_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    formIdx: index("response_analyses_form_id_idx").on(table.formId),
    sentimentIdx: index("response_analyses_sentiment_idx").on(table.sentiment),
    sentimentCheck: check("response_analyses_sentiment_check", sql`${table.sentiment} in ('positive', 'neutral', 'negative', 'mixed')`),
  }),
);

export const responseEmbeddings = pgTable(
  "response_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponses.id, { onDelete: "cascade" }),
    answerId: uuid("answer_id").references(() => responseAnswers.id, { onDelete: "cascade" }),
    contentKind: text("content_kind").notNull(),
    content: text("content").notNull(),
    contentHash: text("content_hash").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    modelProvider: text("model_provider").notNull(),
    modelName: text("model_name").notNull(),
    embeddingDimensions: integer("embedding_dimensions").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    formIdx: index("response_embeddings_form_id_idx").on(table.formId),
    responseIdx: index("response_embeddings_response_id_idx").on(table.responseId),
    responseModelUnique: unique("response_embeddings_response_content_model_unique").on(
      table.responseId,
      table.contentHash,
      table.modelName,
    ),
    contentKindCheck: check(
      "response_embeddings_content_kind_check",
      sql`${table.contentKind} in ('long_answer', 'response_summary', 'pain_point', 'feature_request')`,
    ),
  }),
);
