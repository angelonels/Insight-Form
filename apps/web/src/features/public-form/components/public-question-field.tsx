import { Checkbox } from "../../../components/ui/checkbox.js";
import { Input } from "../../../components/ui/input.js";
import { RadioGroup, RadioOption } from "../../../components/ui/radio-group.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select.js";
import { Textarea } from "../../../components/ui/textarea.js";
import type { PublicQuestionProps } from "../types/public-form.types.js";

export function PublicQuestionField({ error, onChange, onFocus, question, value }: PublicQuestionProps) {
  const fieldId = `question-${question.id}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  const options = question.config.options ?? [];

  return (
    <fieldset className="min-w-0 rounded-xl border border-border-subtle bg-raised p-4 transition-colors duration-150 focus-within:border-primary/45 focus-within:shadow-subtle sm:p-5">
      <legend className="sr-only">{question.questionText}</legend>
      <label className="text-base font-medium leading-6" htmlFor={fieldId}>
        {question.questionText}
        {question.isRequired ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      {question.helpText ? <p className="mt-1 text-sm leading-6 text-muted-foreground" id={helpId}>{question.helpText}</p> : null}
      <div className="mt-4">
        {question.type === "long_answer" ? (
          <Textarea
            aria-describedby={[question.helpText ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}
            aria-invalid={Boolean(error)}
            id={fieldId}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            placeholder={question.config.placeholder}
            value={typeof value === "string" ? value : ""}
          />
        ) : question.type === "short_answer" || question.type === "email" || question.type === "number" ? (
          <Input
            aria-describedby={[question.helpText ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}
            aria-invalid={Boolean(error)}
            id={fieldId}
            onChange={(event) => onChange(question.type === "number" ? readNumber(event.target.value) : event.target.value)}
            onFocus={onFocus}
            placeholder={question.config.placeholder}
            type={question.type === "email" ? "email" : question.type === "number" ? "number" : "text"}
            value={typeof value === "string" || typeof value === "number" ? value : ""}
          />
        ) : question.type === "multiple_choice" ? (
          <RadioGroup onValueChange={onChange} value={typeof value === "string" ? value : undefined}>
            {options.map((option) => (
              <RadioOption key={option.id} onFocus={onFocus} value={option.id}>
                {option.label}
              </RadioOption>
            ))}
          </RadioGroup>
        ) : question.type === "checkbox" ? (
          <div className="grid gap-2">
            {options.map((option) => {
              const values = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
              const checked = values.includes(option.id);
              return (
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border-subtle bg-background px-3 text-sm transition-colors hover:border-primary/30 hover:bg-secondary/30" key={option.id}>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onChange(checked ? values.filter((item) => item !== option.id) : [...values, option.id])}
                    onFocus={onFocus}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        ) : question.type === "dropdown" ? (
          <Select onValueChange={onChange} value={typeof value === "string" ? value : undefined}>
            <SelectTrigger id={fieldId} onFocus={onFocus}>
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <div className="grid gap-4">
            <input
              aria-label={question.questionText}
              className="h-6 w-full cursor-pointer accent-[hsl(var(--primary))]"
              max={question.config.max ?? 5}
              min={question.config.min ?? 1}
              onChange={(event) => onChange(readNumber(event.target.value))}
              onFocus={onFocus}
              type="range"
              value={typeof value === "number" ? value : question.config.min ?? 1}
            />
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-muted-foreground">
              <span>{question.config.minLabel ?? question.config.min ?? 1}</span>
              <span className="rounded-md bg-primary px-2.5 py-1 font-mono font-medium text-primary-foreground">{String(value || question.config.min || 1)}</span>
              <span className="text-right">{question.config.maxLabel ?? question.config.max ?? 5}</span>
            </div>
          </div>
        )}
      </div>
      {error ? <p className="mt-3 text-sm text-destructive" id={errorId}>{error}</p> : null}
    </fieldset>
  );
}

function readNumber(value: string) {
  if (value.trim() === "") {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
}
