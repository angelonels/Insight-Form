import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  CheckCircle,
  DotsSixVertical,
  Eye,
  FloppyDisk,
  Globe,
  Plus,
  Sparkle,
  Trash,
  XCircle,
} from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";

import { routes } from "../../app/routes.js";
import { ErrorState } from "../../components/feedback/error-state.js";
import { LoadingState } from "../../components/feedback/loading-state.js";
import { StatusBadge } from "../../components/feedback/status-badge.js";
import { Button } from "../../components/ui/button.js";
import { Card } from "../../components/ui/card.js";
import { Checkbox } from "../../components/ui/checkbox.js";
import { DropdownMenu, DropdownMenuItem } from "../../components/ui/dropdown-menu.js";
import { Input } from "../../components/ui/input.js";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.js";
import { Textarea } from "../../components/ui/textarea.js";
import {
  getDraftSaveLabel,
  type DraftEdit,
  type DraftSaveState,
  type DraftValidationIssue,
} from "../../features/form-editor/draft-editing-session.js";
import { useDraftEditingSession } from "../../features/form-editor/use-draft-editing-session.js";
import type {
  FormQuestion,
  FormSection,
  QuestionType,
} from "../../features/forms/types/form.types.js";
import { questionTypeLabels, questionTypes } from "../../features/forms/types/form.types.js";
import {
  createClientId,
  createDefaultQuestionConfig,
} from "../../features/forms/utils/create-form-draft.js";
import type { QualityCheckResult } from "../../features/form-quality-check/types/form-quality-check.types.js";
import { cn } from "../../lib/utils/cn.js";

