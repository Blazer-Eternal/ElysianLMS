"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CONTROL_CLASSES, Input } from "@/components/ui/field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/primitives";
import { ConfirmIcon } from "@/features/teaching/confirm";
import { LessonEditor } from "@/features/teaching/lesson-editor";
import { useCurriculumMutations } from "@/features/teaching/mutations";
import { useSections } from "@/features/teaching/queries";
import { toApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Curriculum builder: ordered sections, ordered lessons inside them,
 * inline rename, move up/down (bounded orders the backend expects),
 * two-step deletes, and an inline editor that opens under its row.
 */
export function CurriculumTab({ courseId }: { courseId: number }) {
  const query = useSections(courseId);
  const mutations = useCurriculumMutations(courseId);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    const status = toApiError(query.error).status;
    return (
      <ErrorState
        title={status === 403 ? "No edit access" : "Curriculum unavailable"}
        description={
          status === 403
            ? "Only the course owner, staff members, or an admin can edit this curriculum."
            : status === 404
              ? "Course not found — it may have been deleted."
              : toApiError(query.error).message
        }
      />
    );
  }

  const sections = [...query.data].sort((a, b) => a.orderIndex - b.orderIndex);
  const editing =
    editingLessonId !== null
      ? sections
          .flatMap((section) => section.lessons)
          .find((lesson) => lesson.id === editingLessonId) ?? null
      : null;

  const createSection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(new FormData(form).get("title") ?? "").trim();
    if (!title) return;
    mutations.createSection.mutate(title, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-3xl text-sm leading-6 text-ink-muted">
        Sections hold lessons in order; each lesson can carry reading text, a video, and a
        quiz. Review requires at least one section with one lesson.
      </p>

      {sections.length === 0 ? (
        <EmptyState
          icon="layers"
          title="No sections yet"
          description="Build the course top-down: add the first section, then drop lessons into it."
        />
      ) : null}

      <ol className="flex flex-col gap-4">
        {sections.map((section, sectionIndex) => {
          const lessons = [...section.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
          const renamePending =
            mutations.renameSection.isPending &&
            mutations.renameSection.variables?.id === section.id;

          return (
            <li
              key={section.id}
              className="overflow-hidden rounded-card border border-line bg-surface"
            >
              {/* Section header */}
              <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface-muted/50 px-4 py-3 sm:px-5">
                <span className="font-mono text-[11px] text-pine">{pad(sectionIndex + 1)}</span>

                {renamingId === section.id ? (
                  <RenameForm
                    initial={section.title}
                    busy={renamePending}
                    onSubmit={(title) =>
                      mutations.renameSection.mutate(
                        { id: section.id, title },
                        { onSuccess: () => setRenamingId(null) }
                      )
                    }
                    onCancel={() => setRenamingId(null)}
                  />
                ) : (
                  <>
                    <h3 className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-ink">
                      {section.title}
                    </h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                      {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="quiet"
                        size="sm"
                        iconStart="pencil"
                        onClick={() => setRenamingId(section.id)}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="quiet"
                        size="sm"
                        iconStart="arrow-up"
                        aria-label={`Move ${section.title} up`}
                        title="Move up"
                        disabled={sectionIndex === 0}
                        onClick={() =>
                          mutations.moveSection.mutate({
                            id: section.id,
                            orderIndex: sectionIndex - 1,
                          })
                        }
                      />
                      <Button
                        variant="quiet"
                        size="sm"
                        iconStart="arrow-down"
                        aria-label={`Move ${section.title} down`}
                        title="Move down"
                        disabled={sectionIndex === sections.length - 1}
                        onClick={() =>
                          mutations.moveSection.mutate({
                            id: section.id,
                            orderIndex: sectionIndex + 1,
                          })
                        }
                      />
                      <ConfirmIcon
                        label={`Delete section ${section.title} and its lessons`}
                        onConfirm={() => mutations.deleteSection.mutateAsync(section.id)}
                      />
                    </div>
                  </>
                )}
              </header>

              {/* Lessons */}
              {lessons.length === 0 ? (
                <p className="px-4 py-4 text-sm text-ink-muted sm:px-5">
                  No lessons in this section yet.
                </p>
              ) : (
                <ul>
                  {lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id} className="border-t border-line first:border-t-0">
                      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
                        <span className="font-mono text-[11px] text-ink-muted">
                          {pad(lessonIndex + 1)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {lesson.title}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            {lesson.isPreview ? (
                              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                                preview
                              </span>
                            ) : null}
                            {lesson.videoProvider ? (
                              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-pine">
                                video · {lesson.videoProvider}
                              </span>
                            ) : null}
                            {lesson.content?.trim() ? (
                              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                                text
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="quiet"
                            size="sm"
                            iconStart="pencil"
                            onClick={() =>
                              setEditingLessonId((current) =>
                                current === lesson.id ? null : lesson.id
                              )
                            }
                          >
                            {editingLessonId === lesson.id ? "Close" : "Edit"}
                          </Button>
                          <Button
                            variant="quiet"
                            size="sm"
                            iconStart="arrow-up"
                            aria-label={`Move ${lesson.title} up`}
                            title="Move up"
                            disabled={lessonIndex === 0}
                            onClick={() =>
                              mutations.reorderLesson.mutate({
                                id: lesson.id,
                                orderIndex: lessonIndex - 1,
                              })
                            }
                          />
                          <Button
                            variant="quiet"
                            size="sm"
                            iconStart="arrow-down"
                            aria-label={`Move ${lesson.title} down`}
                            title="Move down"
                            disabled={lessonIndex === lessons.length - 1}
                            onClick={() =>
                              mutations.reorderLesson.mutate({
                                id: lesson.id,
                                orderIndex: lessonIndex + 1,
                              })
                            }
                          />
                          <ConfirmIcon
                            label={`Delete lesson ${lesson.title}`}
                            onConfirm={() => mutations.deleteLesson.mutateAsync(lesson.id)}
                          />
                        </div>
                      </div>

                      {editing?.id === lesson.id ? (
                        <LessonEditor
                          key={lesson.id}
                          courseId={courseId}
                          lesson={lesson}
                          sections={sections}
                          onClose={() => setEditingLessonId(null)}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}

              {/* Add lesson */}
              <form
                className="flex items-center gap-2 border-t border-line px-4 py-3 sm:px-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const title = String(new FormData(form).get("title") ?? "").trim();
                  if (!title) return;
                  mutations.createLesson.mutate(
                    { sectionId: section.id, title },
                    { onSuccess: () => form.reset() }
                  );
                }}
              >
                <input
                  name="title"
                  placeholder="New lesson title"
                  aria-label={`New lesson title in ${section.title}`}
                  className={cn(CONTROL_CLASSES, "h-9 flex-1 text-sm")}
                />
                <Button
                  type="submit"
                  size="sm"
                  iconStart="plus"
                  loading={
                    mutations.createLesson.isPending &&
                    mutations.createLesson.variables?.sectionId === section.id
                  }
                >
                  Add lesson
                </Button>
              </form>
            </li>
          );
        })}
      </ol>

      {/* Add section */}
      <form
        onSubmit={createSection}
        className="flex flex-wrap items-end gap-3 rounded-card border border-dashed border-line-strong px-4 py-4 sm:px-5"
      >
        <div className="min-w-56 flex-1">
          <Input
            label="New section title"
            name="title"
            placeholder="e.g. Getting started"
          />
        </div>
        <div className="pt-7">
          <Button
            type="submit"
            size="md"
            iconStart="plus"
            loading={
              mutations.createSection.isPending &&
              typeof mutations.createSection.variables === "string"
            }
          >
            Add section
          </Button>
        </div>
      </form>
    </div>
  );
}

function RenameForm({
  initial,
  busy,
  onSubmit,
  onCancel,
}: {
  initial: string;
  busy: boolean;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <form
      className="flex min-w-0 flex-1 items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const title = String(new FormData(event.currentTarget).get("title") ?? "").trim();
        if (title) onSubmit(title);
      }}
    >
      <input
        ref={inputRef}
        name="title"
        defaultValue={initial}
        aria-label="Section title"
        className={cn(CONTROL_CLASSES, "h-9 min-w-0 flex-1 text-sm")}
      />
      <Button type="submit" size="sm" loading={busy}>
        Save
      </Button>
      <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}
