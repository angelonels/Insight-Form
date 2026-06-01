import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { AiChatGateway } from "../../ai/langchain-model-factory.js";
import type { FormDetail } from "../../forms/form.entity.js";
import { qualityCheckOutputSchema, type qualityIssueOutputSchema } from "../ai-form-authoring.schemas.js";
import { buildFormQualityCheckPrompt } from "../prompts/form-quality-check.prompt.js";
import type { z } from "zod";

type QualityCheckOutput = z.infer<typeof qualityCheckOutputSchema>;
type QualityIssueOutput = z.infer<typeof qualityIssueOutputSchema>;

const QualityCheckAnnotation = Annotation.Root({
  form: Annotation<FormDetail>(),
  issues: Annotation<QualityIssueOutput[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  output: Annotation<QualityCheckOutput | undefined>(),
});

export async function runFormQualityCheckGraph(input: { form: FormDetail; ai: AiChatGateway }) {
  const graph = new StateGraph(QualityCheckAnnotation)
    .addNode("load_form_context", async (state) => ({ form: state.form }))
    .addNode("analyze_question_quality", async (state) => {
      const output = await input.ai.generateStructuredOutput({
        system:
          "You run an InsightForm quality check. Be specific, grounded in the provided form, and conservative with auto-fixes.",
        prompt: buildFormQualityCheckPrompt({ formContext: state.form }),
        schema: qualityCheckOutputSchema,
        modelProfile: "large",
      });
      return { issues: output.issues, output };
    })
    .addNode("analyze_form_structure", async (state) => ({ issues: state.issues }))
    .addNode("detect_bias", async (state) => ({ issues: state.issues }))
    .addNode("merge_issues", async (state) => ({ issues: state.issues }))
    .addNode("score_form_quality", async (state) => ({ output: state.output }))
    .addEdge(START, "load_form_context")
    .addEdge("load_form_context", "analyze_question_quality")
    .addEdge("analyze_question_quality", "analyze_form_structure")
    .addEdge("analyze_form_structure", "detect_bias")
    .addEdge("detect_bias", "merge_issues")
    .addEdge("merge_issues", "score_form_quality")
    .addEdge("score_form_quality", END)
    .compile();

  const result = await graph.invoke({ form: input.form });
  return qualityCheckOutputSchema.parse(result.output);
}
