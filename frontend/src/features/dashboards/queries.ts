"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api-client";
import type {
  AdminDashboard,
  StudentDashboard,
  TeacherDashboard,
} from "@/types/dashboard";

export function useStudentDashboard(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: () =>
      getData<StudentDashboard>({ method: "GET", url: "/dashboard/student" }),
    enabled,
  });
}

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["dashboard", "teacher"],
    queryFn: () =>
      getData<TeacherDashboard>({ method: "GET", url: "/dashboard/teacher" }),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: () => getData<AdminDashboard>({ method: "GET", url: "/dashboard/admin" }),
  });
}
