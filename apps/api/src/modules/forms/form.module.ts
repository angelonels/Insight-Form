import { and, count, desc, eq, inArray, max } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import {
  formEvents,
  formQuestions,
  formResponses,
  forms,
  formSections,
} from "../../shared/database/schema/index.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js";
import type { EditableFormDraft, QuestionType } from "../../shared/types/form-schema.js";
import { createId } from "../../shared/utils/ids.js";
import type { Form, FormDetail } from "./form.entity.js";

type FormRow = typeof forms.$inferSelect;
type SectionRow = typeof formSections.$inferSelect;
type QuestionRow = typeof formQuestions.$inferSelect;

function mapForm(row: FormRow): Form {
  return {
    ...row,
    status: row.status as Form["status"],
    qualityStatus: row.qualityStatus as Form["qualityStatus"],
    insightStatus: row.insightStatus as Form["insightStatus"],
  };
}

function mapDetail(form: FormRow, sections: SectionRow[], questions: QuestionRow[]): FormDetail {
  return {
    ...mapForm(form),
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
}

export class FormModule {
  constructor(private readonly database: Database = db) {}

  async listByOwner(ownerUserId: string) {
    const rows = await this.database
      .select()
      .from(forms)
      .where(eq(forms.ownerUserId, ownerUserId))
      .orderBy(desc(forms.updatedAt));

    return Promise.all(
      rows.map(async (row) => {
        const [responseCountRow] = await this.database
          .select({ count: count(), lastResponseAt: max(formResponses.submittedAt) })
          .from(formResponses)
          .where(eq(formResponses.formId, row.id));
        const [openedCountRow] = await this.database
          .select({ count: count() })
          .from(formEvents)
          .where(and(eq(formEvents.formId, row.id), eq(formEvents.eventType, "form_opened")));

        const responseCount = responseCountRow?.count ?? 0;
        const openedCount = openedCountRow?.count ?? 0;

        return {
          ...mapForm(row),
          responseCount,
          completionRate: openedCount > 0 ? responseCount / openedCount : null,
          lastResponseAt: responseCountRow?.lastResponseAt ?? null,
        };
      }),
    );
  }

  async findOwnedForm(formId: string, ownerUserId: string): Promise<Form | undefined> {
    const [form] = await this.database.select().from(forms).where(eq(forms.id, formId)).limit(1);

    if (form && form.ownerUserId !== ownerUserId) {
      throw new ForbiddenError({
        code: "FORM_ACCESS_DENIED",
        message: "You do not have access to this form.",
      });
    }

    return form ? mapForm(form) : undefined;
  }

  async getOwnedForm(formId: string, ownerUserId: string): Promise<Form> {
    const form = await this.findOwnedForm(formId, ownerUserId);
    if (!form) {
      throw new NotFoundError({
        code: "FORM_NOT_FOUND",
        message: "Form not found.",
      });
    }

    return form;
  }

  async getDetail(formId: string, ownerUserId: string): Promise<FormDetail> {
    const [form] = await this.database.select().from(forms).where(eq(forms.id, formId)).limit(1);

    if (!form) {
      throw new NotFoundError({
        code: "FORM_NOT_FOUND",
        message: "Form not found.",
      });
    }

    if (form.ownerUserId !== ownerUserId) {
      throw new ForbiddenError({
        code: "FORM_ACCESS_DENIED",
        message: "You do not have access to this form.",
      });
    }

    return this.getDetailForFormRow(form);
  }

  async getDetailForFormRow(form: FormRow): Promise<FormDetail> {
    const sections = await this.database
      .select()
      .from(formSections)
      .where(eq(formSections.formId, form.id))
      .orderBy(formSections.position);
    const questions = sections.length
      ? await this.database
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

    return mapDetail(form, sections, questions);
  }

  async createBlank(
    ownerUserId: string,
    input: { title: string; description?: string | null },
  ): Promise<FormDetail> {
    const formId = await this.database.transaction(async (tx) => {
      const [form] = await tx
        .insert(forms)
        .values({
          ownerUserId,
          title: input.title,
          description: input.description,
        })
        .returning();

      if (!form) {
        throw new ConflictError({
          code: "FORM_CREATE_FAILED",
          message: "Failed to create form.",
        });
      }

      await tx.insert(formSections).values({
        formId: form.id,
        title: "Section 1",
        position: 1,
      });

      return form.id;
    });

    return this.getDetail(formId, ownerUserId);
  }

  async updateMetadata(
    formId: string,
    ownerUserId: string,
    input: { title?: string; description?: string | null },
  ) {
    await this.getOwnedForm(formId, ownerUserId);

    const [form] = await this.database
      .update(forms)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(forms.id, formId))
      .returning();

    if (!form) {
      throw new NotFoundError({ code: "FORM_NOT_FOUND", message: "Form not found." });
    }

    return mapForm(form);
  }

  async deleteForm(formId: string, ownerUserId: string) {
    await this.getOwnedForm(formId, ownerUserId);
    await this.database.delete(forms).where(eq(forms.id, formId));
  }

  async replaceDraft(
    formId: string,
    ownerUserId: string,
    draft: EditableFormDraft,
    expectedDraftVersion: number,
  ): Promise<FormDetail> {
    await this.database.transaction(async (tx) => {
      const [form] = await tx
        .select()
        .from(forms)
        .where(and(eq(forms.id, formId), eq(forms.ownerUserId, ownerUserId)))
        .limit(1)
        .for("update");

      if (!form) {
        throw new NotFoundError({ code: "FORM_NOT_FOUND", message: "Form not found." });
      }

      if (form.currentDraftVersion !== expectedDraftVersion) {
        throw new ConflictError({
          code: "FORM_DRAFT_VERSION_CONFLICT",
          message: "This form changed in another tab. Reload to continue.",
          details: {
            currentDraftVersion: form.currentDraftVersion,
            expectedDraftVersion,
          },
        });
      }

      await tx.delete(formSections).where(eq(formSections.formId, formId));
      await tx
        .update(forms)
        .set({
          title: draft.title,
          description: draft.description,
          currentDraftVersion: form.currentDraftVersion + 1,
          updatedAt: new Date(),
        })
        .where(eq(forms.id, formId));

      for (const section of draft.sections) {
        const sectionId = section.id ?? createId();
        await tx.insert(formSections).values({
          id: sectionId,
          formId,
          title: section.title,
          description: section.description,
          position: section.position,
        });

        if (section.questions.length) {
          await tx.insert(formQuestions).values(
            section.questions.map((question) => ({
              id: question.id ?? createId(),
              sectionId,
              questionText: question.questionText,
              helpText: question.helpText,
              type: question.type,
              isRequired: question.isRequired,
              position: question.position,
              config: question.config,
            })),
          );
        }
      }
    });

    return this.getDetail(formId, ownerUserId);
  }

  async addSection(
    formId: string,
    ownerUserId: string,
    input: { title?: string; description?: string | null; position?: number },
  ) {
    await this.getOwnedForm(formId, ownerUserId);
    const [countRow] = await this.database
      .select({ count: count() })
      .from(formSections)
      .where(eq(formSections.formId, formId));
    const [section] = await this.database
      .insert(formSections)
      .values({
        formId,
        title: input.title ?? `Section ${(countRow?.count ?? 0) + 1}`,
        description: input.description,
        position: input.position ?? (countRow?.count ?? 0) + 1,
      })
      .returning();

    if (!section) {
      throw new ConflictError({
        code: "SECTION_CREATE_FAILED",
        message: "Failed to create section.",
      });
    }

    await this.touch(formId);
    return section;
  }

  async updateSection(
    formId: string,
    ownerUserId: string,
    sectionId: string,
    input: { title?: string; description?: string | null; position?: number },
  ) {
    await this.getOwnedForm(formId, ownerUserId);
    const [section] = await this.database
      .update(formSections)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(formSections.id, sectionId), eq(formSections.formId, formId)))
      .returning();

    if (!section) {
      throw new NotFoundError({ code: "SECTION_NOT_FOUND", message: "Section not found." });
    }

    await this.touch(formId);
    return section;
  }

  async deleteSection(formId: string, ownerUserId: string, sectionId: string) {
    await this.getOwnedForm(formId, ownerUserId);
    await this.database
      .delete(formSections)
      .where(and(eq(formSections.id, sectionId), eq(formSections.formId, formId)));
    await this.normalizeSectionPositions(formId);
    await this.touch(formId);
  }

  async reorderSections(formId: string, ownerUserId: string, sectionIds: string[]) {
    await this.getOwnedForm(formId, ownerUserId);
    return this.database.transaction(async (tx) => {
      for (const [index, sectionId] of sectionIds.entries()) {
        await tx
          .update(formSections)
          .set({ position: -(index + 1) })
          .where(and(eq(formSections.id, sectionId), eq(formSections.formId, formId)));
      }

      for (const [index, sectionId] of sectionIds.entries()) {
        await tx
          .update(formSections)
          .set({ position: index + 1, updatedAt: new Date() })
          .where(and(eq(formSections.id, sectionId), eq(formSections.formId, formId)));
      }

      await tx.update(forms).set({ updatedAt: new Date() }).where(eq(forms.id, formId));
      return this.getDetail(formId, ownerUserId);
    });
  }

  async addQuestion(
    formId: string,
    ownerUserId: string,
    input: {
      sectionId?: string;
      questionText?: string;
      helpText?: string | null;
      type?: QuestionType;
      isRequired?: boolean;
      position?: number;
      config?: Record<string, unknown>;
    },
  ) {
    await this.getOwnedForm(formId, ownerUserId);
    const sectionId = input.sectionId ?? (await this.getFirstSectionId(formId));
    const [countRow] = await this.database
      .select({ count: count() })
      .from(formQuestions)
      .where(eq(formQuestions.sectionId, sectionId));
    const [question] = await this.database
      .insert(formQuestions)
      .values({
        sectionId,
        questionText: input.questionText ?? "Untitled question",
        helpText: input.helpText,
        type: input.type ?? "short_answer",
        isRequired: input.isRequired ?? false,
        position: input.position ?? (countRow?.count ?? 0) + 1,
        config: input.config ?? {},
      })
      .returning();

    if (!question) {
      throw new ConflictError({
        code: "QUESTION_CREATE_FAILED",
        message: "Failed to create question.",
      });
    }

    await this.touch(formId);
    return question;
  }

  async updateQuestion(
    formId: string,
    ownerUserId: string,
    questionId: string,
    input: {
      questionText?: string;
      helpText?: string | null;
      type?: string;
      isRequired?: boolean;
      position?: number;
      config?: Record<string, unknown>;
      sectionId?: string;
    },
  ) {
    await this.getOwnedForm(formId, ownerUserId);
    const sectionIds = await this.getSectionIds(formId);
    const [question] = await this.database
      .update(formQuestions)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(formQuestions.id, questionId), inArray(formQuestions.sectionId, sectionIds)))
      .returning();

    if (!question) {
      throw new NotFoundError({ code: "QUESTION_NOT_FOUND", message: "Question not found." });
    }

    await this.touch(formId);
    return question;
  }

  async deleteQuestion(formId: string, ownerUserId: string, questionId: string) {
    await this.getOwnedForm(formId, ownerUserId);
    const sectionIds = await this.getSectionIds(formId);
    await this.database
      .delete(formQuestions)
      .where(and(eq(formQuestions.id, questionId), inArray(formQuestions.sectionId, sectionIds)));
    for (const sectionId of sectionIds) {
      await this.normalizeQuestionPositions(sectionId);
    }
    await this.touch(formId);
  }

  async duplicateQuestion(formId: string, ownerUserId: string, questionId: string) {
    await this.getOwnedForm(formId, ownerUserId);
    const sectionIds = await this.getSectionIds(formId);
    const [source] = await this.database
      .select()
      .from(formQuestions)
      .where(and(eq(formQuestions.id, questionId), inArray(formQuestions.sectionId, sectionIds)))
      .limit(1);

    if (!source) {
      throw new NotFoundError({ code: "QUESTION_NOT_FOUND", message: "Question not found." });
    }

    const [question] = await this.database
      .insert(formQuestions)
      .values({
        sectionId: source.sectionId,
        questionText: `${source.questionText} (copy)`,
        helpText: source.helpText,
        type: source.type,
        isRequired: source.isRequired,
        position: await this.getNextQuestionPosition(source.sectionId),
        config: source.config,
      })
      .returning();

    if (!question) {
      throw new ConflictError({
        code: "QUESTION_DUPLICATE_FAILED",
        message: "Failed to duplicate question.",
      });
    }

    await this.normalizeQuestionPositions(source.sectionId);
    await this.touch(formId);
    return question;
  }

  async reorderQuestions(
    formId: string,
    ownerUserId: string,
    sectionId: string,
    questionIds: string[],
  ) {
    await this.getOwnedForm(formId, ownerUserId);
    const sectionIds = await this.getSectionIds(formId);
    if (!sectionIds.includes(sectionId)) {
      throw new NotFoundError({ code: "SECTION_NOT_FOUND", message: "Section not found." });
    }

    await this.database.transaction(async (tx) => {
      for (const [index, questionId] of questionIds.entries()) {
        await tx
          .update(formQuestions)
          .set({ position: -(index + 1) })
          .where(and(eq(formQuestions.id, questionId), eq(formQuestions.sectionId, sectionId)));
      }

      for (const [index, questionId] of questionIds.entries()) {
        await tx
          .update(formQuestions)
          .set({ position: index + 1, updatedAt: new Date() })
          .where(and(eq(formQuestions.id, questionId), eq(formQuestions.sectionId, sectionId)));
      }

      await tx.update(forms).set({ updatedAt: new Date() }).where(eq(forms.id, formId));
    });

    return this.getDetail(formId, ownerUserId);
  }

  private async getSectionIds(formId: string) {
    const rows = await this.database
      .select({ id: formSections.id })
      .from(formSections)
      .where(eq(formSections.formId, formId));
    return rows.map((row) => row.id);
  }

  private async getFirstSectionId(formId: string) {
    const [section] = await this.database
      .select({ id: formSections.id })
      .from(formSections)
      .where(eq(formSections.formId, formId))
      .orderBy(formSections.position)
      .limit(1);

    if (!section) {
      const [createdSection] = await this.database
        .insert(formSections)
        .values({ formId, title: "Section 1", position: 1 })
        .returning({ id: formSections.id });
      if (!createdSection) {
        throw new ConflictError({
          code: "SECTION_CREATE_FAILED",
          message: "Failed to create section.",
        });
      }
      return createdSection.id;
    }

    return section.id;
  }

  private async normalizeSectionPositions(formId: string) {
    const sections = await this.database
      .select()
      .from(formSections)
      .where(eq(formSections.formId, formId))
      .orderBy(formSections.position);

    for (const [index, section] of sections.entries()) {
      await this.database
        .update(formSections)
        .set({ position: -(index + 1) })
        .where(eq(formSections.id, section.id));
    }

    for (const [index, section] of sections.entries()) {
      await this.database
        .update(formSections)
        .set({ position: index + 1 })
        .where(eq(formSections.id, section.id));
    }
  }

  private async normalizeQuestionPositions(sectionId: string) {
    const questions = await this.database
      .select()
      .from(formQuestions)
      .where(eq(formQuestions.sectionId, sectionId))
      .orderBy(formQuestions.position);

    for (const [index, question] of questions.entries()) {
      await this.database
        .update(formQuestions)
        .set({ position: -(index + 1) })
        .where(eq(formQuestions.id, question.id));
    }

    for (const [index, question] of questions.entries()) {
      await this.database
        .update(formQuestions)
        .set({ position: index + 1 })
        .where(eq(formQuestions.id, question.id));
    }
  }

  private async getNextQuestionPosition(sectionId: string) {
    const [countRow] = await this.database
      .select({ count: count() })
      .from(formQuestions)
      .where(eq(formQuestions.sectionId, sectionId));
    return (countRow?.count ?? 0) + 1;
  }

  private async touch(formId: string) {
    await this.database.update(forms).set({ updatedAt: new Date() }).where(eq(forms.id, formId));
  }
}
