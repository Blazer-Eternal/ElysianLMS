"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/auth-provider";
import { changePassword } from "@/features/auth/auth-service";
import { ApiError } from "@/types/api";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ButtonBlock } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/primitives";

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or fewer"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.next === values.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })
  .refine((values) => values.current !== values.next, {
    message: "The new password must differ from the current one",
    path: ["next"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [alert, setAlert] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAlert("");
    try {
      await changePassword(values.current, values.next);
      // Backend revoked every session for this user as part of the change.
      await logout();
      router.replace("/login?reset=1");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isRateLimited) {
          setAlert("Too many attempts. Wait a moment, then try again.");
          return;
        }
        if (error.status === 401 || error.status === 403) {
          setError("current", { message: "Current password is incorrect" });
          return;
        }
        const fields = error.fieldErrors;
        if (fields.current) return setError("current", { message: fields.current });
        if (fields.newPassword) return setError("next", { message: fields.newPassword });
        setAlert(error.message);
        return;
      }
      setAlert("Could not reach the server. Check your connection and try again.");
    }

    reset();
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Appearance and security. Everything here applies immediately."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Security */}
        <Card>
          <CardHeader
            title="Change password"
            subtitle="Changing it signs you out everywhere, on every device"
          />
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-1 px-5 py-5 sm:px-6">
            <FormAlert message={alert} />

            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              placeholder="Your current password"
              error={errors.current?.message}
              {...register("current")}
            />
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hint="8 to 72 characters."
              error={errors.next?.message}
              {...register("next")}
            />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              placeholder="Repeat the new password"
              error={errors.confirm?.message}
              {...register("confirm")}
            />

            <ButtonBlock type="submit" loading={isSubmitting} className="mt-1">
              {isSubmitting ? "Updating password" : "Update password"}
            </ButtonBlock>
          </form>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Appearance */}
          <Card>
            <CardHeader
              title="Appearance"
              subtitle="System follows your device setting"
            />
            <div className="px-5 py-5 sm:px-6">
              <ThemeToggle />
              <p className="mt-4 text-sm leading-6 text-ink-muted">
                The theme is stored on this device only and applies before
                the first frame renders, so nothing flashes on reload.
              </p>
            </div>
          </Card>

          {/* Session facts */}
          <Card>
            <CardHeader title="How sessions work" />
            <div className="px-5 py-5 sm:px-6">
              <ul className="flex flex-col gap-3 text-sm leading-6 text-ink-muted">
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-pine">15m</span>
                  access tokens renew silently in the background.
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-pine">7d</span>
                  refresh tokens rotate on every use; a reused one is rejected.
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-pine">0</span>
                  password recovery links are single-use and expire on their own.
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
