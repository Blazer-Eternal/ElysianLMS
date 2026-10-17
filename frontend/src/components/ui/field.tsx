"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface FieldChromeProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  required?: boolean;
  /** Rendered right of the label (e.g. "Forgot password?"). */
  labelAside?: React.ReactNode;
  htmlFor: string;
  children: React.ReactNode;
}

/**
 * Shared label + control + message frame. Labels always sit above the
 * control (never floating), errors reserve their own line so forms do
 * not jump when validation fires.
 */
function FieldChrome({
  label,
  error,
  hint,
  required,
  labelAside,
  htmlFor,
  children,
}: FieldChromeProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-1 text-clay" aria-hidden>
              *
            </span>
          ) : null}
        </label>
        {labelAside}
      </div>

      {children}

      <div className="min-h-5">
        {error ? (
          <p role="alert" className="text-[13px] leading-5 text-clay">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[13px] leading-5 text-ink-muted">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Shared control styling — also reused by raw inputs/selects in feature forms. */
export const CONTROL_CLASSES =
  "w-full rounded-[var(--radius-control)] border border-line bg-surface px-3.5 text-[15px] text-ink " +
  "placeholder:text-ink-muted/70 transition-colors duration-150 " +
  "hover:border-line-strong focus:border-pine focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
  "aria-[invalid=true]:border-clay aria-[invalid=true]:focus:border-clay disabled:bg-surface-muted disabled:text-ink-muted";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string;
  labelAside?: React.ReactNode;
  iconStart?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, labelAside, iconStart, required, className, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const describedBy = error || hint ? messageId : undefined;

  return (
    <FieldChrome
      label={label}
      error={error}
      hint={hint}
      required={required}
      labelAside={labelAside}
      htmlFor={inputId}
    >
      <div className="relative">
        {iconStart ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-ink-muted">
            {iconStart}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            CONTROL_CLASSES,
            "h-11",
            iconStart && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    </FieldChrome>
  );
});

/** Password input with a toggle that keeps focus in the field. */
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  function PasswordInput(
    { label, error, hint, required, className, id, labelAside, ...props },
    ref
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const messageId = `${inputId}-message`;
    const describedBy = error || hint ? messageId : undefined;
    const [visible, setVisible] = useState(false);

    return (
      <FieldChrome
        label={label}
        error={error}
        hint={hint}
        required={required}
        labelAside={labelAside}
        htmlFor={inputId}
      >
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(CONTROL_CLASSES, "h-11 pr-11", className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name={visible ? "eye-off" : "eye"} size={17} />
          </button>
        </div>
      </FieldChrome>
    );
  }
);

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | undefined;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, required, className, id, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const messageId = `${inputId}-message`;
    const describedBy = error || hint ? messageId : undefined;

    return (
      <FieldChrome
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={inputId}
      >
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(CONTROL_CLASSES, "min-h-28 resize-y py-2.5", className)}
          {...props}
        />
      </FieldChrome>
    );
  }
);
