import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiEnvelope, ApiError, ApiFieldError } from "@/types/api";
import { RefreshResponse } from "@/types/auth";
import { clearAuth, getAuth, patchTokens, readStoredAuth } from "@/lib/auth-storage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/** Raw client for the refresh call itself (never intercepted). */
const rawClient = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 });

/**
 * Shared client used by every service module.
 * - Attaches the in-memory access token to each request.
 * - On a 401 (and only for non-auth endpoints) performs ONE concurrent
 *   refresh, rotates both tokens, and retries the original request once.
 * - If the backend rejects the refresh (session truly dead) the session is
 *   cleared and the caller surfaces the original 401 so the UI can route
 *   to /login. Transport failures do NOT kill the session.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = getAuth();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

/**
 * One rotation at a time, serialized on two axes:
 *  - within a tab: concurrent 401 retries and the boot-time
 *    restoreSession() all await the same promise;
 *  - across tabs: navigator.locks makes a second tab WAIT, then read the
 *    already-rotated refresh token from storage instead of replaying a
 *    used one (the backend's strict rotation rejects replays with 401,
 *    which would otherwise wipe a perfectly good session).
 */
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  // Read through to storage first: while waiting on the lock another tab
  // may have rotated, and the in-memory token would be a replay.
  const auth = readStoredAuth() ?? getAuth();
  if (!auth?.refreshToken) throw new ApiError(401, "No session");

  const { data } = await rawClient.post<ApiEnvelope<RefreshResponse>>("/auth/refresh", {
    refreshToken: auth.refreshToken,
  });

  if (!data.success || !data.data) {
    throw new ApiError(401, data.message || "Session expired");
  }

  patchTokens(data.data.token, data.data.refreshToken);
  return data.data.token;
}

export function refreshSessionOnce(): Promise<string> {
  if (!refreshPromise) {
    const run = async () => {
      const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
      if (locks?.request) {
        return locks.request("elysian.session-refresh", () => performRefresh());
      }
      return performRefresh();
    };
    refreshPromise = run().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** True when the backend (not the network) rejected the session. */
export function isSessionRejected(error: unknown): boolean {
  const apiError = error instanceof AxiosError ? toApiError(error) : error;
  return apiError instanceof ApiError && (apiError.status === 401 || apiError.status === 403);
}

const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/forgot-password", "/auth/reset-password"];

function isAuthPath(url = ""): boolean {
  return AUTH_PATHS.some((path) => url.includes(path));
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const canRetry =
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthPath(original.url) &&
      !isAuthPath(original.baseURL ?? "");

    if (canRetry && original) {
      original._retry = true;
      try {
        const token = await refreshSessionOnce();
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return apiClient(original);
      } catch (refreshError) {
        // Only a backend rejection kills the session; a network blip keeps
        // it so a flaky connection never logs the user out.
        if (isSessionRejected(refreshError)) clearAuth();
        if (refreshError instanceof AxiosError) {
          return Promise.reject(toApiError(refreshError));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(toApiError(error));
  }
);

/** Convert axios failures into the ApiError the UI layers understand. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiEnvelope<unknown> | undefined;
    const status = error.response?.status ?? 0;

    if (!error.response) {
      return new ApiError(0, "Cannot reach the server. Check your connection.");
    }

    // FastAPI-style field errors are not used; the backend sends zod issues
    // as { errors: [{ field, message }] } on validation failures.
    const rawErrors = (body as { errors?: unknown } | undefined)?.errors;
    const fieldErrors = Array.isArray(rawErrors)
      ? (rawErrors as ApiFieldError[])
      : undefined;

    return new ApiError(status, body?.message || `Request failed (${status})`, fieldErrors);
  }

  return new ApiError(0, "Something went wrong");
}

/** Typed GET helper: unwraps the envelope's `data` field. */
export async function getData<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiEnvelope<T>>(config);
  return response.data.data as T;
}

/** Typed mutation helper for services. */
export async function sendData<T, B = unknown>(config: AxiosRequestConfig & { data?: B }): Promise<T> {
  const response = await apiClient.request<ApiEnvelope<T>>(config as AxiosRequestConfig);
  return response.data.data as T;
}

/** Helper for endpoints whose success matters but payload does not. */
export async function sendVoid<B = unknown>(config: AxiosRequestConfig & { data?: B }): Promise<string> {
  const response = await apiClient.request<ApiEnvelope<unknown>>(config as AxiosRequestConfig);
  return response.data.message;
}
