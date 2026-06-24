"use client";
import { PermissionGuard } from "@/components/PermissionGuard";
import { isSuperAdmin } from "@/utils/permissions";
export default function ContactInfoLayout({ children }) {
    return <PermissionGuard check={isSuperAdmin}>{children}</PermissionGuard>;
}
