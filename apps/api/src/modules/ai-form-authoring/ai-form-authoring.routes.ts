import { Router } from "express";

import { asyncHandler } from "../../shared/http/async-handler.js";
import { parseBody, parseParams } from "../../shared/http/parse-request.js";
import { ok } from "../../shared/http/response.js";
import { getRequiredUserId } from "../auth/request-auth-context.js";
import { requireCurrentUser } from "../users/require-current-user.middleware.js";
import { AcceptGeneratedFormDraftUseCase } from "./accept-generated-form-draft.usecase.js";
import {
  formAiParamsSchema,
  generateFormDraftBodySchema,
  generatedDraftParamsSchema,
  improveQuestionBodySchema,
  qualityIssueBodySchema,
} from "./ai-form-authoring.schemas.js";
import { ApplyQualityFixUseCase } from "./apply-quality-fix.usecase.js";
import { GenerateFormDraftWithAiUseCase } from "./generate-form-draft-with-ai.usecase.js";
import { IgnoreQualityIssueUseCase } from "./ignore-quality-issue.usecase.js";
import { ImproveQuestionWithAiUseCase } from "./improve-question-with-ai.usecase.js";
import { RunFormQualityCheckUseCase } from "./run-form-quality-check.usecase.js";

export function createAiFormAuthoringRouter() {
  const router = Router();
  const generateFormDraft = new GenerateFormDraftWithAiUseCase();
  const acceptGeneratedFormDraft = new AcceptGeneratedFormDraftUseCase();
  const improveQuestion = new ImproveQuestionWithAiUseCase();
  const runQualityCheck = new RunFormQualityCheckUseCase();
  const applyQualityFix = new ApplyQualityFixUseCase();
  const ignoreQualityIssue = new IgnoreQualityIssueUseCase();

  router.post(
    "/ai/form-drafts/generate",
    ...requireCurrentUser,
    asyncHandler(async (request, response) => {
      const body = parseBody(request, generateFormDraftBodySchema);
      ok(response, await generateFormDraft.execute({ userId: getRequiredUserId(request), ...body }));
    }),
  );

  router.post(
    "/ai/form-drafts/:draftId/accept",
    ...requireCurrentUser,
    asyncHandler(async (request, response) => {
      const { draftId } = parseParams(request, generatedDraftParamsSchema);
      ok(response, await acceptGeneratedFormDraft.execute({ draftId, userId: getRequiredUserId(request) }));
    }),
  );

  router.post(
    "/forms/:formId/ai/improve-question",
    ...requireCurrentUser,
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, formAiParamsSchema);
      const { questionId } = parseBody(request, improveQuestionBodySchema);
      ok(response, await improveQuestion.execute({ formId, questionId, userId: getRequiredUserId(request) }));
    }),
  );

  router.post(
    "/forms/:formId/ai/quality-check",
    ...requireCurrentUser,
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, formAiParamsSchema);
      ok(response, await runQualityCheck.execute({ formId, userId: getRequiredUserId(request) }));
    }),
  );

  router.post(
    "/forms/:formId/ai/apply-quality-fix",
    ...requireCurrentUser,
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, formAiParamsSchema);
      const { issueId } = parseBody(request, qualityIssueBodySchema);
      ok(response, await applyQualityFix.execute({ formId, issueId, userId: getRequiredUserId(request) }));
    }),
  );

  router.post(
    "/forms/:formId/ai/ignore-quality-issue",
    ...requireCurrentUser,
    asyncHandler(async (request, response) => {
      const { formId } = parseParams(request, formAiParamsSchema);
      const { issueId } = parseBody(request, qualityIssueBodySchema);
      ok(response, await ignoreQualityIssue.execute({ formId, issueId, userId: getRequiredUserId(request) }));
    }),
  );

  return router;
}
