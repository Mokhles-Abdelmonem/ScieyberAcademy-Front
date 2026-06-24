"use client";
import { PermissionGuard } from "@/components/PermissionGuard";
import { isInstructor } from "@/utils/permissions";
export default function BatchesLayout({ children }) {
    return <PermissionGuard check={isInstructor}>{children}</PermissionGuard>;
}
