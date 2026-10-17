"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";
import type { Category, Course, Pagination } from "@/types/course";

/**
 * GET /api/course returns `data` AND a top-level `pagination` sibling, so
 * this query reads the full envelope instead of unwrapping via getData.
 */
export interface CatalogPage {
  courses: Course[];
  pagination: Pagination;
}

export function useCatalog(params: { page: number; category: number | null }) {
  return useQuery({
    queryKey: ["catalog", "courses", params.page, params.category],
    queryFn: async (): Promise<CatalogPage> => {
      const response = await apiClient.get<ApiEnvelope<Course[]> & { pagination: Pagination }>(
        "/course",
        { params: { page: params.page, limit: 12, ...(params.category ? { category: params.category } : {}) } }
      );
      return {
        courses: response.data.data ?? [],
        pagination: response.data.pagination,
      };
    },
    placeholderData: (previous) => previous,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: async () => {
      const response = await apiClient.get<ApiEnvelope<Category[]>>("/category");
      return response.data.data ?? [];
    },
    staleTime: 5 * 60_000,
  });
}
