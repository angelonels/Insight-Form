import { UnauthorizedError } from "../../shared/errors/app-error.js";
import type { AuthContext } from "../auth/auth.types.js";
import type { UserRepository } from "./user.repository.js";

export class GetCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(auth: AuthContext) {
    const user = auth.userId
      ? await this.users.findById(auth.userId)
      : await this.users.findByClerkUserId(auth.clerkUserId);

    if (!user) {
      throw new UnauthorizedError({
        message: "Current user is not synced.",
      });
    }

    return user;
  }
}
