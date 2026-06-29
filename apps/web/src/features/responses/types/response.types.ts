export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export type ResponseCard = {
  id: string;
  respondentEmail: string | null;
  submittedAt: string;
  completionTimeSeconds: number | null;
  summary: string | null;
  sentiment: Sentiment | null;
  topics: string[];
  followUpNeeded: boolean;
};

export type ResponseAnswer = {
  id: string;
  questionId: string;
  questionText: string;
  questionType: string;
  answer: unknown;
};

export type ResponseAnalysis = {
  id: string;
  summary: string;
  sentiment: Sentiment;
  topics: string[];
  painPoints: string[];
  featureRequests: string[];
  followUpNeeded: boolean;
  followUpReason: string | null;
  modelProvider: string | null;
  modelName: string | null;
  promptVersion: string | null;
};

export type ResponseDetail = {
  id: string;
  formId: string;
  publishedFormId: string;
  respondentEmail: string | null;
  submittedAt: string;
  completionTimeSeconds: number | null;
  metadata: unknown;
  answers: ResponseAnswer[];
  analysis: ResponseAnalysis | null;
};
