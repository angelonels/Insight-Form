import { AiModelConfig } from "../ai/ai-model-config.js";
import { PromptVersions } from "../ai/ai-prompt-registry.js";
import type { QuestionType, PublishedFormSchema } from "../../shared/types/form-schema.js";
import { sha256 } from "../../shared/utils/hash.js";
import { createId } from "../../shared/utils/ids.js";

type Option = {
  id: string;
  label: string;
};

type DemoQuestionSeed = {
  key: string;
  id: string;
  sectionId: string;
  questionText: string;
  helpText: string | null;
  type: QuestionType;
  isRequired: boolean;
  position: number;
  config: Record<string, unknown>;
};

type DemoResponseProfile = {
  clusterKey: "mentor_support" | "operations" | "judging" | "sponsor_value";
  sentiment: "positive" | "mixed" | "neutral" | "negative";
  track: string;
  teamSize: string;
  highlights: string[];
  overallRating: number;
  mentorRating: number;
  hoursSpent: number;
  bestPart: string;
  improvement: string;
  organizerNote: string;
  topics: string[];
  painPoints: string[];
  featureRequests: string[];
};

const DEMO_TITLE = "Hackathon Feedback Demo";
const DEMO_DESCRIPTION =
  "A realistic post-event feedback form showing published forms, submissions, analytics, insights, reports, quality checks, and Ask AI evidence.";
const DEMO_BASE_DATE = Date.UTC(2026, 2, 15, 9, 0, 0);
const DEMO_AI_MODEL = AiModelConfig.chatModelId("large");

const TRACK_OPTIONS: Option[] = [
  { id: "ai-ml", label: "AI / Machine Learning" },
  { id: "fintech", label: "Fintech" },
  { id: "climate", label: "Climate Tech" },
  { id: "health", label: "Health Tech" },
  { id: "open-innovation", label: "Open Innovation" },
];

const TEAM_SIZE_OPTIONS: Option[] = [
  { id: "solo", label: "Solo" },
  { id: "two", label: "2 people" },
  { id: "three-four", label: "3-4 people" },
  { id: "five-plus", label: "5+ people" },
];

const HIGHLIGHT_OPTIONS: Option[] = [
  { id: "mentor-help", label: "Mentor help" },
  { id: "workshops", label: "Workshops" },
  { id: "networking", label: "Networking" },
  { id: "sponsor-booths", label: "Sponsor booths" },
  { id: "judging-feedback", label: "Judging feedback" },
  { id: "venue-food", label: "Venue and food" },
];

const DEMO_SECTIONS = [
  {
    key: "participant",
    title: "Participant Profile",
    description: "A few basics that help segment the event feedback.",
    position: 1,
  },
  {
    key: "experience",
    title: "Event Experience",
    description: "Ratings and highlights from the hackathon weekend.",
    position: 2,
  },
  {
    key: "feedback",
    title: "Open Feedback",
    description: "Specific comments for organizers and sponsors.",
    position: 3,
  },
] as const;

