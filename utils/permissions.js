/**
 * Centralised permission predicates.
 * All functions accept the current user object from UserContext.
 *
 * Two orthogonal axes:
 *   user.role      → SUPER_ADMIN | ADMIN | STAFF | CLIENT
 *   user.user_type → STAFF | STUDENT | INSTRUCTOR | PARENT
 */

export const isAdmin      = (u) => u?.role === "ADMIN"       || u?.role === "SUPER_ADMIN";
export const isSuperAdmin = (u) => u?.role === "SUPER_ADMIN";
export const isInstructor = (u) => u?.user_type === "INSTRUCTOR" || isAdmin(u);
export const isStudent    = (u) => u?.user_type === "STUDENT";
