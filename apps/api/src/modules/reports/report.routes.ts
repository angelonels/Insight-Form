import { Router } from "express";

import { asyncHandler } from "../../shared/http/async-handler.js";
import { parseBody, parseParams } from "../../shared/http/parse-request.js";
import { ok } from "../../shared/http/response.js";
import { getRequiredUserId } from "../auth/request-auth-context.js";
import { enqueueGenerateReport } from "../jobs/enqueue-report-generation.js";
import { requireCurrentUser } from "../users/require-current-user.middleware.js";
import { GenerateReportUseCase } from "./generate-report.usecase.js";
import { ReportRepository } from "./report.repository.js";
import { createReportBodySchema, reportFormParamsSchema, reportParamsSchema, updateReportBodySchema } from "./report.schemas.js";

function mapReport(report: {
  id: string;
  formId: string;
  insightSnapshotId: string | null;
  reportType: string;
  status: string;
  title: string;
  contentMarkdown: string | null;
  createdAt: Date;
  updatedAt: Date;
  generatedAt: Date | null;
}) {
  return {
    id: report.id,
    formId: report.formId,
    insightSnapshotId: report.insightSnapshotId,
    reportType: report.reportType,
    status: report.status,
    title: report.title,
    contentMarkdown: report.contentMarkdown,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    generatedAt: report.generatedAt?.toISOString() ?? null,
  };
}

export function createReportRouter() {
  const router = Router({ mergeParams: true });
  const reports = new ReportRepository();
  const generateReport = new GenerateReportUseCase(reports);

  router.use(...requireCurrentUser);

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, reportFormParamsSchema);
      const body = parseBody(request, createReportBodySchema);
      ok(response, await generateReport.execute({ formId, userId: getRequiredUserId(request), ...body }));
    }),
  );

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, reportFormParamsSchema);
      ok(
        response,
        (await reports.list(formId, getRequiredUserId(request))).map((report) => mapReport(report)),
      );
    }),
  );

  router.get(
    "/:reportId",
    asyncHandler(async (request, response) => {
      const { formId, reportId } = parseParams(request, reportParamsSchema);
      ok(response, mapReport(await reports.get(formId, getRequiredUserId(request), reportId)));
    }),
  );

  router.patch(
    "/:reportId",
    asyncHandler(async (request, response) => {
      const { formId, reportId } = parseParams(request, reportParamsSchema);
      const body = parseBody(request, updateReportBodySchema);
      ok(response, mapReport(await reports.update(formId, getRequiredUserId(request), reportId, body)));
    }),
  );

  router.post(
    "/:reportId/regenerate",
    asyncHandler(async (request, response) => {
      const { formId, reportId } = parseParams(request, reportParamsSchema);
      await reports.markGenerating(formId, getRequiredUserId(request), reportId);
      await enqueueGenerateReport(reportId);
      ok(response, { reportId, status: "queued" });
    }),
  );

  router.post(
    "/:reportId/export",
    asyncHandler(async (request, response) => {
      const { formId, reportId } = parseParams(request, reportParamsSchema);
      const report = await reports.get(formId, getRequiredUserId(request), reportId);
      ok(response, {
        reportId,
        format: "markdown",
        contentMarkdown: report.contentMarkdown ?? "",
      });
    }),
  );

  return router;
}
