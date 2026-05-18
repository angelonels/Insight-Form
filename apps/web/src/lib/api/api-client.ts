export type RequestOptions = {
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken?: () => Promise<string | null>,
  ) {}

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

  async delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return this.request<TResponse>("DELETE", path, undefined, options);
  }

  private async request<TResponse>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    const token = await this.getToken?.();

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
  }
}

