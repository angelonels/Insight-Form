import { FormModule } from "../forms/form.module.js";
import { FormQualityCheckRepository } from "./form-quality-check.repository.js";

export class ApplyQualityFixUseCase {
  constructor(
    private readonly forms = new FormModule(),
    private readonly qualityChecks = new FormQualityCheckRepository(),
  ) {}

  async execute(input: { userId: string; formId: string; issueId: string }) {
    await this.forms.getOwnedForm(input.formId, input.userId);
    return this.qualityChecks.applyIssue(input.formId, input.issueId);
  }
}
