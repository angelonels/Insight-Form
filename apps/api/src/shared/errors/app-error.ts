export type AppErrorInput = {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
};

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(input: AppErrorInput) {
    super(input.message);
    this.name = new.target.name;
    this.code = input.code;
    this.statusCode = input.statusCode;
    this.details = input.details;
  }
}

export class ValidationError extends AppError {
  constructor(input: Omit<AppErrorInput, "statusCode">) {
    super({ ...input, statusCode: 400 });
  }
}

export class UnauthorizedError extends AppError {
  constructor(input: Partial<Omit<AppErrorInput, "statusCode">> = {}) {
    super({
      code: input.code ?? "UNAUTHORIZED",
      message: input.message ?? "Authentication is required.",
      details: input.details,
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(input: Omit<AppErrorInput, "statusCode">) {
    super({ ...input, statusCode: 403 });
  }
}

export class NotFoundError extends AppError {
  constructor(input: Omit<AppErrorInput, "statusCode">) {
    super({ ...input, statusCode: 404 });
  }
}

export class ConflictError extends AppError {
  constructor(input: Omit<AppErrorInput, "statusCode">) {
    super({ ...input, statusCode: 409 });
  }
}

export class DomainError extends AppError {
  constructor(input: Omit<AppErrorInput, "statusCode"> & { statusCode?: number }) {
    super({ ...input, statusCode: input.statusCode ?? 400 });
  }
}

export class ExternalServiceError extends AppError {
  constructor(input: Omit<AppErrorInput, "statusCode"> & { statusCode?: number }) {
    super({ ...input, statusCode: input.statusCode ?? 502 });
  }
}

export class AiInferenceFailedError extends ExternalServiceError {
  constructor(message = "AI inference failed.", details?: unknown) {
    super({ code: "AI_INFERENCE_FAILED", message, details });
  }
}

export class AiOutputValidationError extends ExternalServiceError {
  constructor(message = "AI output validation failed.", details?: unknown) {
    super({ code: "AI_OUTPUT_VALIDATION_FAILED", message, details });
  }
}

export class RateLimitExceededError extends AppError {
  constructor(input: Partial<Omit<AppErrorInput, "statusCode">> = {}) {
    super({
      code: input.code ?? "RATE_LIMIT_EXCEEDED",
      message: input.message ?? "Too many requests.",
      details: input.details,
      statusCode: 429,
    });
  }
}
