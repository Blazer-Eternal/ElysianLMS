"use client";

import { useAuth } from "@/features/auth/auth-provider";
import { StudentDashboard } from "@/features/dashboards/student-dashboard";
import { TeacherDashboard } from "@/features/dashboards/teacher-dashboard";
import { AdminDashboard } from "@/features/dashboards/admin-dashboard";
import { DashboardSkeleton } from "@/features/dashboards/dashboard-bits";
import { PageContainer } from "@/components/layout/page";

/**
 * Role-aware entry point. Guard in the layout guarantees a user; this
 * only picks the view that matches the account's identity.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <DashboardSkeleton />;

  return (
    <PageContainer>
      {user.role === "admin" ? (
        <AdminDashboard />
      ) : user.role === "teacher" ? (
        <TeacherDashboard />
      ) : (
        <StudentDashboard />
      )}
    </PageContainer>
  );
}
