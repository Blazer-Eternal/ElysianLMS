"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendVoid, toApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast-provider";
import type { Role } from "@/types/auth";

function useNotifyError() {
  const { push } = useToast();
  return (error: unknown) => push(toApiError(error).message, "error");
}

/* --------------------------------- users --------------------------------- */

export function useUserMutations() {
  const queryClient = useQueryClient();
  const onError = useNotifyError();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const assignRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) =>
      sendVoid({ method: "PATCH", url: `/user/${id}/role`, data: { role } }),
    onSuccess: invalidate,
    onError,
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => sendVoid({ method: "DELETE", url: `/user/${id}` }),
    onSuccess: invalidate,
    onError,
  });

  return { assignRole, deleteUser };
}

/* --------------------------------- orders --------------------------------- */

export function useOrderMutations() {
  const queryClient = useQueryClient();
  const onError = useNotifyError();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["courses", "mine"] });
    queryClient.invalidateQueries({ queryKey: ["enrollments"] });
  };

  // Every state change carries an audit note; the gateway webhooks that
  // would normally supply this do not exist yet.
  const audit = { source: "admin-console" };

  const confirm = useMutation({
    mutationFn: ({ id, transactionId }: { id: number; transactionId?: string }) =>
      sendVoid({
        method: "PATCH",
        url: `/order/${id}/confirm`,
        data: { gatewayResponse: audit, ...(transactionId ? { transactionId } : {}) },
      }),
    onSuccess: invalidate,
    onError,
  });

  const fail = useMutation({
    mutationFn: (id: number) =>
      sendVoid({
        method: "PATCH",
        url: `/order/${id}/fail`,
        data: { gatewayResponse: audit },
      }),
    onSuccess: invalidate,
    onError,
  });

  const refund = useMutation({
    mutationFn: (id: number) =>
      sendVoid({
        method: "PATCH",
        url: `/order/${id}/refund`,
        data: { gatewayResponse: audit },
      }),
    onSuccess: invalidate,
    onError,
  });

  return { confirm, fail, refund };
}

/* ------------------------------- categories ------------------------------- */

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const onError = useNotifyError();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
    queryClient.invalidateQueries({ queryKey: ["course"] });
  };

  const createCategory = useMutation({
    mutationFn: (data: { name: string; slug?: string }) =>
      sendVoid({ method: "POST", url: "/category", data }),
    onSuccess: invalidate,
    onError,
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; slug?: string } }) =>
      sendVoid({ method: "PATCH", url: `/category/${id}`, data }),
    onSuccess: invalidate,
    onError,
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => sendVoid({ method: "DELETE", url: `/category/${id}` }),
    onSuccess: invalidate,
    onError,
  });

  return { createCategory, updateCategory, deleteCategory };
}
