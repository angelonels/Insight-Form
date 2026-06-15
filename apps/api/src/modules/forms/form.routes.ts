import { Router } from "express";

import { env } from "../../shared/config/env.js";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { parseBody, parseParams } from "../../shared/http/parse-request.js";
import { created, noContent, ok } from "../../shared/http/response.js";
import { getRequiredUserId } from "../auth/request-auth-context.js";
import { FormPublicationModule } from "../form-publication/form-publication.module.js";
import { requireCurrentUser } from "../users/require-current-user.middleware.js";
import { mapFormCard, mapFormDetail } from "./form.mapper.js";
import { FormModule } from "./form.module.js";
import {
  addQuestionBodySchema,
  addSectionBodySchema,
  createFormBodySchema,
  formIdParamsSchema,
  questionParamsSchema,
  reorderQuestionsBodySchema,
  reorderSectionsBodySchema,
  sectionParamsSchema,
  updateDraftBodySchema,
  updateFormMetadataBodySchema,
  updateQuestionBodySchema,
  updateSectionBodySchema,
} from "./form.schemas.js";

function mapSection(section: {
  id: string;
  formId: string;
  title: string;
  description: string | null;
  position: number;
}) {
  return {
    id: section.id,
    formId: section.formId,
    title: section.title,
    description: section.description,
    position: section.position,
  };
}

function mapQuestion(question: {
  id: string;
  sectionId: string;
  questionText: string;
  helpText: string | null;
  type: string;
  isRequired: boolean;
  position: number;
  config: unknown;
}) {
  return {
    id: question.id,
    sectionId: question.sectionId,
    questionText: question.questionText,
    helpText: question.helpText,
    type: question.type,
    isRequired: question.isRequired,
    position: question.position,
    config: question.config,
  };
}

export function createFormRouter() {
  const router = Router();
  const forms = new FormModule();
  const publication = new FormPublicationModule();

  router.use(...requireCurrentUser);

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const rows = await forms.listByOwner(userId);
      ok(response, rows.map(mapFormCard));
    }),
  );

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const body = parseBody(request, createFormBodySchema);
      const form = await forms.createBlank(userId, body);
      created(response, mapFormDetail(form));
    }),
  );

  router.get(
    "/:formId",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const form = await forms.getDetail(formId, userId);
      ok(response, mapFormDetail(form));
    }),
  );

  router.patch(
    "/:formId",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const body = parseBody(request, updateFormMetadataBodySchema);
      const form = await forms.updateMetadata(formId, userId, body);
      ok(response, mapFormCard(form));
    }),
  );

  router.delete(
    "/:formId",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      await forms.deleteForm(formId, userId);
      noContent(response);
    }),
  );

  router.put(
    "/:formId/draft",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const { draft, expectedDraftVersion } = parseBody(request, updateDraftBodySchema);
      const form = await forms.replaceDraft(formId, userId, draft, expectedDraftVersion);
      ok(response, mapFormDetail(form));
    }),
  );

  router.post(
    "/:formId/sections",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const body = parseBody(request, addSectionBodySchema);
      const section = await forms.addSection(formId, userId, body);
      created(response, mapSection(section));
    }),
  );

  router.patch(
    "/:formId/sections/:sectionId",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId, sectionId } = parseParams(request, sectionParamsSchema);
      const body = parseBody(request, updateSectionBodySchema);
      const section = await forms.updateSection(formId, userId, sectionId, body);
      ok(response, mapSection(section));
    }),
  );

  router.delete(
    "/:formId/sections/:sectionId",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId, sectionId } = parseParams(request, sectionParamsSchema);
      await forms.deleteSection(formId, userId, sectionId);
      noContent(response);
    }),
  );

  router.post(
    "/:formId/sections/reorder",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const body = parseBody(request, reorderSectionsBodySchema);
      const form = await forms.reorderSections(formId, userId, body.sectionIds);
      ok(response, mapFormDetail(form));
    }),
  );

  router.post(
    "/:formId/questions",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const body = parseBody(request, addQuestionBodySchema);
      const question = await forms.addQuestion(formId, userId, body);
      created(response, mapQuestion(question));
    }),
  );

  router.patch(
    "/:formId/questions/:questionId",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId, questionId } = parseParams(request, questionParamsSchema);
      const body = parseBody(request, updateQuestionBodySchema);
      const question = await forms.updateQuestion(formId, userId, questionId, body);
      ok(response, mapQuestion(question));
    }),
  );

  router.delete(
    "/:formId/questions/:questionId",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId, questionId } = parseParams(request, questionParamsSchema);
      await forms.deleteQuestion(formId, userId, questionId);
      noContent(response);
    }),
  );

  router.post(
    "/:formId/questions/:questionId/duplicate",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId, questionId } = parseParams(request, questionParamsSchema);
      const question = await forms.duplicateQuestion(formId, userId, questionId);
      created(response, mapQuestion(question));
    }),
  );

  router.post(
    "/:formId/questions/reorder",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const body = parseBody(request, reorderQuestionsBodySchema);
      const form = await forms.reorderQuestions(formId, userId, body.sectionId, body.questionIds);
      ok(response, mapFormDetail(form));
    }),
  );

  router.post(
    "/:formId/publish",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const result = await publication.publish(formId, userId);
      ok(response, {
        formId: result.formId,
        status: result.status,
        publicSlug: result.publicSlug,
        publishedVersion: result.publishedVersion,
        publishedFormId: result.publishedFormId,
        publicUrl: `${env.PUBLIC_APP_URL}/f/${result.publicSlug}`,
      });
    }),
  );

  router.post(
    "/:formId/close",
    asyncHandler(async (request, response) => {
      const userId = getRequiredUserId(request);
      const { formId } = parseParams(request, formIdParamsSchema);
      const form = await publication.close(formId, userId);
      ok(response, mapFormCard(form));
    }),
  );

  return router;
}
