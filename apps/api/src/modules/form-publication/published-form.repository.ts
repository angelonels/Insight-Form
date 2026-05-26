import { and, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import {
  formEvents,
  formResponses,
  forms,
  publishedForms,
  responseAnswers,
} from "../../shared/database/schema/index.js";
import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import { publishedFormSchema, type PublishedFormSchema, type PublicAnswerInput } from "../../shared/types/form-schema.js";
import { sha256 } from "../../shared/utils/hash.js";
import { enqueueAnalyzeSubmittedResponse } from "../jobs/enqueue-response-analysis.js";
import { validatePublicAnswers } from "../responses/validate-public-response.usecase.js";

export type PublicFormState =
  | {
      status: "open";
      formId: string;
      publishedFormId: string;
      version: number;
      schema: PublishedFormSchema;
    }
  | {
      status: "closed";
      title: string;
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    };

export type TrackPublicFormEventInput = {
  eventType: "form_opened" | "form_started" | "section_reached" | "question_focused" | "form_submitted";
  publishedFormId?: string;
  sectionId?: string | null;
  questionId?: string | null;
  metadata: Record<string, unknown>;
};

export type SubmitPublicResponseInput = {
  publishedFormId: string;
  answers: PublicAnswerInput[];
  respondentEmail?: string | null;
  completionTimeSeconds?: number | null;
  respondentFingerprint?: string | null;
  metadata: Record<string, unknown>;
  userAgent?: string;
  ip?: string;
};

export class PublishedFormRepository {
  constructor(private readonly database: Database = db) {}

  async getPublicForm(publicSlug: string): Promise<PublicFormState> {
    const [form] = await this.database.select().from(forms).where(eq(forms.publicSlug, publicSlug)).limit(1);

    if (!form || !form.latestPublishedVersion || form.status === "draft") {
      return {
        status: "not_found",
        message: "Form not found.",
      };
    }

    if (form.status === "closed") {
      return {
        status: "closed",
        title: form.title,
        message: "This form is no longer accepting responses.",
      };
    }

    const [publishedForm] = await this.database
      .select()
      .from(publishedForms)
      .where(and(eq(publishedForms.formId, form.id), eq(publishedForms.version, form.latestPublishedVersion)))
      .limit(1);

    if (!publishedForm) {
      return {
        status: "not_found",
        message: "Form not found.",
      };
    }

    return {
      status: "open",
      formId: form.id,
      publishedFormId: publishedForm.id,
      version: publishedForm.version,
      schema: publishedFormSchema.parse(publishedForm.schema),
    };
  }

  async trackEvent(publicSlug: string, input: TrackPublicFormEventInput) {
    const [form] = await this.database.select().from(forms).where(eq(forms.publicSlug, publicSlug)).limit(1);

    if (!form) {
      throw new NotFoundError({
        code: "FORM_NOT_FOUND",
        message: "Form not found.",
      });
    }

    await this.database.insert(formEvents).values({
      formId: form.id,
      publishedFormId: input.publishedFormId,
      eventType: input.eventType,
      sectionId: input.sectionId,
      questionId: input.questionId,
      metadata: input.metadata,
    });
  }

  async submit(publicSlug: string, input: SubmitPublicResponseInput) {
    const state = await this.getPublicForm(publicSlug);

    if (state.status === "not_found") {
      throw new NotFoundError({
        code: "FORM_NOT_FOUND",
        message: "Form not found.",
      });
    }

    if (state.status === "closed") {
      throw new ConflictError({
        code: "FORM_CLOSED",
        message: "This form is no longer accepting responses.",
      });
    }

    if (input.publishedFormId !== state.publishedFormId) {
      throw new ConflictError({
        code: "PUBLISHED_FORM_VERSION_MISMATCH",
        message: "This form has changed. Please reload and submit again.",
      });
    }

    const normalizedAnswers = validatePublicAnswers(state.schema, input.answers);

    const responseId = await this.database.transaction(async (tx) => {
      const [formResponse] = await tx
        .insert(formResponses)
        .values({
          formId: state.formId,
          publishedFormId: state.publishedFormId,
          respondentEmail: input.respondentEmail,
          completionTimeSeconds: input.completionTimeSeconds,
          respondentFingerprint: input.respondentFingerprint,
          userAgent: input.userAgent,
          ipHash: input.ip ? sha256(input.ip) : undefined,
          metadata: input.metadata,
        })
        .returning();

      if (!formResponse) {
        throw new ConflictError({
          code: "RESPONSE_CREATE_FAILED",
          message: "Failed to submit response.",
        });
      }

      if (normalizedAnswers.length) {
        await tx.insert(responseAnswers).values(
          normalizedAnswers.map((answer) => ({
            responseId: formResponse.id,
            questionId: answer.questionId,
            questionText: answer.questionText,
            questionType: answer.questionType,
            answer: answer.answer,
          })),
        );
      }

      await tx.insert(formEvents).values({
        formId: state.formId,
        publishedFormId: state.publishedFormId,
        responseId: formResponse.id,
        eventType: "form_submitted",
        metadata: {
          answerCount: normalizedAnswers.length,
        },
      });

      return formResponse.id;
    });

    await enqueueAnalyzeSubmittedResponse(responseId);

    return {
      responseId,
      message: "Thank you for your response.",
    };
  }
}
