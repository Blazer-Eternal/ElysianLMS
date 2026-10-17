"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api-client";
import type { MyOrder } from "@/types/course";

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => getData<MyOrder[]>({ method: "GET", url: "/order/mine" }),
  });
}
