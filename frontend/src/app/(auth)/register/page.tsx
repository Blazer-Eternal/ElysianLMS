"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError } from "@/types/api";
import { ButtonBlock } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/primitives";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be 100 characters or fewer"),
    email: z.email("Enter a valid email address"),
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

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const router = useRouter();
  const [alert, setAlert] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAlert("");
    try {
      await signUp({
        name: values.name.trim(),
        email: values.email,
        password: values.password,
      });
      router.replace("/login?registered=1");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isRateLimited) {
          setAlert("Too many attempts. Wait a moment, then try again.");
          return;
        }
        if (error.status === 409) {
          // Unique-constraint rejection: the email is already registered.
          setError("email", { message: "An account with this email already exists" });
          return;
        }
        const fields = error.fieldErrors;
        if (fields.name) return setError("name", { message: fields.name });
        if (fields.email) return setError("email", { message: fields.email });
        if (fields.password) return setError("password", { message: fields.password });
        setAlert(error.message);
        return;
      }
      setAlert("Could not reach the server. Check your connection and try again.");
    }
  });

  return (
    <div>
      <p className="label">Create account</p>
      <h1 className="mt-2 font-display text-[2.1rem] font-semibold text-ink">
        Start learning
      </h1>
      <p className="mt-2.5 text-[15px] leading-6 text-ink-muted">
        New accounts begin as students. Teachers can be granted authoring
        access later.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-1">
        <FormAlert message={alert} />

        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          error={errors.name?.message}
          {...register("name")}
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="8 to 72 characters."
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />

        <ButtonBlock type="submit" loading={isSubmitting} className="mt-2">
          {isSubmitting ? "Creating account" : "Create account"}
        </ButtonBlock>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="link-underline font-medium text-pine hover:text-pine-deep"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