const DEMO_QUESTION_DEFS = [
  {
    key: "email",
    sectionKey: "participant",
    questionText: "What email should we use if the organizers follow up?",
    helpText: "Used only for event follow-up in this demo.",
    type: "email",
    isRequired: true,
    position: 1,
    config: { placeholder: "you@example.com" },
  },
  {
    key: "track",
    sectionKey: "participant",
    questionText: "Which challenge track did your team work on?",
    helpText: null,
    type: "multiple_choice",
    isRequired: true,
    position: 2,
    config: { options: TRACK_OPTIONS },
  },
  {
    key: "team_size",
    sectionKey: "participant",
    questionText: "How large was your team?",
    helpText: null,
    type: "dropdown",
    isRequired: true,
    position: 3,
    config: { options: TEAM_SIZE_OPTIONS },
  },
  {
    key: "overall_rating",
    sectionKey: "experience",
    questionText: "Overall, how would you rate the hackathon experience?",
    helpText: null,
    type: "rating_scale",
    isRequired: true,
    position: 1,
    config: { min: 1, max: 5, minLabel: "Poor", maxLabel: "Excellent" },
  },
  {
    key: "highlights",
    sectionKey: "experience",
    questionText: "Which parts of the event were most useful?",
    helpText: "Select all that apply.",
    type: "checkbox",
    isRequired: true,
    position: 2,
    config: { options: HIGHLIGHT_OPTIONS },
  },
  {
    key: "mentor_rating",
    sectionKey: "experience",
    questionText: "How helpful were the mentors and office hours?",
    helpText: null,
    type: "rating_scale",
    isRequired: true,
    position: 3,
    config: { min: 1, max: 5, minLabel: "Not helpful", maxLabel: "Very helpful" },
  },
  {
    key: "hours_spent",
    sectionKey: "experience",
    questionText: "About how many hours did your team spend building?",
    helpText: null,
    type: "number",
    isRequired: false,
    position: 4,
    config: { min: 1, max: 48 },
  },
  {
    key: "best_part",
    sectionKey: "feedback",
    questionText: "What was the best part of the hackathon?",
    helpText: null,
    type: "long_answer",
    isRequired: true,
    position: 1,
    config: { placeholder: "Share a moment, resource, or interaction that stood out." },
  },
  {
    key: "improvement",
    sectionKey: "feedback",
    questionText: "What should we improve for the next hackathon?",
    helpText: null,
    type: "long_answer",
    isRequired: true,
    position: 2,
    config: { placeholder: "Mention logistics, judging, sponsor sessions, or anything else." },
  },
  {
    key: "organizer_note",
    sectionKey: "feedback",
    questionText: "Anything else you want the organizing team to know?",
    helpText: null,
    type: "long_answer",
    isRequired: false,
    position: 3,
    config: { placeholder: "Optional final note." },
  },
] satisfies Array<{
  key: string;
  sectionKey: (typeof DEMO_SECTIONS)[number]["key"];
  questionText: string;
  helpText: string | null;
  type: QuestionType;
  isRequired: boolean;
  position: number;
  config: Record<string, unknown>;
}>;

