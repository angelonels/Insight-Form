import { and, desc, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import {
  formResponses,
  responseAnalyses,
  responseAnswers,
} from "../../shared/database/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { FormOwnership } from "../forms/form-ownership.js";
import { enqueueAnalyzeSubmittedResponse } from "../jobs/enqueue-response-analysis.js";

export class ResponseRepository {
  private readonly ownership: FormOwnership;

  constructor(private readonly database: Database = db) {
    this.ownership = new FormOwnership(database);
  }

  async listForForm(formId: string, ownerUserId: string) {
    await this.ownership.requireOwner(formId, ownerUserId);

    const rows = await this.database
      .select({
        response: formResponses,
        analysis: responseAnalyses,
      })
      .from(formResponses)
      .leftJoin(responseAnalyses, eq(responseAnalyses.responseId, formResponses.id))
      .where(eq(formResponses.formId, formId))
      .orderBy(desc(formResponses.submittedAt));

    return rows.map((row) => ({
      id: row.response.id,
      respondentEmail: row.response.respondentEmail,
      submittedAt: row.response.submittedAt.toISOString(),
      completionTimeSeconds: row.response.completionTimeSeconds,
      summary: row.analysis?.summary ?? null,
      sentiment: row.analysis?.sentiment ?? null,
      topics: row.analysis?.topics ?? [],
      followUpNeeded: row.analysis?.followUpNeeded ?? false,
    }));
  }

  async getDetail(formId: string, ownerUserId: string, responseId: string) {
    await this.ownership.requireOwner(formId, ownerUserId);

    const [response] = await this.database
      .select()
      .from(formResponses)
      .where(and(eq(formResponses.id, responseId), eq(formResponses.formId, formId)))
      .limit(1);

    if (!response) {
      throw new NotFoundError({
        code: "RESPONSE_NOT_FOUND",
        message: "Response not found.",
      });
    }

    const answers = await this.database
      .select()
      .from(responseAnswers)
      .where(eq(responseAnswers.responseId, responseId));
    const [analysis] = await this.database
      .select()
      .from(responseAnalyses)
      .where(eq(responseAnalyses.responseId, responseId))
      .limit(1);

    return {
      id: response.id,
      formId: response.formId,
      publishedFormId: response.publishedFormId,
      respondentEmail: response.respondentEmail,
      submittedAt: response.submittedAt.toISOString(),
      completionTimeSeconds: response.completionTimeSeconds,
      metadata: response.metadata,
      answers: answers.map((answer) => ({
        id: answer.id,
        questionId: answer.questionId,
        questionText: answer.questionText,
        questionType: answer.questionType,
        answer: answer.answer,
      })),
      analysis: analysis
        ? {
            id: analysis.id,
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            topics: analysis.topics,
            painPoints: analysis.painPoints,
            featureRequests: analysis.featureRequests,
            followUpNeeded: analysis.followUpNeeded,
            followUpReason: analysis.followUpReason,
            modelProvider: analysis.modelProvider,
            modelName: analysis.modelName,
            promptVersion: analysis.promptVersion,
          }
        : null,
    };
  }

  async regenerateAnalysis(formId: string, ownerUserId: string, responseId: string) {
    await this.getDetail(formId, ownerUserId, responseId);
    await enqueueAnalyzeSubmittedResponse(responseId);
    return {
      responseId,
      status: "queued" as const,
    };
  }
}
