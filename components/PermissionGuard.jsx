"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/**
 * Drop-in layout wrapper that enforces role-based access.
 *
 * The parent dashboard layout already guarantees the user is authenticated,
 * so this component only needs to verify that the role/type check passes.
 * If it fails it redirects to /dashboard (the safe fallback for all roles).
 *
 * Usage in any sub-layout:
 *   import { PermissionGuard } from "@/components/PermissionGuard";
 *   import { isAdmin } from "@/utils/permissions";
 *   export default function Layout({ children }) {
 *       return <PermissionGuard check={isAdmin}>{children}</PermissionGuard>;
 *   }
 */
export function PermissionGuard({ check, children }) {
    const { user } = useUser();
    const router   = useRouter();

    const allowed = user && check(user);

    useEffect(() => {
        if (user && !check(user)) {
            router.replace("/dashboard");
        }
    }, [user, check, router]);

    if (!allowed) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return children;
}
