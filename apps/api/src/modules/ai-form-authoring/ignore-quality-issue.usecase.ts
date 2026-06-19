import { FormModule } from "../forms/form.module.js";
import { FormQualityCheckRepository } from "./form-quality-check.repository.js";

export class IgnoreQualityIssueUseCase {
  constructor(
    private readonly forms = new FormModule(),
    private readonly qualityChecks = new FormQualityCheckRepository(),
  ) {}

  async execute(input: { userId: string; formId: string; issueId: string }) {
    await this.forms.getOwnedForm(input.formId, input.userId);
    return this.qualityChecks.ignoreIssue(input.formId, input.issueId);
  }
}
