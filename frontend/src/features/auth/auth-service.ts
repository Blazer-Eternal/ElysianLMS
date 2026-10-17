import {
  apiClient,
  isSessionRejected,
  refreshSessionOnce,
  sendData,
  sendVoid,
} from "@/lib/api-client";
import { clearAuth, getAuth, setAuth, StoredAuth } from "@/lib/auth-storage";
import { ApiEnvelope } from "@/types/api";
import { ForgotPasswordResponse, LoginResponse } from "@/types/auth";

export async function login(email: string, password: string): Promise<StoredAuth> {
  const response = await apiClient.post<ApiEnvelope<LoginResponse>>("/auth/login", {
    email,
    password,
  });
  const payload = response.data.data;

  if (!payload) throw new Error(response.data.message || "Login failed");

  const stored: StoredAuth = {
    accessToken: payload.token,
    refreshToken: payload.refreshToken,
    user: payload.user,
  };
  setAuth(stored);
  return stored;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<string> {
  return sendVoid({ method: "POST", url: "/auth/signup", data: input });
}

export async function logout(): Promise<void> {
  const stored = getAuth();
  try {
    if (stored?.refreshToken) {
      await apiClient.post<ApiEnvelope<unknown>>("/auth/logout", {
        refreshToken: stored.refreshToken,
      });
    }
  } catch {
    // Revocation is best-effort; local state is cleared regardless.
  } finally {
    clearAuth();
  }
}

/**
 * Silent session restore on page load. Shares the single-flight refresh
 * with the axios interceptor, so boot-time 401 retries and this call
 * rotate exactly once (a second rotation would be a replay → 401).
 * Returns the stored session, or null when the backend rejected it.
 */
export async function restoreSession(): Promise<StoredAuth | null> {
  const stored = getAuth();
  if (!stored?.refreshToken) return null;

  try {
    await refreshSessionOnce();
    return getAuth();
  } catch (error) {
    if (isSessionRejected(error)) {
      clearAuth();
      return null;
    }
    // Transport failure: keep the persisted session instead of logging out
    // over a flaky connection. Requests surface the network error, and the
    // next successful refresh restores access.
    return getAuth();
  }
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return sendData<ForgotPasswordResponse>({
    method: "POST",
    url: "/auth/forgot-password",
    data: { email },
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<string> {
  return sendVoid({ method: "POST", url: "/auth/reset-password", data: { token, newPassword } });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<string> {
  return sendVoid({
    method: "PATCH",
    url: "/auth/change-password",
    data: { currentPassword, newPassword },
  });
}