export function FormEditorPage() {
  const { formId = "" } = useParams();
  const {
    actions,
    closeForm,
    dispatch,
    editor,
    form,
    improveQuestion,
    publishForm,
    qualityResult,
    runQualityCheck,
    selectedQuestion,
  } = useDraftEditingSession(formId);

  if (form.isPending) {
    return <LoadingState rows={3} />;
  }

  if (form.isError) {
    return <ErrorState error={form.error} title="Could not load editor" />;
  }

  return (
    <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] bg-raised">
      <div className="sticky top-16 z-30 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 border-b border-border-subtle bg-raised/96 px-4 py-3 backdrop-blur-xl sm:px-6 lg:top-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            to={routes.dashboard}
            aria-label="Back to forms"
          >
            <ArrowLeft className="size-4" weight="regular" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={form.data.status} />
              {form.data.qualityStatus === "passed" ? (
                <span className="text-xs text-muted-foreground">Quality reviewed</span>
              ) : null}
              {form.data.isDemo ? (
                <span className="text-xs font-medium text-primary">Sample form</span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    editor.saveState === "failed"
                      ? "bg-destructive"
                      : editor.saveState === "saved"
                        ? "bg-success"
                        : "bg-warning",
                  )}
                />
                {getDraftSaveLabel(editor.saveState)}
              </span>
            </div>
            <h1 className="mt-1 break-words font-editorial text-2xl font-medium leading-none tracking-[-0.02em] sm:text-[1.75rem]">
              {editor.draft.title}
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-raised px-3 text-sm font-medium shadow-subtle transition-colors hover:border-primary/35 hover:bg-secondary/45"
            to={routes.ownerFormPreview(formId)}
          >
            <Eye className="size-4" weight="regular" aria-hidden="true" />
            Preview
          </Link>
          <Button
            className="justify-center"
            isLoading={editor.saveState === "saving"}
            onClick={actions.save}
            type="button"
            variant="outline"
          >
            <FloppyDisk className="size-4" weight="regular" aria-hidden="true" />
            Save
          </Button>
          <Button
            className="justify-center"
            isLoading={runQualityCheck.isPending}
            onClick={actions.reviewQuality}
            type="button"
            variant="secondary"
          >
            <Sparkle className="size-4" weight="regular" aria-hidden="true" />
            Review form
          </Button>
          {form.data.status === "closed" ? null : form.data.status === "published" ? (
            <Button
              className="justify-center"
              isLoading={closeForm.isPending}
              onClick={actions.close}
              type="button"
              variant="outline"
            >
              <XCircle className="size-4" weight="regular" aria-hidden="true" />
              Close form
            </Button>
          ) : (
            <Button
              className="justify-center"
              isLoading={publishForm.isPending}
              onClick={actions.publish}
              type="button"
            >
              <Globe className="size-4" weight="regular" aria-hidden="true" />
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 px-4 pt-4 sm:px-6 lg:px-7">
        <DraftSavePanel
          error={editor.lastError}
          issues={editor.validationIssues}
          onReload={actions.reloadAfterConflict}
          state={editor.saveState}
        />
        {publishForm.isSuccess ? (
          <div className="rounded-lg border border-success/25 bg-success/10 p-4 text-sm text-success-foreground">
          Published. Public link:{" "}
          <Link
            className="font-semibold underline"
            to={routes.publicForm(publishForm.data.publicSlug)}
          >
            {publishForm.data.publicUrl}
          </Link>
          </div>
        ) : null}
        {publishForm.isError ? (
          <ErrorState error={publishForm.error} title="Could not publish this form" />
        ) : null}
        {runQualityCheck.isError ? (
          <ErrorState error={runQualityCheck.error} title="Quality check failed" />
        ) : null}
        {qualityResult ? <QualityCheckPanel result={qualityResult} /> : null}
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-0 px-4 pb-12 sm:px-6 lg:px-7">
          <div className="border-b border-border-subtle py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Form title
                <Input
                  value={editor.draft.title}
                  onChange={(event) =>
                    dispatch({ type: "meta", field: "title", value: event.target.value })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Description
                <Input
                  value={editor.draft.description ?? ""}
                  onChange={(event) =>
                    dispatch({ type: "meta", field: "description", value: event.target.value })
                  }
                />
              </label>
            </div>
          </div>

          {editor.draft.sections.length ? (
            editor.draft.sections.map((section) => (
              <SectionEditor
                dispatch={dispatch}
                key={section.id ?? section.position}
                section={section}
                selectedQuestionId={editor.selectedQuestionId}
              />
            ))
          ) : (
            <Card className="my-6 grid gap-3 p-6 text-center">
              <h2 className="text-lg font-semibold">Add the first section</h2>
              <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
                Group related questions so respondents can move through the form without friction.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => dispatch({ type: "add-section" })} type="button">
                  <Plus className="size-4" aria-hidden="true" />
                  Add section
                </Button>
              </div>
            </Card>
          )}

          <Button
            className="my-5 w-full border-dashed"
            onClick={() => dispatch({ type: "add-section" })}
            type="button"
            variant="outline"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add section
          </Button>
        </div>

        <aside className="border-t border-border-subtle bg-background/60 lg:sticky lg:top-[4.5rem] lg:h-[calc(100dvh-4.5rem)] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <QuestionSettings
            onImprove={actions.improveSelectedQuestion}
            dispatch={dispatch}
            isImproving={improveQuestion.isPending}
            question={selectedQuestion}
          />
        </aside>
      </div>
    </section>
  );
}

function SectionEditor({
  dispatch,
  section,
  selectedQuestionId,
}: {
  dispatch: (edit: DraftEdit) => void;
  section: FormSection;
  selectedQuestionId?: string;
}) {
  const sectionId = requireId(section.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    dispatch({
      type: "reorder-questions",
      sectionId,
      activeQuestionId: String(active.id),
      overQuestionId: String(over.id),
    });
  }

  return (
    <section className="min-w-0 border-b border-border-subtle py-5">
      <div className="grid gap-3 pb-3 md:grid-cols-[1fr_auto] md:items-start">
        <div className="grid gap-2">
          <Input
            aria-label="Section title"
            className="h-auto border-transparent bg-transparent px-0 py-0 font-editorial text-xl font-medium shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0"
            value={section.title}
            onChange={(event) =>
              dispatch({
                type: "update-section",
                sectionId,
                field: "title",
                value: event.target.value,
              })
            }
          />
          <Textarea
            className="min-h-8 resize-none border-transparent bg-transparent px-0 py-0 text-sm shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0"
            aria-label="Section description"
            value={section.description ?? ""}
            onChange={(event) =>
              dispatch({
                type: "update-section",
                sectionId,
                field: "description",
                value: event.target.value,
              })
            }
          />
        </div>
        <Button
          className="justify-self-start text-muted-foreground hover:text-destructive md:justify-self-end"
          onClick={() => dispatch({ type: "remove-section", sectionId })}
          size="sm"
          type="button"
          variant="ghost"
        >
          Remove
        </Button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext
          items={section.questions.map((question) => requireId(question.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] divide-y divide-border-subtle border-y border-border-subtle">
            {section.questions.length ? (
              section.questions.map((question) => {
                const questionId = requireId(question.id);
                return (
                  <SortableQuestionCard
                    key={questionId}
                    onSelect={() => dispatch({ type: "select-question", sectionId, questionId })}
                    question={question}
                    questionId={questionId}
                    selected={selectedQuestionId === question.id}
                  />
                );
              })
            ) : (
              <div className="m-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                Add a question to this section.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex justify-center pt-3">
        <DropdownMenu
          align="left"
          trigger={
            <span className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-primary transition-colors hover:bg-secondary/60">
              <Plus className="size-4" aria-hidden="true" />
              Add question
            </span>
          }
        >
          {questionTypes.map((questionType) => (
            <DropdownMenuItem key={questionType}>
              <button
                className="flex w-full items-center gap-2 text-left"
                onClick={() => dispatch({ type: "add-question", sectionId, questionType })}
                type="button"
              >
                <Plus className="size-4" aria-hidden="true" />
                {questionTypeLabels[questionType]}
              </button>
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      </div>
    </section>
  );
}

function SortableQuestionCard({
  onSelect,
  question,
  questionId,
  selected,
}: {
  onSelect: () => void;
  question: FormQuestion;
  questionId: string;
  selected: boolean;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: questionId,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full border-l-2 border-transparent bg-raised px-3 py-2.5 transition-colors duration-150",
        selected ? "border-l-primary bg-secondary/60" : "hover:bg-surface/70",
        isDragging && "relative z-10 shadow-panel",
      )}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex min-w-0 items-start gap-3">
        <button
          aria-label={`Drag ${question.questionText}`}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          type="button"
          {...attributes}
          {...listeners}
        >
          <DotsSixVertical className="size-4" weight="bold" aria-hidden="true" />
        </button>
        <button className="min-w-0 flex-1 text-left" onClick={onSelect} type="button">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium">{question.questionText}</p>
              <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.05em] text-muted-foreground">
                {questionTypeLabels[question.type]}
              </p>
            </div>
            {question.isRequired ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="size-4 text-success" weight="regular" aria-hidden="true" />
                Required
              </span>
            ) : null}
          </div>
        </button>
      </div>
    </div>
  );
}

function QuestionSettings({
  dispatch,
  isImproving,
  onImprove,
  question,
}: {
  dispatch: (edit: DraftEdit) => void;
  isImproving: boolean;
  onImprove: () => void;
  question?: FormQuestion;
}) {
  if (!question?.id) {
    return (
      <div className="p-5">
        <h2 className="text-lg font-semibold">Question settings</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose a question to adjust wording, answer type, options, and whether it is required.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 p-5">
      <div className="border-b border-border-subtle pb-4">
        <h2 className="text-lg font-semibold">Edit question</h2>
        <p className="mt-1 text-sm text-muted-foreground">{questionTypeLabels[question.type]}</p>
      </div>
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Question
          <Textarea
            className="min-h-24"
            value={question.questionText}
            onChange={(event) =>
              dispatch({
                type: "update-question",
                questionId: question.id!,
                patch: { questionText: event.target.value },
              })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Helper text
          <Input
            value={question.helpText ?? ""}
            onChange={(event) =>
              dispatch({
                type: "update-question",
                questionId: question.id!,
                patch: { helpText: event.target.value },
              })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Type
          <Select
            value={question.type}
            onValueChange={(value) =>
              dispatch({
                type: "update-question",
                questionId: question.id!,
                patch: {
                  type: value as QuestionType,
                  config: createDefaultQuestionConfig(value as QuestionType),
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {questionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {questionTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        <label className="flex min-h-10 items-center justify-start gap-3 text-sm font-medium">
          <Checkbox
            checked={question.isRequired}
            onCheckedChange={(checked) =>
              dispatch({
                type: "update-question",
                questionId: question.id!,
                patch: { isRequired: checked === true },
              })
            }
          />
          Required response
        </label>
        <QuestionConfigEditor dispatch={dispatch} question={question} />
      </div>
      <div className="grid gap-2 border-t border-border-subtle pt-4">
        <Button isLoading={isImproving} onClick={onImprove} type="button" variant="secondary">
          <Sparkle className="size-4" aria-hidden="true" />
          Improve wording with AI
        </Button>
        <Button
          className="text-muted-foreground hover:text-destructive"
          onClick={() => dispatch({ type: "remove-question", questionId: question.id! })}
          type="button"
          variant="ghost"
        >
          <Trash className="size-4" aria-hidden="true" />
          Remove question
        </Button>
      </div>
      <div className="rounded-md border border-border-subtle bg-secondary/35 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="size-4 text-success" aria-hidden="true" />
          Quality
        </div>
        <p className="mt-2 text-sm font-medium">Looks good</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Clear, specific, and easy to answer.
        </p>
      </div>
    </div>
  );
}

function QuestionConfigEditor({
  dispatch,
  question,
}: {
  dispatch: (edit: DraftEdit) => void;
  question: FormQuestion & { id?: string };
}) {
  if (!question.id) {
    return null;
  }

  if (
    question.type === "multiple_choice" ||
    question.type === "checkbox" ||
    question.type === "dropdown"
  ) {
    const options = question.config.options ?? [];
    return (
      <div className="grid gap-2">
        <p className="text-sm font-medium">Options</p>
        {options.map((option, index) => (
          <div className="flex gap-2" key={option.id}>
            <Input
              value={option.label}
              onChange={(event) => {
                const nextOptions = options.map((item, optionIndex) =>
                  optionIndex === index ? { ...item, label: event.target.value } : item,
                );
                dispatch({
                  type: "update-question-config",
                  questionId: question.id!,
                  key: "options",
                  value: nextOptions,
                });
              }}
            />
            <Button
              aria-label={`Remove ${option.label}`}
              disabled={options.length <= 1}
              onClick={() =>
                dispatch({
                  type: "update-question-config",
                  questionId: question.id!,
                  key: "options",
                  value: options.filter((item) => item.id !== option.id),
                })
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
        <Button
          onClick={() =>
            dispatch({
              type: "update-question-config",
              questionId: question.id!,
              key: "options",
              value: [
                ...options,
                { id: createClientId("option"), label: `Option ${options.length + 1}` },
              ],
            })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add option
        </Button>
      </div>
    );
  }

  if (question.type === "rating_scale") {
    return (
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm font-medium">
            Min
            <Input
              type="number"
              value={question.config.min ?? 1}
              onChange={(event) =>
                dispatch({
                  type: "update-question-config",
                  questionId: question.id!,
                  key: "min",
                  value: Number(event.target.value),
                })
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Max
            <Input
              type="number"
              value={question.config.max ?? 5}
              onChange={(event) =>
                dispatch({
                  type: "update-question-config",
                  questionId: question.id!,
                  key: "max",
                  value: Number(event.target.value),
                })
              }
            />
          </label>
        </div>
        <Input
          value={question.config.minLabel ?? ""}
          placeholder="Minimum label"
          onChange={(event) =>
            dispatch({
              type: "update-question-config",
              questionId: question.id!,
              key: "minLabel",
              value: event.target.value,
            })
          }
        />
        <Input
          value={question.config.maxLabel ?? ""}
          placeholder="Maximum label"
          onChange={(event) =>
            dispatch({
              type: "update-question-config",
              questionId: question.id!,
              key: "maxLabel",
              value: event.target.value,
            })
          }
        />
      </div>
    );
  }

  return (
    <label className="grid gap-2 text-sm font-medium">
      Placeholder
      <Input
        value={question.config.placeholder ?? ""}
        onChange={(event) =>
          dispatch({
            type: "update-question-config",
            questionId: question.id!,
            key: "placeholder",
            value: event.target.value,
          })
        }
      />
    </label>
  );
}

function QualityCheckPanel({ result }: { result: QualityCheckResult }) {
  return (
    <Card className="border-primary/20 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-primary">AI quality review</p>
          <h2 className="mt-1 font-mono text-3xl font-semibold">{result.score} / 100</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{result.summary}</p>
      </div>
      {result.issues.length ? (
        <div className="mt-5 grid gap-3">
          {result.issues.map((issue, index) => (
            <div className="border-t border-border-subtle pt-4" key={`${issue.problem}-${index}`}>
              <StatusBadge status={issue.severity} />
              <h3 className="mt-2 font-semibold">{issue.problem}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{issue.whyItMatters}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-success-foreground">No major issues found.</p>
      )}
    </Card>
  );
}

function DraftSavePanel({
  error,
  issues,
  onReload,
  state,
}: {
  error?: unknown;
  issues: DraftValidationIssue[];
  onReload: () => void;
  state: DraftSaveState;
}) {
  if (state === "conflict") {
    return (
      <Card className="flex flex-col justify-between gap-4 border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">This form changed in another tab</h2>
          <p className="mt-1 text-sm text-muted-foreground">Reload the latest Form Draft before continuing.</p>
        </div>
        <Button onClick={onReload} type="button" variant="outline">Reload latest</Button>
      </Card>
    );
  }

  if (state === "invalid") {
    return (
      <Card className="border-warning/30 bg-warning/10 p-4">
        <h2 className="font-semibold">Fix the Form Draft before saving</h2>
        <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
          {issues.map((issue) => <li key={`${issue.path}-${issue.message}`}>{issue.message}</li>)}
        </ul>
      </Card>
    );
  }

  return state === "failed" ? <ErrorState error={error} title="Changes were not saved" /> : null;
}

function requireId(value?: string) {
  return value ?? "missing-id";
}
