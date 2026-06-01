import { and, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import {
  formQuestions,
  forms,
  formSections,
  generatedFormDrafts,
} from "../../shared/database/schema/index.js";
import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import { editableFormDraftSchema, type EditableFormDraft } from "../../shared/types/form-schema.js";
import { createId } from "../../shared/utils/ids.js";

export class GeneratedFormDraftRepository {
  constructor(private readonly database: Database = db) {}

  async create(input: {
    userId: string;
    prompt: string;
    guidedOptions: Record<string, unknown>;
    generatedSchema: EditableFormDraft;
    modelProvider?: string;
    modelName?: string;
    promptVersion?: string;
  }) {
    const [draft] = await this.database
      .insert(generatedFormDrafts)
      .values({
        userId: input.userId,
        prompt: input.prompt,
        guidedOptions: input.guidedOptions,
        generatedSchema: input.generatedSchema,
        modelProvider: input.modelProvider,
        modelName: input.modelName,
        promptVersion: input.promptVersion,
      })
      .returning();

    if (!draft) {
      throw new ConflictError({ code: "GENERATED_DRAFT_CREATE_FAILED", message: "Failed to save generated form draft." });
    }

    return draft;
  }

  async accept(draftId: string, userId: string) {
    return this.database.transaction(async (tx) => {
      const [draft] = await tx
        .select()
        .from(generatedFormDrafts)
        .where(and(eq(generatedFormDrafts.id, draftId), eq(generatedFormDrafts.userId, userId)))
        .limit(1);

      if (!draft) {
        throw new NotFoundError({ code: "GENERATED_DRAFT_NOT_FOUND", message: "Generated draft not found." });
      }

      if (draft.status !== "generated") {
        throw new ConflictError({ code: "GENERATED_DRAFT_ALREADY_USED", message: "Generated draft has already been used." });
      }

      const generatedSchema = editableFormDraftSchema.parse(draft.generatedSchema);
      const [form] = await tx
        .insert(forms)
        .values({
          ownerUserId: userId,
          title: generatedSchema.title,
          description: generatedSchema.description,
        })
        .returning();

      if (!form) {
        throw new ConflictError({ code: "FORM_CREATE_FAILED", message: "Failed to create form from generated draft." });
      }

      for (const section of generatedSchema.sections) {
        const sectionId = section.id ?? createId();
        await tx.insert(formSections).values({
          id: sectionId,
          formId: form.id,
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

      await tx
        .update(generatedFormDrafts)
        .set({
          status: "accepted",
          acceptedFormId: form.id,
          updatedAt: new Date(),
        })
        .where(eq(generatedFormDrafts.id, draftId));

      return { formId: form.id };
    });
  }
}
