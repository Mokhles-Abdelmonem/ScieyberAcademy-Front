"use client";
import { PermissionGuard } from "@/components/PermissionGuard";
import { isAdmin } from "@/utils/permissions";
export default function UsersLayout({ children }) {
    return <PermissionGuard check={isAdmin}>{children}</PermissionGuard>;
}
