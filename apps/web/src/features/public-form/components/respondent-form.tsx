import { CheckCircle, Envelope } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Button } from "../../../components/ui/button.js";
import { Input } from "../../../components/ui/input.js";
import { Progress } from "../../../components/ui/progress.js";
import type {
  EditableFormDraft,
  FormQuestion,
  FormSection,
} from "../../forms/types/form.types.js";
import type { PublicAnswerMap } from "../types/public-form.types.js";
import { PublicQuestionField } from "./public-question-field.js";

type RespondentQuestion = FormQuestion & { id: string };

export function RespondentForm({
  answers,
  errors,
  isPreview = false,
  isSubmitting = false,
  onAnswerChange,
  onQuestionFocus,
  onRespondentEmailChange,
  onSubmit,
  respondentEmail,
  schema,
  submitError,
}: {
  answers: PublicAnswerMap;
  errors: Record<string, string>;
  isPreview?: boolean;
  isSubmitting?: boolean;
  onAnswerChange: (question: RespondentQuestion, value: unknown) => void;
  onQuestionFocus?: (section: FormSection, question: RespondentQuestion) => void;
  onRespondentEmailChange: (value: string) => void;
  onSubmit: () => void;
  respondentEmail: string;
  schema: EditableFormDraft;
  submitError?: ReactNode;
}) {
  const questions = schema.sections.flatMap((section) =>
    section.questions.map((question) => ({
      ...question,
      id: questionId(section, question),
    })),
  );
  const answeredCount = questions.filter((question) => hasValue(answers[question.id])).length;

  return (
    <section className="grid min-w-0 gap-9">
      <header className="border-b border-border-subtle pb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Feedback form</p>
        <h1 className="font-editorial text-4xl font-medium leading-[1.02] tracking-[-0.025em] text-foreground sm:text-5xl">
          {schema.title}
        </h1>
        {schema.description ? <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{schema.description}</p> : null}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">{answeredCount} of {questions.length} questions answered</span>
            <span className="font-mono text-muted-foreground">{questions.length ? Math.round((answeredCount / questions.length) * 100) : 0}%</span>
          </div>
          <Progress value={questions.length ? (answeredCount / questions.length) * 100 : 0} />
        </div>
      </header>

      {schema.sections.map((section, sectionIndex) => (
        <section className="grid min-w-0 gap-4 border-b border-border-subtle pb-8 last:border-b-0" key={section.id ?? section.position}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 font-editorial text-lg text-primary">{String(sectionIndex + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="font-editorial text-2xl font-medium">{section.title}</h2>
              {section.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.description}</p> : null}
            </div>
          </div>
          <div className="grid min-w-0 gap-3">
            {section.questions.map((question) => {
              const normalizedQuestion = { ...question, id: questionId(section, question) };

              return (
                <PublicQuestionField
                  error={errors[normalizedQuestion.id]}
                  key={normalizedQuestion.id}
                  onFocus={() => onQuestionFocus?.(section, normalizedQuestion)}
                  onChange={(value) => onAnswerChange(normalizedQuestion, value)}
                  question={normalizedQuestion}
                  value={answers[normalizedQuestion.id]}
                />
              );
            })}
          </div>
        </section>
      ))}

      <section className="grid gap-4 border-b border-border-subtle pb-8">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <Envelope className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Follow-up, optional</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Leave an email only if you are comfortable being contacted about this response.</p>
          </div>
        </div>
        <label className="grid gap-2 text-sm font-medium" data-invalid={Boolean(errors._respondentEmail) || undefined}>
          Email address
          <Input
            aria-describedby={errors._respondentEmail ? "respondent-email-error" : "respondent-email-help"}
            aria-invalid={Boolean(errors._respondentEmail)}
            autoComplete="email"
            value={respondentEmail}
            onChange={(event) => onRespondentEmailChange(event.target.value)}
            type="email"
          />
          <span className="text-sm font-normal text-muted-foreground" id="respondent-email-help">We will attach this only to your submitted response.</span>
          {errors._respondentEmail ? <span className="text-sm font-normal text-destructive" id="respondent-email-error">{errors._respondentEmail}</span> : null}
        </label>
      </section>

      {submitError}
      <div className="sticky bottom-3 grid gap-3 rounded-lg border border-border-subtle bg-raised/96 p-3 shadow-soft backdrop-blur sm:grid-cols-[1fr_auto] sm:items-center sm:p-4">
        <p className="hidden text-sm leading-6 text-muted-foreground sm:block">
          {isPreview ? "Preview mode — answers are interactive but will not be saved." : "Review required answers before submitting. Your entries stay on this page if submission fails."}
        </p>
        <Button className="w-full sm:w-auto" disabled={isPreview} isLoading={isSubmitting} onClick={onSubmit} type="button">
          <CheckCircle className="size-4" aria-hidden="true" />
          Submit response
        </Button>
      </div>
    </section>
  );
}

function questionId(section: FormSection, question: FormQuestion) {
  return question.id ?? `section-${section.position}-question-${question.position}`;
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
