"use client";
import { PermissionGuard } from "@/components/PermissionGuard";
import { isInstructor } from "@/utils/permissions";
export default function StudentsLayout({ children }) {
    return <PermissionGuard check={isInstructor}>{children}</PermissionGuard>;
}
