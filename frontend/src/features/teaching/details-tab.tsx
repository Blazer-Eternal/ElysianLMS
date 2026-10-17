"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/primitives";
import { Select } from "@/features/teaching/select";
import { useCourseDetailMutations } from "@/features/teaching/mutations";
import { useCategories } from "@/features/catalog/queries";
import { useToast } from "@/components/providers/toast-provider";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Course } from "@/types/course";

/** Course facts form: everything PATCH /course/:id accepts, in one place. */
export function DetailsTab({ course }: { course: Course }) {
  const { updateCourse } = useCourseDetailMutations(course.id);
  const categories = useCategories();
  const { push } = useToast();
  const [error, setError] = useState("");

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const priceValue = String(form.get("price") ?? "").trim();
    const thumbnail = String(form.get("thumbnailUrl") ?? "").trim();
    const categoryRaw = String(form.get("categoryId") ?? "").trim();
    const price = Number(priceValue);
    const categoryId = categoryRaw ? Number(categoryRaw) : null;

    if (!title) {
      setError("A title is required.");
      return;
    }
    if (!description) {
      setError("Write a short description — it appears on the course page.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be zero or more. Use 0 for a free course.");
      return;
    }
    if (thumbnail && !/^https?:\/\//i.test(thumbnail)) {
      setError("Thumbnail must be a full http(s) URL.");
      return;
    }

    setError("");
    updateCourse.mutate(
      { title, description, price, thumbnailUrl: thumbnail || null, categoryId },
      { onSuccess: () => push("Course details saved.", "success") }
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <form onSubmit={save} className="flex max-w-2xl flex-col gap-4">
        <Input label="Title" name="title" defaultValue={course.title} required />

        <Textarea
          label="Description"
          name="description"
          rows={7}
          defaultValue={course.description}
          hint="Plain paragraphs; shown on the public course page."
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (USD)"
            name="price"
            type="number"
            min={0}
            step="1"
            defaultValue={course.price}
            hint="0 makes the course free (instant enrollment)."
          />
          <Select
            label="Category"
            name="categoryId"
            defaultValue={course.categoryId ?? ""}
            disabled={categories.isLoading}
            hint="Drives catalog filters."
          >
            <option value="">No category</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Thumbnail URL"
          name="thumbnailUrl"
          type="url"
          defaultValue={course.thumbnailUrl ?? ""}
          placeholder="https://…"
          hint="16:9 image. Leave empty to use the drawn fallback."
        />

        <FormAlert message={error} />

        <div className="flex items-center gap-3">
          <Button type="submit" iconStart="check" loading={updateCourse.isPending}>
            Save changes
          </Button>
          <span className="text-[13px] text-ink-muted">
            Slug <span className="font-mono text-ink">{course.slug}</span> stays fixed.
          </span>
        </div>
      </form>

      {/* Facts */}
      <aside className="h-fit rounded-card border border-line bg-surface px-5 py-5">
        <p className="label pb-4">Facts</p>
        <dl className="flex flex-col gap-3.5 text-sm">
          <Fact label="Current price" value={formatPrice(course.price)} />
          <Fact label="Status" value={course.status} />
          <Fact
            label="Category"
            value={course.category?.name ?? "—"}
          />
          <Fact label="Created" value={formatDate(course.createdAt)} />
          <Fact label="Updated" value={formatDate(course.updatedAt)} />
        </dl>
      </aside>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
