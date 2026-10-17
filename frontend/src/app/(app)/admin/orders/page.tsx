"use client";

import { useState, type FormEvent } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Badge, EmptyState, ErrorState, Skeleton } from "@/components/ui/primitives";
import { ConfirmAction } from "@/features/teaching/confirm";
import { AdminGate } from "@/features/admin/admin-gate";
import { useAdminOrders } from "@/features/admin/queries";
import { useOrderMutations } from "@/features/admin/mutations";
import { toApiError } from "@/lib/api-client";
import { cn, formatPrice, timeAgo } from "@/lib/utils";
import type { OrderStatus } from "@/types/course";

const STATUSES: Array<{ key: OrderStatus; label: string; hint: string }> = [
  {
    key: "pending",
    label: "Pending",
    hint: "Awaiting reconciliation — match the payment in eSewa/Khalti first, then confirm with its transaction id.",
  },
  {
    key: "paid",
    label: "Paid",
    hint: "Settled orders. A refund here reverses the payment; the decision belongs to you.",
  },
  {
    key: "failed",
    label: "Failed",
    hint: "Declared unpaid. Students can retry from their orders page.",
  },
  {
    key: "refunded",
    label: "Refunded",
    hint: "Closed: money returned to the student.",
  },
];

/**
 * Reconciliation queue. Gateway webhooks don't exist yet, so the three
 * money buttons (confirm / fail / refund) live here, admin only, with
 * two-step confirmation on the destructive pair.
 */
export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus>("pending");
  const query = useAdminOrders(status);
  const mutations = useOrderMutations();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const activeHint = STATUSES.find((item) => item.key === status)?.hint ?? "";

  const confirmPayment = (event: FormEvent<HTMLFormElement>, orderId: number) => {
    event.preventDefault();
    const transactionId = String(
      new FormData(event.currentTarget).get("transactionId") ?? ""
    ).trim();
    mutations.confirm.mutate(
      { id: orderId, ...(transactionId ? { transactionId } : {}) },
      { onSuccess: () => setExpandedId(null) }
    );
  };

  return (
    <PageContainer>
      <AdminGate>
        <PageHeader
          eyebrow="Admin"
          title="Orders"
          description="Payments settle manually until gateway webhooks exist. Every action below is recorded on the order."
        />

        {/* Status tabs */}
        <div
          className="mt-6 flex w-fit flex-wrap gap-1 rounded-(--radius-control) border border-line bg-surface p-1"
          role="group"
          aria-label="Order status"
        >
          {STATUSES.map((item) => {
            const active = item.key === status;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setStatus(item.key);
                  setExpandedId(null);
                }}
                className={cn(
                  "h-8 rounded-(--radius-control) px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-pine text-paper"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">{activeHint}</p>

        {/* Queue */}
        {query.isLoading ? (
          <div className="mt-6 flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : query.isError || !query.data ? (
          <div className="mt-6">
            <ErrorState
              title={
                toApiError(query.error).status === 403 ? "Admins only" : "Orders unavailable"
              }
              description={toApiError(query.error).message}
              action={
                <button
                  type="button"
                  onClick={() => query.refetch()}
                  className="link-underline text-sm text-pine"
                >
                  Try again
                </button>
              }
            />
          </div>
        ) : query.data.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon="inbox"
              title={`No ${status} orders`}
              description="Nothing needs attention in this queue right now."
            />
          </div>
        ) : (
          <ul className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
            {query.data.map((order, index) => (
              <li
                key={order.id}
                className={cn("px-4 py-4 sm:px-5", index > 0 && "border-t border-line")}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                  <span className="font-mono text-[11px] text-ink-muted">#{order.id}</span>

                  <span className="min-w-0 flex-1 basis-52">
                    <span className="block truncate text-sm font-medium text-ink">
                      {order.course.title}
                    </span>
                    <span className="block truncate text-[13px] text-ink-muted">
                      {order.user.name} · {order.user.email}
                    </span>
                  </span>

                  <span className="font-mono text-sm tabular-nums text-ink">
                    {formatPrice(order.amount)}
                  </span>

                  <Badge tone="neutral">{order.gateway}</Badge>

                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                    {timeAgo(order.createdAt)}
                  </span>

                  <span className="hidden max-w-40 truncate font-mono text-[11px] text-ink-muted sm:block" title={order.transactionId ?? undefined}>
                    {order.transactionId ?? "no txn id"}
                  </span>

                  {/* Actions by state */}
                  <span className="flex items-center gap-1.5">
                    {order.status === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          iconStart="check"
                          onClick={() =>
                            setExpandedId((current) => (current === order.id ? null : order.id))
                          }
                        >
                          Confirm payment
                        </Button>
                        <ConfirmAction
                          label="Fail"
                          confirmLabel="Mark failed"
                          icon="close"
                          onConfirm={() => mutations.fail.mutateAsync(order.id)}
                        />
                      </>
                    ) : order.status === "paid" ? (
                      <ConfirmAction
                        label="Refund"
                        confirmLabel="Confirm refund"
                        icon="refresh"
                        onConfirm={() => mutations.refund.mutateAsync(order.id)}
                      />
                    ) : (
                      <span className="text-[13px] text-ink-muted">
                        {order.status === "failed" ? "closed · may retry" : "closed"}
                      </span>
                    )}
                  </span>
                </div>

                {/* Inline confirm with optional transaction id */}
                {order.status === "pending" && expandedId === order.id ? (
                  <form
                    onSubmit={(event) => confirmPayment(event, order.id)}
                    className="mt-3 flex flex-wrap items-end gap-3 rounded-(--radius-control) bg-surface-muted/70 px-4 py-3.5"
                  >
                    <div className="w-64">
                      <Input
                        label="Transaction id (optional)"
                        name="transactionId"
                        placeholder="e.g. 7Y2K9PQ4"
                        hint="Copy it from the gateway statement for the audit trail."
                      />
                    </div>
                    <div className="flex gap-2 pb-6">
                      <Button
                        type="submit"
                        size="sm"
                        loading={mutations.confirm.isPending}
                      >
                        Confirm payment
                      </Button>
                      <Button
                        type="button"
                        variant="quiet"
                        size="sm"
                        onClick={() => setExpandedId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </AdminGate>
    </PageContainer>
  );
}
