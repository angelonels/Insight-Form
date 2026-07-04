export function formatAnswerValue(answer: unknown): string {
  if (answer == null) {
    return "No answer";
  }

  if (typeof answer === "string" || typeof answer === "number" || typeof answer === "boolean") {
    return String(answer);
  }

  if (Array.isArray(answer)) {
    return answer.map((item) => formatAnswerValue(item)).join(", ");
  }

  if (typeof answer === "object") {
    const record = answer as Record<string, unknown>;
    if (Array.isArray(record.selectedOptionLabels)) {
      return record.selectedOptionLabels.map((item) => formatAnswerValue(item)).join(", ");
    }
    if (typeof record.selectedOptionLabel === "string") {
      return record.selectedOptionLabel;
    }
    if (typeof record.label === "string") {
      return record.label;
    }
    if ("value" in record) {
      return formatAnswerValue(record.value);
    }
    if (Array.isArray(record.selectedOptionIds)) {
      return record.selectedOptionIds.map((item) => formatAnswerValue(item)).join(", ");
    }
    if (typeof record.selectedOptionId === "string") {
      return record.selectedOptionId;
    }

    const values = Object.values(record)
      .map((value) => formatAnswerValue(value))
      .filter((value) => value !== "No answer");

    return values.length ? values.join(", ") : "Answer saved";
  }

  return String(answer);
}