const RESPONSE_PROFILES: DemoResponseProfile[] = [
  {
    clusterKey: "mentor_support",
    sentiment: "positive",
    track: "ai-ml",
    teamSize: "three-four",
    highlights: ["mentor-help", "workshops", "judging-feedback"],
    overallRating: 5,
    mentorRating: 5,
    hoursSpent: 34,
    bestPart: "The mentor office hours helped us turn a rough AI idea into a working demo before judging.",
    improvement: "Add a few more late-night mentor slots for teams that hit integration issues after workshops end.",
    organizerNote: "The final showcase felt energetic and the judging feedback was specific enough to act on.",
    topics: ["mentor support", "AI track", "judging feedback"],
    painPoints: [],
    featureRequests: ["More late-night mentor office hours"],
  },
  {
    clusterKey: "operations",
    sentiment: "mixed",
    track: "fintech",
    teamSize: "three-four",
    highlights: ["networking", "sponsor-booths"],
    overallRating: 4,
    mentorRating: 4,
    hoursSpent: 29,
    bestPart: "Networking with sponsor engineers helped us validate the fraud workflow quickly.",
    improvement: "Check-in lines were long and the Wi-Fi dropped during our final API demo rehearsal.",
    organizerNote: "The event was valuable, but logistics need more buffers around registration and internet capacity.",
    topics: ["registration", "Wi-Fi", "sponsor networking"],
    painPoints: ["Long check-in lines", "Unstable Wi-Fi during demo prep"],
    featureRequests: ["Separate preregistered check-in lane"],
  },
  {
    clusterKey: "judging",
    sentiment: "mixed",
    track: "climate",
    teamSize: "two",
    highlights: ["workshops", "judging-feedback"],
    overallRating: 4,
    mentorRating: 4,
    hoursSpent: 31,
    bestPart: "The climate data workshop gave us sample datasets that made our prototype possible.",
    improvement: "Judging criteria were published late, so we spent time optimizing parts that mattered less.",
    organizerNote: "Please share the rubric before hacking starts and include examples of strong submissions.",
    topics: ["judging rubric", "workshops", "climate data"],
    painPoints: ["Judging criteria were unclear until late"],
    featureRequests: ["Publish rubric before kickoff"],
  },
  {
    clusterKey: "sponsor_value",
    sentiment: "positive",
    track: "health",
    teamSize: "five-plus",
    highlights: ["sponsor-booths", "networking", "mentor-help"],
    overallRating: 5,
    mentorRating: 5,
    hoursSpent: 38,
    bestPart: "Sponsor booth walkthroughs helped us understand compliance constraints for our health workflow.",
    improvement: "The sponsor lightning talks would be easier to use if recordings were available afterward.",
    organizerNote: "The partner companies were approachable and gave practical feedback on the pitch.",
    topics: ["sponsor sessions", "health tech", "networking"],
    painPoints: [],
    featureRequests: ["Share sponsor talk recordings"],
  },
  {
    clusterKey: "operations",
    sentiment: "negative",
    track: "open-innovation",
    teamSize: "solo",
    highlights: ["venue-food", "networking"],
    overallRating: 2,
    mentorRating: 3,
    hoursSpent: 18,
    bestPart: "Meeting other solo builders was useful and kept me motivated through the weekend.",
    improvement: "The quiet working rooms filled up early, outlets were scarce, and schedule changes were hard to track.",
    organizerNote: "Solo participants need clearer team-matching support and more reliable schedule announcements.",
    topics: ["workspace capacity", "schedule communication", "solo builders"],
    painPoints: ["Quiet rooms filled up", "Power outlets were scarce", "Schedule changes were hard to track"],
    featureRequests: ["Live schedule board for room and timing changes"],
  },
  {
    clusterKey: "mentor_support",
    sentiment: "positive",
    track: "ai-ml",
    teamSize: "three-four",
    highlights: ["mentor-help", "workshops"],
    overallRating: 5,
    mentorRating: 5,
    hoursSpent: 36,
    bestPart: "The technical mentors gave direct architecture advice without taking over the build.",
    improvement: "More examples for model evaluation would help teams avoid shallow demos.",
    organizerNote: "This felt like a serious builder event rather than just a weekend pitch contest.",
    topics: ["mentor support", "model evaluation", "workshops"],
    painPoints: [],
    featureRequests: ["Add model evaluation examples to the AI workshop"],
  },
  {
    clusterKey: "judging",
    sentiment: "neutral",
    track: "fintech",
    teamSize: "two",
    highlights: ["judging-feedback", "networking"],
    overallRating: 3,
    mentorRating: 3,
    hoursSpent: 24,
    bestPart: "The judges asked useful customer-discovery questions that exposed gaps in our onboarding flow.",
    improvement: "The judging room handoff was rushed and teams were not sure how much setup time they had.",
    organizerNote: "A fixed demo setup checklist would make judging less stressful.",
    topics: ["judging flow", "demo setup", "customer discovery"],
    painPoints: ["Rushed judging handoff"],
    featureRequests: ["Provide a demo setup checklist"],
  },
  {
    clusterKey: "sponsor_value",
    sentiment: "positive",
    track: "climate",
    teamSize: "three-four",
    highlights: ["sponsor-booths", "workshops", "venue-food"],
    overallRating: 4,
    mentorRating: 4,
    hoursSpent: 30,
    bestPart: "The sponsor APIs were documented well enough for us to build an emissions dashboard quickly.",
    improvement: "Some sponsor booth hours overlapped with workshops, so we missed a few technical sessions.",
    organizerNote: "The venue and meals made it easy to stay focused for long blocks.",
    topics: ["sponsor APIs", "workshop scheduling", "venue"],
    painPoints: ["Sponsor booth hours overlapped with workshops"],
    featureRequests: ["Avoid overlapping sponsor hours with core workshops"],
  },
];

