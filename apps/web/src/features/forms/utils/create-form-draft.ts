import type { EditableFormDraft, FormQuestion, FormSection, QuestionType } from "../types/form.types.js";

export function createClientId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptySection(position = 1): FormSection {
  return {
    id: createClientId("section"),
    title: `Section ${position}`,
    description: "",
    position,
    questions: [],
  };
}

export function createEmptyQuestion(type: QuestionType = "short_answer", position = 1): FormQuestion {
  return {
    id: createClientId("question"),
    questionText: "What would you like to ask?",
    helpText: "",
    type,
    isRequired: false,
    position,
    config: createDefaultQuestionConfig(type),
  };
}

export function normalizeDraft(draft: EditableFormDraft): EditableFormDraft {
  return {
    ...draft,
    sections: draft.sections.map((section, sectionIndex) => ({
      ...section,
      id: section.id ?? createClientId("section"),
      position: sectionIndex + 1,
      questions: section.questions.map((question, questionIndex) => ({
        ...question,
        id: question.id ?? createClientId("question"),
        position: questionIndex + 1,
        config: normalizeQuestionConfig(question.type, question.config),
      })),
    })),
  };
}

export function createDefaultQuestionConfig(type: QuestionType) {
  if (type === "multiple_choice" || type === "checkbox" || type === "dropdown") {
    return {
      options: [
        { id: createClientId("option"), label: "Option A" },
        { id: createClientId("option"), label: "Option B" },
      ],
    };
  }

  if (type === "rating_scale") {
    return { min: 1, max: 5, minLabel: "Not good", maxLabel: "Excellent" };
  }

  return {};
}

export function normalizeQuestionConfig(type: QuestionType, config: FormQuestion["config"] = {}) {
  if (type === "multiple_choice" || type === "checkbox" || type === "dropdown") {
    const defaultOptions = [
      { id: createClientId("option"), label: "Option A" },
      { id: createClientId("option"), label: "Option B" },
    ];
    const options = Array.isArray(config.options) && config.options.length ? config.options : defaultOptions;

    return {
      options: options.map((option, index) => ({
        id: option.id?.trim() ? option.id : createClientId("option"),
        label: option.label?.trim() ? option.label : `Option ${index + 1}`,
      })),
    };
  }

  if (type === "rating_scale") {
    const min = Number(config.min ?? 1);
    const max = Number(config.max ?? 5);

    return {
      min,
      max: Math.max(max, min + 1),
      minLabel: typeof config.minLabel === "string" ? config.minLabel : "",
      maxLabel: typeof config.maxLabel === "string" ? config.maxLabel : "",
    };
  }

  return config.placeholder ? { placeholder: config.placeholder } : {};
}

export function toDraftPayload(draft: EditableFormDraft): EditableFormDraft {
  return {
    title: draft.title,
    description: draft.description ?? null,
    sections: draft.sections.map((section, sectionIndex) => ({
      id: isUuid(section.id) ? section.id : undefined,
      title: section.title,
      description: section.description ?? null,
      position: sectionIndex + 1,
      questions: section.questions.map((question, questionIndex) => ({
        id: isUuid(question.id) ? question.id : undefined,
        questionText: question.questionText,
        helpText: question.helpText ?? null,
        type: question.type,
        isRequired: question.isRequired,
        position: questionIndex + 1,
        config: question.config ?? {},
      })),
    })),
  };
}

function isUuid(value?: string) {
  return Boolean(value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
}
