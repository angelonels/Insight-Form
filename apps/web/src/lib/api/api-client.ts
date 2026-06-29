import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
  type RawAxiosRequestHeaders,
} from "axios";

export type RequestOptions = Pick<AxiosRequestConfig, "headers" | "params" | "signal" | "timeout">;

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(input: { status: number; payload: ApiErrorPayload; cause?: unknown }) {
    super(input.payload.message, { cause: input.cause });
    this.name = "ApiError";
    this.code = input.payload.code;
    this.status = input.status;
    this.details = input.payload.details;
    this.requestId = input.payload.requestId;
  }

  static fromAxiosError(error: AxiosError<unknown>) {
    const response = error.response;

    if (!response) {
      return new ApiError({
        status: 0,
        payload: {
          code: "NETWORK_ERROR",
          message: error.message || "Unable to reach the server.",
        },
        cause: error,
      });
    }

    const payload = getApiErrorPayload(response.data);
    return new ApiError({
      status: response.status,
      payload: payload ?? {
        code: `HTTP_${response.status}`,
        message: response.statusText || "Request failed.",
      },
      cause: error,
    });
  }
}

type SuccessEnvelope<TData> = {
  data: TData;
};

type ErrorEnvelope = {
  error?: unknown;
};

function getApiErrorPayload(data: unknown): ApiErrorPayload | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const payload = (data as ErrorEnvelope).error;
  if (
    !payload ||
    typeof payload !== "object" ||
    !("code" in payload) ||
    typeof payload.code !== "string" ||
    !("message" in payload) ||
    typeof payload.message !== "string"
  ) {
    return undefined;
  }

  return payload as ApiErrorPayload;
}

export class ApiClient {
  private readonly http: AxiosInstance;

  constructor(
    baseUrl: string,
    private readonly getToken?: () => Promise<string | null>,
    defaultHeaders: RawAxiosRequestHeaders = {},
    http?: AxiosInstance,
  ) {
    this.http =
      http ??
      axios.create({
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          ...defaultHeaders,
        },
      });
  }

  async get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>("GET", path, undefined, options);
  }

  async post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>("POST", path, body, options);
  }

  async patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>("PATCH", path, body, options);
  }

  async put<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>("PUT", path, body, options);
  }

  async delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>("DELETE", path, undefined, options);
  }

  private async request<TResponse>(
    method: Method,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    const token = await this.getToken?.();

    try {
      const response = await this.http.request<SuccessEnvelope<TResponse>>({
        method,
        url: path,
        data: body,
        ...options,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
      });

      if (response.status === 204) {
        return undefined as TResponse;
      }

      return response.data.data;
    } catch (error) {
      if (!axios.isAxiosError(error) || axios.isCancel(error)) {
        throw error;
      }

      throw ApiError.fromAxiosError(error);
    }
  }
}
