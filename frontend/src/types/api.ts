/**
 * Typed mirror of the backend API envelope.
 * Every endpoint responds { success, message, data? }; failures carry the
 * same shape plus optional per-field `errors` from zod validation and
 * HTTP status in the 4xx/5xx range.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: ApiFieldError[]
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** True for rate-limit responses (429) — surfaced as a retry notice. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** Field → first message, for wiring server validation into forms. */
  get fieldErrors(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const err of this.errors ?? []) {
      if (!(err.field in map)) map[err.field] = err.message;
    }
    return map;
  }
}