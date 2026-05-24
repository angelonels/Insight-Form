import { eq } from "drizzle-orm";

import { db, type Database } from "../../shared/database/db.js";
import { users } from "../../shared/database/schema/index.js";
import { ExternalServiceError } from "../../shared/errors/app-error.js";
import type { User } from "./user.entity.js";

export type SyncUserInput = {
  clerkUserId: string;
  email: string;
  displayName?: string | null;
  imageUrl?: string | null;
};

export class UserRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.database.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async findByClerkUserId(clerkUserId: string): Promise<User | undefined> {
    const [user] = await this.database.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
    return user;
  }

  async upsertFromClerk(input: SyncUserInput): Promise<User> {
    const [user] = await this.database
      .insert(users)
      .values({
        clerkUserId: input.clerkUserId,
        email: input.email,
        displayName: input.displayName,
        imageUrl: input.imageUrl,
      })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: {
          email: input.email,
          displayName: input.displayName,
          imageUrl: input.imageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!user) {
      throw new ExternalServiceError({
        code: "USER_SYNC_FAILED",
        message: "Failed to sync current user.",
      });
    }

    return user;
  }
}
