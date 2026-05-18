import { ApiClient } from "./api-client.js";

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000");

