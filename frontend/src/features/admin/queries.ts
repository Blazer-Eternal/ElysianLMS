"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api-client";
import type { AdminOrder, AdminUser } from "@/types/admin";
import type { OrderStatus } from "@/types/course";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getData<AdminUser[]>({ method: "GET", url: "/user" }),
    retry: false,
  });
}

export function useAdminOrders(status: OrderStatus) {
  return useQuery({
    queryKey: ["admin-orders", status],
    queryFn: () => getData<AdminOrder[]>({ method: "GET", url: `/order?status=${status}` }),
    retry: false,
  });
}
