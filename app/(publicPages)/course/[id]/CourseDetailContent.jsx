"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    AwardIcon, BookOpenIcon, BellIcon, CheckCircleIcon, ChevronDownIcon, ChevronRightIcon,
    ClockIcon, HeartIcon, LayersIcon, Loader2, MonitorPlayIcon, PencilIcon, Tag, X,
    UsersIcon, Wifi, Building2, CalendarDays, CopyIcon, CheckIcon, Upload, Smartphone,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import {
    fetchCourse, fetchWishlistStatus, toggleWishlist, initiateCheckout, validateDiscount,
    fetchInstapayInfo, uploadInstapayScreenshot, submitInstapayRequest,
    fetchInstapayStatusForCourse,
} from "@/utils/academyApi";

const LEVEL_COLOR = {
    BEGINNER:     { bg: "rgba(52,211,153,0.15)",  text: "#34d399", border: "rgba(52,211,153,0.3)"  },
    INTERMEDIATE: { bg: "rgba(251,191,36,0.15)",   text: "#fbbf24", border: "rgba(251,191,36,0.3)"  },
    ADVANCED:     { bg: "rgba(248,113,113,0.15)",  text: "#f87171", border: "rgba(248,113,113,0.3)" },
};

const MODE_ICON = {
    ONLINE_LIVE: Wifi,
    IN_OFFICE:   Building2,
    HYBRID:      LayersIcon,
};

const MODE_LABEL_KEY = {
    ONLINE_LIVE: "dash_course_mode_online_live",
    IN_OFFICE:   "dash_course_mode_in_office",
    HYBRID:      "dash_course_mode_hybrid",
};

/* ── Skeleton ──────────────────────────────────────────────────── */

function Skeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-transparent animate-pulse">
            <div className="bg-gradient-to-br from-teal-50/60 via-white to-teal-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 pt-28 pb-16 border-b border-teal-100/60 dark:border-slate-800">
                <div className="mx-auto max-w-6xl px-6 md:px-16 space-y-4">
                    <div className="h-3 rounded-full w-32" style={{ background: "rgba(148,163,184,0.2)" }} />
                    <div className="h-8 rounded-full w-2/3" style={{ background: "rgba(148,163,184,0.15)" }} />
                    <div className="h-4 rounded-full w-1/2" style={{ background: "rgba(148,163,184,0.1)" }} />
                    <div className="flex gap-4 pt-2">
                        {[80, 90, 110, 95].map((w, i) => (
                            <div key={i} className="h-3 rounded-full" style={{ background: "rgba(148,163,184,0.15)", width: w }} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-6xl px-6 md:px-16 py-14 grid lg:grid-cols-[1fr_340px] gap-10">
                <div className="space-y-6">
                    {[280, 200, 240].map((h, i) => (
                        <div key={i} className="rounded-2xl" style={{ height: h, background: "rgba(148,163,184,0.08)" }} />
                    ))}
                </div>
                <div className="rounded-2xl" style={{ height: 380, background: "rgba(148,163,184,0.08)" }} />
            </div>
        </div>
    );
}

/* ── Text block ────────────────────────────────────────────────── */

function TextBlock({ title, body }) {
    if (!body) return null;
    return (
        <section className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2.5 text-slate-800 dark:text-white">
                <CheckCircleIcon size={18} className="text-teal-500" strokeWidth={2} />
                {title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {body}
            </p>
        </section>
    );
}

/* ── Skills grid ───────────────────────────────────────────────── */

function SkillsGrid({ skills, t }) {
    if (!skills?.length) return null;
    return (
        <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5 text-slate-800 dark:text-white">
                <CheckCircleIcon size={20} className="text-teal-500" strokeWidth={2} />
                {t("cd_what_learn")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
                {skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                        <CheckCircleIcon size={15} className="text-teal-500 shrink-0" strokeWidth={2.2} />
                        <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{skill}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ── Curriculum accordion ──────────────────────────────────────── */

function CurriculumItem({ module, index, t }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-start"
            >
                <div className="flex items-center gap-3">
                    <span className="shrink-0 flex items-center justify-center size-7 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold">
                        {index + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-white text-sm">{module.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:block text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                        {module.weeks} {module.weeks === 1 ? t("cd_week") : t("cd_weeks")}
                    </span>
                    <ChevronDownIcon size={16} className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </div>
            </button>
            {open && (
                <div className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    {t("cd_module_pre")}{" "}
                    <span className="font-medium text-teal-600 dark:text-teal-400">{module.title}</span>{" "}
                    {t("cd_module_post")}
                </div>
            )}
        </div>
    );
}

function CurriculumSection({ curriculum, t }) {
    if (!curriculum?.length) return null;
    return (
        <section>
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t("cd_curriculum")}</h2>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    {curriculum.length} {t("cd_modules")}
                </span>
            </div>
            <div className="space-y-2.5">
                {curriculum.map((module, i) => (
                    <CurriculumItem key={i} module={module} index={i} t={t} />
                ))}
            </div>
        </section>
    );
}

/* ── Instructors section ───────────────────────────────────────── */

function InstructorsSection({ instructors, t }) {
    if (!instructors?.length) return null;
    return (
        <section>
            <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">{t("cd_instructors")}</h2>
            <div className="space-y-4">
                {instructors.map((instructor) => (
                    <Link
                        key={instructor.id}
                        href={`/instructor/${instructor.id}`}
                        className="group flex items-start gap-5 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-teal-300 dark:hover:border-teal-500/40 hover:shadow-md hover:shadow-teal-500/8 transition-all duration-200"
                    >
                        <div className="shrink-0 size-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white font-bold text-lg overflow-hidden ring-2 ring-transparent group-hover:ring-teal-400/30 transition-all">
                            {instructor.profile_picture_url ? (
                                <img src={instructor.profile_picture_url} alt={instructor.first_name} className="size-full object-cover" />
                            ) : (
                                (instructor.first_name?.[0] ?? "?").toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                {instructor.first_name} {instructor.last_name}
                            </p>
                            <p className="text-teal-500 text-xs font-medium mt-0.5 mb-3">
                                {instructor.title || `@${instructor.username}`}
                            </p>
                            {instructor.bio && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{instructor.bio}</p>
                            )}
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">{t("ip_view_profile")} →</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

/* ── Main component ────────────────────────────────────────────── */

export default function CourseDetailContent({ courseId }) {
    const { t, locale } = useLocale();
    const { user } = useUser();
    const router = useRouter();

    const [course, setCourse]         = useState(null);
    const [loading, setLoading]       = useState(true);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistBusy, setWishlistBusy] = useState(false);

    // Enrollment modal state
    const [showModal, setShowModal]     = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [discountCode, setDiscountCode]   = useState("");
    const [discountInfo, setDiscountInfo]   = useState(null);
    const [discountError, setDiscountError] = useState("");
    const [discountChecking, setDiscountChecking] = useState(false);
    const [enrolling, setEnrolling]     = useState(false);
    const [enrollError, setEnrollError] = useState("");
    const [paymentType, setPaymentType] = useState("FULL");

    // InstaPay modal state
    const [showInstapayModal, setShowInstapayModal] = useState(false);
    const [instapayBatch, setInstapayBatch]           = useState(null);
    const [instapayDiscount, setInstapayDiscount]     = useState("");
    const [instapayDiscountInfo, setInstapayDiscountInfo] = useState(null);
    const [instapayDiscountError, setInstapayDiscountError] = useState("");
    const [instapayDiscountChecking, setInstapayDiscountChecking] = useState(false);
    const [instapayPreview, setInstapayPreview]       = useState(null);
    const [instapayUploading, setInstapayUploading]         = useState(false);
    const [instapayUploadProgress, setInstapayUploadProgress] = useState(0);
    const [instapayScreenshotUrl, setInstapayScreenshotUrl] = useState(null);
    const [instapaySending, setInstapaySending]       = useState(false);
    const [instapayError, setInstapayError]           = useState("");
    const [instapaySuccess, setInstapaySuccess]       = useState(false);
    const [instapayPhone, setInstapayPhone]           = useState("01094016963");
    const [instapayCopied, setInstapayCopied]         = useState(false);
    const [instapayStep, setInstapayStep]             = useState(1);
    const [instapayPaymentType, setInstapayPaymentType] = useState("FULL");
    const [instapayStatus, setInstapayStatus]         = useState(null);

    const isAdmin    = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    const isLoggedIn = !!user;

    useEffect(() => {
        setLoading(true);
        fetchCourse(courseId, locale)
            .then(setCourse)
            .finally(() => setLoading(false));
    }, [courseId, locale]);

    useEffect(() => {
        if (isLoggedIn && courseId) {
            fetchWishlistStatus(courseId)
                .then((r) => setWishlisted(r?.wishlisted ?? false))
                .catch(() => {});
        }
    }, [courseId, isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn && courseId) {
            fetchInstapayStatusForCourse(courseId)
                .then(setInstapayStatus)
                .catch(() => {});
        }
    }, [courseId, isLoggedIn]);

    async function handleWishlistToggle() {
        if (!isLoggedIn || wishlistBusy) return;
        setWishlistBusy(true);
        try {
            const res = await toggleWishlist(courseId);
            setWishlisted(res.wishlisted);
        } catch {
            /* silent */
        } finally {
            setWishlistBusy(false);
        }
    }

    function openEnrollModal() {
        if (!isLoggedIn) { router.push("/login"); return; }
        setDiscountCode(""); setDiscountInfo(null); setDiscountError(""); setEnrollError("");
        setPaymentType("FULL");
        const firstActive = (course?.batches ?? []).find(b => b.status === "UPCOMING" || b.status === "ONGOING");
        setSelectedBatch(firstActive?.id ?? null);
        setShowModal(true);
    }

    function computeMonthlyBreakdown(effectivePrice) {
        const batch = (course?.batches ?? []).find(b => b.id === selectedBatch);
        let months = null;
        if (batch?.start_date && batch?.end_date) {
            const days = (new Date(batch.end_date) - new Date(batch.start_date)) / (1000 * 60 * 60 * 24);
            months = Math.max(1, Math.round(days / 30));
        } else if (course?.duration_weeks) {
            months = Math.max(1, Math.ceil(course.duration_weeks / 4.33));
        }
        if (!months || !effectivePrice) return null;
        const monthly = Math.ceil((effectivePrice / months) * 100) / 100;
        return { months, monthly };
    }

    async function handleCheckDiscount() {
        if (!discountCode.trim() || !selectedBatch) return;
        setDiscountChecking(true); setDiscountError(""); setDiscountInfo(null);
        try {
            const info = await validateDiscount(discountCode.trim(), selectedBatch);
            setDiscountInfo(info);
        } catch (err) {
            const code = err?.body?.error_code;
            setDiscountError(
                code === "SYSTEM_DISCOUNT_ACTIVE"      ? t("enroll_system_discount_active") :
                code === "COUPON_EXPIRED"              ? t("enroll_coupon_expired") :
                code === "COUPON_USAGE_LIMIT_REACHED"  ? t("enroll_coupon_used_up") :
                code === "COUPON_NOT_APPLICABLE"       ? t("enroll_coupon_not_applicable") :
                t("enroll_coupon_invalid")
            );
        } finally { setDiscountChecking(false); }
    }

    async function handleEnroll() {
        if (!selectedBatch) return;
        setEnrolling(true); setEnrollError("");
        const hasSystemDiscount = !!(course?.discounted_price);
        try {
            const res = await initiateCheckout({
                batch_id: selectedBatch,
                discount_code: (!hasSystemDiscount && discountCode.trim()) ? discountCode.trim() : undefined,
                payment_type: paymentType,
            });
            setShowModal(false);
            if (res.is_free) {
                router.push(`/payment/success?enrollment_id=${res.enrollment_id}&free=1`);
            } else {
                sessionStorage.setItem("paymob_enrollment_id", res.enrollment_id);
                sessionStorage.setItem("paymob_course_id", courseId);
                window.location.href = res.payment_url;
            }
        } catch (err) {
            const code = err?.body?.error_code;
            setEnrollError(
                code === "ALREADY_ENROLLED"      ? t("enroll_already_enrolled") :
                code === "COUPON_INVALID"        ? t("enroll_coupon_invalid") :
                code === "COUPON_EXPIRED"        ? t("enroll_coupon_expired") :
                code === "SYSTEM_DISCOUNT_ACTIVE" ? t("enroll_system_discount_active") :
                code === "PAYMENT_GATEWAY_ERROR"  ? t("enroll_gateway_error") :
                t("enroll_error")
            );
        } finally { setEnrolling(false); }
    }

    function openInstapayModal() {
        if (!isLoggedIn) { router.push("/login"); return; }
        if (instapayStatus?.has_pending) return;
        if (instapayStatus?.has_approved || course?.is_enrolled) return;
        setInstapayDiscount(""); setInstapayDiscountInfo(null); setInstapayDiscountError("");
        setInstapayPreview(null); setInstapayScreenshotUrl(null);
        setInstapayError(""); setInstapaySuccess(false);
        setInstapayStep(1);
        setInstapayPaymentType("FULL");
        const firstActive = (course?.batches ?? []).find(b => b.status === "UPCOMING" || b.status === "ONGOING");
        setInstapayBatch(firstActive?.id ?? null);
        fetchInstapayInfo().then(info => { if (info?.phone) setInstapayPhone(info.phone); });
        setShowInstapayModal(true);
    }

    async function handleInstapayCheckDiscount() {
        if (!instapayDiscount.trim() || !instapayBatch) return;
        setInstapayDiscountChecking(true); setInstapayDiscountError(""); setInstapayDiscountInfo(null);
        try {
            const info = await validateDiscount(instapayDiscount.trim(), instapayBatch);
            setInstapayDiscountInfo(info);
        } catch (err) {
            const code = err?.body?.error_code;
            setInstapayDiscountError(
                code === "SYSTEM_DISCOUNT_ACTIVE"     ? t("enroll_system_discount_active") :
                code === "COUPON_EXPIRED"             ? t("enroll_coupon_expired") :
                code === "COUPON_USAGE_LIMIT_REACHED" ? t("enroll_coupon_used_up") :
                code === "COUPON_NOT_APPLICABLE"      ? t("enroll_coupon_not_applicable") :
                t("enroll_coupon_invalid")
            );
        } finally { setInstapayDiscountChecking(false); }
    }

    async function handleInstapayFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setInstapayPreview(URL.createObjectURL(file));
        setInstapayScreenshotUrl(null);
        setInstapayUploadProgress(0);
        setInstapayUploading(true);
        try {
            const res = await uploadInstapayScreenshot(file, (pct) => setInstapayUploadProgress(pct));
            setInstapayScreenshotUrl(res.url);
            setInstapayUploadProgress(100);
        } catch {
            setInstapayError(t("instapay_upload_label") + " — " + t("enroll_error"));
            setInstapayUploadProgress(0);
        } finally { setInstapayUploading(false); }
    }

    async function handleInstapaySend() {
        if (!instapayBatch || !instapayScreenshotUrl) return;
        setInstapaySending(true); setInstapayError("");
        try {
            await submitInstapayRequest({
                batch_id:       instapayBatch,
                discount_code:  instapayDiscount.trim() || undefined,
                screenshot_url: instapayScreenshotUrl,
                payment_type:   instapayPaymentType,
            });
            // Immediately mark as pending so the modal cannot be re-opened
            setInstapayStatus({ has_pending: true, has_approved: false, status: "PENDING", request_id: null });
            setInstapaySuccess(true);
        } catch (err) {
            const code = err?.body?.error_code;
            if (code === "INSTAPAY_REQUEST_DUPLICATE") {
                // Request already exists — treat as success and update status
                setInstapayStatus({ has_pending: true, has_approved: false, status: "PENDING", request_id: null });
                setInstapaySuccess(true);
            } else {
                setInstapayError(
                    code === "ALREADY_ENROLLED"   ? t("enroll_already_enrolled") :
                    code === "COUPON_INVALID"      ? t("enroll_coupon_invalid") :
                    code === "COUPON_EXPIRED"      ? t("enroll_coupon_expired") :
                    t("enroll_error")
                );
            }
        } finally { setInstapaySending(false); }
    }

    function handleInstapayCopy() {
        navigator.clipboard.writeText(instapayPhone).catch(() => {});
        setInstapayCopied(true);
        setTimeout(() => setInstapayCopied(false), 2000);
    }

    if (loading) return <Skeleton />;

    if (!course) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
                <BookOpenIcon size={48} className="text-slate-300 dark:text-slate-600" strokeWidth={1} />
                <h1 className="text-xl font-bold text-slate-700 dark:text-white">{t("cd_not_found")}</h1>
                <p className="text-sm text-slate-400 dark:text-slate-500">{t("cd_not_found_desc")}</p>
                <Link href="/#courses" className="mt-2 text-sm text-teal-500 hover:underline flex items-center gap-1">
                    {t("cd_breadcrumb")} <ChevronRightIcon size={14} />
                </Link>
            </div>
        );
    }

    const level    = LEVEL_COLOR[course.level] ?? LEVEL_COLOR.BEGINNER;
    const ModeIcon = MODE_ICON[course.delivery_mode] ?? Building2;
    const isFree   = !Number(course.price) || Number(course.price) === 0;

    const hasPendingInstapay = instapayStatus?.has_pending === true;
    const hasApprovedInstapay = instapayStatus?.has_approved === true;

    return (
        <div className="min-h-screen relative overflow-hidden bg-white dark:bg-transparent">
            {/* Glow orbs — light mode only */}
            <div className="pointer-events-none fixed top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-teal-300/20 blur-[140px] dark:hidden" />
            <div className="pointer-events-none fixed top-[40%] right-[-8%] w-[450px] h-[450px] rounded-full bg-teal-400/15 blur-[130px] dark:hidden" />
            <div className="pointer-events-none fixed bottom-[10%] left-[30%] w-[400px] h-[300px] rounded-full bg-teal-200/20 blur-[120px] dark:hidden" />

            {/* ── HERO ───────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/60 via-white to-teal-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 dark:bg-none pt-28 pb-16 border-b border-teal-100/60 dark:border-slate-800">
                <div className="pointer-events-none absolute -top-32 left-1/4 w-[600px] h-[400px] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px]" />
                <div className="pointer-events-none absolute top-10 right-0 w-[400px] h-[300px] rounded-full bg-teal-300/20 dark:bg-teal-700/10 blur-[100px]" />

                <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-16">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-6">
                        <Link href="/#courses" className="hover:text-teal-500 dark:hover:text-teal-400 transition">
                            {t("cd_breadcrumb")}
                        </Link>
                        <span>/</span>
                        <span className="text-slate-500 dark:text-slate-400">{course.title}</span>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
                        {/* Left — info */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {/* Level badge */}
                                <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border"
                                    style={{ background: level.bg, color: level.text, borderColor: level.border }}>
                                    <LayersIcon size={11} className="me-1.5" />
                                    {t(`dash_course_${course.level.toLowerCase()}`)}
                                </span>

                                {/* Category badge */}
                                {course.category_name && (
                                    <span className="inline-flex text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
                                        {course.category_name}
                                    </span>
                                )}

                                {/* Enrollment status badge */}
                                {!course.enrollment_open && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                                        style={{ background: "rgba(251,191,36,0.12)", color: "#f59e0b", borderColor: "rgba(251,191,36,0.3)" }}>
                                        <BellIcon size={11} />
                                        {t("cd_enrollment_closed")}
                                    </span>
                                )}

                                {/* Wishlist button */}
                                {isLoggedIn && (
                                    <button
                                        type="button"
                                        onClick={handleWishlistToggle}
                                        disabled={wishlistBusy}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition hover:opacity-80 disabled:opacity-50"
                                        style={wishlisted
                                            ? { background: "rgba(239,68,68,0.12)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }
                                            : { background: "transparent", color: "var(--dt-muted,#94a3b8)", borderColor: "rgba(148,163,184,0.3)" }
                                        }
                                    >
                                        <HeartIcon size={11} className={wishlisted ? "fill-current" : ""} />
                                        {wishlisted ? t("cd_wishlisted") : t("cd_add_to_wishlist")}
                                    </button>
                                )}

                                {/* Admin: Edit + Manage Batches buttons */}
                                {isAdmin && (
                                    <>
                                        <Link
                                            href={`/dashboard/courses/${course.id}/edit`}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-80"
                                            style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}
                                        >
                                            <PencilIcon size={11} />
                                            {t("cd_edit_course")}
                                        </Link>
                                        <Link
                                            href={`/dashboard/courses/${course.id}/batches`}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-80 border"
                                            style={{ background: "rgba(20,184,166,0.1)", color: "#14b8a6", borderColor: "rgba(20,184,166,0.3)" }}
                                        >
                                            <CalendarDays size={11} />
                                            {t("cd_manage_batches")}
                                        </Link>
                                    </>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-slate-900 dark:text-white">
                                {course.title}
                            </h1>

                            {course.short_description && (
                                <p className="text-slate-500 dark:text-slate-300 text-base leading-relaxed max-w-2xl mb-7">
                                    {course.short_description}
                                </p>
                            )}

                            {/* Stats row */}
                            <div className="flex flex-wrap gap-5 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-2">
                                    <ModeIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                    {t(MODE_LABEL_KEY[course.delivery_mode])}
                                </span>
                                {course.duration_weeks && (
                                    <span className="flex items-center gap-2">
                                        <ClockIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                        {course.duration_weeks} {t("dash_course_weeks")}
                                    </span>
                                )}
                                {course.sessions_per_week && (
                                    <span className="flex items-center gap-2">
                                        <MonitorPlayIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                        {course.sessions_per_week} {t("cd_sessions_per_week")}
                                    </span>
                                )}
                                {course.max_students && (
                                    <span className="flex items-center gap-2">
                                        <UsersIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                        {t("dash_max")} {course.max_students}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right — hero pricing card (desktop only) */}
                        <div className="hidden lg:block">
                            <HeroPriceCard course={course} isFree={isFree} t={t}
                                wishlisted={wishlisted} wishlistBusy={wishlistBusy}
                                isLoggedIn={isLoggedIn} onWishlist={handleWishlistToggle}
                                onEnroll={openEnrollModal} onInstapay={openInstapayModal}
                                isEnrolled={!!course?.is_enrolled || hasApprovedInstapay}
                                hasPendingInstapay={hasPendingInstapay} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BODY ───────────────────────────────────────────────── */}
            <div className="mx-auto max-w-6xl px-6 md:px-16 py-14 grid lg:grid-cols-[1fr_340px] gap-10 items-start">

                {/* Left column */}
                <div className="space-y-8">
                    <TextBlock title={t("cd_about")}        body={course.description} />
                    <TextBlock title={t("cd_requirements")} body={course.requirements} />
                    <SkillsGrid skills={course.what_you_learn} t={t} />
                    <CurriculumSection curriculum={course.curriculum} t={t} />
                    <TextBlock title={t("cd_objectives")}   body={course.objectives} />
                    <InstructorsSection instructors={course.instructors} t={t} />

                    {/* Fallback if nothing to show */}
                    {!course.what_you_learn?.length && !course.curriculum?.length &&
                     !course.description && !course.requirements && !course.objectives &&
                     !course.instructors?.length && (
                        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
                            <BookOpenIcon size={32} className="text-slate-300 dark:text-slate-600" strokeWidth={1.2} />
                            <p className="text-sm text-slate-400">{t("dash_no_courses_desc")}</p>
                        </div>
                    )}
                </div>

                {/* Right sidebar */}
                <div className="lg:sticky lg:top-24 space-y-5">
                    <SidebarPriceCard course={course} isFree={isFree} t={t} isAdmin={isAdmin}
                        wishlisted={wishlisted} wishlistBusy={wishlistBusy}
                        isLoggedIn={isLoggedIn} onWishlist={handleWishlistToggle}
                        onEnroll={openEnrollModal} onInstapay={openInstapayModal}
                        isEnrolled={!!course?.is_enrolled || hasApprovedInstapay}
                        hasPendingInstapay={hasPendingInstapay} />

                    {/* Back link */}
                    <Link
                        href="/#courses"
                        className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-500 transition py-2"
                    >
                        {t("cd_back")}
                    </Link>
                </div>
            </div>

            {/* ── Enrollment modal ────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 end-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{t("enroll_modal_title")}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{course.title}</p>

                        {/* Batch selector — only UPCOMING / ONGOING */}
                        {(() => {
                            const activeBatches = (course.batches ?? []).filter(
                                b => b.status === "UPCOMING" || b.status === "ONGOING"
                            );
                            return activeBatches.length > 0 ? (
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        {t("enroll_select_batch")}
                                    </label>
                                    <select
                                        value={selectedBatch ?? ""}
                                        onChange={e => { setSelectedBatch(e.target.value); setDiscountInfo(null); setDiscountError(""); }}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-3 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    >
                                        {activeBatches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p className="text-sm text-amber-500 mb-4">{t("enroll_no_batches")}</p>
                            );
                        })()}

                        {/* Price display */}
                        {(() => {
                            const hasSystemDiscount = !!(course.discounted_price);
                            const effectivePrice = hasSystemDiscount
                                ? Number(course.discounted_price)
                                : (discountInfo ? Number(discountInfo.final_price) : Number(course.price));
                            const isEffectivelyFree = !effectivePrice;
                            return (
                                <div className="mb-4">
                                    {hasSystemDiscount ? (
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <span className="text-xl font-bold text-teal-500">
                                                {Number(course.discounted_price).toLocaleString()} {t("enroll_egp")}
                                            </span>
                                            <span className="text-sm text-slate-400 line-through">
                                                {Number(course.price).toLocaleString()}
                                            </span>
                                        </div>
                                    ) : discountInfo ? (
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <span className="text-xl font-bold text-teal-500">
                                                {Number(discountInfo.final_price).toLocaleString()} {t("enroll_egp")}
                                            </span>
                                            <span className="text-sm text-slate-400 line-through">
                                                {Number(discountInfo.original_price).toLocaleString()}
                                            </span>
                                            <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                                -{Number(discountInfo.discount_amount).toLocaleString()} {t("enroll_egp")}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold text-slate-800 dark:text-white">
                                            {isEffectivelyFree ? t("cd_free") : `${Number(course.price).toLocaleString()} ${t("enroll_egp")}`}
                                        </span>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Payment type selector — Full vs Monthly */}
                        {(() => {
                            const hasSystemDiscount = !!(course.discounted_price);
                            const effectivePrice = hasSystemDiscount
                                ? Number(course.discounted_price)
                                : (discountInfo ? Number(discountInfo.final_price) : Number(course.price));
                            const breakdown = computeMonthlyBreakdown(effectivePrice);
                            if (!effectivePrice || !breakdown) return null;
                            return (
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                        {t("enroll_payment_type")}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: "FULL",    label: t("enroll_pay_full"),    sub: `${effectivePrice.toLocaleString()} ${t("enroll_egp")}` },
                                            { value: "MONTHLY", label: t("enroll_pay_monthly"), sub: `${breakdown.monthly.toLocaleString()} ${t("enroll_egp")} × ${breakdown.months}` },
                                        ].map(({ value, label, sub }) => (
                                            <button key={value} type="button"
                                                onClick={() => setPaymentType(value)}
                                                className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-start transition ${
                                                    paymentType === value
                                                        ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                                }`}>
                                                <span className={`text-xs font-semibold ${paymentType === value ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-slate-200"}`}>
                                                    {label}
                                                </span>
                                                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {paymentType === "MONTHLY" && (
                                        <p className="mt-2 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl px-3 py-2">
                                            {t("enroll_monthly_note")
                                                .replace("{monthly}", breakdown.monthly.toLocaleString())
                                                .replace("{months}", breakdown.months)
                                                .replace("{total}", effectivePrice.toLocaleString())}
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Discount code — hidden when system discount is active */}
                        {course.discounted_price ? (
                            <div className="mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
                                <Tag size={14} className="text-green-500 shrink-0" />
                                <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                                    {t("enroll_system_discount")}
                                    {course.discount_label && <span className="ms-1 font-bold">({course.discount_label})</span>}
                                </p>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    {t("enroll_discount_code")} <span className="normal-case font-normal">({t("test_optional")})</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={discountCode}
                                            onChange={e => { setDiscountCode(e.target.value); setDiscountInfo(null); setDiscountError(""); }}
                                            placeholder={t("enroll_discount_placeholder")}
                                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCheckDiscount}
                                        disabled={!discountCode.trim() || discountChecking}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-teal-400 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 disabled:opacity-40 transition"
                                    >
                                        {discountChecking ? <Loader2 size={15} className="animate-spin" /> : t("enroll_apply")}
                                    </button>
                                </div>
                                {discountInfo && (
                                    <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                                        {t("enroll_coupon_applied")}
                                    </p>
                                )}
                                {discountError && (
                                    <p className="mt-1.5 text-xs text-red-500">{discountError}</p>
                                )}
                            </div>
                        )}

                        {enrollError && (
                            <p className="mb-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{enrollError}</p>
                        )}

                        <button
                            onClick={handleEnroll}
                            disabled={enrolling || !selectedBatch || !course.batches?.length}
                            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 transition text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                            {enrolling && <Loader2 size={15} className="animate-spin" />}
                            {(isFree || Number(course.discounted_price) === 0) ? t("enroll_btn_free") : t("enroll_btn_pay")}
                        </button>

                        {!isFree && Number(course.discounted_price) !== 0 && (
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); openInstapayModal(); }}
                                className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition hover:opacity-80"
                                style={{ borderColor: "rgba(20,184,166,0.4)", color: "#14b8a6", background: "rgba(20,184,166,0.05)" }}
                            >
                                <Smartphone size={15} />
                                {t("instapay_title")}
                            </button>
                        )}

                        <p className="text-center text-xs text-slate-400 mt-3">{t("enroll_secure")}</p>
                    </div>
                </div>
            )}
            {/* ── InstaPay modal (3-step wizard) ───────────────── */}
            {showInstapayModal && (() => {
                const hasSystemDiscount = !!(course.discounted_price);
                const effectivePrice    = hasSystemDiscount
                    ? Number(course.discounted_price)
                    : instapayDiscountInfo
                        ? Number(instapayDiscountInfo.final_price)
                        : Number(course.price);
                const savedAmount = hasSystemDiscount
                    ? Number(course.price) - Number(course.discounted_price)
                    : instapayDiscountInfo ? Number(instapayDiscountInfo.discount_amount) : 0;
                const monthlyBreakdown  = computeMonthlyBreakdown(effectivePrice);
                const isMonthly         = instapayPaymentType === "MONTHLY" && !!monthlyBreakdown;
                const displayPrice      = isMonthly ? monthlyBreakdown.monthly : effectivePrice;
                const activeBatches = (course.batches ?? []).filter(
                    b => b.status === "UPCOMING" || b.status === "ONGOING"
                );
                const selectedBatchObj = activeBatches.find(b => b.id === instapayBatch);
                const STEP_LABELS = [t("instapay_step_order"), t("instapay_step_transfer"), t("instapay_step_upload")];

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col">

                            {/* ── Gradient banner header ────────────────── */}
                            <div className="relative px-5 pt-5 pb-4 flex items-start justify-between"
                                style={{ background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)" }}>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Smartphone size={16} className="text-white/80" />
                                        <span className="text-white font-bold text-sm tracking-wide">{t("instapay_title")}</span>
                                    </div>
                                    <p className="text-white/60 text-xs">{t("instapay_secure_note")}</p>
                                </div>
                                <button onClick={() => setShowInstapayModal(false)}
                                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition shrink-0">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* ── Course summary card ───────────────────── */}
                            {!instapaySuccess && (
                                <div className="mx-4 -mt-2 mb-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm px-4 py-3 flex items-center gap-3 z-10">
                                    <div className="shrink-0 size-10 rounded-lg flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(8,145,178,0.15) 100%)" }}>
                                        <BookOpenIcon size={18} className="text-teal-600 dark:text-teal-400" strokeWidth={1.8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-tight">{course.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {course.level && (
                                                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
                                                    style={{ background: LEVEL_COLOR[course.level]?.bg, color: LEVEL_COLOR[course.level]?.text }}>
                                                    {course.level}
                                                </span>
                                            )}
                                            {selectedBatchObj && (
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{selectedBatchObj.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-end">
                                        <p className="text-base font-bold text-teal-600 dark:text-teal-400 leading-tight">
                                            {displayPrice.toLocaleString()}
                                            <span className="text-xs font-normal text-slate-400 ms-1">{t("enroll_egp")}</span>
                                        </p>
                                        {isMonthly && (
                                            <p className="text-[10px] text-teal-500 font-semibold">
                                                × {monthlyBreakdown.months} {t("instapay_months")}
                                            </p>
                                        )}
                                        {savedAmount > 0 && !isMonthly && (
                                            <p className="text-[10px] text-green-500 font-semibold">
                                                -{savedAmount.toLocaleString()} {t("enroll_egp")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Success screen ────────────────────────── */}
                            {instapaySuccess ? (
                                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                                    <div className="size-16 rounded-full flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(8,145,178,0.15) 100%)" }}>
                                        <CheckIcon size={28} className="text-teal-500" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white">{t("instapay_success_title")}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{t("instapay_success_desc")}</p>
                                    <div className="mt-1 w-full bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30 rounded-xl px-4 py-3 text-xs text-teal-700 dark:text-teal-300 flex items-center gap-2">
                                        <CheckCircleIcon size={14} className="shrink-0" />
                                        {t("instapay_success_check_dashboard")}
                                    </div>
                                    <button onClick={() => setShowInstapayModal(false)}
                                        className="mt-2 w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition">
                                        {t("instapay_done")}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* ── Step indicator ────────────────────── */}
                                    <div className="flex items-center justify-center px-6 pt-4 pb-2">
                                        {STEP_LABELS.map((label, i) => {
                                            const n      = i + 1;
                                            const done   = instapayStep > n;
                                            const active = instapayStep === n;
                                            return (
                                                <div key={n} className="flex items-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className={`size-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-300 ${
                                                            done   ? "bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-200 dark:shadow-teal-900" :
                                                            active ? "border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30" :
                                                                     "border-slate-200 dark:border-slate-700 text-slate-400"
                                                        }`}>
                                                            {done ? <CheckIcon size={12} /> : n}
                                                        </div>
                                                        <span className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                                                            active ? "text-teal-500" : done ? "text-teal-400" : "text-slate-400"
                                                        }`}>{label}</span>
                                                    </div>
                                                    {i < 2 && (
                                                        <div className="w-12 h-px mx-1 mb-4 transition-all duration-500"
                                                            style={{ background: instapayStep > n + 1 ? "#14b8a6" : instapayStep === n + 1 ? "linear-gradient(to right, #14b8a6 50%, #e2e8f0 50%)" : "#e2e8f0" }} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* ── Step content ─────────────────────── */}
                                    <div className="px-5 pb-5 pt-2">

                                        {/* Step 1 — Order Details */}
                                        {instapayStep === 1 && (
                                            <div className="space-y-3">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">{t("instapay_step1_hint")}</p>

                                                {activeBatches.length > 0 ? (
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                                            {t("instapay_select_batch")}
                                                        </label>
                                                        <select
                                                            value={instapayBatch ?? ""}
                                                            onChange={e => { setInstapayBatch(e.target.value); setInstapayDiscountInfo(null); setInstapayDiscountError(""); }}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-3 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 transition">
                                                            {activeBatches.map(b => (
                                                                <option key={b.id} value={b.id}>{b.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2.5">{t("enroll_no_batches")}</p>
                                                )}

                                                {/* Payment type selector */}
                                                {effectivePrice > 0 && (
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                                            {t("instapay_payment_type")}
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {[
                                                                { value: "FULL",    labelKey: "instapay_pay_full",    descKey: "instapay_pay_full_desc"    },
                                                                { value: "MONTHLY", labelKey: "instapay_pay_monthly", descKey: "instapay_pay_monthly_desc" },
                                                            ].map(({ value, labelKey, descKey }) => (
                                                                <button key={value} type="button"
                                                                    onClick={() => setInstapayPaymentType(value)}
                                                                    className={`rounded-xl border-2 p-3 text-start transition ${
                                                                        instapayPaymentType === value
                                                                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                                                    }`}>
                                                                    <p className={`text-xs font-bold ${instapayPaymentType === value ? "text-teal-600 dark:text-teal-400" : "text-slate-700 dark:text-slate-200"}`}>
                                                                        {t(labelKey)}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">{t(descKey)}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {instapayPaymentType === "MONTHLY" && course.duration_weeks && (
                                                            <p className="mt-2 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl px-3 py-2">
                                                                {t("instapay_monthly_amount").replace(
                                                                    "{amount}",
                                                                    Math.ceil(effectivePrice / Math.ceil(course.duration_weeks / 4.33)).toLocaleString()
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {!hasSystemDiscount && (
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                                            {t("instapay_discount_label")}
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Tag size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                <input
                                                                    value={instapayDiscount}
                                                                    onChange={e => { setInstapayDiscount(e.target.value); setInstapayDiscountInfo(null); setInstapayDiscountError(""); }}
                                                                    placeholder={t("enroll_discount_placeholder")}
                                                                    className="w-full ps-8 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                                                                />
                                                            </div>
                                                            <button type="button" onClick={handleInstapayCheckDiscount}
                                                                disabled={!instapayDiscount.trim() || instapayDiscountChecking}
                                                                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-teal-400 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 disabled:opacity-40 transition">
                                                                {instapayDiscountChecking ? <Loader2 size={14} className="animate-spin" /> : t("instapay_discount_apply")}
                                                            </button>
                                                        </div>
                                                        {instapayDiscountInfo && (
                                                            <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                                                <CheckIcon size={11} /> {t("instapay_discount_applied")} — {Number(instapayDiscountInfo.discount_amount).toLocaleString()} {t("enroll_egp")} {t("instapay_off")}
                                                            </p>
                                                        )}
                                                        {instapayDiscountError && <p className="mt-1.5 text-xs text-red-500">{instapayDiscountError}</p>}
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={() => setShowInstapayModal(false)}
                                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                        {t("instapay_cancel")}
                                                    </button>
                                                    <button disabled={!instapayBatch} onClick={() => setInstapayStep(2)}
                                                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
                                                        style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}>
                                                        {t("instapay_next")} <ChevronRightIcon size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2 — Transfer */}
                                        {instapayStep === 2 && (
                                            <div className="space-y-3">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">{t("instapay_step2_hint")}</p>

                                                {/* Phone number */}
                                                <div className="rounded-xl overflow-hidden border border-teal-200 dark:border-teal-800/50"
                                                    style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.06) 0%, rgba(8,145,178,0.06) 100%)" }}>
                                                    <div className="px-4 pt-3 pb-1">
                                                        <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">{t("instapay_number_label")}</p>
                                                        <p className="font-mono font-black text-2xl tracking-[0.2em] text-slate-800 dark:text-white">{instapayPhone}</p>
                                                    </div>
                                                    <div className="px-3 pb-3">
                                                        <button type="button" onClick={handleInstapayCopy}
                                                            className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
                                                            style={instapayCopied
                                                                ? { background: "rgba(16,185,129,0.12)", color: "#10b981" }
                                                                : { background: "rgba(20,184,166,0.12)", color: "#0d9488" }
                                                            }>
                                                            {instapayCopied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                                                            {instapayCopied ? t("instapay_copied") : t("instapay_copy_number")}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Amount to transfer */}
                                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-2.5">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{t("instapay_transfer_amount")}</span>
                                                    <div className="text-end">
                                                        <span className="font-bold text-teal-600 dark:text-teal-400">
                                                            {displayPrice.toLocaleString()} {t("enroll_egp")}
                                                        </span>
                                                        {isMonthly && (
                                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                                {t("instapay_per_month")} × {monthlyBreakdown.months}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Instructions */}
                                                <div className="space-y-1.5">
                                                    {[t("instapay_step1"), t("instapay_step2"), t("instapay_step3"), t("instapay_step4"), t("instapay_step5")].map((step, i) => (
                                                        <div key={i} className="flex items-start gap-2.5 py-0.5">
                                                            <span className="shrink-0 size-4 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold flex items-center justify-center mt-0.5 border border-teal-200 dark:border-teal-800/50">{i + 1}</span>
                                                            <p className="text-xs text-slate-600 dark:text-slate-300">{step}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={() => setInstapayStep(1)}
                                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                        ← {t("instapay_back")}
                                                    </button>
                                                    <button onClick={() => setInstapayStep(3)}
                                                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition"
                                                        style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}>
                                                        {t("instapay_next")} <ChevronRightIcon size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3 — Upload Proof */}
                                        {instapayStep === 3 && (
                                            <div className="space-y-3">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">{t("instapay_step3_hint")}</p>

                                                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                                    instapayPreview ? "p-2 border-teal-300 dark:border-teal-700" : "py-8 border-slate-200 dark:border-slate-700"
                                                } ${instapayUploading ? "opacity-60 cursor-wait" : "hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-900/10"}`}>
                                                    {instapayPreview ? (
                                                        <div className="relative w-full">
                                                            <img src={instapayPreview} alt="screenshot" className="w-full max-h-36 rounded-lg object-contain" />
                                                            {!instapayUploading && (
                                                                <span className="absolute top-2 end-2 bg-white/90 dark:bg-slate-800/90 rounded-lg px-2 py-1 text-[10px] text-slate-500 font-medium shadow-sm">
                                                                    {t("instapay_tap_change")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                <Upload size={20} className="text-slate-400" strokeWidth={1.5} />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t("instapay_upload_label")}</span>
                                                            <span className="text-xs text-slate-400">{t("instapay_upload_hint")}</span>
                                                        </>
                                                    )}
                                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleInstapayFileChange} />
                                                </label>

                                                {instapayUploading && (
                                                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl px-3 py-2.5">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
                                                                <Loader2 size={11} className="animate-spin shrink-0" />
                                                                {t("instapay_uploading")}
                                                            </span>
                                                            <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                                                                {instapayUploadProgress}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 rounded-full bg-teal-100 dark:bg-teal-800/40 overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-200"
                                                                style={{ width: `${instapayUploadProgress}%`, background: "linear-gradient(90deg, #0d9488, #0891b2)" }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {instapayScreenshotUrl && !instapayUploading && (
                                                    <p className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
                                                        <CheckCircleIcon size={13} className="shrink-0" /> {t("instapay_uploaded")}
                                                    </p>
                                                )}
                                                {instapayError && (
                                                    <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{instapayError}</p>
                                                )}

                                                {/* Final order recap */}
                                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-2.5 text-xs">
                                                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[55%]">{course.title}</span>
                                                    <div className="text-end shrink-0">
                                                        <span className="font-bold text-teal-600 dark:text-teal-400">
                                                            {displayPrice.toLocaleString()} {t("enroll_egp")}
                                                        </span>
                                                        {isMonthly && (
                                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                                {t("instapay_per_month")} × {monthlyBreakdown.months}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={() => setInstapayStep(2)}
                                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                        ← {t("instapay_back")}
                                                    </button>
                                                    <button onClick={handleInstapaySend}
                                                        disabled={instapaySending || !instapayScreenshotUrl || instapayUploading}
                                                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                                                        style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}>
                                                        {instapaySending && <Loader2 size={14} className="animate-spin" />}
                                                        {t("instapay_send")}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

/* ── Pricing sub-components ────────────────────────────────────── */

function HeroPriceCard({ course, isFree, t, wishlisted, wishlistBusy, isLoggedIn, onWishlist, onEnroll, onInstapay, isEnrolled, hasPendingInstapay }) {
    return (
        <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/60 dark:shadow-none backdrop-blur-sm p-6">
            {isEnrolled ? (
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: "#10b981" }}>
                    <CheckCircleIcon size={11} /> {t("cd_enrolled")}
                </p>
            ) : hasPendingInstapay ? (
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: "#f59e0b" }}>
                    <ClockIcon size={11} /> {t("instapay_pending_badge")}
                </p>
            ) : course.enrollment_open ? (
                <p className="text-xs text-red-500 dark:text-red-400 font-semibold uppercase tracking-wider mb-3">
                    {t("cd_limited_offer")}
                </p>
            ) : (
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: "#f59e0b" }}>
                    <BellIcon size={11} /> {t("cd_enrollment_closed")}
                </p>
            )}

            {isFree ? (
                <p className="text-3xl font-bold text-teal-500 dark:text-teal-400 mb-1">
                    {t("cd_free")}
                </p>
            ) : (
                <div className="mb-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">{t("cd_one_time")}</p>
                    {course.discounted_price ? (
                        <>
                            <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
                                {course.discount_label}
                            </span>
                            <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                                <span className="text-base line-through text-slate-400 dark:text-slate-500">
                                    {Number(course.price).toLocaleString()} {t("cd_currency")}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-teal-500 dark:text-teal-400">
                                    {Number(course.discounted_price).toLocaleString()}
                                </span>
                                <span className="text-slate-400 dark:text-slate-300 text-sm">{t("cd_price_per_batch")}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-3xl font-bold text-teal-500 dark:text-teal-400">
                                {Number(course.price).toLocaleString()}
                            </span>
                            <span className="text-slate-400 dark:text-slate-300 text-sm">{t("cd_price_per_batch")}</span>
                        </div>
                    )}
                </div>
            )}

            {isEnrolled ? (
                <Link
                    href="/dashboard/enrollments"
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition text-white font-semibold py-3 rounded-xl text-sm"
                >
                    <CheckCircleIcon size={15} />
                    {t("cd_view_enrollment")}
                </Link>
            ) : hasPendingInstapay ? (
                <div className="w-full mt-4 flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl py-3 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                    <ClockIcon size={15} /> {t("instapay_pending_badge")}
                </div>
            ) : course.enrollment_open ? (
                <div className="mt-4 space-y-2">
                    <button
                        onClick={onEnroll}
                        className="w-full bg-teal-500 hover:bg-teal-600 transition text-white font-semibold py-3 rounded-xl text-sm"
                    >
                        {t("cd_enroll")}
                    </button>
                    {!isFree && (
                        <button
                            type="button"
                            onClick={onInstapay}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition hover:opacity-80"
                            style={{ borderColor: "rgba(20,184,166,0.4)", color: "#14b8a6", background: "rgba(20,184,166,0.05)" }}
                        >
                            <Smartphone size={14} />
                            {t("instapay_title")}
                        </button>
                    )}
                </div>
            ) : (
                <div className="mt-4 space-y-2">
                    <div className="w-full py-3 rounded-xl text-sm font-semibold text-center border"
                        style={{ borderColor: "rgba(251,191,36,0.4)", color: "#f59e0b", background: "rgba(251,191,36,0.06)" }}>
                        {t("cd_enrollment_soon")}
                    </div>
                    {isLoggedIn && (
                        <button
                            type="button"
                            onClick={onWishlist}
                            disabled={wishlistBusy}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition hover:opacity-80 disabled:opacity-50"
                            style={wishlisted
                                ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }
                                : { background: "transparent", color: "#64748b", borderColor: "rgba(148,163,184,0.3)" }}
                        >
                            <HeartIcon size={14} className={wishlisted ? "fill-current" : ""} />
                            {wishlisted ? t("cd_wishlisted") : t("cd_add_to_wishlist")}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function SidebarPriceCard({ course, isFree, t, isAdmin, wishlisted, wishlistBusy, isLoggedIn, onWishlist, onEnroll, onInstapay, isEnrolled, hasPendingInstapay }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-lg shadow-black/5">
            {/* Visual header */}
            <div className="relative flex items-center justify-center h-36 bg-gradient-to-br from-gray-900 to-teal-950 overflow-hidden">
                <div className="absolute inset-0 bg-teal-500/5" />
                <MonitorPlayIcon size={48} className="text-teal-400/60" strokeWidth={1} />
                <span className="absolute bottom-0 inset-x-0 text-center text-xs text-white/50 pb-2 bg-black/20 pt-1">
                    {t("cd_course_content")}
                </span>
            </div>

            <div className="p-5">
                {isEnrolled ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", borderColor: "rgba(16,185,129,0.3)" }}>
                        <CheckCircleIcon size={11} /> {t("cd_enrolled")}
                    </span>
                ) : hasPendingInstapay ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)" }}>
                        <ClockIcon size={11} /> {t("instapay_pending_badge")}
                    </span>
                ) : course.enrollment_open ? (
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/40 px-3 py-1 rounded-full mb-4">
                        {t("cd_limited_offer")}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border"
                        style={{ background: "rgba(251,191,36,0.1)", color: "#f59e0b", borderColor: "rgba(251,191,36,0.3)" }}>
                        <BellIcon size={11} /> {t("cd_enrollment_closed")}
                    </span>
                )}

                {isFree ? (
                    <p className="text-3xl font-bold text-teal-500 dark:text-teal-400 mb-4">
                        {t("cd_free")}
                    </p>
                ) : (
                    <div className="mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t("cd_one_time")}</p>
                        {course.discounted_price ? (
                            <>
                                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
                                    {course.discount_label}
                                </span>
                                <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                                    <span className="text-base line-through text-slate-400 dark:text-slate-500">
                                        {Number(course.price).toLocaleString()} {t("cd_currency")}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-3xl font-bold text-slate-800 dark:text-white">
                                        {Number(course.discounted_price).toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-sm">{t("cd_price_per_batch")}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-slate-800 dark:text-white">
                                    {Number(course.price).toLocaleString()}
                                </span>
                                <span className="text-slate-400 text-sm">{t("cd_price_per_batch")}</span>
                            </div>
                        )}
                    </div>
                )}

                {isEnrolled ? (
                    <Link
                        href="/dashboard/enrollments"
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition text-white font-semibold py-3 rounded-xl text-sm"
                    >
                        <CheckCircleIcon size={15} />
                        {t("cd_view_enrollment")}
                    </Link>
                ) : hasPendingInstapay ? (
                    <div className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl py-3 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                        <ClockIcon size={15} /> {t("instapay_pending_badge")}
                    </div>
                ) : course.enrollment_open ? (
                    <div className="space-y-2">
                        <button
                            onClick={onEnroll}
                            className="w-full bg-teal-500 hover:bg-teal-600 transition text-white font-semibold py-3 rounded-xl text-sm"
                        >
                            {t("cd_enroll")}
                        </button>
                        {!isFree && (
                            <button
                                type="button"
                                onClick={onInstapay}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition hover:opacity-80"
                                style={{ borderColor: "rgba(20,184,166,0.4)", color: "#14b8a6", background: "rgba(20,184,166,0.05)" }}
                            >
                                <Smartphone size={14} />
                                {t("instapay_title")}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full py-3 rounded-xl text-sm font-semibold text-center border"
                        style={{ borderColor: "rgba(251,191,36,0.4)", color: "#f59e0b", background: "rgba(251,191,36,0.06)" }}>
                        {t("cd_enrollment_soon")}
                    </div>
                )}

                {isLoggedIn && (
                    <button
                        type="button"
                        onClick={onWishlist}
                        disabled={wishlistBusy}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition hover:opacity-80 disabled:opacity-50"
                        style={wishlisted
                            ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }
                            : { background: "transparent", color: "#64748b", borderColor: "rgba(148,163,184,0.3)" }}
                    >
                        <HeartIcon size={15} className={wishlisted ? "fill-current" : ""} />
                        {wishlisted ? t("cd_wishlisted") : t("cd_add_to_wishlist")}
                    </button>
                )}

                <p className="text-center text-xs text-slate-400 mt-3">
                    {t("cd_questions")}{" "}
                    <a href="mailto:contact@scieyber.com" className="text-teal-500 hover:underline">
                        {t("cd_contact_link")}
                    </a>
                </p>

                {/* Admin quick edit */}
                {isAdmin && (
                    <Link
                        href={`/dashboard/courses/${course.id}/edit`}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl border transition hover:opacity-80"
                        style={{ borderColor: "rgba(20,184,166,0.4)", color: "#14b8a6" }}
                    >
                        <PencilIcon size={13} />
                        {t("cd_edit_course")}
                    </Link>
                )}
            </div>

            {/* Meta info */}
            <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-4 space-y-2.5">
                {course.duration_weeks && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <ClockIcon size={15} className="text-teal-500 shrink-0" strokeWidth={1.8} />
                        {course.duration_weeks} {t("dash_course_weeks")}
                    </div>
                )}
                {course.sessions_per_week && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <MonitorPlayIcon size={15} className="text-teal-500 shrink-0" strokeWidth={1.8} />
                        {course.sessions_per_week} {t("cd_sessions_per_week")}
                    </div>
                )}
                {course.session_duration_hours && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <AwardIcon size={15} className="text-teal-500 shrink-0" strokeWidth={1.8} />
                        {course.session_duration_hours}h {t("cd_session_hours")}
                    </div>
                )}
                {course.max_students && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <UsersIcon size={15} className="text-teal-500 shrink-0" strokeWidth={1.8} />
                        {t("dash_max")} {course.max_students} {t("cd_students")}
                    </div>
                )}
            </div>
        </div>
    );
}
