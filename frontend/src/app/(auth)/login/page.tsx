"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError } from "@/types/api";
import { ButtonBlock } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/primitives";
import { safeInternalPath } from "@/lib/utils";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

/** Map server rejections onto the form: fields first, then one alert. */
function applyLoginError(
  error: unknown,
  setAlert: (message: string) => void
): Partial<keyof LoginForm> | undefined {
  if (error instanceof ApiError) {
    if (error.isRateLimited) {
      setAlert("Too many attempts. Wait a moment, then try again.");
      return undefined;
    }
    if (error.status === 401 || error.status === 404) {
      setAlert("Email or password is incorrect.");
      return undefined;
    }
    if (error.status === 403) {
      setAlert(error.message);
      return undefined;
    }
    const fields = error.fieldErrors;
    if (fields.email) return "email";
    if (fields.password) return "password";
    setAlert(error.message);
    return undefined;
  }
  setAlert("Could not reach the server. Check your connection and try again.");
  return undefined;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [alert, setAlert] = useState("");

  const nextPath = safeInternalPath(searchParams.get("next")) ?? "/dashboard";
  const registered = searchParams.get("registered") === "1";
  const reset = searchParams.get("reset") === "1";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAlert("");
    try {
      await login(values.email, values.password);
      router.replace(nextPath);
    } catch (error) {
      const field = applyLoginError(error, setAlert);
      if (field) setError(field, { message: "Check this field" });
    }
  });

  return (
    <div>
      <p className="label">Sign in</p>
      <h1 className="mt-2 font-display text-[2.1rem] font-semibold text-ink">Welcome back</h1>
      <p className="mt-2.5 text-[15px] leading-6 text-ink-muted">
        Use the email you registered with. Sessions last seven days and can be
        revoked from any device by signing out.
      </p>

      {registered ? (
        <p
          role="status"
          className="mt-5 rounded-(--radius-control) border border-pine/35 bg-pine-soft px-3.5 py-2.5 text-sm text-pine"
        >
          Account created. Sign in to continue.
        </p>
      ) : null}

      {reset ? (
        <p
          role="status"
          className="mt-5 rounded-(--radius-control) border border-pine/35 bg-pine-soft px-3.5 py-2.5 text-sm text-pine"
        >
          Password updated. Sign in with your new password.
        </p>
      ) : null}

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

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          labelAside={
            <Link
              href="/forgot-password"
              className="text-[13px] text-pine transition-colors hover:text-pine-deep"
            >
              Forgot password?
            </Link>
          }
          {...register("password")}
        />

        <ButtonBlock type="submit" loading={isSubmitting} className="mt-2">
          {isSubmitting ? "Signing in" : "Sign in"}
        </ButtonBlock>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Elysian?{" "}
        <Link
          href="/register"
          className="link-underline font-medium text-pine hover:text-pine-deep"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
