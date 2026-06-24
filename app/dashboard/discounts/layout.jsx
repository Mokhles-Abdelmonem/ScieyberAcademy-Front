"use client";
import { PermissionGuard } from "@/components/PermissionGuard";
import { isAdmin } from "@/utils/permissions";
export default function DiscountsLayout({ children }) {
    return <PermissionGuard check={isAdmin}>{children}</PermissionGuard>;
}
