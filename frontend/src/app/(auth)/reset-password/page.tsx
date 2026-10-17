"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword } from "@/features/auth/auth-service";
import { ApiError } from "@/types/api";
import { ButtonBlock, ButtonLink } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/field";
import { FormAlert, LoadingBlock } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or fewer"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Checking link" />}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [alert, setAlert] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAlert("");
    try {
      await resetPassword(token, values.password);
      router.replace("/login?reset=1");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isRateLimited) {
          setAlert("Too many attempts. Wait a moment, then try again.");
          return;
        }
        if (error.status === 400 || error.status === 404 || error.status === 410) {
          setAlert("This reset link is invalid or has expired. Request a new one.");
          return;
        }
        const fields = error.fieldErrors;
        if (fields.newPassword) {
          setAlert(fields.newPassword);
          return;
        }
        setAlert(error.message);
        return;
      }
      setAlert("Could not reach the server. Check your connection and try again.");
    }
  });

  if (!token) {
    return (
      <InvalidLinkState
        title="This link is incomplete"
        description="The reset URL is missing its token. Request a fresh link and open it directly."
      />
    );
  }

  return (
    <div>
      <p className="label">Reset password</p>
      <h1 className="mt-2 font-display text-[2.1rem] font-semibold text-ink">
        Choose a new password
      </h1>
      <p className="mt-2.5 text-[15px] leading-6 text-ink-muted">
        This link works once. After saving, every existing session is signed
        out, including this one.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-1">
        <FormAlert message={alert} />

        <PasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="8 to 72 characters."
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Repeat the new password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />

        <ButtonBlock type="submit" loading={isSubmitting} className="mt-2">
          {isSubmitting ? "Saving password" : "Save new password"}
        </ButtonBlock>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/forgot-password" className="link-underline text-pine hover:text-pine-deep">
          Request a new link
        </Link>
      </p>
    </div>
  );
}

function InvalidLinkState({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-full bg-clay-soft text-clay">
        <Icon name="lock" size={20} />
      </span>
      <h1 className="mt-4 font-display text-[2.1rem] font-semibold text-ink">{title}</h1>
      <p className="mt-2.5 text-[15px] leading-6 text-ink-muted">{description}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/forgot-password">Request a new link</ButtonLink>
        <ButtonLink href="/login" variant="secondary">
          Back to sign in
        </ButtonLink>
      </div>
    </div>
  );
}
