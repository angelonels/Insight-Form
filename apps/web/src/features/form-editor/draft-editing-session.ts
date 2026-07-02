import { editableFormDraftSchema } from "@insightform/shared";

import type {
  EditableFormDraft,
  FormDetail,
  FormQuestion,
  QuestionType,
} from "../forms/types/form.types.js";
import {
  createEmptyQuestion,
  createEmptySection,
  normalizeDraft,
  normalizeQuestionConfig,
  toDraftPayload,
} from "../forms/utils/create-form-draft.js";

export type DraftSaveState = "saved" | "dirty" | "saving" | "failed" | "invalid" | "conflict";

export type DraftValidationIssue = {
  message: string;
  path: string;
};

export type DraftEditingSnapshot = {
  draft: EditableFormDraft;
  formId: string;
  lastError?: unknown;
  lastSavedAt?: string;
  revision: number;
  saveState: DraftSaveState;
  selectedQuestionId?: string;
  selectedSectionId?: string;
  serverVersion: number;
  validationIssues: DraftValidationIssue[];
};

export type DraftEdit =
  | { type: "meta"; field: "title" | "description"; value: string }
  | { type: "add-section" }
  | { type: "remove-section"; sectionId: string }
  | { type: "update-section"; sectionId: string; field: "title" | "description"; value: string }
  | { type: "add-question"; sectionId: string; questionType?: QuestionType }
  | { type: "select-question"; sectionId: string; questionId: string }
  | {
      type: "reorder-questions";
      sectionId: string;
      activeQuestionId: string;
      overQuestionId: string;
    }
  | { type: "remove-question"; questionId: string }
  | { type: "update-question"; questionId: string; patch: Partial<FormQuestion> }
  | { type: "update-question-config"; questionId: string; key: string; value: unknown };

type SaveDraft = (input: {
  draft: EditableFormDraft;
  expectedDraftVersion: number;
}) => Promise<FormDetail>;

