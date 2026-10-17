"use client";

import Link from "next/link";
import { useMyOrders } from "@/features/orders/queries";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge, EmptyState, LoadingBlock } from "@/components/ui/primitives";
import { Thumb } from "@/components/ui/thumb";
import { ApiError } from "@/types/api";
import type { MyOrder, OrderStatus } from "@/types/course";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS_TONE } from "@/constants/status";

/** Per-status explanation so nobody has to guess what a state means. */
const STATUS_HINT: Record<OrderStatus, string> = {
  pending: "Payment not confirmed yet. An admin marks it paid from the orders queue once the gateway clears it.",
  paid: "Confirmed and your enrollment is active.",
  failed: "This payment did not go through. Create a fresh order from the course page.",
  refunded: "The payment was returned and the enrollment was revoked. Progress and attempts are kept.",
};

export default function OrdersPage() {
  const query = useMyOrders();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title="Orders"
        description="Payments for paid courses. Free enrollments never create an order."
      />

      <div className="mt-8">
        {query.isLoading ? (
          <LoadingBlock label="Loading orders" />
        ) : query.isError ? (
          <EmptyState
            icon="alert"
            title="Orders unavailable"
            description={
              query.error instanceof ApiError
                ? query.error.message
                : "Something went wrong while loading your orders."
            }
            action={
              <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
                Try again
              </Button>
            }
          />
        ) : !query.data || query.data.length === 0 ? (
          <EmptyState
            icon="bag"
            title="No orders yet"
            description="Paid courses create an order at checkout; free courses skip that step entirely."
            action={
              <ButtonLink href="/courses" size="sm" iconEnd="arrow-right">
                Browse the catalog
              </ButtonLink>
            }
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {query.data.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}

function OrderCard({ order }: { order: MyOrder }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-4 px-5 py-5 sm:px-6">
        <Thumb url={order.course.thumbnailUrl} title={order.course.title} />

        <div className="min-w-0 flex-1 basis-56">
          <Link
            href={`/courses/${order.courseId}`}
            className="link-underline font-display text-[17px] font-semibold text-ink"
          >
            {order.course.title}
          </Link>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            order #{order.id} · {order.gateway} · {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-lg tabular-nums text-ink">
            {formatPrice(order.amount)}
          </span>
          <Badge tone={ORDER_STATUS_TONE[order.status]}>{order.status}</Badge>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 sm:px-6",
          order.status === "pending" && "bg-amber-soft",
          order.status === "failed" && "bg-clay-soft",
          order.status === "paid" && "bg-pine-soft"
        )}
      >
        <p className="flex items-start gap-2 text-[13px] leading-5 text-ink">
          {order.status === "pending" ? (
            <Icon name="clock" size={15} className="mt-0.5 shrink-0 text-amber" />
          ) : order.status === "failed" ? (
            <Icon name="close" size={15} className="mt-0.5 shrink-0 text-clay" />
          ) : order.status === "paid" ? (
            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-pine" />
          ) : (
            <Icon name="refresh" size={15} className="mt-0.5 shrink-0 text-ink-muted" />
          )}
          {STATUS_HINT[order.status]}
          {order.paidAt ? ` Paid ${formatDate(order.paidAt)}.` : ""}
          {order.refundedAt ? ` Refunded ${formatDate(order.refundedAt)}.` : ""}
        </p>

        {order.status === "paid" ? (
          <ButtonLink href={`/learn/${order.courseId}`} size="sm" iconEnd="arrow-right">
            Go to course
          </ButtonLink>
        ) : order.status === "failed" ? (
          <ButtonLink href={`/courses/${order.courseId}`} variant="secondary" size="sm">
            Open course page
          </ButtonLink>
        ) : null}
      </div>
    </Card>
  );
}
