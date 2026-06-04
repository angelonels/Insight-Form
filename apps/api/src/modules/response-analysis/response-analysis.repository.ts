import { and, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { formResponses, responseAnalyses, responseAnswers } from "../../shared/database/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import type { z } from "zod";
import type { responseAnalysisOutputSchema } from "./response-analysis.schemas.js";

export type ResponseAnalysisOutput = z.infer<typeof responseAnalysisOutputSchema>;

export class ResponseAnalysisRepository {
  constructor(private readonly database: Database = db) {}

  async loadResponseWithAnswers(responseId: string) {
    const [response] = await this.database.select().from(formResponses).where(eq(formResponses.id, responseId)).limit(1);

    if (!response) {
      throw new NotFoundError({ code: "RESPONSE_NOT_FOUND", message: "Response not found." });
    }

    const answers = await this.database.select().from(responseAnswers).where(eq(responseAnswers.responseId, responseId));

    return {
      response,
      answers,
    };
  }

  async findByResponseId(responseId: string) {
    const [analysis] = await this.database.select().from(responseAnalyses).where(eq(responseAnalyses.responseId, responseId)).limit(1);
    return analysis;
  }

  async upsert(input: {
    responseId: string;
    formId: string;
    output: ResponseAnalysisOutput;
    modelProvider: string;
    modelName: string;
    promptVersion: string;
  }) {
    const [analysis] = await this.database
      .insert(responseAnalyses)
      .values({
        responseId: input.responseId,
        formId: input.formId,
        summary: input.output.summary,
        sentiment: input.output.sentiment,
        topics: input.output.topics,
        painPoints: input.output.painPoints,
        featureRequests: input.output.featureRequests,
        followUpNeeded: input.output.followUpNeeded,
        followUpReason: input.output.followUpReason,
        modelProvider: input.modelProvider,
        modelName: input.modelName,
        promptVersion: input.promptVersion,
      })
      .onConflictDoUpdate({
        target: responseAnalyses.responseId,
        set: {
          summary: input.output.summary,
          sentiment: input.output.sentiment,
          topics: input.output.topics,
          painPoints: input.output.painPoints,
          featureRequests: input.output.featureRequests,
          followUpNeeded: input.output.followUpNeeded,
          followUpReason: input.output.followUpReason,
          modelProvider: input.modelProvider,
          modelName: input.modelName,
          promptVersion: input.promptVersion,
          updatedAt: new Date(),
        },
      })
      .returning();

    return analysis;
  }

  async deleteEmbeddingsForResponseModel(responseId: string, modelName: string) {
    const { responseEmbeddings } = await import("../../shared/database/schema/index.js");
    await this.database
      .delete(responseEmbeddings)
      .where(and(eq(responseEmbeddings.responseId, responseId), eq(responseEmbeddings.modelName, modelName)));
  }
}
