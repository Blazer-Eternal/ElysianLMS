"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPassword } from "@/features/auth/auth-service";
import { ApiError } from "@/types/api";
import { ButtonBlock } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/primitives";

const forgotSchema = z.object({
  email: z.email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [alert, setAlert] = useState("");
  // Development-only payload: the backend echoes the reset link while no
  // email provider is configured. Production responses never carry it.
  const [devLink, setDevLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAlert("");
    try {
      const data = await forgotPassword(values.email);
      setSubmitted(values.email);

      if (data?.devResetToken) {
        setDevLink(`/reset-password?token=${encodeURIComponent(data.devResetToken)}`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isRateLimited) {
          setAlert("Too many attempts. Wait a moment, then try again.");
          return;
        }
        if (error.fieldErrors.email) {
          setAlert(error.fieldErrors.email);
          return;
        }
        // For everything else stay generic: never reveal account existence.
        setAlert(error.message);
        return;
      }
      setAlert("Could not reach the server. Check your connection and try again.");
    }
  });

  if (submitted) {
    return (
      <div>
        <p className="label">Reset password</p>
        <h1 className="mt-2 font-display text-[2.1rem] font-semibold text-ink">
          Check your inbox
        </h1>

        <div className="mt-6 rounded-card border border-line bg-surface px-5 py-5">
          <p className="text-[15px] leading-6 text-ink">
            If an account exists for <span className="font-medium">{submitted}</span>,
            reset instructions are on their way. The link expires shortly and
            can only be used once.
          </p>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Didn’t get it? Check spam, then request another link.
          </p>
        </div>

        {devLink ? (
          <div className="mt-4 rounded-(--radius-control) border border-amber/40 bg-amber-soft px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
              Development mode
            </p>
            <p className="mt-1 text-sm text-ink">
              No email provider is configured, so the link was echoed here.
            </p>
            <Link
              href={devLink}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-pine hover:text-pine-deep"
            >
              Open the reset link
            </Link>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <button
            type="button"
            onClick={() => {
              setSubmitted(null);
              setDevLink(null);
            }}
            className="link-underline text-pine hover:text-pine-deep"
          >
            Use a different email
          </button>
          <Link href="/login" className="link-underline text-ink-muted hover:text-ink">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="label">Reset password</p>
      <h1 className="mt-2 font-display text-[2.1rem] font-semibold text-ink">
        Forgot your password?
      </h1>
      <p className="mt-2.5 text-[15px] leading-6 text-ink-muted">
        Enter your account email. We’ll send a single-use link that expires on
        its own.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-1">
        <FormAlert message={alert} />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <ButtonBlock type="submit" loading={isSubmitting} className="mt-2">
          {isSubmitting ? "Sending link" : "Send reset link"}
        </ButtonBlock>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="link-underline font-medium text-pine hover:text-pine-deep"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
