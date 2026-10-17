"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { youtubeEmbedUrl } from "@/features/learn/queries";
import type { LessonPayload } from "@/types/progress";
import type { FlatLesson } from "@/features/learn/queries";

/**
 * The lesson pane: media first (or text when there is no video), then
 * the quiz card, then explicit prev / complete / next controls.
 * Everything about position comes from the page; this stays presentational.
 */
export function LessonView({
  courseId,
  payload,
  completed,
  bestScore,
  completeBusy,
  onToggleComplete,
  prev,
  next,
  onNavigate,
}: {
  courseId: number;
  payload: LessonPayload;
  completed: boolean;
  bestScore: number | null;
  completeBusy: boolean;
  onToggleComplete: (currentlyCompleted: boolean) => void;
  prev: FlatLesson | null;
  next: FlatLesson | null;
  onNavigate: (lessonId: number) => void;
}) {
  const { lesson, course, quiz } = payload;

  return (
    <article>
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="label pb-3">{course.title}</p>
          <h1 className="font-display text-[clamp(1.6rem,3vw,2.25rem)] leading-tight font-semibold text-ink">
            {lesson.title}
          </h1>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest",
            completed
              ? "border-pine/35 bg-pine-soft text-pine"
              : "border-line-strong bg-surface text-ink-muted"
          )}
        >
          <Icon name={completed ? "check" : "clock"} size={12} strokeWidth={2} />
          {completed ? "completed" : "in progress"}
        </span>
      </header>

      {/* Media */}
      <div className="mt-7">
        <LessonMedia lesson={lesson} />
      </div>

      {/* Text content */}
      {lesson.content?.trim() ? (
        <div className="mt-6 flex flex-col gap-4 text-[15px] leading-7 text-ink">
          {lesson.content
            .split(/\n+/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      ) : null}

      {!lesson.content?.trim() && !lesson.videoRef ? (
        <div className="mt-6">
          <EmptyState
            icon="document"
            title="No content in this lesson yet"
            description="The instructor has not attached reading or video here. Check the next lesson or come back later."
            className="border-solid py-8"
          />
        </div>
      ) : null}

      {/* Quiz */}
      {quiz ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Icon name="document" size={16} className="text-amber" />
              Quiz · {quiz.title}
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Pass mark {quiz.passScore}%
              {bestScore !== null ? (
                <>
                  {" "}
                  · your best <span className="font-mono text-ink">{bestScore}%</span>
                  {bestScore >= quiz.passScore ? (
                    <span className="ml-1.5 text-pine">· passed</span>
                  ) : (
                    <span className="ml-1.5 text-clay">· not passed yet</span>
                  )}
                </>
              ) : (
                <> · not attempted yet</>
              )}
            </p>
          </div>
          <ButtonLink
            href={`/learn/${courseId}/quiz/${quiz.id}`}
            iconStart={bestScore !== null && bestScore >= quiz.passScore ? "refresh" : "send"}
            size="sm"
          >
            {bestScore === null ? "Take quiz" : "Open quiz"}
          </ButtonLink>
        </div>
      ) : null}

      {/* Footer navigation */}
      <div className="rule-top mt-10 flex flex-wrap items-center justify-between gap-3 pt-5">
        <Button
          variant="secondary"
          iconStart="chevron-left"
          disabled={!prev}
          onClick={() => prev && onNavigate(prev.lessonId)}
        >
          Previous
        </Button>

        <Button
          variant={completed ? "secondary" : "primary"}
          iconStart={completed ? "check" : "plus"}
          loading={completeBusy}
          onClick={() => onToggleComplete(completed)}
          title={completed ? "Mark this lesson incomplete" : "Mark this lesson complete"}
        >
          {completed ? "Completed" : "Mark complete"}
        </Button>

        <Button
          variant="secondary"
          iconEnd="chevron-right"
          disabled={!next}
          onClick={() => next && onNavigate(next.lessonId)}
        >
          Next
        </Button>
      </div>
    </article>
  );
}

/* --------------------------------- media --------------------------------- */

function LessonMedia({ lesson }: { lesson: LessonPayload["lesson"] }) {
  const [failed, setFailed] = useState(false);

  if (!lesson.videoProvider || !lesson.videoRef) return null;

  if (failed) {
    return (
      <div className="rounded-card border border-line bg-surface-muted px-5 py-6 text-center">
        <p className="text-sm font-medium text-ink">This video could not be loaded.</p>
        <p className="mt-1 font-mono text-[12px] break-all text-ink-muted">
          {lesson.videoRef}
        </p>
        {/^https?:\/\//i.test(lesson.videoRef) ? (
          <a
            href={lesson.videoRef}
            target="_blank"
            rel="noreferrer"
            className="link-underline mt-2 inline-block text-sm text-pine"
          >
            Open the source directly
          </a>
        ) : null}
      </div>
    );
  }

  if (lesson.videoProvider === "youtube") {
    const embed = youtubeEmbedUrl(lesson.videoRef);
    if (!embed) {
      return (
        <div className="rounded-card border border-line bg-surface-muted px-5 py-6 text-center">
          <p className="text-sm text-ink">Video reference needs review.</p>
          <p className="mt-1 font-mono text-[12px] break-all text-ink-muted">
            {lesson.videoRef}
          </p>
        </div>
      );
    }
    return (
      <div className="aspect-video overflow-hidden rounded-card border border-line bg-ink">
        <iframe
          src={embed}
          title={lesson.title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  // cloudinary (or any direct media URL)
  return (
    <video
      src={lesson.videoRef}
      controls
      preload="metadata"
      onError={() => setFailed(true)}
      className="aspect-video w-full rounded-card border border-line bg-ink"
    >
      Your browser does not support embedded video.
    </video>
  );
}
