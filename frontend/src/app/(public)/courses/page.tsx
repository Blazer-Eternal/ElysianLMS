"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCatalog, useCategories } from "@/features/catalog/queries";
import { CourseCard } from "@/features/catalog/course-card";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogInner />
    </Suspense>
  );
}

function CatalogInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const categoryParam = Number(searchParams.get("category")) || null;

  const categoriesQuery = useCategories();
  const catalogQuery = useCatalog({ page, category: categoryParam });

  const activeCategory = useMemo(
    () => categoriesQuery.data?.find((category) => category.id === categoryParam) ?? null,
    [categoriesQuery.data, categoryParam]
  );

  const navigate = (next: { page?: number; category?: number | null }) => {
    const params = new URLSearchParams();
    const targetPage = next.page ?? page;
    const targetCategory = next.category !== undefined ? next.category : categoryParam;

    if (targetPage > 1) params.set("page", String(targetPage));
    if (targetCategory) params.set("category", String(targetCategory));

    const query = params.toString();
    router.replace(`/courses${query ? `?${query}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pagination = catalogQuery.data?.pagination;

  return (
    <>
      {/* Header band */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <p className="label pb-3">Catalog</p>
          <h1 className="max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-semibold text-ink">
            {activeCategory ? activeCategory.name : "Courses worth finishing."}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-ink-muted">
            {activeCategory
              ? `Published courses in ${activeCategory.name}.`
              : "Published courses from instructors on Elysian. Free courses open the moment you enroll."}
            {pagination ? (
              <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                {pagination.total} total
              </span>
            ) : null}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2 pb-8">
          <FilterChip
            active={categoryParam === null}
            onClick={() => navigate({ page: 1, category: null })}
            label="All subjects"
          />
          {categoriesQuery.data?.map((category) => (
            <FilterChip
              key={category.id}
              active={categoryParam === category.id}
              onClick={() => navigate({ page: 1, category: category.id })}
              label={category.name}
            />
          ))}
        </div>

        {/* Results */}
        {catalogQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-card border border-line bg-surface"
              >
                <Skeleton className="h-36 w-full rounded-none" />
                <div className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : catalogQuery.isError ? (
          <EmptyState
            icon="alert"
            title="Catalog unavailable"
            description="The server did not answer. Check your connection and try again."
            action={
              <Button variant="secondary" size="sm" onClick={() => catalogQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : !pagination || catalogQuery.data!.courses.length === 0 ? (
          <EmptyState
            icon="book"
            title="No courses here yet"
            description={
              activeCategory
                ? `Nothing has been published in ${activeCategory.name} yet. Try another subject.`
                : "The catalog is empty right now. New courses appear as soon as instructors publish them."
            }
            action={
              categoryParam !== null ? (
                <Button variant="secondary" size="sm" onClick={() => navigate({ page: 1, category: null })}>
                  Show all subjects
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalogQuery.data!.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 ? (
          <nav
            aria-label="Catalog pages"
            className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6"
          >
            <Button
              variant="secondary"
              iconStart="chevron-left"
              disabled={pagination.page <= 1}
              onClick={() => navigate({ page: pagination.page - 1 })}
            >
              Previous
            </Button>

            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="secondary"
              iconEnd="chevron-right"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => navigate({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </nav>
        ) : null}
      </div>
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors",
        active
          ? "border-pine bg-pine text-paper"
          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}
