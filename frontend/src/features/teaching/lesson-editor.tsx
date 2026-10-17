"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { FormAlert, Skeleton } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { Select } from "@/features/teaching/select";
import { QuizEditor } from "@/features/teaching/quiz-editor";
import { useCurriculumMutations, useQuizMutations } from "@/features/teaching/mutations";
import { useLesson } from "@/features/learn/queries";
import type { TeachingLesson, TeachingSection } from "@/types/teaching";

/**
 * Inline lesson editor that opens beneath its row in the curriculum:
 * title, section move, video (provider + ref pair), reading text,
 * preview flag — then the quiz block (create or full editor). Keyed by
 * lesson id by the parent so state resets between lessons.
 */
export function LessonEditor({
  courseId,
  lesson,
  sections,
  onClose,
}: {
  courseId: number;
  lesson: TeachingLesson;
  sections: TeachingSection[];
  onClose: () => void;
}) {
  const curriculum = useCurriculumMutations(courseId);
  const quizMutations = useQuizMutations(courseId, lesson.id);
  const lessonQuery = useLesson(lesson.id, true);
  const { push } = useToast();

  const [provider, setProvider] = useState<string>(lesson.videoProvider ?? "none");
  const [error, setError] = useState("");

  const quiz = lessonQuery.data?.quiz ?? null;

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const videoRef = String(form.get("videoRef") ?? "").trim();
    const content = String(form.get("content") ?? "").trim();
    const isPreview = form.get("isPreview") === "on";

    if (!title) {
      setError("Lesson title is required.");
      return;
    }
    if (provider !== "none" && !videoRef) {
      setError("Paste the video link or ID — or switch the video source to none.");
      return;
    }

    setError("");
    curriculum.updateLesson.mutate(
      {
        id: lesson.id,
        data: {
          title,
          content: content || null,
          videoProvider: provider === "none" ? null : (provider as "youtube" | "cloudinary"),
          videoRef: provider === "none" ? null : videoRef || null,
          isPreview,
        },
      },
      {
        onSuccess: () => {
          push("Lesson saved.", "success");
          onClose();
        },
      }
    );
  };

  return (
    <div className="border-t border-line bg-surface-muted/50 px-4 py-5 sm:px-5">
      <div className="flex items-center justify-between gap-3 pb-4">
        <p className="label">Edit lesson</p>
        <Button variant="quiet" size="sm" iconStart="close" onClick={onClose}>
          Close
        </Button>
      </div>

      <form onSubmit={save} className="flex flex-col gap-4">
        <Input label="Title" name="title" defaultValue={lesson.title} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Section"
            hint="Moving keeps the lesson; it lands at the end of the target section."
            value={lesson.sectionId}
            onChange={(event) => {
              const target = Number(event.target.value);
              if (target !== lesson.sectionId) {
                curriculum.moveLesson.mutate({ id: lesson.id, sectionId: target });
              }
            }}
          >
            {sections
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
          </Select>

          <Select
            label="Video source"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            hint={
              provider === "none"
                ? "Reading-only lesson unless you attach a video."
                : provider === "youtube"
                  ? "Paste any watch, share, or shorts link."
                  : "Direct media URL (Cloudinary or compatible)."
            }
          >
            <option value="none">No video</option>
            <option value="youtube">YouTube</option>
            <option value="cloudinary">Cloudinary / direct file</option>
          </Select>
        </div>

        {provider !== "none" ? (
          <Input
            label={provider === "youtube" ? "YouTube link or ID" : "Video URL"}
            name="videoRef"
            defaultValue={lesson.videoRef ?? ""}
            placeholder={
              provider === "youtube" ? "https://youtu.be/…" : "https://res.cloudinary.com/…"
            }
          />
        ) : null}

        <Textarea
          label="Reading content"
          name="content"
          rows={7}
          defaultValue={lesson.content ?? ""}
          placeholder="Shown under the video. One paragraph per blank line."
          hint="Plain text; blank lines split paragraphs."
        />

        <label className="flex items-start gap-3 rounded-(--radius-control) border border-line bg-surface px-4 py-3">
          <input
            type="checkbox"
            name="isPreview"
            defaultChecked={lesson.isPreview}
            className="mt-0.5 size-4 shrink-0 accent-pine"
          />
          <span className="text-sm leading-6">
            <span className="font-medium text-ink">Preview lesson</span>
            <span className="block text-ink-muted">
              Visitors can open this lesson without enrolling (via direct links).
            </span>
          </span>
        </label>

        <FormAlert message={error} />

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="submit"
            size="sm"
            iconStart="check"
            loading={curriculum.updateLesson.isPending}
          >
            Save lesson
          </Button>
          <Button type="button" variant="quiet" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Quiz block */}
      <div className="mt-6 border-t border-line pt-5">
        {lessonQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : quiz ? (
          <QuizEditor courseId={courseId} lessonId={lesson.id} quizId={quiz.id} />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-dashed border-line-strong px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">Quiz</p>
              <p className="text-[13px] text-ink-muted">
                Multiple-choice questions scored by the server — students see results
                after submitting.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconStart="plus"
              loading={quizMutations.createQuiz.isPending}
              onClick={() =>
                quizMutations.createQuiz.mutate({
                  lessonId: lesson.id,
                  title: `${lesson.title} quiz`,
                  passScore: 70,
                })
              }
            >
              Add quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
