"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getData, toApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge, EmptyState, FormAlert, ProgressBar, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { ApiEnvelope } from "@/types/api";
import type { AttemptSubmission, StudentQuiz } from "@/types/quiz";

/**
 * Quiz runner: all questions on one page (no wizard hiding questions),
 * every question required, one submission scored by the server. The
 * result screen shows score, pass mark, and full attempt history.
 */
export function QuizPlayer({ courseId, quizId }: { courseId: number; quizId: number }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getData<StudentQuiz>({ method: "GET", url: `/quiz/${quizId}` }),
    enabled: Number.isFinite(quizId),
    retry: false,
  });

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [alert, setAlert] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptSubmission["attempt"] | null>(null);

  const data = query.data;
  const questions = useMemo(
    () => [...(data?.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    [data]
  );

  const answeredCount = questions.filter((question) => answers[question.id] != null).length;

  const submit = async () => {
    if (!data) return;
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      setAlert(
        `${unanswered} question${unanswered === 1 ? "" : "s"} still unanswered. ` +
          "Answer every question before submitting."
      );
      return;
    }

    setAlert("");
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map((question) => ({
          questionId: question.id,
          optionId: answers[question.id],
        })),
      };
      const response = await apiClient.post<ApiEnvelope<AttemptSubmission>>(
        `/quiz/${quizId}/attempts`,
        payload
      );
      const submission = response.data.data!;
      setResult(submission.attempt);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quiz", quizId] }),
        queryClient.invalidateQueries({ queryKey: ["course", courseId, "progress"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    } catch (error) {
      const apiError = toApiError(error);
      setAlert(
        apiError.status === 403
          ? "Only enrolled students can submit quiz attempts."
          : apiError.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = async () => {
    setAnswers({});
    setResult(null);
    setAlert("");
    await queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
  };

  /* -------------------------------- states -------------------------------- */

  if (query.isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (query.isError || !data) {
    const status = toApiError(query.error).status;
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={status === 403 ? "lock" : status === 404 ? "search" : "alert"}
          title={
            status === 403
              ? "Quiz locked"
              : status === 404
                ? "Quiz not found"
                : "Quiz unavailable"
          }
          description={
            status === 403
              ? "Enroll in the course to take its quizzes and record attempts."
              : status === 404
                ? "This quiz was removed with its lesson."
                : toApiError(query.error).message
          }
          action={
            <ButtonLink href={`/learn/${courseId}`} iconStart="chevron-left" size="sm">
              Back to the course
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const { quiz, previousAttempts, bestScore } = data;
  const passedEver = bestScore !== null && bestScore >= quiz.passScore;

  /* -------------------------------- result -------------------------------- */

  if (result) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-card border border-line bg-surface">
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5",
              result.passed ? "bg-pine-soft" : "bg-clay-soft"
            )}
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-5xl leading-none tabular-nums text-ink">
                {result.score}
              </span>
              <span className="text-sm text-ink-muted">
                out of 100
                <span className="block">pass mark {quiz.passScore}</span>
              </span>
            </div>
            <Badge tone={result.passed ? "positive" : "negative"}>
              {result.passed ? "passed" : "not passed"}
            </Badge>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm leading-6 text-ink">
              {result.passed
                ? `You cleared ${quiz.title} by ${result.score - quiz.passScore} point${
                    result.score - quiz.passScore === 1 ? "" : "s"
                  }. Your best score is recorded on the outline.`
                : `Not past the ${quiz.passScore} mark yet. Review the lesson, then take it again — attempts are unlimited.`}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <ButtonLink href={`/learn/${courseId}`} iconStart="chevron-left" size="sm">
                Back to lesson
              </ButtonLink>
              <Button
                variant="secondary"
                size="sm"
                iconStart="refresh"
                onClick={reset}
              >
                Take it again
              </Button>
            </div>
          </div>

          <AttemptHistory attempts={previousAttempts} highlightId={result.id} />
        </div>
      </div>
    );
  }

  /* ------------------------------- answering ------------------------------- */

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      {/* Head */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="label pb-3">{quiz.title}</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Quiz attempt</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Pass mark {quiz.passScore}%
            {bestScore !== null ? (
              <>
                {" "}
                · your best <span className="font-mono text-ink">{bestScore}%</span>
                {passedEver ? (
                  <span className="ml-1 text-pine">· already passed</span>
                ) : null}
              </>
            ) : null}{" "}
            · answers are scored when you submit
          </p>
        </div>
        <ButtonLink
          href={`/learn/${courseId}?lesson=${quiz.lessonId}`}
          variant="quiet"
          size="sm"
          iconStart="chevron-left"
        >
          Back to lesson
        </ButtonLink>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <ProgressBar value={(answeredCount / Math.max(1, questions.length)) * 100} />
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
          {answeredCount} of {questions.length} answered
        </p>
      </div>

      {/* Questions */}
      <div className="mt-6 flex flex-col gap-5">
        {questions.map((question, index) => (
          <fieldset
            key={question.id}
            className="rounded-card border border-line bg-surface px-5 py-5 sm:px-6"
          >
            <legend className="px-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-pine">
                question {index + 1} of {questions.length}
              </span>
            </legend>
            <p className="text-[15px] leading-6 font-medium text-ink">
              {question.questionText}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {[...question.options].map((option, optionIndex) => {
                const chosen = answers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-(--radius-control) border px-4 py-3 transition-colors",
                      chosen
                        ? "border-pine bg-pine-soft"
                        : "border-line hover:border-line-strong hover:bg-surface-muted/60"
                    )}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      className="mt-0.5 size-4 shrink-0 accent-pine"
                      checked={chosen}
                      onChange={() =>
                        setAnswers((previous) => ({ ...previous, [question.id]: option.id }))
                      }
                    />
                    <span className="text-sm leading-6 text-ink">
                      <span className="mr-2 font-mono text-[11px] text-ink-muted">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      {option.optionText}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Submit */}
      <div className="sticky bottom-4 mt-6 rounded-card border border-line bg-paper px-5 py-4 shadow-[0_8px_24px_rgba(27,27,23,0.10)]">
        <FormAlert message={alert} />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted">
            One submission per attempt. You can retake the quiz afterwards.
          </p>
          <Button
            iconStart="send"
            loading={submitting}
            disabled={questions.length === 0}
            onClick={submit}
          >
            {submitting ? "Scoring" : "Submit answers"}
          </Button>
        </div>
      </div>

      {/* History */}
      {previousAttempts.length > 0 ? (
        <div className="mt-8">
          <AttemptHistory attempts={previousAttempts} />
        </div>
      ) : null}
    </div>
  );
}

function AttemptHistory({
  attempts,
  highlightId,
}: {
  attempts: AttemptSubmission["attempt"][];
  highlightId?: number;
}) {
  if (attempts.length === 0) return null;

  const ordered = [...attempts].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return (
    <div className="border-t border-line px-6 py-5">
      <p className="label pb-3">Attempt history</p>
      <ul className="flex flex-col">
        {ordered.map((attempt, index) => (
          <li
            key={attempt.id}
            className={cn(
              "flex items-center gap-4 py-2.5",
              index > 0 && "border-t border-line",
              attempt.id === highlightId && "font-medium"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                attempt.passed ? "bg-pine-soft text-pine" : "bg-clay-soft text-clay"
              )}
            >
              <Icon name={attempt.passed ? "check" : "close"} size={12} strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink">
              Attempt {ordered.length - index}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
              {formatDate(attempt.submittedAt)}
            </span>
            <span
              className={cn(
                "w-14 text-right font-mono text-sm tabular-nums",
                attempt.passed ? "text-pine" : "text-clay"
              )}
            >
              {attempt.score}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