type Schedule = (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
type CancelSchedule = (handle: ReturnType<typeof setTimeout>) => void;
type Sleep = (delayMs: number) => Promise<void>;

export class DraftEditingSession {
  private listeners = new Set<() => void>();
  private saveTimer?: ReturnType<typeof setTimeout>;
  private activeSave?: Promise<boolean>;
  private snapshot: DraftEditingSnapshot;

  constructor(
    private readonly input: {
      debounceMs?: number;
      form: FormDetail;
      saveDraft: SaveDraft;
      schedule?: Schedule;
      cancelSchedule?: CancelSchedule;
      sleep?: Sleep;
    },
  ) {
    this.snapshot = createSnapshot(input.form);
  }

  getSnapshot = () => this.snapshot;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  load(form: FormDetail) {
    if (form.id !== this.snapshot.formId) {
      this.replaceWith(form);
      return;
    }

    if (this.hasUnsavedChanges()) {
      return;
    }

    this.replaceWith(form);
  }

  reload(form: FormDetail) {
    this.cancelPendingSave();
    this.replaceWith(form);
  }

  edit(command: DraftEdit) {
    if (this.snapshot.saveState === "conflict") {
      return;
    }

    const next = applyEdit(this.snapshot, command);
    if (next === this.snapshot) {
      return;
    }

    const validationIssues = validateDraft(next.draft);
    this.setSnapshot({
      ...next,
      lastError: undefined,
      saveState: validationIssues.length ? "invalid" : "dirty",
      validationIssues,
    });

    if (validationIssues.length) {
      this.cancelPendingSave();
    } else {
      this.scheduleSave();
    }
  }

  async saveNow(): Promise<boolean> {
    this.cancelPendingSave();

    if (this.snapshot.saveState === "conflict") {
      return false;
    }

    const validationIssues = validateDraft(this.snapshot.draft);
    if (validationIssues.length) {
      this.setSnapshot({
        ...this.snapshot,
        saveState: "invalid",
        validationIssues,
      });
      return false;
    }

    if (this.snapshot.saveState === "saved") {
      return true;
    }

    if (this.activeSave) {
      await this.activeSave;
      const stateAfterSave = this.snapshot.saveState as DraftSaveState;
      return stateAfterSave === "dirty" ? this.saveNow() : stateAfterSave === "saved";
    }

    const savingRevision = this.snapshot.revision;
    const draft = toDraftPayload(this.snapshot.draft);
    const expectedDraftVersion = this.snapshot.serverVersion;
    this.setSnapshot({ ...this.snapshot, lastError: undefined, saveState: "saving", validationIssues: [] });

    this.activeSave = this.performSave({ draft, expectedDraftVersion }, savingRevision);
    const saved = await this.activeSave;
    this.activeSave = undefined;

    if (saved && this.snapshot.saveState === "dirty") {
      return this.saveNow();
    }

    return saved && (this.snapshot.saveState as DraftSaveState) === "saved";
  }

  async runAfterSave(action: () => Promise<unknown>) {
    const saved = await this.saveNow();
    if (!saved) {
      return false;
    }

    await action();
    return true;
  }

  hasUnsavedChanges() {
    return this.snapshot.saveState !== "saved";
  }

  async flushBeforeLeave() {
    return this.hasUnsavedChanges() ? this.saveNow() : true;
  }

  dispose() {
    this.cancelPendingSave();
    this.listeners.clear();
  }

  private async performSave(
    input: { draft: EditableFormDraft; expectedDraftVersion: number },
    savingRevision: number,
  ) {
    try {
      const form = await this.saveWithRetry(input);
      const hasNewerChanges = this.snapshot.revision !== savingRevision;
      const selectedQuestionId = this.snapshot.selectedQuestionId;
      const savedDraft = normalizeDraft(form);
      const selected = findQuestionById(savedDraft, selectedQuestionId) ?? findFirstQuestion(savedDraft);

      this.setSnapshot({
        ...this.snapshot,
        draft: hasNewerChanges ? this.snapshot.draft : savedDraft,
        lastError: undefined,
        lastSavedAt: new Date().toISOString(),
        saveState: hasNewerChanges ? "dirty" : "saved",
        selectedQuestionId: hasNewerChanges ? selectedQuestionId : selected?.question.id,
        selectedSectionId: hasNewerChanges ? this.snapshot.selectedSectionId : selected?.sectionId,
        serverVersion: form.currentDraftVersion,
        validationIssues: [],
      });

      if (hasNewerChanges) {
        this.scheduleSave();
      }
      return true;
    } catch (error) {
      const conflict = isVersionConflict(error);
      this.setSnapshot({
        ...this.snapshot,
        lastError: error,
        saveState: conflict ? "conflict" : "failed",
      });
      return false;
    }
  }

  private async saveWithRetry(input: { draft: EditableFormDraft; expectedDraftVersion: number }) {
    const sleep = this.input.sleep ?? defaultSleep;
    let attempt = 0;

    while (true) {
      try {
        return await this.input.saveDraft(input);
      } catch (error) {
        if (!isTransientSaveError(error) || attempt >= 2) {
          throw error;
        }
        await sleep(250 * 2 ** attempt);
        attempt += 1;
      }
    }
  }

  private scheduleSave() {
    this.cancelPendingSave();
    const schedule = this.input.schedule ?? setTimeout;
    this.saveTimer = schedule(() => {
      this.saveTimer = undefined;
      void this.saveNow();
    }, this.input.debounceMs ?? 1_200);
  }

  private cancelPendingSave() {
    if (this.saveTimer === undefined) {
      return;
    }
    const cancel = this.input.cancelSchedule ?? clearTimeout;
    cancel(this.saveTimer);
    this.saveTimer = undefined;
  }

  private replaceWith(form: FormDetail) {
    const next = createSnapshot(form);
    this.setSnapshot(next);
  }

  private setSnapshot(snapshot: DraftEditingSnapshot) {
    this.snapshot = snapshot;
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function getDraftSaveLabel(saveState: DraftSaveState) {
  if (saveState === "dirty") return "Changes need saving";
  if (saveState === "saving") return "Saving changes";
  if (saveState === "failed") return "Save failed";
  if (saveState === "invalid") return "Fix highlighted fields";
  if (saveState === "conflict") return "Reload required";
  return "All changes saved";
}

export function selectDraftQuestion(snapshot: DraftEditingSnapshot) {
  return snapshot.draft.sections
    .flatMap((section) => section.questions)
    .find((question) => question.id === snapshot.selectedQuestionId);
}

export function isPersistedFormItem(value?: string) {
  return Boolean(value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
}

function createSnapshot(form: FormDetail): DraftEditingSnapshot {
  const draft = normalizeDraft(form);
  const selected = findFirstQuestion(draft);
  return {
    draft,
    formId: form.id,
    revision: 0,
    saveState: "saved",
    selectedQuestionId: selected?.question.id,
    selectedSectionId: selected?.sectionId,
    serverVersion: form.currentDraftVersion,
    validationIssues: [],
  };
}

function validateDraft(draft: EditableFormDraft): DraftValidationIssue[] {
  const result = editableFormDraftSchema.safeParse(toDraftPayload(draft));
  if (result.success) {
    return [];
  }
  return result.error.issues.map((issue) => ({
    message: issue.message,
    path: issue.path.join("."),
  }));
}

function applyEdit(snapshot: DraftEditingSnapshot, command: DraftEdit): DraftEditingSnapshot {
  const state = { ...snapshot, revision: snapshot.revision + 1 };
  switch (command.type) {
    case "meta":
      return { ...state, draft: { ...state.draft, [command.field]: command.value } };
    case "add-section": {
      const section = createEmptySection(state.draft.sections.length + 1);
      return {
        ...state,
        draft: normalizeDraft({ ...state.draft, sections: [...state.draft.sections, section] }),
        selectedQuestionId: undefined,
        selectedSectionId: section.id,
      };
    }
    case "remove-section": {
      const draft = normalizeDraft({
        ...state.draft,
        sections: state.draft.sections.filter((section) => section.id !== command.sectionId),
      });
      const selected = findQuestionById(draft, state.selectedQuestionId) ?? findFirstQuestion(draft);
      return {
        ...state,
        draft,
        selectedQuestionId: selected?.question.id,
        selectedSectionId: selected?.sectionId,
      };
    }
    case "update-section":
      return {
        ...state,
        draft: {
          ...state.draft,
          sections: state.draft.sections.map((section) =>
            section.id === command.sectionId ? { ...section, [command.field]: command.value } : section,
          ),
        },
      };
    case "add-question": {
      const question = createEmptyQuestion(command.questionType, 1);
      return {
        ...state,
        draft: normalizeDraft({
          ...state.draft,
          sections: state.draft.sections.map((section) =>
            section.id === command.sectionId
              ? { ...section, questions: [...section.questions, question] }
              : section,
          ),
        }),
        selectedQuestionId: question.id,
        selectedSectionId: command.sectionId,
      };
    }
    case "select-question":
      return {
        ...snapshot,
        selectedQuestionId: command.questionId,
        selectedSectionId: command.sectionId,
      };
    case "reorder-questions":
      return {
        ...state,
        draft: {
          ...state.draft,
          sections: state.draft.sections.map((section) => {
            if (section.id !== command.sectionId) return section;
            const from = section.questions.findIndex((question) => question.id === command.activeQuestionId);
            const to = section.questions.findIndex((question) => question.id === command.overQuestionId);
            if (from < 0 || to < 0) return section;
            return {
              ...section,
              questions: moveItem(section.questions, from, to).map((question, index) => ({
                ...question,
                position: index + 1,
              })),
            };
          }),
        },
        selectedQuestionId: command.activeQuestionId,
        selectedSectionId: command.sectionId,
      };
    case "remove-question": {
      const draft = normalizeDraft({
        ...state.draft,
        sections: state.draft.sections.map((section) => ({
          ...section,
          questions: section.questions.filter((question) => question.id !== command.questionId),
        })),
      });
      const selected =
        state.selectedQuestionId === command.questionId
          ? findFirstQuestion(draft)
          : findQuestionById(draft, state.selectedQuestionId);
      return {
        ...state,
        draft,
        selectedQuestionId: selected?.question.id,
        selectedSectionId: selected?.sectionId,
      };
    }
    case "update-question":
      return {
        ...state,
        draft: normalizeDraft({
          ...state.draft,
          sections: state.draft.sections.map((section) => ({
            ...section,
            questions: section.questions.map((question) => {
              if (question.id !== command.questionId) return question;
              const nextType = command.patch.type ?? question.type;
              const nextConfig = command.patch.config
                ? normalizeQuestionConfig(nextType, command.patch.config)
                : question.config;
              return { ...question, ...command.patch, type: nextType, config: nextConfig };
            }),
          })),
        }),
      };
    case "update-question-config":
      return {
        ...state,
        draft: {
          ...state.draft,
          sections: state.draft.sections.map((section) => ({
            ...section,
            questions: section.questions.map((question) =>
              question.id === command.questionId
                ? {
                    ...question,
                    config: normalizeQuestionConfig(question.type, {
                      ...question.config,
                      [command.key]: command.value,
                    }),
                  }
                : question,
            ),
          })),
        },
      };
  }
}

function findFirstQuestion(draft: EditableFormDraft) {
  for (const section of draft.sections) {
    const question = section.questions[0];
    if (section.id && question?.id) return { sectionId: section.id, question };
  }
  return undefined;
}

function findQuestionById(draft: EditableFormDraft, questionId?: string) {
  if (!questionId) return undefined;
  for (const section of draft.sections) {
    const question = section.questions.find((item) => item.id === questionId);
    if (section.id && question?.id) return { sectionId: section.id, question };
  }
  return undefined;
}

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

function isVersionConflict(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "FORM_DRAFT_VERSION_CONFLICT",
  );
}

function isTransientSaveError(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return false;
  }
  const status = Number(error.status);
  return status === 0 || status >= 500;
}

function defaultSleep(delayMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}
