import { and, eq, inArray } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import {
  formQuestions,
  forms,
  formSections,
  publishedForms,
} from "../../shared/database/schema/index.js";
import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors/app-error.js";
import type { PublishedFormSchema, QuestionType } from "../../shared/types/form-schema.js";
import { createPublicSlug } from "../../shared/utils/ids.js";
import type { Form } from "../forms/form.entity.js";
import { FormModule } from "../forms/form.module.js";

export class FormPublicationModule {
  constructor(private readonly database: Database = db) {}

  async publish(formId: string, ownerUserId: string) {
    return this.database.transaction(async (tx) => {
      const [form] = await tx
        .select()
        .from(forms)
        .where(and(eq(forms.id, formId), eq(forms.ownerUserId, ownerUserId)))
        .limit(1);

      if (!form) {
        throw new NotFoundError({ code: "FORM_NOT_FOUND", message: "Form not found." });
      }

      const sections = await tx
        .select()
        .from(formSections)
        .where(eq(formSections.formId, formId))
        .orderBy(formSections.position);
      const questions = sections.length
        ? await tx
            .select()
            .from(formQuestions)
            .where(
              inArray(
                formQuestions.sectionId,
                sections.map((section) => section.id),
              ),
            )
            .orderBy(formQuestions.position)
        : [];
      if (!sections.length || questions.length === 0) {
        throw new ValidationError({
          code: "FORM_EMPTY",
          message: "Cannot publish an empty form.",
        });
      }

      const publicSlug = form.publicSlug ?? createPublicSlug(form.title);
      const publishedVersion = (form.latestPublishedVersion ?? 0) + 1;
      const snapshot: PublishedFormSchema = {
        formId,
        version: publishedVersion,
        title: form.title,
        description: form.description,
        sections: sections.map((section) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          position: section.position,
          questions: questions
            .filter((question) => question.sectionId === section.id)
            .map((question) => ({
              id: question.id,
              questionText: question.questionText,
              helpText: question.helpText,
              type: question.type as QuestionType,
              isRequired: question.isRequired,
              position: question.position,
              config: question.config as Record<string, unknown>,
            })),
        })),
      };

      const [publishedForm] = await tx
        .insert(publishedForms)
        .values({
          formId,
          version: publishedVersion,
          title: snapshot.title,
          description: snapshot.description,
          schema: snapshot,
        })
        .returning();

      if (!publishedForm) {
        throw new ConflictError({
          code: "FORM_PUBLISH_FAILED",
          message: "Failed to publish form.",
        });
      }

      await tx
        .update(forms)
        .set({
          status: "published",
          publicSlug,
          latestPublishedVersion: publishedVersion,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(forms.id, formId));

      return {
        formId,
        status: "published" as const,
        publicSlug,
        publishedVersion,
        publishedFormId: publishedForm.id,
      };
    });
  }

  async close(formId: string, ownerUserId: string): Promise<Form> {
    const formModule = new FormModule(this.database);
    await formModule.getOwnedForm(formId, ownerUserId);
    const [form] = await this.database
      .update(forms)
      .set({ status: "closed", closedAt: new Date(), updatedAt: new Date() })
      .where(eq(forms.id, formId))
      .returning();

    if (!form) {
      throw new NotFoundError({ code: "FORM_NOT_FOUND", message: "Form not found." });
    }

    return {
      ...form,
      status: form.status as Form["status"],
      qualityStatus: form.qualityStatus as Form["qualityStatus"],
      insightStatus: form.insightStatus as Form["insightStatus"],
    };
  }
}
