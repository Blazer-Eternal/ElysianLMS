"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { useStudentDashboard } from "@/features/dashboards/queries";
import { useEnrollActions } from "@/features/courses/queries";
import { useToast } from "@/components/providers/toast-provider";
import { Button, ButtonBlock, ButtonLinkBlock } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProgressBar, Spinner } from "@/components/ui/primitives";
import { toApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/types/course";

/**
 * The single decision panel on a course page. Priority:
 * owner → enrolled → pending order → free enroll → paid checkout → guest.
 * Enrollment state is read from the student dashboard (identity-scoped,
 * already cached); a race is recovered by handling the server's 409.
 */
export function EnrollActions({ course }: { course: Course }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const { push } = useToast();

  const dashboard = useStudentDashboard(status === "authenticated");
  const actions = useEnrollActions(course.id);

  /* ------------------------------- guests ------------------------------- */
  if (status === "loading" || (user && dashboard.isLoading)) {
    return (
      <div className="flex h-44 items-center justify-center">
        <Spinner label="Checking access" />
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-6 text-ink-muted">
          Sign in to enroll, track progress, and take quizzes.
        </p>
        <ButtonLinkBlock
          href={`/login?next=${encodeURIComponent(`/courses/${course.id}`)}`}
          iconEnd="arrow-right"
        >
          Sign in to enroll
        </ButtonLinkBlock>
        <p className="text-center text-[13px] text-ink-muted">
          No account yet?{" "}
          <Link href="/register" className="text-pine hover:text-pine-deep">
            Create one
          </Link>
        </p>
      </div>
    );
  }

  /* -------------------------------- owner ------------------------------- */
  const isOwner = user.id === course.teacherId;
  if (isOwner) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Your course
        </p>
        <ButtonLinkBlock href={`/teaching/${course.id}`} iconEnd="arrow-right">
          Open in workspace
        </ButtonLinkBlock>
        <p className="text-[13px] leading-5 text-ink-muted">
          Edit content, manage staff, and submit status changes from the
          teaching workspace.
        </p>
      </div>
    );
  }

  /* ------------------------------- enrolled ----------------------------- */
  const enrolledCourse = dashboard.data?.courses.find((entry) => entry.id === course.id);
  if (enrolledCourse) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Enrolled
          </p>
          <p className="font-mono text-[11px] text-ink-muted">
            {enrolledCourse.completedLessons}/{enrolledCourse.totalLessons} lessons
          </p>
        </div>
        <ProgressBar value={enrolledCourse.percent} />
        <ButtonLinkBlock href={`/learn/${course.id}`} iconEnd="arrow-right">
          {enrolledCourse.percent >= 100
            ? "Review course"
            : enrolledCourse.percent > 0
              ? "Resume course"
              : "Start course"}
        </ButtonLinkBlock>
      </div>
    );
  }

  /* --------------------------- pending order ---------------------------- */
  const pendingOrder =
    dashboard.data?.pendingOrder?.course.id === course.id ? dashboard.data.pendingOrder : null;
  if (pendingOrder) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-(--radius-control) border border-amber/40 bg-amber-soft px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <Icon name="clock" size={15} className="text-amber" />
            Payment pending
          </p>
          <p className="mt-1 text-[13px] leading-5 text-ink-muted">
            Order #{pendingOrder.id} for {formatPrice(pendingOrder.amount)} is waiting
            for confirmation. Access unlocks the moment it is marked paid.
          </p>
        </div>
        <ButtonLinkBlock href="/orders" variant="secondary" iconEnd="arrow-right">
          Track this order
        </ButtonLinkBlock>
      </div>
    );
  }

  /* ------------------------------ free enroll --------------------------- */
  if (course.price === 0) {
    const busy = actions.enroll.isPending;
    return (
      <div className="flex flex-col gap-3">
        <ButtonBlock
          iconStart="plus"
          loading={busy}
          onClick={() =>
            actions.enroll.mutate(undefined, {
              onSuccess: () => {
                push("Enrolled. Welcome in.", "success");
                router.push(`/learn/${course.id}`);
              },
              onError: (error) => {
                const apiError = toApiError(error);
                if (apiError.status === 409) {
                  // Already enrolled (dashboard was stale): just open it.
                  router.push(`/learn/${course.id}`);
                  return;
                }
                push(apiError.message, "error");
              },
            })
          }
        >
          {busy ? "Enrolling" : "Enroll for free"}
        </ButtonBlock>
        <p className="text-center text-[13px] text-ink-muted">
          Opens instantly. No payment required.
        </p>
      </div>
    );
  }

  /* ------------------------------ paid checkout -------------------------- */
  const orderBusy = actions.createOrder.isPending;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        Pay once · {formatPrice(course.price)}
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          size="md"
          loading={orderBusy && actions.createOrder.variables === "esewa"}
          onClick={() => createOrder("esewa")}
          className="w-full"
        >
          eSewa
        </Button>
        <Button
          size="md"
          variant="secondary"
          loading={orderBusy && actions.createOrder.variables === "khalti"}
          onClick={() => createOrder("khalti")}
          className="w-full"
        >
          Khalti
        </Button>
      </div>

      <p className="text-[13px] leading-5 text-ink-muted">
        Creates a pending order for {formatPrice(course.price)}. This deployment
        confirms payments through an admin queue, and enrollment unlocks as
        soon as the order is marked paid.
      </p>
    </div>
  );

  function createOrder(gateway: "esewa" | "khalti") {
    actions.createOrder.mutate(gateway, {
      onSuccess: (order) => {
        push(`Order #${order.id} created. Awaiting confirmation.`, "success");
      },
      onError: (error) => {
        const apiError = toApiError(error);
        if (apiError.status === 409) {
          push("You are already enrolled in this course.", "info");
          return;
        }
        push(apiError.message, "error");
      },
    });
  }
}