function minutesAfter(minutes: number) {
  return new Date(DEMO_BASE_DATE + minutes * 60_000);
}

function optionLabel(options: Option[], id: string) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function stableDemoSlug(userId: string) {
  return `demo-hackathon-${userId.replace(/-/g, "")}`;
}

function buildResponseProfiles() {
  return Array.from({ length: 100 }, (_, index) => {
    const profile = RESPONSE_PROFILES[index % RESPONSE_PROFILES.length]!;
    const sequence = index + 1;
    return {
      ...profile,
      sequence,
      respondentEmail: `participant-${String(sequence).padStart(3, "0")}@demo.insightform.app`,
      submittedAt: minutesAfter(34 + index * 11),
      completionTimeSeconds: 92 + (index % 14) * 13,
      respondentFingerprint: `demo-respondent-${String(sequence).padStart(3, "0")}`,
      ipHash: sha256(`demo-ip-${sequence}`),
      userAgent: "InsightForm Demo Seeder",
    };
  });
}

function buildQuestionAnswer(question: DemoQuestionSeed, response: ReturnType<typeof buildResponseProfiles>[number]) {
  if (question.key === "email") {
    return { value: response.respondentEmail };
  }
  if (question.key === "track") {
    return {
      selectedOptionId: response.track,
      selectedOptionLabel: optionLabel(TRACK_OPTIONS, response.track),
    };
  }
  if (question.key === "team_size") {
    return {
      selectedOptionId: response.teamSize,
      selectedOptionLabel: optionLabel(TEAM_SIZE_OPTIONS, response.teamSize),
    };
  }
  if (question.key === "overall_rating") {
    return { value: response.overallRating };
  }
  if (question.key === "highlights") {
    return {
      selectedOptionIds: response.highlights,
      selectedOptionLabels: response.highlights.map((id) => optionLabel(HIGHLIGHT_OPTIONS, id)),
    };
  }
  if (question.key === "mentor_rating") {
    return { value: response.mentorRating };
  }
  if (question.key === "hours_spent") {
    return { value: response.hoursSpent };
  }
  if (question.key === "best_part") {
    return { value: response.bestPart };
  }
  if (question.key === "improvement") {
    return { value: response.improvement };
  }
  return { value: response.organizerNote };
}

function buildSummary(response: ReturnType<typeof buildResponseProfiles>[number]) {
  return `Participant ${response.sequence} rated the event ${response.overallRating}/5. They highlighted ${response.topics.join(
    ", ",
  )}. Best part: ${response.bestPart} Improvement: ${response.improvement}`;
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>(
    (counts, value) => ({
      ...counts,
      [value]: (counts[value] ?? 0) + 1,
    }),
    {} as Record<T, number>,
  );
}

