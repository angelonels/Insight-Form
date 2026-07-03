import { useState } from "react";

import type { EditableFormDraft } from "../../forms/types/form.types.js";
import type { PublicAnswerMap } from "../types/public-form.types.js";
import { RespondentForm } from "./respondent-form.js";

export function FormPreview({ draft }: { draft: EditableFormDraft }) {
  const [answers, setAnswers] = useState<PublicAnswerMap>({});
  const [respondentEmail, setRespondentEmail] = useState("");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <RespondentForm
        answers={answers}
        errors={{}}
        isPreview
        onAnswerChange={(question, value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
        onRespondentEmailChange={setRespondentEmail}
        onSubmit={() => undefined}
        respondentEmail={respondentEmail}
        schema={draft}
      />
    </div>
  );
}
