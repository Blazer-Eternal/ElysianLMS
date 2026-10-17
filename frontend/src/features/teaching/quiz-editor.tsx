"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CONTROL_CLASSES, Input, Textarea } from "@/components/ui/field";
import { ErrorState, FormAlert, Skeleton } from "@/components/ui/primitives";
import { ConfirmAction } from "@/features/teaching/confirm";
import { useQuizMutations } from "@/features/teaching/mutations";
import { useStaffQuiz } from "@/features/teaching/queries";
import { toApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface OptionRow {
  id?: number;
  text: string;
  correct: boolean;
}

interface QuestionFormState {
  questionId: number | null;
  text: string;
  options: OptionRow[];
}

const EMPTY_QUESTION: QuestionFormState = {
  questionId: null,
  text: "",
  options: [
    { text: "", correct: true },
    { text: "", correct: false },
  ],
};

function questionToForm(state: {
  id: number;
  questionText: string;
  options: Array<{ id: number; optionText: string; isCorrect: boolean }>;
}): QuestionFormState {
  return {
    questionId: state.id,
    text: state.questionText,
    options: state.options.map((option) => ({
      id: option.id,
      text: option.optionText,
      correct: option.isCorrect,
    })),
  };
}

/**
 * Staff quiz editor: settings (title + pass mark), then questions with
 * full option management. Exactly one correct option per question is
 * enforced by radio inputs and re-checked before submission. Correct
 * answers exist only here — the student view never receives them.
 */
export function QuizEditor({
  courseId,
  lessonId,
  quizId,
}: {
  courseId: number;
  lessonId: number;
  quizId: number;
}) {
  const query = useStaffQuiz(quizId, true);
  const mutations = useQuizMutations(courseId, lessonId);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [settingsError, setSettingsError] = useState("");

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    const status = toApiError(query.error).status;
    return (
      <ErrorState
        title={status === 403 ? "Quiz not editable" : "Quiz unavailable"}
        description={
          status === 403
            ? "Only the course owner, staff, or an admin can open the quiz editor."
            : status === 404
              ? "This quiz no longer exists — it may have been deleted with its lesson."
              : toApiError(query.error).message
        }
      />
    );
  }

  const { quiz, questions } = query.data;
  const ordered = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const passScore = Number(form.get("passScore"));

    if (!title) {
      setSettingsError("Give the quiz a title.");
      return;
    }
    if (!Number.isFinite(passScore) || passScore < 0 || passScore > 100) {
      setSettingsError("Pass mark must be a number between 0 and 100.");
      return;
    }
    setSettingsError("");
    mutations.updateQuiz.mutate({ id: quizId, data: { title, passScore } });
  };

  const handleAdd = (state: QuestionFormState) => {
    mutations.addQuestion.mutate(
      {
        quizId,
        data: {
          questionText: state.text,
          options: state.options.map((option) => ({
            optionText: option.text,
            isCorrect: option.correct,
          })),
        },
      },
      { onSuccess: () => setAdding(false) }
    );
  };

  const handleEdit = (state: QuestionFormState) => {
    if (state.questionId === null) return;
    mutations.updateQuestion.mutate(
      {
        questionId: state.questionId,
        quizId,
        data: {
          questionText: state.text,
          options: state.options.map((option) => ({
            optionText: option.text,
            isCorrect: option.correct,
          })),
        },
      },
      { onSuccess: () => setEditingId(null) }
    );
  };

  return (
    <section className="overflow-hidden rounded-card border border-line bg-surface">
      {/* Settings */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="label">Quiz settings</p>
          <p className="mt-1 text-sm text-ink-muted">
            {questions.length} question{questions.length === 1 ? "" : "s"} · pass mark{" "}
            {quiz.passScore}%
          </p>
        </div>
        <ConfirmAction
          label="Delete quiz"
          confirmLabel="Delete"
          onConfirm={() => mutations.deleteQuiz.mutateAsync(quiz.id)}
        />
      </header>

      <form
        onSubmit={saveSettings}
        className="flex flex-wrap items-start gap-3 border-b border-line px-5 py-4"
      >
        <div className="min-w-56 flex-1">
          <Input label="Quiz title" name="title" defaultValue={quiz.title} required />
        </div>
        <div className="w-32">
          <Input
            label="Pass mark (%)"
            name="passScore"
            type="number"
            min={0}
            max={100}
            defaultValue={quiz.passScore}
            required
          />
        </div>
        <div className="pt-7">
          <Button
            type="submit"
            size="md"
            iconStart="check"
            loading={mutations.updateQuiz.isPending}
          >
            Save
          </Button>
        </div>
        <div className="w-full">
          <FormAlert message={settingsError} />
        </div>
      </form>

      {/* Questions */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-3 pb-3">
          <p className="label">Questions</p>
          {!adding && editingId === null ? (
            <Button
              variant="secondary"
              size="sm"
              iconStart="plus"
              onClick={() => setAdding(true)}
            >
              Add question
            </Button>
          ) : null}
        </div>

        {ordered.length === 0 && !adding ? (
          <p className="rounded-(--radius-control) border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-muted">
            No questions yet. A quiz needs at least one to submit.
          </p>
        ) : null}

        <ol className="flex flex-col">
          {ordered.map((question, index) => (
            <li
              key={question.id}
              className={cn("py-4", index > 0 && "border-t border-line")}
            >
              {editingId === question.id ? (
                <QuestionForm
                  initial={questionToForm(question)}
                  submitLabel="Save question"
                  busy={mutations.updateQuestion.isPending}
                  onSubmit={handleEdit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-pine">
                      question {index + 1}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="quiet"
                        size="sm"
                        iconStart="pencil"
                        onClick={() => {
                          setAdding(false);
                          setEditingId(question.id);
                        }}
                      >
                        Edit
                      </Button>
                      <ConfirmAction
                        label="Delete"
                        onConfirm={() =>
                          mutations.deleteQuestion.mutateAsync({
                            questionId: question.id,
                            quizId,
                          })
                        }
                      />
                    </div>
                  </div>

                  <p className="mt-1.5 text-sm leading-6 font-medium text-ink">
                    {question.questionText}
                  </p>

                  <ul className="mt-2 flex flex-col gap-1">
                    {question.options.map((option, optionIndex) => (
                      <li
                        key={option.id}
                        className={cn(
                          "flex items-start gap-2 text-sm leading-6",
                          option.isCorrect ? "text-pine" : "text-ink-muted"
                        )}
                      >
                        <span className="mt-0.5 shrink-0">
                          <Icon
                            name={option.isCorrect ? "check" : "close"}
                            size={13}
                            strokeWidth={2.2}
                          />
                        </span>
                        <span>
                          <span className="mr-1.5 font-mono text-[11px]">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option.optionText}
                          {option.isCorrect ? (
                            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em]">
                              correct
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ol>

        {adding ? (
          <div className="border-t border-line pt-4">
            <QuestionForm
              initial={EMPTY_QUESTION}
              submitLabel="Add question"
              busy={mutations.addQuestion.isPending}
              onSubmit={handleAdd}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------- question form ------------------------------- */

function QuestionForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: {
  initial: QuestionFormState;
  submitLabel: string;
  busy: boolean;
  onSubmit: (state: QuestionFormState) => void;
  onCancel: () => void;
}) {
  const formId = useId();
  const [text, setText] = useState(initial.text);
  const [options, setOptions] = useState<OptionRow[]>(initial.options);
  const [error, setError] = useState("");

  const updateOption = (index: number, patch: Partial<OptionRow>) =>
    setOptions((previous) =>
      previous.map((option, i) => (i === index ? { ...option, ...patch } : option))
    );

  const setCorrect = (index: number) =>
    setOptions((previous) =>
      previous.map((option, i) => ({ ...option, correct: i === index }))
    );

  const addOption = () =>
    setOptions((previous) =>
      previous.length >= 8
        ? previous
        : [...previous, { text: "", correct: false }]
    );

  const removeOption = (index: number) =>
    setOptions((previous) => {
      if (previous.length <= 2) return previous;
      const next = previous.filter((_, i) => i !== index);
      if (!next.some((option) => option.correct)) {
        next[0] = { ...next[0], correct: true };
      }
      return next;
    });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = text.trim();
    const trimmedOptions = options.map((option) => ({
      ...option,
      text: option.text.trim(),
    }));

    if (!trimmedText) {
      setError("Write the question.");
      return;
    }
    if (trimmedOptions.length < 2) {
      setError("A question needs at least two options.");
      return;
    }
    if (trimmedOptions.some((option) => !option.text)) {
      setError("Every option needs text — or remove the empty row.");
      return;
    }
    if (trimmedOptions.filter((option) => option.correct).length !== 1) {
      setError("Mark exactly one option as correct.");
      return;
    }

    setError("");
    onSubmit({
      questionId: initial.questionId,
      text: trimmedText,
      options: trimmedOptions,
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Textarea
        label="Question"
        placeholder="e.g. Which layer runs before any middleware?"
        rows={2}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">
          Options{" "}
          <span className="font-normal text-ink-muted">
            — select the correct answer
          </span>
        </p>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <input
              type="radio"
              name={`correct-${formId}`}
              checked={option.correct}
              onChange={() => setCorrect(index)}
              className="size-4 shrink-0 accent-pine"
              aria-label={`Option ${String.fromCharCode(65 + index)} is correct`}
            />
            <input
              value={option.text}
              onChange={(event) => updateOption(index, { text: event.target.value })}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className={cn(CONTROL_CLASSES, "h-10")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconStart="minus"
              disabled={options.length <= 2}
              onClick={() => removeOption(index)}
              aria-label={`Remove option ${String.fromCharCode(65 + index)}`}
            />
          </div>
        ))}
        <div>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            iconStart="plus"
            disabled={options.length >= 8}
            onClick={addOption}
          >
            Add option
          </Button>
          <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {options.length}/8
          </span>
        </div>
      </div>

      {error ? <FormAlert message={error} /> : null}

      <div className="flex items-center gap-2.5">
        <Button type="submit" size="sm" iconStart="check" loading={busy}>
          {submitLabel}
        </Button>
        <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
