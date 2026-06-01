import { GeneratedFormDraftRepository } from "./generated-form-draft.repository.js";

export class AcceptGeneratedFormDraftUseCase {
  constructor(private readonly drafts = new GeneratedFormDraftRepository()) {}

  async execute(input: { draftId: string; userId: string }) {
    return this.drafts.accept(input.draftId, input.userId);
  }
}
