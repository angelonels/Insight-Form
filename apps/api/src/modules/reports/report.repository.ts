import { and, desc, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { forms, insightSnapshots, reports, responseClusters } from "../../shared/database/schema/index.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js";

export class ReportRepository {
  constructor(private readonly database: Database = db) {}

  async ensureFormOwner(formId: string, ownerUserId: string) {
    const [form] = await this.database.select().from(forms).where(eq(forms.id, formId)).limit(1);

    if (!form) {
      throw new NotFoundError({ code: "FORM_NOT_FOUND", message: "Form not found." });
    }

    if (form.ownerUserId !== ownerUserId) {
      throw new ForbiddenError({
        code: "FORM_ACCESS_DENIED",
        message: "You do not have access to this form.",
      });
    }

    return form;
  }

  async createGenerating(input: { formId: string; ownerUserId: string; reportType: "executive_summary" | "feedback_report"; title?: string }) {
    await this.ensureFormOwner(input.formId, input.ownerUserId);
    const [latestInsight] = await this.database
      .select()
      .from(insightSnapshots)
      .where(and(eq(insightSnapshots.formId, input.formId), eq(insightSnapshots.status, "ready")))
      .orderBy(desc(insightSnapshots.createdAt))
      .limit(1);

    if (!latestInsight) {
      throw new ConflictError({
        code: "INSIGHTS_NOT_READY",
        message: "Generate insights before creating a report.",
      });
    }

    const [report] = await this.database
      .insert(reports)
      .values({
        formId: input.formId,
        insightSnapshotId: latestInsight.id,
        reportType: input.reportType,
        status: "generating",
        title: input.title ?? (input.reportType === "executive_summary" ? "Executive Summary" : "Feedback Report"),
      })
      .returning();

    if (!report) {
      throw new ConflictError({ code: "REPORT_CREATE_FAILED", message: "Failed to create report." });
    }

    return report;
  }

  async list(formId: string, ownerUserId: string) {
    await this.ensureFormOwner(formId, ownerUserId);
    return this.database.select().from(reports).where(eq(reports.formId, formId)).orderBy(desc(reports.createdAt));
  }

  async get(formId: string, ownerUserId: string, reportId: string) {
    await this.ensureFormOwner(formId, ownerUserId);
    const [report] = await this.database
      .select()
      .from(reports)
      .where(and(eq(reports.id, reportId), eq(reports.formId, formId)))
      .limit(1);

    if (!report) {
      throw new NotFoundError({ code: "REPORT_NOT_FOUND", message: "Report not found." });
    }

    return report;
  }

  async update(formId: string, ownerUserId: string, reportId: string, input: { title?: string; contentMarkdown?: string }) {
    await this.get(formId, ownerUserId, reportId);
    const [report] = await this.database
      .update(reports)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(reports.id, reportId))
      .returning();
    return report!;
  }

  async markGenerating(formId: string, ownerUserId: string, reportId: string) {
    await this.get(formId, ownerUserId, reportId);
    await this.database.update(reports).set({ status: "generating", updatedAt: new Date() }).where(eq(reports.id, reportId));
  }

  async loadReportContext(reportId: string) {
    const [report] = await this.database.select().from(reports).where(eq(reports.id, reportId)).limit(1);
    if (!report) {
      throw new NotFoundError({ code: "REPORT_NOT_FOUND", message: "Report not found." });
    }

    const [insight] = report.insightSnapshotId
      ? await this.database.select().from(insightSnapshots).where(eq(insightSnapshots.id, report.insightSnapshotId)).limit(1)
      : [];

    if (!insight || insight.status !== "ready") {
      throw new ConflictError({ code: "INSIGHTS_NOT_READY", message: "Report requires a ready insight snapshot." });
    }

    const clusters = await this.database.select().from(responseClusters).where(eq(responseClusters.insightSnapshotId, insight.id));
    return { report, insight, clusters };
  }

  async markReady(input: { reportId: string; title: string; contentMarkdown: string; modelProvider: string; modelName: string; promptVersion: string }) {
    const [report] = await this.database
      .update(reports)
      .set({
        title: input.title,
        contentMarkdown: input.contentMarkdown,
        status: "ready",
        modelProvider: input.modelProvider,
        modelName: input.modelName,
        promptVersion: input.promptVersion,
        generatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, input.reportId))
      .returning();

    return report;
  }
}
