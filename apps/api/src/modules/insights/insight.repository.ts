import { count, desc, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import {
  formEvents,
  formResponses,
  forms,
  insightSnapshots,
  responseAnalyses,
  responseAnswers,
  responseClusters,
} from "../../shared/database/schema/index.js";
import { FormOwnership } from "../forms/form-ownership.js";

export class InsightRepository {
  private readonly ownership: FormOwnership;

  constructor(private readonly database: Database = db) {
    this.ownership = new FormOwnership(database);
  }

  async markProcessing(formId: string, ownerUserId: string) {
    await this.ownership.requireOwner(formId, ownerUserId);
    await this.database
      .update(forms)
      .set({ insightStatus: "processing", updatedAt: new Date() })
      .where(eq(forms.id, formId));
  }

  async markFailed(formId: string) {
    await this.database
      .update(forms)
      .set({ insightStatus: "failed", updatedAt: new Date() })
      .where(eq(forms.id, formId));
  }

  async latest(formId: string, ownerUserId: string) {
    const form = await this.ownership.requireOwner(formId, ownerUserId);
    const [snapshot] = await this.database
      .select()
      .from(insightSnapshots)
      .where(eq(insightSnapshots.formId, formId))
      .orderBy(desc(insightSnapshots.createdAt))
      .limit(1);

    if (!snapshot) {
      if (form.insightStatus === "processing" || form.insightStatus === "failed") {
        const metrics = await this.calculateDeterministicMetrics(formId);
        return {
          id: `${form.insightStatus}-${formId}`,
          formId,
          status: form.insightStatus,
          totalResponses: metrics.totalResponses,
          sentimentBreakdown: metrics.sentimentBreakdown,
          overviewMetrics: metrics.overviewMetrics,
          questionMetrics: metrics.questionMetrics,
          keyFindings: [],
          recommendedActions: [],
          dropoffSummary: metrics.dropoffSummary,
          generatedAt: null,
          clusters: [],
        };
      }

      return null;
    }

    const clusters = await this.database
      .select()
      .from(responseClusters)
      .where(eq(responseClusters.insightSnapshotId, snapshot.id));

    return {
      id: snapshot.id,
      formId: snapshot.formId,
      status:
        form.insightStatus === "processing" || form.insightStatus === "failed"
          ? form.insightStatus
          : snapshot.status,
      totalResponses: snapshot.totalResponses,
      sentimentBreakdown: snapshot.sentimentBreakdown,
      overviewMetrics: snapshot.overviewMetrics,
      questionMetrics: snapshot.questionMetrics,
      keyFindings: snapshot.keyFindings,
      recommendedActions: snapshot.recommendedActions,
      dropoffSummary: snapshot.dropoffSummary,
      generatedAt: snapshot.generatedAt?.toISOString() ?? null,
      clusters,
    };
  }

  async calculateDeterministicMetrics(formId: string) {
    const [responseCount] = await this.database
      .select({ count: count() })
      .from(formResponses)
      .where(eq(formResponses.formId, formId));
    const sentimentRows = await this.database
      .select({ sentiment: responseAnalyses.sentiment, count: count() })
      .from(responseAnalyses)
      .where(eq(responseAnalyses.formId, formId))
      .groupBy(responseAnalyses.sentiment);
    const eventRows = await this.database
      .select({ eventType: formEvents.eventType, count: count() })
      .from(formEvents)
      .where(eq(formEvents.formId, formId))
      .groupBy(formEvents.eventType);
    const questionRows = await this.database
      .select({
        questionId: responseAnswers.questionId,
        questionText: responseAnswers.questionText,
        questionType: responseAnswers.questionType,
        answerCount: count(),
      })
      .from(responseAnswers)
      .innerJoin(formResponses, eq(formResponses.id, responseAnswers.responseId))
      .where(eq(formResponses.formId, formId))
      .groupBy(
        responseAnswers.questionId,
        responseAnswers.questionText,
        responseAnswers.questionType,
      );

    const sentimentBreakdown = Object.fromEntries(
      sentimentRows.map((row) => [row.sentiment, row.count]),
    );
    const dropoffSummary = Object.fromEntries(eventRows.map((row) => [row.eventType, row.count]));

    return {
      totalResponses: responseCount?.count ?? 0,
      sentimentBreakdown,
      overviewMetrics: {
        totalResponses: responseCount?.count ?? 0,
      },
      questionMetrics: questionRows,
      dropoffSummary,
    };
  }

  async listAnalyses(formId: string) {
    return this.database.select().from(responseAnalyses).where(eq(responseAnalyses.formId, formId));
  }

  async saveReadySnapshot(input: {
    formId: string;
    totalResponses: number;
    sentimentBreakdown: unknown;
    overviewMetrics: unknown;
    questionMetrics: unknown;
    keyFindings: unknown;
    recommendedActions: unknown;
    dropoffSummary: unknown;
    clusters?: Array<{
      name: string;
      summary: string;
      sentiment: string;
      responseCount: number;
      representativeQuotes: unknown;
      recommendedAction?: string | null;
    }>;
    modelProvider?: string;
    modelName?: string;
    promptVersion?: string;
  }) {
    return this.database.transaction(async (tx) => {
      const [snapshot] = await tx
        .insert(insightSnapshots)
        .values({
          formId: input.formId,
          status: "ready",
          totalResponses: input.totalResponses,
          sentimentBreakdown: input.sentimentBreakdown,
          overviewMetrics: input.overviewMetrics,
          questionMetrics: input.questionMetrics,
          keyFindings: input.keyFindings,
          recommendedActions: input.recommendedActions,
          dropoffSummary: input.dropoffSummary,
          modelProvider: input.modelProvider,
          modelName: input.modelName,
          promptVersion: input.promptVersion,
          generatedAt: new Date(),
        })
        .returning();

      if (snapshot && input.clusters?.length) {
        await tx.insert(responseClusters).values(
          input.clusters.map((cluster) => ({
            formId: input.formId,
            insightSnapshotId: snapshot.id,
            name: cluster.name,
            summary: cluster.summary,
            sentiment: cluster.sentiment,
            responseCount: cluster.responseCount,
            representativeQuotes: cluster.representativeQuotes,
            recommendedAction: cluster.recommendedAction,
          })),
        );
      }

      await tx
        .update(forms)
        .set({ insightStatus: "ready", updatedAt: new Date() })
        .where(eq(forms.id, input.formId));
      return snapshot;
    });
  }
}
