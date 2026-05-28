import { count, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { formEvents, forms, formResponses } from "../../shared/database/schema/index.js";
import { ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js";

export class AnalyticsRepository {
  constructor(private readonly database: Database = db) {}

  async calculateDropoff(formId: string, ownerUserId: string) {
    const [form] = await this.database.select({ id: forms.id, ownerUserId: forms.ownerUserId }).from(forms).where(eq(forms.id, formId)).limit(1);

    if (!form) {
      throw new NotFoundError({ code: "FORM_NOT_FOUND", message: "Form not found." });
    }

    if (form.ownerUserId !== ownerUserId) {
      throw new ForbiddenError({
        code: "FORM_ACCESS_DENIED",
        message: "You do not have access to this form.",
      });
    }

    const eventRows = await this.database
      .select({ eventType: formEvents.eventType, count: count() })
      .from(formEvents)
      .where(eq(formEvents.formId, formId))
      .groupBy(formEvents.eventType);
    const [responseRow] = await this.database.select({ count: count() }).from(formResponses).where(eq(formResponses.formId, formId));

    const counts = Object.fromEntries(eventRows.map((row) => [row.eventType, row.count]));
    const opened = counts.form_opened ?? 0;
    const submitted = responseRow?.count ?? 0;

    return {
      openedCount: opened,
      startedCount: counts.form_started ?? 0,
      submittedCount: submitted,
      completionRate: opened > 0 ? submitted / opened : null,
      eventCounts: counts,
    };
  }
}
