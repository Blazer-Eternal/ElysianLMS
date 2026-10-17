"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { useCourseReviews, useReviewMutation } from "@/features/courses/queries";
import { useToast } from "@/components/providers/toast-provider";
import { Monogram } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { EmptyState, FormAlert, Spinner } from "@/components/ui/primitives";
import { StarPicker, Stars } from "@/components/ui/stars";
import { toApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/types/course";

/**
 * Public reviews with verified-purchase rules: anyone reads, only
 * enrolled students write, exactly one review per course (409 → edit).
 */
export function ReviewsSection({
  courseId,
  enrolled,
}: {
  courseId: number;
  enrolled: boolean;
}) {
  const { user } = useAuth();
  const query = useCourseReviews(courseId);
  const { push } = useToast();

  const reviews = query.data?.reviews ?? [];
  const summary = query.data?.summary ?? { average: 0, count: 0 };
  const mine = user ? reviews.find((review) => review.userId === user.id) ?? null : null;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const mutations = useReviewMutation(courseId);

  // Deep links end in `#reviews` (from the dashboard). Land there once
  // the section actually exists; scrolling is pure DOM work, no state.
  useEffect(() => {
    if (query.isLoading || window.location.hash !== "#reviews") return;
    const timer = window.setTimeout(
      () =>
        document
          .getElementById("reviews")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      120
    );
    return () => window.clearTimeout(timer);
  }, [query.isLoading]);

  const openCreate = () => {
    setEditing(null);
    setRating(5);
    setComment("");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (review: Review) => {
    setEditing(review);
    setRating(review.rating);
    setComment(review.comment ?? "");
    setFormError("");
    setFormOpen(true);
  };

  const submit = async () => {
    setFormError("");
    if (rating < 1 || rating > 5) {
      setFormError("Choose a rating between 1 and 5.");
      return;
    }

    try {
      if (editing) {
        await mutations.update.mutateAsync({
          id: editing.id,
          rating,
          comment: comment.trim() || null,
        });
        push("Review updated.", "success");
      } else {
        await mutations.create.mutateAsync({
          rating,
          comment: comment.trim() || null,
        });
        push("Review published. Thank you.", "success");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.status === 409) {
        setFormError("You have already reviewed this course. Edit your existing review instead.");
      } else {
        setFormError(apiError.message);
      }
    }
  };

  const remove = async (review: Review) => {
    try {
      await mutations.remove.mutateAsync(review.id);
      push("Review deleted.", "success");
      setConfirmDelete(false);
    } catch (error) {
      push(toApiError(error).message, "error");
    }
  };

  return (
    <section id="reviews" className="scroll-mt-24">
      <Card>
        <CardHeader
          title="Reviews"
          subtitle="Written by students who enrolled"
          action={
            summary.count > 0 ? (
              <span className="flex items-center gap-2.5">
                <span className="font-mono text-xl tabular-nums text-ink">
                  {summary.average.toFixed(1)}
                </span>
                <Stars value={summary.average} size={15} />
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                  {summary.count}
                </span>
              </span>
            ) : undefined
          }
        />

        <div className="px-5 py-5 sm:px-6">
          {/* Action row */}
          {enrolled && !mine && !formOpen ? (
            <div className="pb-4">
              <Button variant="secondary" size="sm" iconStart="pencil" onClick={openCreate}>
                Write a review
              </Button>
            </div>
          ) : null}

          {enrolled && mine && !formOpen ? (
            <div className="flex justify-end pb-4">
              <Button variant="quiet" size="sm" iconStart="pencil" onClick={() => openEdit(mine)}>
                Edit your review
              </Button>
            </div>
          ) : null}

          {!enrolled && user && summary.count > 0 ? (
            <p className="pb-4 text-[13px] text-ink-muted">
              Only enrolled students can write reviews.
            </p>
          ) : null}

          {/* Form */}
          {formOpen ? (
            <div ref={formRef} className="mb-5 rounded-(--radius-control) border border-line bg-surface-muted px-4 py-4">
              <p className="label pb-3">{editing ? "Edit your review" : "Write a review"}</p>
              <div className="flex flex-col gap-3">
                <StarPicker value={rating} onChange={setRating} />
                <Textarea
                  label="Comment"
                  placeholder="What worked, what didn't, who should take this course?"
                  hint={`${comment.length}/2000 characters. Optional.`}
                  maxLength={2000}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
                <FormAlert message={formError} />
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    size="sm"
                    loading={mutations.create.isPending || mutations.update.isPending}
                    onClick={submit}
                  >
                    {editing ? "Save changes" : "Publish review"}
                  </Button>
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => {
                      setFormOpen(false);
                      setEditing(null);
                      setFormError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* List */}
          {query.isLoading ? (
            <Spinner label="Loading reviews" />
          ) : query.isError ? (
            <p className="text-sm text-ink-muted">Reviews could not be loaded right now.</p>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon="star"
              title="No reviews yet"
              description={
                enrolled
                  ? "You enrolled first: your review sets the tone."
                  : "Reviews appear once enrolled students finish the course."
              }
              className="border-solid py-8"
            />
          ) : (
            <ul className="flex flex-col">
              {reviews.map((review) => {
                const isMine = user?.id === review.userId;
                return (
                  <li key={review.id} className="border-t border-line py-4 first:border-t-0 first:pt-0">
                    <div className="flex items-start gap-3">
                      <Monogram name={review.user.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-sm font-medium text-ink">
                            {review.user.name}
                          </span>
                          <Stars value={review.rating} size={13} />
                          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.comment ? (
                          <p className="mt-1.5 text-sm leading-6 whitespace-pre-wrap text-ink">
                            {review.comment}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-sm italic text-ink-muted">
                            Rated without a comment.
                          </p>
                        )}
                      </div>

                      {isMine ? (
                        <div className="flex shrink-0 gap-2">
                          <Button variant="quiet" size="sm" onClick={() => openEdit(review)}>
                            Edit
                          </Button>
                          {confirmDelete ? (
                            <>
                              <Button variant="danger" size="sm" onClick={() => remove(review)}>
                                Confirm
                              </Button>
                              <Button variant="quiet" size="sm" onClick={() => setConfirmDelete(false)}>
                                Keep
                              </Button>
                            </>
                          ) : (
                            <Button variant="quiet" size="sm" onClick={() => setConfirmDelete(true)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </section>
  );
}
