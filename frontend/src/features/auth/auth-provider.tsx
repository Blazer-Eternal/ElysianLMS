"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StoredAuth } from "@/lib/auth-storage";
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  restoreSession,
} from "@/features/auth/auth-service";
import { ApiError } from "@/types/api";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthContextValue {
  user: StoredAuth["user"] | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<StoredAuth>;
  register: (input: { name: string; email: string; password: string }) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<StoredAuth["user"] | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Silent restore on mount: rotate the stored refresh token into a fresh
  // access token; if it is dead, drop to guest.
  useEffect(() => {
    let cancelled = false;

    restoreSession()
      .then((session) => {
        if (cancelled) return;
        setUser(session?.user ?? null);
        setStatus(session ? "authenticated" : "guest");
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus("guest");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      async login(email, password) {
        const session = await apiLogin(email, password);
        setUser(session.user);
        setStatus("authenticated");
        return session;
      },
      async register(input) {
        const message = await apiRegister(input);
        return message;
      },
      async logout() {
        await apiLogout();
        setUser(null);
        setStatus("guest");
        router.replace("/login");
      },
    }),
    [user, status, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** Redirect helper for guarded pages: keeps the intended destination. */
export function loginHrefFor(pathname: string): string {
  if (!pathname || pathname === "/") return "/login";
  return `/login?next=${encodeURIComponent(pathname)}`;
}

export { ApiError };
