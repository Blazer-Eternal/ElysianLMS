"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  /** Resolved theme actually applied right now (system folded in). */
  resolved: Resolved;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "elysian.theme";
/** Same-tab change signal (the native `storage` event only fires cross-tab). */
const CHANGE_EVENT = "elysian:theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ---------------------- store: preference in localStorage ---------------------- */

function subscribePreference(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getPreference(): string {
  return window.localStorage.getItem(STORAGE_KEY) ?? "system";
}

function getServerPreference(): string {
  return "system";
}

/* --------------------------- store: OS color scheme --------------------------- */

function subscribeSystem(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getSystemServerDark(): boolean {
  return false;
}

/* --------------------------------- provider --------------------------------- */

/**
 * Preference and OS setting are external stores (localStorage +
 * matchMedia), read through useSyncExternalStore so there is no
 * setState-in-effect and no hydration mismatch: during hydration the
 * server snapshot ("system", light) is used, then the real value lands.
 * The only effect here writes to the DOM, which is its job.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(
    subscribePreference,
    getPreference,
    getServerPreference
  );
  const theme: Theme =
    stored === "light" || stored === "dark" ? stored : "system";

  const systemDark = useSyncExternalStore(
    subscribeSystem,
    getSystemDark,
    getSystemServerDark
  );

  const resolved: Resolved =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Sync <html> to the resolved value (the pre-paint script handles the
  // very first frame; this keeps later changes and OS flips in sync).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  }, [resolved]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolved,
      setTheme: (next) => {
        window.localStorage.setItem(STORAGE_KEY, next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
      },
    }),
    [theme, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
