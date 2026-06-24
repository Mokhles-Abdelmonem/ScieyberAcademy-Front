"use client";
import { PermissionGuard } from "@/components/PermissionGuard";
import { isStudent } from "@/utils/permissions";
export default function EnrollmentsLayout({ children }) {
    return <PermissionGuard check={isStudent}>{children}</PermissionGuard>;
}
