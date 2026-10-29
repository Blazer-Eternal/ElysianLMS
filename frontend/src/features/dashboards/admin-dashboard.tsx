"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminDashboard } from "@/features/dashboards/queries";
import {
  DashboardError,
  DashboardSkeleton,
  StatStrip,
} from "@/features/dashboards/dashboard-bits";
import { PageHeader } from "@/components/layout/page";
import { useToast } from "@/components/providers/toast-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { apiClient, toApiError } from "@/lib/api-client";
import { formatPrice, timeAgo } from "@/lib/utils";
import { ORDER_STATUS_TONE } from "@/constants/status";
import type { ApiEnvelope } from "@/types/api";
import type { OrderStatus } from "@/types/course";

export function AdminDashboard() {
  const query = useAdminDashboard();
  const { push } = useToast();
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "published" | "rejected" }) => {
      const response = await apiClient.patch<ApiEnvelope<unknown>>(`/course/${id}/status`, {
        status,
      });
      return response.data.message;
    },
    onSuccess: (message) => {
      push(message || "Course updated", "success");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher"] });
    },
    onError: (error) => push(toApiError(error).message, "error"),
  });

  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError || !query.data) {
    return <DashboardError error={query.error} onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const statusCounts = Object.entries(data.totals.coursesByStatus);
  const riskCount =
    data.riskFlags.emptyContentCourses.length + (data.riskFlags.paidOrdersWithoutEnrollment > 0 ? 1 : 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Users, revenue, the review queue, and anything that needs a human decision."
        actions={
          <>
            <ButtonLink href="/admin/orders" variant="secondary" iconEnd="arrow-right">
              Orders
            </ButtonLink>
            <ButtonLink href="/admin/users" variant="secondary" iconEnd="arrow-right">
              Users
            </ButtonLink>
          </>
        }
      />

      <StatStrip
        items={[
          {
            label: "Users",
            value: data.totals.users,
            note: `${data.growth.signups7d} new in 7 days`,
          },
          { label: "Courses", value: data.totals.courses, note: `${data.totals.coursesByStatus.published ?? 0} published` },
          { label: "Enrollments", value: data.totals.enrollments, note: `${data.growth.enrollments7d} new in 7 days` },
          { label: "Reviews", value: data.totals.reviews },
        ]}
      />

      <StatStrip
        items={[
          { label: "Paid", value: formatPrice(data.revenue.paid), note: `${data.ordersByStatus.paid?.count ?? 0} orders` },
          { label: "Net", value: formatPrice(data.revenue.net), note: "paid minus refunded" },
          { label: "Refunded", value: formatPrice(data.revenue.refunded) },
          { label: "Pending", value: formatPrice(data.revenue.pending), note: `${data.ordersByStatus.pending?.count ?? 0} awaiting confirm` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Review queue */}
          <Card>
            <CardHeader
              title="Course review queue"
              subtitle="Courses submitted for publication"
              action={
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                  {data.reviewQueue.length} waiting
                </span>
              }
            />
            <div className="px-5 sm:px-6">
              {data.reviewQueue.length === 0 ? (
                <EmptyState
                  icon="check"
                  title="Queue is clear"
                  description="Nothing is waiting for review right now."
                  className="my-4 border-solid"
                />
              ) : (
                <ul className="flex flex-col">
                  {data.reviewQueue.map((course) => (
                    <li
                      key={course.id}
                      className="flex flex-wrap items-center gap-4 border-t border-line py-4 first:border-t-0 first:pt-5"
                    >
                      <div className="min-w-0 flex-1 basis-64">
                        <Link
                          href={`/courses/${course.id}`}
                          className="link-underline font-display text-[17px] font-semibold text-ink"
                        >
                          {course.title}
                        </Link>
                        <p className="mt-0.5 text-[13px] text-ink-muted">
                          {course.teacherName} · {course.sections} sections · {course.lessons}{" "}
                          lessons · {formatPrice(course.price)} · updated {timeAgo(course.updatedAt)}
                        </p>
                        {!course.publishReady ? (
                          <p className="mt-1 flex items-center gap-1 text-[13px] text-amber">
                            <Icon name="alert" size={13} />
                            Missing content: needs at least one section with a lesson
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          iconStart="check"
                          loading={
                            reviewMutation.isPending &&
                            reviewMutation.variables?.id === course.id &&
                            reviewMutation.variables.status === "published"
                          }
                          onClick={() => reviewMutation.mutate({ id: course.id, status: "published" })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={
                            reviewMutation.isPending &&
                            reviewMutation.variables?.id === course.id &&
                            reviewMutation.variables.status === "rejected"
                          }
                          onClick={() => reviewMutation.mutate({ id: course.id, status: "rejected" })}
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Latest orders */}
          <Card>
            <CardHeader
              title="Latest orders"
              subtitle="Newest first"
              action={
                <Link href="/admin/orders" className="text-sm text-pine hover:text-pine-deep">
                  Manage orders
                </Link>
              }
            />
            <div className="px-5 sm:px-6">
              {data.latestOrders.length === 0 ? (
                <p className="py-6 text-sm text-ink-muted">No orders yet.</p>
              ) : (
                <ul className="flex flex-col">
                  {data.latestOrders.slice(0, 6).map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line py-3 first:border-t-0 first:pt-4"
                    >
                      <span className="font-mono text-sm text-ink-muted">#{order.id}</span>
                      <span className="min-w-0 flex-1 basis-40 truncate text-sm text-ink">
                        {order.userName}
                        <span className="text-ink-muted"> · {order.courseTitle}</span>
                      </span>
                      <span className="font-mono text-sm tabular-nums text-ink">
                        {formatPrice(order.amount)}
                      </span>
                      <Badge tone={ORDER_STATUS_TONE[order.status as OrderStatus] ?? "neutral"}>{order.status}</Badge>
                      <span className="w-20 text-right font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                        {timeAgo(order.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Risk flags */}
          {riskCount > 0 ? (
            <div className="rounded-card border border-amber/40 bg-amber-soft px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Icon name="alert" size={16} className="text-amber" />
                Needs attention
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-ink">
                {data.riskFlags.paidOrdersWithoutEnrollment > 0 ? (
                  <li className="flex items-baseline gap-2">
                    <span className="font-mono text-amber">
                      {data.riskFlags.paidOrdersWithoutEnrollment}
                    </span>
                    paid orders without an enrollment (reconcile manually)
                  </li>
                ) : null}
                {data.riskFlags.emptyContentCourses.map((course) => (
                  <li key={course.id} className="flex items-baseline gap-2">
                    <span className="font-mono text-amber">1</span>
                    <Link href={`/courses/${course.id}`} className="link-underline">
                      {course.title}
                    </Link>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                      {course.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-card border border-pine/35 bg-pine-soft px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Icon name="check" size={16} className="text-pine" />
                Nothing flagged
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                No empty published courses, no paid orders missing enrollments.
              </p>
            </div>
          )}

          {/* Courses by status */}
          <Card>
            <CardHeader title="Courses by status" />
            <div className="px-5 sm:px-6">
              <ul className="flex flex-col">
                {statusCounts.map(([status, count]) => (
                  <li
                    key={status}
                    className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0 first:pt-4"
                  >
                    <Badge tone={ORDER_STATUS_TONE[status as OrderStatus] ?? "neutral"}>{status}</Badge>
                    <span className="font-mono text-sm tabular-nums text-ink">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Latest users */}
          <Card>
            <CardHeader
              title="Latest users"
              action={
                <Link href="/admin/users" className="text-sm text-pine hover:text-pine-deep">
                  All users
                </Link>
              }
            />
            <div className="px-5 sm:px-6">
              {data.latestUsers.length === 0 ? (
                <p className="py-6 text-sm text-ink-muted">No users yet.</p>
              ) : (
                <ul className="flex flex-col">
                  {data.latestUsers.slice(0, 6).map((account) => (
                    <li
                      key={account.id}
                      className="flex items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-4"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {account.name}
                        </span>
                        <span className="block truncate text-[13px] text-ink-muted">
                          {account.email}
                        </span>
                      </span>
                      <Badge tone={account.role === "admin" ? "info" : "neutral"}>
                        {account.role}
                      </Badge>
                      <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                        {timeAgo(account.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

