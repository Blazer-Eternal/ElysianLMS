"use client";

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/api";

/**
 * Shared query defaults tuned for an LMS dashboard:
 *  - never retry client errors (4xx are answers, not failures),
 *  - retry transient network/5xx issues twice with backoff,
 *  - no aggressive refetch storms (calm by default).
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      },
      mutations: {
        retry: false,
      },
    },
  });
}
