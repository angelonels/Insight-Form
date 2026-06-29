import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useImproveQuestion, useRunQualityCheck } from "../form-quality-check/hooks/use-form-quality.js";
import type { QualityCheckResult } from "../form-quality-check/types/form-quality-check.types.js";
import {
  useCloseForm,
  useFormDetail,
  usePublishForm,
  useSaveFormDraft,
} from "../forms/hooks/use-forms.js";
import type { FormDetail } from "../forms/types/form.types.js";
import {
  DraftEditingSession,
  isPersistedFormItem,
  selectDraftQuestion,
  type DraftEdit,
} from "./draft-editing-session.js";

export function useDraftEditingSession(formId: string) {
  const form = useFormDetail(formId);
  const saveDraft = useSaveFormDraft(formId);
  const publishForm = usePublishForm(formId);
  const closeForm = useCloseForm(formId);
  const improveQuestion = useImproveQuestion(formId);
  const runQualityCheck = useRunQualityCheck(formId);
  const navigate = useNavigate();
  const [qualityResult, setQualityResult] = useState<QualityCheckResult | null>(null);
  const saveAdapter = useRef(saveDraft.mutateAsync);
  saveAdapter.current = saveDraft.mutateAsync;

  const sessionRef = useRef<{ formId: string; session: DraftEditingSession } | undefined>(undefined);
  if (!sessionRef.current || sessionRef.current.formId !== formId) {
    sessionRef.current?.session.dispose();
    sessionRef.current = {
      formId,
      session: new DraftEditingSession({
        form: emptyFormDetail(formId),
        saveDraft: (input) => saveAdapter.current(input),
      }),
    };
  }

  const session = sessionRef.current.session;
  const editor = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const selectedQuestion = selectDraftQuestion(editor);

  useEffect(() => {
    if (form.data) {
      session.load(form.data);
    }
  }, [form.data, session]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!session.hasUnsavedChanges()) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    }

    function saveBeforeInternalNavigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !session.hasUnsavedChanges()
      ) {
        return;
      }

      const target = event.target;
      const anchor = target instanceof Element ? target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      void session.flushBeforeLeave().then((saved) => {
        if (saved) {
          navigate(`${destination.pathname}${destination.search}${destination.hash}`);
          return;
        }
        showSaveBlockMessage(session);
      });
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", saveBeforeInternalNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", saveBeforeInternalNavigation, true);
    };
  }, [navigate, session]);

  useEffect(() => () => session.dispose(), [session]);

  async function save() {
    const saved = await session.saveNow();
    if (saved) {
      toast.success("Changes saved.");
    } else {
      showSaveBlockMessage(session);
    }
  }

  async function reviewQuality() {
    await runSavedAction(
      session,
      () =>
        runQualityCheck.mutateAsync(undefined).then((result) => {
          setQualityResult(result);
          toast.success("Review complete.");
        }),
      "Could not review this form.",
    );
  }

  async function publish() {
    await runSavedAction(
      session,
      () => publishForm.mutateAsync(undefined).then(() => toast.success("Form published.")),
      "Could not publish this form.",
    );
  }

  async function close() {
    await runSavedAction(
      session,
      () => closeForm.mutateAsync(undefined).then(() => toast.success("Form closed.")),
      "Could not close this form.",
    );
  }

  async function improveSelectedQuestion() {
    const question = selectDraftQuestion(session.getSnapshot());
    if (!question?.id || !isPersistedFormItem(question.id)) {
      toast.info("Save this question, then select it again before asking AI to improve it.");
      return;
    }

    await runSavedAction(
      session,
      () =>
        improveQuestion.mutateAsync(question.id!).then((suggestion) => {
          session.edit({
            type: "update-question",
            questionId: question.id!,
            patch: {
              questionText: suggestion.suggestedQuestionText,
              config: suggestion.suggestedConfig,
            },
          });
          toast.success("Question improved.");
        }),
      "Could not improve this question.",
    );
  }

  async function reloadAfterConflict() {
    const result = await form.refetch();
    if (result.data) {
      session.reload(result.data);
      toast.success("Latest form loaded.");
    }
  }

  return {
    closeForm,
    dispatch: (edit: DraftEdit) => session.edit(edit),
    editor,
    form,
    improveQuestion,
    publishForm,
    qualityResult,
    runQualityCheck,
    saveDraft,
    selectedQuestion,
    actions: {
      close,
      improveSelectedQuestion,
      publish,
      reloadAfterConflict,
      reviewQuality,
      save,
    },
  };
}

async function runSavedAction(
  session: DraftEditingSession,
  action: () => Promise<unknown>,
  errorMessage: string,
) {
  try {
    const ran = await session.runAfterSave(action);
    if (!ran) {
      showSaveBlockMessage(session);
    }
  } catch {
    toast.error(errorMessage);
  }
}

function showSaveBlockMessage(session: DraftEditingSession) {
  const state = session.getSnapshot().saveState;
  if (state === "conflict") {
    toast.error("This form changed in another tab. Reload to continue.");
  } else if (state === "invalid") {
    toast.error("Fix the highlighted Form Draft fields before continuing.");
  } else {
    toast.error("Could not save the latest changes.");
  }
}

function emptyFormDetail(formId: string): FormDetail {
  const now = new Date(0).toISOString();
  return {
    id: formId,
    title: "Untitled form",
    description: "",
    status: "draft",
    qualityStatus: "not_checked",
    insightStatus: "not_ready",
    isDemo: false,
    responseCount: 0,
    completionRate: null,
    lastResponseAt: null,
    publicSlug: null,
    updatedAt: now,
    currentDraftVersion: 1,
    latestPublishedVersion: null,
    createdAt: now,
    publishedAt: null,
    closedAt: null,
    sections: [],
  };
}
