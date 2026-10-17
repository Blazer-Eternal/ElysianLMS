"use client";

/**
 * Session storage for the auth tokens.
 *
 * Design (matches the backend contract):
 *  - The access JWT is short-lived (15 min) and lives in MEMORY ONLY. It is
 *    minted by the shared refresh flow on boot and whenever a request 401s,
 *    so a reload can never resurrect a stale one from disk.
 *  - The opaque refresh token (7-day TTL, rotated on every refresh) and the
 *    user object persist in localStorage: the user object renders the right
 *    shell immediately (the backend has no GET /auth/me), and the refresh
 *    token lets POST /auth/refresh silently restore access.
 *
 * Trade-off: localStorage is readable by any script on the page, so this
 * assumes a trusted first-party frontend (no third-party embeds). The
 * backend only stores SHA-256 hashes, so a stolen-at-rest value is the
 * worst case and is revocable by logout/password change.
 */

const STORAGE_KEY = "elysian.auth.v1";

export interface StoredAuth {
  /** In-memory only — never written to storage (see setAuth). */
  accessToken?: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "student" | "teacher" | "admin";
  };
}

let memory: StoredAuth | null = null;

function readStorage(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    return parsed.refreshToken && parsed.user ? (parsed as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function getAuth(): StoredAuth | null {
  if (memory) return memory;
  memory = readStorage();
  return memory;
}

/**
 * Read straight through to disk, bypassing the memory cache. The refresh
 * flow uses this so a rotation performed by ANOTHER tab (or a previous
 * code path) is seen as fresh instead of replayed — the backend rejects
 * replays with 401.
 */
export function readStoredAuth(): StoredAuth | null {
  return readStorage();
}

export function setAuth(auth: StoredAuth): void {
  memory = auth;
  if (typeof window === "undefined") return;
  try {
    // Only the durable half goes to disk; the access token stays in memory.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ refreshToken: auth.refreshToken, user: auth.user })
    );
  } catch {
    // storage full or blocked: session stays in memory for this tab only
  }
}

export function patchTokens(accessToken: string, refreshToken: string): void {
  const current = getAuth();
  if (!current) return;
  setAuth({ ...current, accessToken, refreshToken });
}

export function clearAuth(): void {
  memory = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to recover from
  }
}
