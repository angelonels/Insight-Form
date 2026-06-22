import { count, eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { formEvents, formResponses } from "../../shared/database/schema/index.js";
import { FormOwnership } from "../forms/form-ownership.js";

export class AnalyticsRepository {
  private readonly ownership: FormOwnership;

  constructor(private readonly database: Database = db) {
    this.ownership = new FormOwnership(database);
  }

  async calculateDropoff(formId: string, ownerUserId: string) {
    await this.ownership.requireOwner(formId, ownerUserId);
    const eventRows = await this.database
      .select({ eventType: formEvents.eventType, count: count() })
      .from(formEvents)
      .where(eq(formEvents.formId, formId))
      .groupBy(formEvents.eventType);
    const [responseRow] = await this.database
      .select({ count: count() })
      .from(formResponses)
      .where(eq(formResponses.formId, formId));

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
