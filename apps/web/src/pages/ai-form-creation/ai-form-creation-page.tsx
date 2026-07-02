import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle, Sparkle } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { ErrorState } from "../../components/feedback/error-state.js";
import { PageHeader } from "../../components/layout/page-header.js";
import { Button } from "../../components/ui/button.js";
import { Card } from "../../components/ui/card.js";
import { Input } from "../../components/ui/input.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.js";
import { Textarea } from "../../components/ui/textarea.js";
import { routes } from "../../app/routes.js";
import { useGenerateFormDraft } from "../../features/ai-form-creation/hooks/use-ai-form-creation.js";

const aiFormSchema = z.object({
  prompt: z.string().min(10, "Describe the form in at least 10 characters.").max(4000),
  purpose: z.string().min(2).max(120),
  audience: z.string().min(2).max(120),
  length: z.enum(["short", "standard", "detailed"]),
  tone: z.enum(["friendly", "neutral", "professional"]),
});

type AiFormValues = z.infer<typeof aiFormSchema>;

const defaultValues: AiFormValues = {
  prompt:
    "Create a feedback form for a college AI hackathon. I want to understand participant satisfaction, technical issues, and suggestions for next year.",
  purpose: "Learn what to improve next",
  audience: "Students and event participants",
  length: "standard",
  tone: "friendly",
};

export function AiFormCreationPage() {
  const navigate = useNavigate();
  const generateDraft = useGenerateFormDraft();
  const form = useForm<AiFormValues>({ resolver: zodResolver(aiFormSchema), defaultValues });
  const length = form.watch("length");
  const tone = form.watch("tone");

  function onSubmit(values: AiFormValues) {
    generateDraft.mutate(
      {
        prompt: values.prompt,
        guidedOptions: {
          purpose: values.purpose,
          audience: values.audience,
          length: values.length,
          tone: values.tone,
        },
      },
      {
        onSuccess: (result) => {
          sessionStorage.setItem(`generated-draft:${result.generatedDraftId}`, JSON.stringify(result.schema));
          navigate(routes.aiFormPreview(result.generatedDraftId), { state: { schema: result.schema } });
        },
      },
    );
  }

  return (
    <section className="grid gap-6">
      <PageHeader
        description="Describe what you want to learn, then review and edit the draft before it becomes a live form."
        eyebrow="Guided draft"
        title="Create a form from an idea"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-border-subtle bg-secondary/30 p-5">
            <h2 className="text-lg font-semibold">Tell InsightForm what you need</h2>
            <p className="text-sm leading-6 text-muted-foreground">Include the audience, the decision you need to make, and the answers that would be useful.</p>
          </div>
          <div className="p-5 sm:p-6">
            <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
              <label className="grid gap-2 text-sm font-medium">
                Form brief
                <Textarea aria-label="Form brief" {...form.register("prompt")} rows={7} />
                <FieldError message={form.formState.errors.prompt?.message} />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Goal
                  <Input {...form.register("purpose")} />
                  <FieldError message={form.formState.errors.purpose?.message} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Audience
                  <Input {...form.register("audience")} />
                  <FieldError message={form.formState.errors.audience?.message} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Length
                  <Select
                    value={length}
                    onValueChange={(value) => form.setValue("length", value as AiFormValues["length"], { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectTrigger aria-invalid={Boolean(form.formState.errors.length)}>
                      <SelectValue placeholder="Choose length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.length?.message} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Tone
                  <Select
                    value={tone}
                    onValueChange={(value) => form.setValue("tone", value as AiFormValues["tone"], { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectTrigger aria-invalid={Boolean(form.formState.errors.tone)}>
                      <SelectValue placeholder="Choose tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.tone?.message} />
                </label>
              </div>
              <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-muted-foreground">You will review the full draft before it is added to your forms.</p>
                <Button className="w-full sm:w-fit" isLoading={generateDraft.isPending} type="submit">
                  Generate draft
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
            {generateDraft.isError ? <ErrorState className="mt-5" error={generateDraft.error} title="Could not create the draft" /> : null}
          </div>
        </Card>

        <aside className="grid gap-6 self-start lg:sticky lg:top-24">
          <div className="border-b border-border-subtle pb-6">
            <div className="grid size-11 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <Sparkle className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">What the draft includes</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
              {["Clear sections", "Neutral question wording", "Matching answer types", "Editable options and rating scales", "A review step before publishing"].map((item) => (
                <li className="flex gap-2" key={item}>
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold">Write a stronger brief</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Strong briefs mention the setting, respondent type, and the decision the responses should support.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}
