export const productName = "InsightForm";
export {
  editableFormDraftSchema,
  editableFormQuestionSchema,
  editableFormSectionSchema,
  questionConfigSchema,
  questionOptionSchema,
  questionTypeSchema,
} from "./form-draft-contract.js";

export type QuestionType =
  | "short_answer"
  | "long_answer"
  | "email"
  | "number"
  | "multiple_choice"
  | "checkbox"
  | "dropdown"
  | "rating_scale";

export type QuestionOption = {
  id: string;
  label: string;
};

export type QuestionConfig = {
  placeholder?: string;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
} & Record<string, unknown>;

export type FormQuestion = {
  id?: string;
  sectionId?: string;
  questionText: string;
  helpText?: string | null;
  type: QuestionType;
  isRequired: boolean;
  position: number;
  config: QuestionConfig;
};

export type FormSection = {
  id?: string;
  formId?: string;
  title: string;
  description?: string | null;
  position: number;
  questions: FormQuestion[];
};

export type EditableFormDraft = {
  title: string;
  description?: string | null;
  sections: FormSection[];
};

export type FormStatus = "draft" | "published" | "closed";
export type QualityStatus = "not_checked" | "passed" | "needs_review";
export type InsightStatus = "not_ready" | "processing" | "ready" | "failed";

export type FormCard = {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  qualityStatus: QualityStatus;
  insightStatus: InsightStatus;
  isDemo: boolean;
  responseCount: number;
  completionRate: number | null;
  lastResponseAt: string | null;
  publicSlug: string | null;
  updatedAt: string;
};

export type FormDetail = FormCard & {
  currentDraftVersion: number;
  latestPublishedVersion: number | null;
  createdAt: string;
  publishedAt: string | null;
  closedAt: string | null;
  sections: FormSection[];
};

export type PublishResult = {
  formId: string;
  status: "published";
  publicSlug: string;
  publishedVersion: number;
  publishedFormId: string;
  publicUrl: string;
};

export type GeneratedFormDraftResult = {
  generatedDraftId: string;
  schema: EditableFormDraft;
};

export type PublishedFormSchema = {
  formId: string;
  version: number;
  title: string;
  description?: string | null;
  sections: Array<{
    id: string;
    formId?: string;
    title: string;
    description?: string | null;
    position: number;
    questions: Array<{
      id: string;
      sectionId?: string;
      questionText: string;
      helpText?: string | null;
      type: QuestionType;
      isRequired: boolean;
      position: number;
      config: QuestionConfig;
    }>;
  }>;
};

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

export type PublicAnswerInput = {
  questionId: string;
  value?: unknown;
};

export type QualityIssue = {
  id?: string;
  sectionId?: string | null;
  questionId?: string | null;
  severity: "high" | "medium" | "low";
  issueType: string;
  problem: string;
  whyItMatters: string;
  suggestedFix?: {
    questionText?: string;
    helpText?: string | null;
    type?: QuestionType;
    config?: QuestionConfig;
  } | null;
  isSafeAutoFix: boolean;
  status?: string;
};

export type QualityCheckResult = {
  id: string;
  score: number;
  summary: string;
  issues: QualityIssue[];
};

export type KeyFinding = {
  title: string;
  summary: string;
  evidenceCount?: number;
};

export type RecommendedAction = {
  title: string;
  rationale: string;
  priority: "high" | "medium" | "low";
};

export type QuestionMetric = {
  questionId: string;
  questionText: string;
  questionType: string;
  answerCount: number;
};

export type ResponseCluster = {
  id: string;
  formId: string;
  insightSnapshotId: string;
  name: string;
  summary: string;
  sentiment: string;
  responseCount: number;
  representativeQuotes: unknown;
  recommendedAction: string | null;
};

export type InsightSnapshot = {
  id: string;
  formId: string;
  status: "ready" | "processing" | "failed";
  totalResponses: number;
  sentimentBreakdown: Record<string, number>;
  overviewMetrics: Record<string, unknown>;
  questionMetrics: QuestionMetric[];
  keyFindings: KeyFinding[];
  recommendedActions: RecommendedAction[];
  dropoffSummary: Record<string, number>;
  generatedAt: string | null;
  clusters: ResponseCluster[];
} | null;

export type DropoffAnalytics = {
  openedCount: number;
  startedCount: number;
  submittedCount: number;
  completionRate: number | null;
  eventCounts: Record<string, number>;
};

export type AskAiAnswer = {
  answer: string;
  evidence: Array<Record<string, unknown>>;
};

export type ReportType = "executive_summary" | "feedback_report";
export type ReportStatus = "generating" | "ready" | "failed";

export type Report = {
  id: string;
  formId: string;
  insightSnapshotId: string | null;
  reportType: ReportType;
  status: ReportStatus;
  title: string;
  contentMarkdown: string | null;
  createdAt: string;
  updatedAt: string;
  generatedAt: string | null;
};
