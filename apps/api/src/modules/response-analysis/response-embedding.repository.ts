import { eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { responseEmbeddings } from "../../shared/database/schema/index.js";
import { sha256 } from "../../shared/utils/hash.js";

export type ResponseEmbeddingChunk = {
  formId: string;
  responseId: string;
  answerId?: string | null;
  contentKind: "long_answer" | "response_summary" | "pain_point" | "feature_request";
  content: string;
  embedding: number[];
  modelProvider: string;
  modelName: string;
  embeddingDimensions: number;
};

export class ResponseEmbeddingRepository {
  constructor(private readonly database: Database = db) {}

  async replaceForResponse(responseId: string, modelName: string, chunks: ResponseEmbeddingChunk[]) {
    await this.database.transaction(async (tx) => {
      await tx.delete(responseEmbeddings).where(eq(responseEmbeddings.responseId, responseId));

      if (chunks.length) {
        await tx.insert(responseEmbeddings).values(
          chunks.map((chunk) => ({
            formId: chunk.formId,
            responseId: chunk.responseId,
            answerId: chunk.answerId,
            contentKind: chunk.contentKind,
            content: chunk.content,
            contentHash: sha256(chunk.content),
            embedding: chunk.embedding,
            modelProvider: chunk.modelProvider,
            modelName,
            embeddingDimensions: chunk.embeddingDimensions,
          })),
        );
      }
    });
  }
}
