/**
 * Academy domain API helpers.
 * All functions use apiFetch() which auto-attaches the Bearer token.
 */

import { apiFetch } from "@/utils/auth";

// ── Courses ────────────────────────────────────────────────────────────────────

export async function fetchPublishedCourses({ offset = 0, limit = 50, level, my, lang = "en" } = {}) {
    const params = new URLSearchParams({ offset, limit, lang });
    if (level) params.set("level", level);
    if (my)    params.set("my", "true");
    const res = await apiFetch(`/api/v1/courses?${params}`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchCourse(courseId, lang = "en") {
    const res = await apiFetch(`/api/v1/courses/${courseId}?lang=${lang}`);
    if (!res.ok) return null;
    return res.json();
}

export async function searchCourses({ q = "", lang = "en", limit = 20, offset = 0 } = {}) {
    if (!q.trim()) return [];
    const params = new URLSearchParams({ q: q.trim(), lang, limit, offset });
    const res = await apiFetch(`/api/v1/courses/search?${params}`);
    if (!res.ok) return [];
    return res.json();
}

export async function createCourse(data) {
    const res = await apiFetch("/api/v1/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create course");
    }
    return res.json();
}

export async function updateCourse(courseId, data) {
    const res = await apiFetch(`/api/v1/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update course");
    }
    return res.json();
}

export async function fetchCourseCategories() {
    const res = await apiFetch("/api/v1/courses/categories");
    if (!res.ok) return [];
    return res.json();
}

// ── Wishlist ───────────────────────────────────────────────────────────────────

export async function fetchMyWishlist() {
    const res = await apiFetch("/api/v1/courses/wishlist/me");
    if (!res.ok) return [];
    return res.json();
}

export async function fetchWishlistStatus(courseId) {
    const res = await apiFetch(`/api/v1/courses/${courseId}/wishlist`);
    if (!res.ok) return { wishlisted: false, course_id: courseId };
    return res.json();
}

export async function toggleWishlist(courseId) {
    const res = await apiFetch(`/api/v1/courses/${courseId}/wishlist`, { method: "POST" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update wishlist");
    }
    return res.json();
}

export async function fetchBatchesByCourse(courseId) {
    const res = await apiFetch(`/api/v1/batches?course_id=${courseId}`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchMyBatches() {
    const res = await apiFetch("/api/v1/batches/me");
    if (!res.ok) return [];
    return res.json();
}

export async function fetchBatch(batchId) {
    const res = await apiFetch(`/api/v1/batches/${batchId}`);
    if (!res.ok) throw { status: res.status };
    return res.json();
}

export async function adminCreateBatch(data) {
    const res = await apiFetch("/api/v1/batches", {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminUpdateBatch(id, data) {
    const res = await apiFetch(`/api/v1/batches/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminDeleteBatch(id) {
    const res = await apiFetch(`/api/v1/batches/${id}`, { method: "DELETE" });
    if (!res.ok) throw { status: res.status };
}

export async function fetchBatchSessions(batchId) {
    const res = await apiFetch(`/api/v1/batches/${batchId}/sessions`);
    if (!res.ok) return [];
    return res.json();
}

export async function adminCreateSession(batchId, data) {
    const res = await apiFetch(`/api/v1/batches/${batchId}/sessions`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminUpdateSession(batchId, sessionId, data) {
    const res = await apiFetch(`/api/v1/batches/${batchId}/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminDeleteSession(batchId, sessionId) {
    const res = await apiFetch(`/api/v1/batches/${batchId}/sessions/${sessionId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw { status: res.status };
}

// ── Enrollments ────────────────────────────────────────────────────────────────

export async function fetchInstructorStudents() {
    const res = await apiFetch("/api/v1/enrollments/instructor-students");
    if (!res.ok) return [];
    return res.json();
}

export async function fetchMyEnrollments({ status } = {}) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const query = params.toString() ? `?${params}` : "";
    const res = await apiFetch(`/api/v1/enrollments/me${query}`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchEnrollmentDetail(enrollmentId) {
    const res = await apiFetch(`/api/v1/enrollments/${enrollmentId}`);
    if (!res.ok) return null;
    return res.json();
}

export async function fetchEnrollmentPayments(enrollmentId) {
    const res = await apiFetch(`/api/v1/enrollments/${enrollmentId}/payments`);
    if (!res.ok) return [];
    return res.json();
}

// ── Attendance ─────────────────────────────────────────────────────────────────

export async function fetchAttendanceSummary(enrollmentId) {
    const res = await apiFetch(`/api/v1/attendance/summary/${enrollmentId}`);
    if (!res.ok) return null;
    return res.json();
}

export async function fetchAttendanceByEnrollment(enrollmentId) {
    const res = await apiFetch(`/api/v1/attendance?enrollment_id=${enrollmentId}`);
    if (!res.ok) return [];
    return res.json();
}

// ── Progress ───────────────────────────────────────────────────────────────────

export async function fetchMyProgress(enrollmentId) {
    const res = await apiFetch(`/api/v1/progress/enrollments/${enrollmentId}`);
    if (!res.ok) return null;
    return res.json();
}

export async function fetchAssignmentsByBatch(batchId) {
    const res = await apiFetch(`/api/v1/progress/assignments?batch_id=${batchId}`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchMySubmissions(enrollmentId) {
    const res = await apiFetch(`/api/v1/progress/assignments/submissions?enrollment_id=${enrollmentId}`);
    if (!res.ok) return [];
    return res.json();
}

// ── Instructors ────────────────────────────────────────────────────────────────

export async function fetchInstructors({ search } = {}) {
    const params = new URLSearchParams({ user_type: "INSTRUCTOR", limit: 100 });
    if (search) params.set("search", search);
    const res = await apiFetch(`/api/v1/users?${params}`);
    if (!res.ok) return [];
    return res.json();
}

// ── Admin — User Management ────────────────────────────────────────────────────

export async function fetchAllUsers({ offset = 0, limit = 50, search, role, user_type, is_active } = {}) {
    const params = new URLSearchParams({ offset, limit });
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (user_type) params.set("user_type", user_type);
    if (is_active !== undefined && is_active !== null) params.set("is_active", String(is_active));
    const res = await apiFetch(`/api/v1/users?${params}`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchAdminUser(userId) {
    const res = await apiFetch(`/api/v1/users/${userId}`);
    if (!res.ok) return null;
    return res.json();
}

export async function adminCreateUser(data) {
    const res = await apiFetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || "Failed to create user");
    }
    return res.json();
}

export async function adminUpdateUser(userId, data) {
    const res = await apiFetch(`/api/v1/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || "Failed to update user");
    }
    return res.json();
}

export async function adminDeleteUser(userId) {
    const res = await apiFetch(`/api/v1/users/${userId}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || "Failed to delete user");
    }
}

// ── Certificates ───────────────────────────────────────────────────────────────

export async function fetchMyCertificates({ status } = {}) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const query = params.toString() ? `?${params}` : "";
    const res = await apiFetch(`/api/v1/certificates/me${query}`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchCertificateByEnrollment(enrollmentId) {
    const res = await apiFetch(`/api/v1/certificates/enrollment/${enrollmentId}`);
    if (!res.ok) return null;
    return res.json();
}

// ── Testimonials ───────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchPublicTestimonials(limit = 6) {
    const res = await fetch(`${API_BASE_URL}/api/v1/testimonials/public?limit=${limit}`);
    if (!res.ok) return [];
    return res.json();
}

export async function submitTestimonial(data) {
    const res = await apiFetch("/api/v1/testimonials", {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw { status: res.status, body };
    }
    return res.json();
}

export async function fetchMyTestimonials() {
    const res = await apiFetch("/api/v1/testimonials/mine");
    if (!res.ok) return [];
    return res.json();
}

export async function adminFetchTestimonials({ status, offset = 0, limit = 50 } = {}) {
    const params = new URLSearchParams({ offset, limit });
    if (status) params.set("status", status);
    const res = await apiFetch(`/api/v1/testimonials?${params}`);
    if (!res.ok) return [];
    return res.json();
}

export async function adminUpdateTestimonialStatus(id, status, admin_note = null) {
    const body = { status };
    if (admin_note !== null) body.admin_note = admin_note;
    const res = await apiFetch(`/api/v1/testimonials/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminDeleteTestimonial(id) {
    const res = await apiFetch(`/api/v1/testimonials/${id}`, { method: "DELETE" });
    if (!res.ok) throw { status: res.status };
}

// ── Dashboard summary ─────────────────────────────────────────────────────────

export async function fetchDashboardSummary() {
    const res = await apiFetch("/api/v1/dashboard/summary");
    if (!res.ok) return null;
    return res.json();
}

// ── Enrollment checkout ───────────────────────────────────────────────────────

export async function initiateCheckout({ batch_id, discount_code, payment_type }) {
    const body = { batch_id, payment_type: payment_type || "FULL" };
    if (discount_code) body.discount_code = discount_code;
    const res = await apiFetch("/api/v1/enrollments/checkout", {
        method: "POST",
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function getPaymentStatus(enrollmentId) {
    const res = await apiFetch(`/api/v1/enrollments/${enrollmentId}/payment-status`);
    if (!res.ok) throw { status: res.status };
    return res.json();
}

export async function processPaymobCallback(enrollmentId, params) {
    const body = { ...params, _enrollment_id: enrollmentId };
    const res = await apiFetch("/api/v1/enrollments/payment-callback", {
        method: "POST",
        body: JSON.stringify(body),
    });
    if (!res.ok) throw { status: res.status };
    return res.json();
}

export async function validateDiscount(code, batchId) {
    const params = new URLSearchParams({ code, batch_id: batchId });
    const res = await apiFetch(`/api/v1/enrollments/validate-discount?${params}`);
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

// ── Admin monthly installments ────────────────────────────────────────────────

export async function adminFetchMonthlyInstallments() {
    const res = await apiFetch("/api/v1/enrollments/monthly-installments");
    if (!res.ok) return [];
    return res.json();
}

export async function adminUpdateEnrollmentStatus(enrollmentId, status, notes) {
    const res = await apiFetch(`/api/v1/enrollments/${enrollmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes: notes || undefined }),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

// ── Admin discount CRUD ───────────────────────────────────────────────────────

export async function adminFetchDiscounts({ offset = 0, limit = 100, includeArchived = false } = {}) {
    const params = new URLSearchParams({ offset, limit });
    if (includeArchived) params.set("include_archived", "true");
    const res = await apiFetch(`/api/v1/discounts?${params}`);
    if (!res.ok) return [];
    return res.json();
}

export async function adminCreateDiscount(data) {
    const res = await apiFetch("/api/v1/discounts", {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminUpdateDiscount(id, data) {
    const res = await apiFetch(`/api/v1/discounts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminDeleteDiscount(id) {
    const res = await apiFetch(`/api/v1/discounts/${id}`, { method: "DELETE" });
    if (!res.ok) throw { status: res.status };
}

export async function payInstallment(enrollmentId) {
    const res = await apiFetch(`/api/v1/enrollments/${enrollmentId}/pay-installment`, {
        method: "POST",
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

export async function adminRestoreDiscount(id) {
    const res = await apiFetch(`/api/v1/discounts/${id}/restore`, { method: "POST" });
    if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw { status: res.status, body: b };
    }
    return res.json();
}

// ── Contact Info ───────────────────────────────────────────────────────────────

export async function fetchContactInfo() {
    const res = await apiFetch("/api/v1/contact-info");
    if (!res.ok) return null;
    return res.json();
}

export async function adminUpdateContactInfo(data) {
    const res = await apiFetch("/api/v1/contact-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || "Failed to update contact info");
    }
    return res.json();
}

// ── Instructor Profile ─────────────────────────────────────────────────────────

export async function fetchInstructorProfile(instructorId, lang = "en") {
    const res = await apiFetch(`/api/v1/courses/instructors/${instructorId}?lang=${lang}`);
    if (!res.ok) return null;
    return res.json();
}
