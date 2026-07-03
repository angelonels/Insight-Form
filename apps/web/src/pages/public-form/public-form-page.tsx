import { Question } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "../../components/feedback/empty-state.js";
import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { routes } from "../../app/routes.js";
import type { FormQuestion } from "../../features/forms/types/form.types.js";
import { RespondentForm } from "../../features/public-form/components/respondent-form.js";
import { usePublicForm, useSubmitPublicForm, useTrackPublicFormEvent } from "../../features/public-form/hooks/use-public-form.js";
import type { PublicAnswerMap } from "../../features/public-form/types/public-form.types.js";

const respondentEmailSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email or leave this blank.");

export function PublicFormPage() {
  const { publicSlug = "" } = useParams();
  const publicForm = usePublicForm(publicSlug);
  const submitForm = useSubmitPublicForm(publicSlug);
  const trackEvent = useTrackPublicFormEvent(publicSlug);
  const navigate = useNavigate();
  const openedTracked = useRef(false);
  const startedTracked = useRef(false);
  const startTime = useRef(Date.now());
  const [answers, setAnswers] = useState<PublicAnswerMap>({});
  const [respondentEmail, setRespondentEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const questions = useMemo(() => {
    if (publicForm.data?.status !== "open") {
      return [];
    }

    return publicForm.data.schema.sections.flatMap((section) =>
      section.questions.map((question) => ({
        ...question,
        id: question.id ?? "",
        sectionId: section.id ?? "",
      })),
    );
  }, [publicForm.data]);

  useEffect(() => {
    if (publicForm.data?.status !== "open" || openedTracked.current) {
      return;
    }

    openedTracked.current = true;
    trackEvent.mutate({
      eventType: "form_opened",
      publishedFormId: publicForm.data.publishedFormId,
      metadata: { version: publicForm.data.version },
    });
  }, [publicForm.data, trackEvent]);

  function updateAnswer(question: FormQuestion & { id: string }, value: unknown) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[question.id];
      return next;
    });

    if (publicForm.data?.status === "open" && !startedTracked.current) {
      startedTracked.current = true;
      trackEvent.mutate({
        eventType: "form_started",
        publishedFormId: publicForm.data.publishedFormId,
        metadata: { firstQuestionId: question.id },
      });
    }
  }

  function handleSubmit() {
    const openPublicForm = publicForm.data;

    if (!openPublicForm || openPublicForm.status !== "open") {
      return;
    }

    const nextErrors: Record<string, string> = {};
    const emailResult = respondentEmailSchema.safeParse(respondentEmail);

    if (!emailResult.success) {
      nextErrors._respondentEmail = emailResult.error.issues[0]?.message ?? "Enter a valid email or leave this blank.";
    }

    for (const question of questions) {
      if (question.isRequired && !hasValue(answers[question.id])) {
        nextErrors[question.id] = "This question needs an answer.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please review the highlighted fields.");
      return;
    }

    submitForm.mutate(
      {
        publishedFormId: openPublicForm.publishedFormId,
        respondentEmail: respondentEmail.trim() || null,
        completionTimeSeconds: Math.round((Date.now() - startTime.current) / 1000),
        metadata: { source: "public-form" },
        answers: questions
          .filter((question) => hasValue(answers[question.id]))
          .map((question) => ({
            questionId: question.id,
            value: answers[question.id],
          })),
      },
      {
        onSuccess: () => {
          trackEvent.mutate({
            eventType: "form_submitted",
            publishedFormId: openPublicForm.publishedFormId,
            metadata: { answeredCount: questions.filter((question) => hasValue(answers[question.id])).length },
          });
          toast.success("Response submitted.");
          navigate(routes.publicThankYou(publicSlug));
        },
        onError: () => toast.error("Could not submit this response."),
      },
    );
  }

  if (publicForm.isPending) {
    return <LoadingState rows={3} />;
  }

  if (publicForm.isError) {
    return <ErrorState error={publicForm.error} title="Could not load this form" />;
  }

  if (publicForm.data.status === "closed") {
    return (
      <EmptyState
        description={publicForm.data.message}
        icon={<Question className="size-5" aria-hidden="true" />}
        title={publicForm.data.title}
      />
    );
  }

  if (publicForm.data.status === "not_found") {
    return <EmptyState description={publicForm.data.message} icon={<Question className="size-5" aria-hidden="true" />} title="Form not found" />;
  }

  const openPublicForm = publicForm.data;

  return (
    <RespondentForm
      answers={answers}
      errors={errors}
      isSubmitting={submitForm.isPending}
      onAnswerChange={updateAnswer}
      onQuestionFocus={(section, question) => {
        trackEvent.mutate({
          eventType: "question_focused",
          publishedFormId: openPublicForm.publishedFormId,
          sectionId: section.id,
          questionId: question.id,
          metadata: { questionPosition: question.position },
        });
      }}
      onRespondentEmailChange={(value) => {
        setRespondentEmail(value);
        setErrors((current) => {
          const next = { ...current };
          delete next._respondentEmail;
          return next;
        });
      }}
      onSubmit={handleSubmit}
      respondentEmail={respondentEmail}
      schema={openPublicForm.schema}
      submitError={submitForm.isError ? <ErrorState error={submitForm.error} title="Could not submit this response" /> : null}
    />
  );
}

function hasValue(value: unknown) {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}