function average(values: number[]) {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export function buildDemoEmbedding(content: string) {
  return Array.from({ length: AiModelConfig.embeddingDimensions }, (_, index) => {
    const digest = sha256(`${content}:${index}`);
    const int = Number.parseInt(digest.slice(0, 8), 16);
    return Number(((int / 0xffffffff) * 2 - 1).toFixed(6));
  });
}

export function buildDemoHackathonSeed(userId: string) {
  const now = minutesAfter(0);
  const formId = createId();
  const publishedFormId = createId();
  const sectionIdsByKey = Object.fromEntries(DEMO_SECTIONS.map((section) => [section.key, createId()]));
  const sections = DEMO_SECTIONS.map((section) => ({
    id: sectionIdsByKey[section.key]!,
    formId,
    title: section.title,
    description: section.description,
    position: section.position,
    createdAt: now,
    updatedAt: now,
  }));
  const questions: DemoQuestionSeed[] = DEMO_QUESTION_DEFS.map((question) => ({
    key: question.key,
    id: createId(),
    sectionId: sectionIdsByKey[question.sectionKey]!,
    questionText: question.questionText,
    helpText: question.helpText,
    type: question.type,
    isRequired: question.isRequired,
    position: question.position,
    config: question.config,
  }));
  const responses = buildResponseProfiles();
  const responseIds = responses.map(() => createId());
  const answerRows = responses.flatMap((response, responseIndex) =>
    questions.map((question) => ({
      id: createId(),
      responseId: responseIds[responseIndex]!,
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.type,
      answer: buildQuestionAnswer(question, response),
      createdAt: response.submittedAt,
    })),
  );
  const responseSummaries = responses.map((response, index) => ({
    response,
    responseId: responseIds[index]!,
    summary: buildSummary(response),
  }));
  const sentimentBreakdown = countBy(responses.map((response) => response.sentiment));
  const trackBreakdown = countBy(responses.map((response) => response.track));
  const clusterGroups = responseSummaries.reduce<Record<DemoResponseProfile["clusterKey"], typeof responseSummaries>>(
    (groups, item) => {
      groups[item.response.clusterKey] = [...(groups[item.response.clusterKey] ?? []), item];
      return groups;
    },
    {
      mentor_support: [],
      operations: [],
      judging: [],
      sponsor_value: [],
    },
  );
  const insightSnapshotId = createId();
  const clusterRows = [
    {
      key: "mentor_support" as const,
      id: createId(),
      name: "Mentor Support Drives Momentum",
      summary: "Teams consistently valued hands-on mentor office hours, especially for AI architecture and demo polish.",
      sentiment: "positive",
      recommendedAction: "Add more late-night mentor office hours and publish a mentor schedule by track.",
    },
    {
      key: "operations" as const,
      id: createId(),
      name: "Logistics And Infrastructure Friction",
      summary: "Registration queues, Wi-Fi reliability, power access, and room capacity created avoidable friction.",
      sentiment: "mixed",
      recommendedAction: "Increase network capacity, add a preregistered check-in lane, and reserve quiet work rooms.",
    },
    {
      key: "judging" as const,
      id: createId(),
      name: "Rubric Clarity Before Build Time",
      summary: "Teams wanted judging criteria and demo setup expectations earlier in the weekend.",
      sentiment: "mixed",
      recommendedAction: "Publish the rubric at kickoff and give each team a demo setup checklist.",
    },
    {
      key: "sponsor_value" as const,
      id: createId(),
      name: "Sponsors Added Practical Context",
      summary: "Sponsor APIs, booths, and partner engineers helped teams validate real-world constraints.",
      sentiment: "positive",
      recommendedAction: "Record sponsor lightning talks and prevent overlap with core workshops.",
    },
  ];

  const publishedSchema: PublishedFormSchema = {
    formId,
    version: 1,
    title: DEMO_TITLE,
    description: DEMO_DESCRIPTION,
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
          type: question.type,
          isRequired: question.isRequired,
          position: question.position,
          config: question.config,
        })),
    })),
  };

  return {
    form: {
      id: formId,
      ownerUserId: userId,
      title: DEMO_TITLE,
      description: DEMO_DESCRIPTION,
      status: "published",
      qualityStatus: "needs_review",
      insightStatus: "ready",
      isDemo: true,
      currentDraftVersion: 1,
      latestPublishedVersion: 1,
      publicSlug: stableDemoSlug(userId),
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    },
    sections,
    questions: questions.map((question) => ({
      id: question.id,
      sectionId: question.sectionId,
      questionText: question.questionText,
      helpText: question.helpText,
      type: question.type,
      isRequired: question.isRequired,
      position: question.position,
      config: question.config,
      createdAt: now,
      updatedAt: now,
    })),
    publishedForm: {
      id: publishedFormId,
      formId,
      version: 1,
      title: DEMO_TITLE,
      description: DEMO_DESCRIPTION,
      schema: publishedSchema,
      publishedAt: now,
    },
    responses: responses.map((response, index) => ({
      id: responseIds[index]!,
      formId,
      publishedFormId,
      respondentEmail: response.respondentEmail,
      submittedAt: response.submittedAt,
      completionTimeSeconds: response.completionTimeSeconds,
      respondentFingerprint: response.respondentFingerprint,
      userAgent: response.userAgent,
      ipHash: response.ipHash,
      metadata: {
        demo: true,
        source: "hackathon_fixture",
        sequence: response.sequence,
        clusterKey: response.clusterKey,
      },
    })),
    answers: answerRows,
    analyses: responseSummaries.map(({ response, responseId, summary }) => ({
      id: createId(),
      responseId,
      formId,
      summary,
      sentiment: response.sentiment,
      topics: response.topics,
      painPoints: response.painPoints,
      featureRequests: response.featureRequests,
      followUpNeeded: response.sentiment === "negative" || response.painPoints.length > 1,
      followUpReason:
        response.sentiment === "negative" || response.painPoints.length > 1
          ? `Follow up on ${response.painPoints.join(", ") || "low satisfaction"}.`
          : null,
      modelProvider: AiModelConfig.provider,
      modelName: AiModelConfig.chatModelId("small"),
      promptVersion: PromptVersions.SummarizeResponse,
      createdAt: response.submittedAt,
      updatedAt: response.submittedAt,
    })),
    embeddings: responseSummaries.map(({ responseId, summary }) => ({
      id: createId(),
      formId,
      responseId,
      answerId: null,
      contentKind: "response_summary",
      content: summary,
      contentHash: sha256(summary),
      embedding: buildDemoEmbedding(summary),
      modelProvider: AiModelConfig.provider,
      modelName: AiModelConfig.embeddingModelId,
      embeddingDimensions: AiModelConfig.embeddingDimensions,
      createdAt: now,
    })),
    events: [
      ...Array.from({ length: 128 }, (_, index) => ({
        formId,
        publishedFormId,
        eventType: "form_opened",
        sectionId: null,
        questionId: null,
        metadata: { demo: true, sequence: index + 1 },
        occurredAt: minutesAfter(index * 3),
      })),
      ...Array.from({ length: 116 }, (_, index) => ({
        formId,
        publishedFormId,
        eventType: "form_started",
        sectionId: sections[0]!.id,
        questionId: questions[0]!.id,
        metadata: { demo: true, sequence: index + 1 },
        occurredAt: minutesAfter(5 + index * 3),
      })),
      ...sections.flatMap((section, sectionIndex) =>
        Array.from({ length: [116, 108, 101][sectionIndex] ?? 100 }, (_, index) => ({
          formId,
          publishedFormId,
          eventType: "section_reached",
          sectionId: section.id,
          questionId: null,
          metadata: { demo: true, sectionPosition: section.position, sequence: index + 1 },
          occurredAt: minutesAfter(8 + sectionIndex * 7 + index * 3),
        })),
      ),
      ...questions.flatMap((question, questionIndex) =>
        Array.from({ length: questionIndex % 3 === 0 ? 32 : 24 }, (_, index) => ({
          formId,
          publishedFormId,
          eventType: "question_focused",
          sectionId: question.sectionId,
          questionId: question.id,
          metadata: { demo: true, questionKey: question.key, sequence: index + 1 },
          occurredAt: minutesAfter(11 + questionIndex * 5 + index * 4),
        })),
      ),
      ...responseIds.map((responseId, index) => ({
        formId,
        publishedFormId,
        responseId,
        eventType: "form_submitted",
        sectionId: sections.at(-1)!.id,
        questionId: null,
        metadata: { demo: true, answerCount: questions.length, sequence: index + 1 },
        occurredAt: responses[index]!.submittedAt,
      })),
    ],
    qualityCheck: {
      id: createId(),
      formId,
      status: "completed",
      score: 84,
      summary: "Strong demo form with useful segmentation, ratings, and open-text prompts. A few wording and logistics questions can be tightened.",
      modelProvider: AiModelConfig.provider,
      modelName: DEMO_AI_MODEL,
      promptVersion: PromptVersions.FormQualityCheck,
      createdAt: now,
      completedAt: minutesAfter(2),
    },
    qualityIssues: [
      {
        id: createId(),
        formId,
        sectionId: sections[1]!.id,
        questionId: questions.find((question) => question.key === "overall_rating")!.id,
        severity: "medium",
        issueType: "ambiguous_rating_context",
        problem: "The overall rating asks about the full hackathon but does not define whether respondents should weigh logistics, mentoring, or judging equally.",
        whyItMatters: "Recruiters and organizers reading results may overinterpret one broad rating without understanding what drove it.",
        suggestedFix: {
          action: "rewrite_question",
          questionText: "Thinking about logistics, mentoring, judging, and venue, how would you rate the overall hackathon experience?",
        },
        status: "open",
        isSafeAutoFix: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: createId(),
        formId,
        sectionId: sections[2]!.id,
        questionId: questions.find((question) => question.key === "improvement")!.id,
        severity: "low",
        issueType: "prompt_guidance",
        problem: "The improvement question is broad and may produce scattered comments.",
        whyItMatters: "Adding examples helps respondents give comments that can be clustered into operational actions.",
        suggestedFix: {
          action: "add_help_text",
          helpText: "Consider logistics, judging, mentoring, sponsor sessions, venue, food, or schedule pacing.",
        },
        status: "open",
        isSafeAutoFix: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: createId(),
        formId,
        sectionId: sections[0]!.id,
        questionId: questions.find((question) => question.key === "track")!.id,
        severity: "low",
        issueType: "option_coverage",
        problem: "The track list may not capture cross-track projects.",
        whyItMatters: "Teams building across multiple categories may choose a poor fit, reducing segmentation quality.",
        suggestedFix: {
          action: "add_option",
          option: { id: "multi-track", label: "Multi-track / cross-functional" },
        },
        status: "open",
        isSafeAutoFix: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    insightSnapshot: {
      id: insightSnapshotId,
      formId,
      status: "ready",
      totalResponses: responses.length,
      sentimentBreakdown,
      overviewMetrics: {
        totalResponses: responses.length,
        completionRate: 0.78,
        averageOverallRating: average(responses.map((response) => response.overallRating)),
        averageMentorRating: average(responses.map((response) => response.mentorRating)),
        averageBuildHours: average(responses.map((response) => response.hoursSpent)),
      },
      questionMetrics: [
        { questionKey: "overall_rating", average: average(responses.map((response) => response.overallRating)), responses: responses.length },
        { questionKey: "mentor_rating", average: average(responses.map((response) => response.mentorRating)), responses: responses.length },
        { questionKey: "track", breakdown: trackBreakdown, responses: responses.length },
      ],
      keyFindings: [
        "Mentor office hours were the strongest satisfaction driver, especially for AI and health-tech teams.",
        "Operational friction centered on check-in queues, Wi-Fi reliability, room capacity, and schedule changes.",
        "Teams want judging rubrics and demo setup expectations earlier in the weekend.",
        "Sponsor access created practical value, but booth hours should avoid workshop conflicts.",
      ],
      recommendedActions: [
        "Add late-night mentor coverage and publish the mentor schedule by challenge track.",
        "Increase Wi-Fi capacity, reserve quiet rooms, and create a preregistered check-in lane.",
        "Publish the judging rubric at kickoff and give each team a demo setup checklist.",
        "Record sponsor lightning talks and separate booth blocks from core workshops.",
      ],
      dropoffSummary: {
        formOpened: 128,
        formStarted: 116,
        reachedFinalSection: 101,
        submitted: 100,
        largestDropoff: "Opened to started",
      },
      modelProvider: AiModelConfig.provider,
      modelName: DEMO_AI_MODEL,
      promptVersion: PromptVersions.GenerateKeyFindings,
      generatedAt: minutesAfter(4),
      createdAt: now,
      updatedAt: now,
    },
    clusters: clusterRows.map((cluster) => ({
      id: cluster.id,
      formId,
      insightSnapshotId,
      name: cluster.name,
      summary: cluster.summary,
      sentiment: cluster.sentiment,
      responseCount: clusterGroups[cluster.key].length,
      representativeQuotes: clusterGroups[cluster.key].slice(0, 3).map((item) => item.response.improvement),
      recommendedAction: cluster.recommendedAction,
      createdAt: now,
    })),
    clusterMembers: clusterRows.flatMap((cluster) =>
      clusterGroups[cluster.key].map((item, index) => ({
        clusterId: cluster.id,
        responseId: item.responseId,
        similarityScore: (0.94 - index * 0.004).toFixed(3),
      })),
    ),
    reports: [
      {
        id: createId(),
        formId,
        insightSnapshotId,
        reportType: "executive_summary",
        status: "ready",
        title: "Executive Summary: Hackathon Feedback Demo",
        contentMarkdown: [
          "# Executive Summary: Hackathon Feedback Demo",
          "",
          "## Response Overview",
          "The demo form contains 100 seeded hackathon responses across five challenge tracks. Average overall rating is strong, with mentor support and sponsor access driving the most positive comments.",
          "",
          "## Key Findings",
          "- Mentor office hours are the clearest satisfaction driver.",
          "- Registration, Wi-Fi, room capacity, and schedule changes are the most repeated operational issues.",
          "- Teams want the judging rubric and demo setup checklist before build time.",
          "",
          "## Recommended Actions",
          "- Add late-night mentor coverage and publish track-specific office hours.",
          "- Increase Wi-Fi capacity and separate preregistered check-in.",
          "- Publish the judging rubric at kickoff and record sponsor talks.",
          "",
          "## Evidence Notes",
          "Representative comments mention mentor architecture help, unstable Wi-Fi, rushed judging handoffs, and sponsor API value.",
        ].join("\n"),
        modelProvider: AiModelConfig.provider,
        modelName: DEMO_AI_MODEL,
        promptVersion: PromptVersions.GenerateExecutiveSummaryReport,
        createdAt: now,
        updatedAt: now,
        generatedAt: minutesAfter(5),
      },
      {
        id: createId(),
        formId,
        insightSnapshotId,
        reportType: "feedback_report",
        status: "ready",
        title: "Feedback Report: Hackathon Feedback Demo",
        contentMarkdown: [
          "# Feedback Report: Hackathon Feedback Demo",
          "",
          "## Response Overview",
          "The published demo form has 100 completed responses, 100 analyses, analytics events for drop-off, and seeded evidence chunks for Ask AI.",
          "",
          "## Sentiment Summary",
          "Most responses are positive or mixed. Negative feedback is concentrated in logistics, workspace capacity, and schedule communication.",
          "",
          "## Themes and Evidence",
          "- Mentor support: teams valued direct architecture and pitch guidance.",
          "- Operations: long check-in lines, unstable Wi-Fi, and quiet-room capacity came up repeatedly.",
          "- Judging: teams asked for rubrics and setup expectations earlier.",
          "- Sponsors: sponsor APIs and partner engineers helped teams make practical tradeoffs.",
          "",
          "## Recommended Actions",
          "Prioritize mentor coverage, infrastructure capacity, rubric clarity, and sponsor-session scheduling before the next event.",
        ].join("\n"),
        modelProvider: AiModelConfig.provider,
        modelName: DEMO_AI_MODEL,
        promptVersion: PromptVersions.GenerateFeedbackReport,
        createdAt: minutesAfter(1),
        updatedAt: minutesAfter(1),
        generatedAt: minutesAfter(6),
      },
    ],
  };
}
