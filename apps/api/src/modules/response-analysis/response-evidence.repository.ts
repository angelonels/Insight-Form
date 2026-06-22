import { sql } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";

export class ResponseEvidenceRepository {
  constructor(private readonly database: Database = db) {}

  async findRelevant(formId: string, embedding: number[], limit = 12) {
    return this.database.execute(sql`
      select
        id,
        response_id as "responseId",
        answer_id as "answerId",
        content,
        content_kind as "contentKind",
        embedding <=> ${JSON.stringify(embedding)}::vector as distance
      from response_embeddings
      where form_id = ${formId}
      order by embedding <=> ${JSON.stringify(embedding)}::vector
      limit ${limit}
    `);
  }
}
