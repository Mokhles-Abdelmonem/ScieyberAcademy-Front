/**
 * Token storage utilities.
 *
 * Strategy:
 *   - Access token  → sessionStorage (cleared when tab closes; short-lived anyway)
 *   - Refresh token → localStorage   (persists across tabs/restarts for silent renewal)
 *
 * Never decode tokens for authorization logic on the client — that is the
 * backend's job. We only peek at `exp` to know when to attempt a silent refresh.
 */

const ACCESS_KEY  = "sa_access";
const REFRESH_KEY = "sa_refresh";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Storage ────────────────────────────────────────────────────────────────────

export function saveTokens(accessToken, refreshToken) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken() {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

// ── Token inspection (no crypto — client-side only for UX hints) ───────────────

function _decodePayload(token) {
    try {
        const [, body] = token.split(".");
        const padding = "=".repeat((4 - (body.length % 4)) % 4);
        return JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/") + padding));
    } catch {
        return null;
    }
}

export function isTokenExpired(token) {
    const payload = _decodePayload(token);
    if (!payload?.exp) return true;
    return Date.now() / 1000 >= payload.exp;
}

export function isAuthenticated() {
    const access = getAccessToken();
    return !!access && !isTokenExpired(access);
}

// ── Silent refresh ─────────────────────────────────────────────────────────────

/**
 * Try to get a valid access token:
 *   1. Return the current one if it is still valid.
 *   2. Attempt a silent refresh using the stored refresh token.
 *   3. Clear tokens and return null if refresh fails.
 */
export async function getValidAccessToken() {
    const access = getAccessToken();
    if (access && !isTokenExpired(access)) return access;

    const refresh = getRefreshToken();
    if (!refresh) { clearTokens(); return null; }

    try {
        const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refresh }),
        });
        if (!res.ok) { clearTokens(); return null; }
        const data = await res.json();
        saveTokens(data.access_token, data.refresh_token);
        return data.access_token;
    } catch {
        clearTokens();
        return null;
    }
}

// ── Authenticated fetch wrapper ────────────────────────────────────────────────

/**
 * Drop-in replacement for fetch() that automatically attaches the Bearer token
 * and attempts a silent refresh on 401.
 *
 * Usage: apiFetch("/api/v1/some/endpoint", { method: "POST", body: ... })
 */
export async function apiFetch(path, options = {}) {
    const token = await getValidAccessToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(`${API_BASE}${path}`, { ...options, headers });
}

// ── Logout helpers ─────────────────────────────────────────────────────────────

export async function logout() {
    const refresh = getRefreshToken();
    if (refresh) {
        await fetch(`${API_BASE}/api/v1/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refresh }),
        }).catch(() => {});
    }
    clearTokens();
}

export async function logoutAllSessions() {
    const token = await getValidAccessToken();
    if (token) {
        await fetch(`${API_BASE}/api/v1/auth/logout/all`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
    }
    clearTokens();
}

// ── Current user ───────────────────────────────────────────────────────────────

/**
 * Fetch the current user's profile from the backend.
 * Returns null if there is no valid session or the request fails.
 */
export async function fetchCurrentUser() {
    const token = await getValidAccessToken();
    if (!token) return null;
    try {
        const res = await fetch(`${API_BASE}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

// ── Profile update ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/users/me — update the authenticated user's editable profile fields.
 * Returns the updated user object, or throws with a parsed error body on failure.
 */
export async function updateProfile(data) {
    const res = await apiFetch("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw { status: res.status, body };
    }
    return res.json();
}

// ── Avatar upload ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/users/me/avatar — upload a profile picture (multipart/form-data).
 * Returns the updated user object, or throws on failure.
 */
export async function uploadAvatar(file) {
    const token = await getValidAccessToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/v1/users/me/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw { status: res.status, body };
    }
    return res.json();
}

// ── Change password ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/users/me/change-password
 * Throws with a parsed error body on failure (e.g. wrong current password → 401).
 */
export async function changePassword(currentPassword, newPassword) {
    const res = await apiFetch("/api/v1/users/me/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw { status: res.status, body };
    }
}
