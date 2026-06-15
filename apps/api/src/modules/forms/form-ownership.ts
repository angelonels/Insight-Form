import { eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { forms } from "../../shared/database/schema/index.js";
import { ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js";

export class FormOwnership {
  constructor(private readonly database: Database = db) {}

  async requireOwner(formId: string, ownerUserId: string) {
    const [form] = await this.database.select().from(forms).where(eq(forms.id, formId)).limit(1);

    if (!form) {
      throw new NotFoundError({ code: "FORM_NOT_FOUND", message: "Form not found." });
    }

    if (form.ownerUserId !== ownerUserId) {
      throw new ForbiddenError({
        code: "FORM_ACCESS_DENIED",
        message: "You do not have access to this form.",
      });
    }

    return form;
  }
}
