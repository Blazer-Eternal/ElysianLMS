"use client";

import { useState, type FormEvent } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/primitives";
import { ConfirmAction } from "@/features/teaching/confirm";
import { AdminGate } from "@/features/admin/admin-gate";
import { useCategoryMutations } from "@/features/admin/mutations";
import { useCategories } from "@/features/catalog/queries";
import { toApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const SLUG_HINT = "Lowercase letters, numbers and hyphens — leave empty to auto-generate.";

/**
 * Category CRUD. Slug is optional on create (server derives it from
 * the name) and omitted from updates when left empty, since the API
 * accepts only non-empty slugs.
 */
export default function AdminCategoriesPage() {
  const query = useCategories();
  const mutations = useCategoryMutations();
  const [editingId, setEditingId] = useState<number | null>(null);

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const slug = String(data.get("slug") ?? "").trim();

    if (!name) return;
    mutations.createCategory.mutate(
      { name, ...(slug ? { slug } : {}) },
      { onSuccess: () => form.reset() }
    );
  };

  const update = (event: FormEvent<HTMLFormElement>, id: number) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const slug = String(data.get("slug") ?? "").trim();

    if (!name) return;
    mutations.updateCategory.mutate(
      { id, data: { name, ...(slug ? { slug } : {}) } },
      { onSuccess: () => setEditingId(null) }
    );
  };

  return (
    <PageContainer>
      <AdminGate>
        <PageHeader
          eyebrow="Admin"
          title="Categories"
          description="Catalog navigation. Deleting a category keeps courses — they simply lose their filter grouping."
        />

        {query.isLoading ? (
          <div className="mt-6 flex flex-col gap-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : query.isError || !query.data ? (
          <div className="mt-6">
            <ErrorState
              title={toApiError(query.error).status === 403 ? "Admins only" : "Categories unavailable"}
              description={toApiError(query.error).message}
              action={
                <button
                  type="button"
                  onClick={() => query.refetch()}
                  className="link-underline text-sm text-pine"
                >
                  Try again
                </button>
              }
            />
          </div>
        ) : (
          <ul className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
            {query.data.length === 0 ? (
              <li className="px-4 py-10 sm:px-5">
                <EmptyState
                  icon="layers"
                  title="No categories yet"
                  description="Create the first one below — the catalog groups courses by it."
                />
              </li>
            ) : null}

            {query.data.map((category, index) => (
              <li
                key={category.id}
                className={cn("px-4 py-3.5 sm:px-5", index > 0 && "border-t border-line")}
              >
                {editingId === category.id ? (
                  <form
                    onSubmit={(event) => update(event, category.id)}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <div className="min-w-44 flex-1">
                      <Input label="Name" name="name" defaultValue={category.name} required />
                    </div>
                    <div className="min-w-48 flex-1">
                      <Input
                        label="Slug"
                        name="slug"
                        defaultValue={category.slug}
                        hint={SLUG_HINT}
                      />
                    </div>
                    <div className="flex gap-2 pb-6">
                      <Button
                        type="submit"
                        size="sm"
                        loading={
                          mutations.updateCategory.isPending &&
                          mutations.updateCategory.variables?.id === category.id
                        }
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="quiet"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block truncate text-sm font-medium text-ink">
                        {category.name}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-ink-muted">
                        {category.slug}
                      </span>
                    </span>

                    <Button
                      variant="quiet"
                      size="sm"
                      iconStart="pencil"
                      onClick={() => setEditingId(category.id)}
                    >
                      Edit
                    </Button>
                    <ConfirmAction
                      label="Delete"
                      confirmLabel="Delete category"
                      disabled={mutations.deleteCategory.isPending}
                      onConfirm={() => mutations.deleteCategory.mutateAsync(category.id)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Create */}
        <form
          onSubmit={create}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-card border border-dashed border-line-strong px-4 py-4 sm:px-5"
        >
          <div className="min-w-44 flex-1">
            <Input label="New category name" name="name" placeholder="e.g. Design" required />
          </div>
          <div className="min-w-48 flex-1">
            <Input label="Slug (optional)" name="slug" placeholder="design" hint={SLUG_HINT} />
          </div>
          <div className="pb-6">
            <Button
              type="submit"
              iconStart="plus"
              loading={
                mutations.createCategory.isPending &&
                typeof mutations.createCategory.variables === "object"
              }
            >
              Create
            </Button>
          </div>
        </form>
      </AdminGate>
    </PageContainer>
  );
}
