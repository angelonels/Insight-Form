import { check, index, integer, jsonb, numeric, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { forms } from "./forms.schema.js";
import { formResponses } from "./responses.schema.js";

export const insightSnapshots = pgTable(
  "insight_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    totalResponses: integer("total_responses").default(0).notNull(),
    sentimentBreakdown: jsonb("sentiment_breakdown").default({}).notNull(),
    overviewMetrics: jsonb("overview_metrics").default({}).notNull(),
    questionMetrics: jsonb("question_metrics").default([]).notNull(),
    keyFindings: jsonb("key_findings").default([]).notNull(),
    recommendedActions: jsonb("recommended_actions").default([]).notNull(),
    dropoffSummary: jsonb("dropoff_summary").default({}).notNull(),
    modelProvider: text("model_provider"),
    modelName: text("model_name"),
    promptVersion: text("prompt_version"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    formCreatedAtIdx: index("insight_snapshots_form_id_created_at_idx").on(table.formId, table.createdAt.desc()),
    statusCheck: check("insight_snapshots_status_check", sql`${table.status} in ('pending', 'processing', 'ready', 'failed')`),
    totalResponsesCheck: check("insight_snapshots_total_responses_check", sql`${table.totalResponses} >= 0`),
  }),
);

export const responseClusters = pgTable(
  "response_clusters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    insightSnapshotId: uuid("insight_snapshot_id").references(() => insightSnapshots.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    sentiment: text("sentiment").notNull(),
    responseCount: integer("response_count").notNull(),
    representativeQuotes: jsonb("representative_quotes").default([]).notNull(),
    recommendedAction: text("recommended_action"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    formIdx: index("response_clusters_form_id_idx").on(table.formId),
    snapshotIdx: index("response_clusters_insight_snapshot_id_idx").on(table.insightSnapshotId),
    sentimentCheck: check("response_clusters_sentiment_check", sql`${table.sentiment} in ('positive', 'neutral', 'negative', 'mixed')`),
    responseCountCheck: check("response_clusters_response_count_check", sql`${table.responseCount} >= 0`),
  }),
);

export const responseClusterMembers = pgTable(
  "response_cluster_members",
  {
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => responseClusters.id, { onDelete: "cascade" }),
    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponses.id, { onDelete: "cascade" }),
    similarityScore: numeric("similarity_score"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.clusterId, table.responseId] }),
    responseIdx: index("response_cluster_members_response_id_idx").on(table.responseId),
  }),
);
