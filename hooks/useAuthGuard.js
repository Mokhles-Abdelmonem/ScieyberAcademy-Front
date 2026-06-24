"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/**
 * Redirect unauthenticated users to /login once the auth state is resolved.
 *
 * Usage in any protected layout or page:
 *   const { user, loading } = useAuthGuard();
 *   if (loading) return <FullPageSpinner />;
 *
 * Returns { user, loading } so the caller can still render a loading state
 * before the redirect fires.
 */
export function useAuthGuard({ redirectTo = "/login" } = {}) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace(redirectTo);
        }
    }, [loading, user, router, redirectTo]);

    return { user, loading };
}

/**
 * Redirect already-authenticated users away from guest-only pages (login, register).
 *
 * Usage in login/register:
 *   const { ready } = useGuestGuard();
 *   if (!ready) return null;   // prevent flash of the auth form
 *
 * Returns { ready } — true once we know the user is NOT logged in.
 */
export function useGuestGuard({ redirectTo = "/dashboard" } = {}) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace(redirectTo);
        }
    }, [loading, user, router, redirectTo]);

    // "ready" means: finished loading AND confirmed no user
    const ready = !loading && !user;
    return { ready };
}
