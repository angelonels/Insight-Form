import { ForbiddenError } from "../../shared/errors/app-error.js";
import type { Form } from "./form.entity.js";

export class FormPolicy {
  ensureOwner(input: { userId: string; form: Pick<Form, "ownerUserId"> }) {
    if (input.form.ownerUserId !== input.userId) {
      throw new ForbiddenError({
        code: "FORM_ACCESS_DENIED",
        message: "You do not have access to this form.",
      });
    }
  }
}
