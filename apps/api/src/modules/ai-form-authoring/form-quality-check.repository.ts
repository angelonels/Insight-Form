import { and, desc, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { formQualityChecks, formQualityIssues, formQuestions, forms } from "../../shared/database/schema/index.js";
import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import type { z } from "zod";
import type { qualityCheckOutputSchema, qualityIssueOutputSchema } from "./ai-form-authoring.schemas.js";

type QualityCheckOutput = z.infer<typeof qualityCheckOutputSchema>;
type QualityIssueOutput = z.infer<typeof qualityIssueOutputSchema>;

export class FormQualityCheckRepository {
  constructor(private readonly database: Database = db) {}

  async saveCompleted(input: {
    formId: string;
    output: QualityCheckOutput;
    modelProvider: string;
    modelName: string;
    promptVersion: string;
  }) {
    return this.database.transaction(async (tx) => {
      const [check] = await tx
        .insert(formQualityChecks)
        .values({
          formId: input.formId,
          status: "completed",
          score: input.output.score,
          summary: input.output.summary,
          modelProvider: input.modelProvider,
          modelName: input.modelName,
          promptVersion: input.promptVersion,
          completedAt: new Date(),
        })
        .returning();

      if (!check) {
        throw new ConflictError({ code: "QUALITY_CHECK_SAVE_FAILED", message: "Failed to save quality check." });
      }

      if (input.output.issues.length) {
        await tx.insert(formQualityIssues).values(
          input.output.issues.map((issue: QualityIssueOutput) => ({
            qualityCheckId: check.id,
            formId: input.formId,
            sectionId: issue.sectionId,
            questionId: issue.questionId,
            severity: issue.severity,
            issueType: issue.issueType,
            problem: issue.problem,
            whyItMatters: issue.whyItMatters,
            suggestedFix: issue.suggestedFix,
            isSafeAutoFix: issue.isSafeAutoFix,
          })),
        );
      }

      await tx
        .update(forms)
        .set({
          qualityStatus: input.output.issues.length ? "needs_review" : "passed",
          updatedAt: new Date(),
        })
        .where(eq(forms.id, input.formId));

      return {
        id: check.id,
        score: check.score,
        summary: check.summary,
        issues: input.output.issues,
      };
    });
  }

  async latestForForm(formId: string) {
    const [check] = await this.database
      .select()
      .from(formQualityChecks)
      .where(eq(formQualityChecks.formId, formId))
      .orderBy(desc(formQualityChecks.createdAt))
      .limit(1);

    if (!check) {
      return null;
    }

    const issues = await this.database.select().from(formQualityIssues).where(eq(formQualityIssues.qualityCheckId, check.id));
    return { check, issues };
  }

  async applyIssue(formId: string, issueId: string) {
    return this.database.transaction(async (tx) => {
      const [issue] = await tx
        .select()
        .from(formQualityIssues)
        .where(and(eq(formQualityIssues.id, issueId), eq(formQualityIssues.formId, formId)))
        .limit(1);

      if (!issue) {
        throw new NotFoundError({ code: "QUALITY_ISSUE_NOT_FOUND", message: "Quality issue not found." });
      }

      if (!issue.isSafeAutoFix || !issue.questionId || !issue.suggestedFix || typeof issue.suggestedFix !== "object") {
        throw new ConflictError({ code: "QUALITY_FIX_NOT_SAFE", message: "This quality issue cannot be applied automatically." });
      }

      const suggestedFix = issue.suggestedFix as {
        questionText?: string;
        helpText?: string | null;
        type?: string;
        config?: Record<string, unknown>;
      };

      await tx
        .update(formQuestions)
        .set({
          questionText: suggestedFix.questionText,
          helpText: suggestedFix.helpText,
          type: suggestedFix.type,
          config: suggestedFix.config,
          updatedAt: new Date(),
        })
        .where(eq(formQuestions.id, issue.questionId));

      await tx
        .update(formQualityIssues)
        .set({ status: "applied", updatedAt: new Date() })
        .where(eq(formQualityIssues.id, issueId));

      return { issueId, status: "applied" as const };
    });
  }

  async ignoreIssue(formId: string, issueId: string) {
    const [issue] = await this.database
      .update(formQualityIssues)
      .set({ status: "ignored", updatedAt: new Date() })
      .where(and(eq(formQualityIssues.id, issueId), eq(formQualityIssues.formId, formId)))
      .returning();

    if (!issue) {
      throw new NotFoundError({ code: "QUALITY_ISSUE_NOT_FOUND", message: "Quality issue not found." });
    }

    return { issueId, status: "ignored" as const };
  }
}
