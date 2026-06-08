import { eq, sql } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import {
  formEvents,
  formQualityChecks,
  formQualityIssues,
  formQuestions,
  formResponses,
  forms,
  formSections,
  insightSnapshots,
  publishedForms,
  reports,
  responseAnalyses,
  responseAnswers,
  responseClusterMembers,
  responseClusters,
  responseEmbeddings,
  users,
} from "../../shared/database/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import { buildDemoHackathonSeed } from "./demo-hackathon.fixture.js";

export class EnsureDemoFormUseCase {
  constructor(private readonly database: Database = db) {}

  async execute(input: { userId: string }) {
    return this.database.transaction(async (tx) => {
      await tx.execute(sql`select id from users where id = ${input.userId} for update`);

      const [user] = await tx
        .select({
          id: users.id,
          demoFormSeededAt: users.demoFormSeededAt,
        })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) {
        throw new NotFoundError({
          code: "USER_NOT_FOUND",
          message: "User not found.",
        });
      }

      if (user.demoFormSeededAt) {
        return { seeded: false as const };
      }

      const seed = buildDemoHackathonSeed(input.userId);

      await tx.insert(forms).values(seed.form);
      await tx.insert(formSections).values(seed.sections);
      await tx.insert(formQuestions).values(seed.questions);
      await tx.insert(publishedForms).values(seed.publishedForm);
      await tx.insert(formResponses).values(seed.responses);
      await tx.insert(responseAnswers).values(seed.answers);
      await tx.insert(responseAnalyses).values(seed.analyses);
      await tx.insert(responseEmbeddings).values(seed.embeddings);
      await tx.insert(formEvents).values(seed.events);
      await tx.insert(formQualityChecks).values(seed.qualityCheck);
      await tx.insert(formQualityIssues).values(
        seed.qualityIssues.map((issue) => ({
          ...issue,
          qualityCheckId: seed.qualityCheck.id,
        })),
      );
      await tx.insert(insightSnapshots).values(seed.insightSnapshot);
      await tx.insert(responseClusters).values(seed.clusters);
      await tx.insert(responseClusterMembers).values(seed.clusterMembers);
      await tx.insert(reports).values(seed.reports);
      await tx
        .update(users)
        .set({
          demoFormSeededAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId));

      return {
        seeded: true as const,
        formId: seed.form.id,
        publicSlug: seed.form.publicSlug,
      };
    });
  }
}
