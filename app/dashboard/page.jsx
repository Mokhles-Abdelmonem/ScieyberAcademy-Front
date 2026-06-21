"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BookOpen, ListChecks, Award, Clock,
    Play, CheckCircle2, ChevronRight,
    Users, Star, BarChart2, ArrowUpRight,
    Flame, Calendar, Target, Loader2,
    CreditCard, Tag, AlertTriangle, TrendingUp,
    GraduationCap, Layers,
} from "lucide-react";
import { useLocale }  from "@/context/LocaleContext";
import { useUser }    from "@/context/UserContext";
import { fetchDashboardSummary } from "@/utils/academyApi";

/* ─── Skeleton ──────────────────────────────────────────────────────────────── */

function SkeletonBlock({ className = "" }) {
    return (
        <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700/40 ${className}`} />
    );
}

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="dash-stat-card p-5">
                    <SkeletonBlock className="w-10 h-10 mb-4 rounded-xl" />
                    <SkeletonBlock className="w-16 h-7 mb-2" />
                    <SkeletonBlock className="w-24 h-4 mb-1" />
                    <SkeletonBlock className="w-20 h-3" />
                </div>
            ))}
        </div>
    );
}

/* ─── Shared stat card ──────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, sub, color = "#14b8a6", index = 0 }) {
    return (
        <div className="dash-stat-card p-5 dash-anim-up" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="flex items-start justify-between mb-4">
                <div className="dash-icon-wrap w-10 h-10">
                    <Icon size={18} style={{ color }} strokeWidth={1.8} />
                </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--dt-primary)" }}>{value}</p>
            <p className="text-sm font-medium mb-0.5" style={{ color: "var(--dt-secondary)" }}>{label}</p>
            {sub && <p className="text-xs" style={{ color: "var(--dt-muted)" }}>{sub}</p>}
        </div>
    );
}

/* ─── Student view ──────────────────────────────────────────────────────────── */

const COURSE_COLORS = ["#14b8a6", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#34d399"];

function EnrollmentCard({ enrollment, index }) {
    const { t }   = useLocale();
    const color   = COURSE_COLORS[index % COURSE_COLORS.length];
    const isMon   = enrollment.payment_type === "MONTHLY";
    const isPart  = enrollment.payment_status === "PARTIAL";
    const isDone  = enrollment.status === "COMPLETED";

    return (
        <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: `${0.35 + index * 0.09}s` }}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}>
                    {isDone ? t("dash_completed") : enrollment.batch_status}
                </span>
                {isMon && isPart && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold">
                        {t("dash_installment_due")}
                    </span>
                )}
            </div>

            <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-2" style={{ color: "var(--dt-primary)" }}>
                {enrollment.course_title}
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--dt-muted)" }}>{enrollment.batch_name}</p>

            <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: "var(--dt-tertiary)" }}>{t("dash_progress")}</span>
                    <span className="text-xs font-semibold" style={{ color }}>{Math.round(enrollment.completion_percentage)}%</span>
                </div>
                <div className="dash-progress-track h-1.5">
                    <div className="dash-progress-fill h-full"
                        style={{ width: `${enrollment.completion_percentage}%`, background: `linear-gradient(90deg,${color}cc,${color})` }} />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--dt-muted)" }}>
                    {enrollment.sessions_attended}/{enrollment.sessions_total} {t("dash_sessions")}
                </span>
                <Link href="/dashboard/enrollments"
                    className="dash-pill-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5"
                    style={{ color: "var(--dt-secondary)" }}>
                    <Play size={11} fill="currentColor" />
                    {isDone ? t("dash_view") : t("dash_continue")}
                </Link>
            </div>
        </div>
    );
}

function StudentDashboard({ data }) {
    const { t, isRTL } = useLocale();

    const stats = [
        { icon: BookOpen,    label: t("dash_stat_enrolled"),     value: data.total_enrollments,      sub: `${data.active_enrollments} ${t("dash_active")}`,    color: "#14b8a6" },
        { icon: CheckCircle2,label: t("dash_stat_completed"),    value: data.completed_enrollments,  sub: `${data.total_enrollments > 0 ? Math.round((data.completed_enrollments / data.total_enrollments) * 100) : 0}%`, color: "#34d399" },
        { icon: Award,       label: t("dash_stat_certificates"), value: data.total_certificates,     sub: `${data.issued_certificates} ${t("dash_issued")}`,   color: "#f59e0b" },
        { icon: CreditCard,  label: t("dash_stat_pending_pay"),  value: data.pending_payment_enrollments, sub: t("dash_needs_payment"),                         color: data.pending_payment_enrollments > 0 ? "#f87171" : "#94a3b8" },
    ];

    return (
        <div className="space-y-7">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
            </div>

            {/* Recent enrollments */}
            <div className="space-y-4">
                <div className="flex items-center justify-between dash-anim-up" style={{ animationDelay: "0.28s" }}>
                    <h2 className="font-semibold text-base" style={{ color: "var(--dt-primary)" }}>
                        {t("dash_continue_learning")}
                    </h2>
                    <Link href="/dashboard/enrollments" className="dash-badge flex items-center gap-1" style={{ cursor: "pointer" }}>
                        {t("dash_view_all")} <ChevronRight size={11} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
                    </Link>
                </div>

                {data.recent_enrollments.length === 0 ? (
                    <div className="dash-card p-8 text-center dash-anim-up">
                        <GraduationCap size={36} className="mx-auto mb-3" style={{ color: "var(--dt-muted)" }} strokeWidth={1.5} />
                        <p className="text-sm font-medium mb-1" style={{ color: "var(--dt-secondary)" }}>{t("dash_no_enrollments")}</p>
                        <Link href="/dashboard/courses" className="text-xs" style={{ color: "var(--dash-gradient-from)" }}>
                            {t("dash_browse_courses")} →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.recent_enrollments.map((e, i) => (
                            <EnrollmentCard key={e.enrollment_id} enrollment={e} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* Certificates + Quick actions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between dash-anim-up" style={{ animationDelay: "0.55s" }}>
                        <h2 className="font-semibold text-base" style={{ color: "var(--dt-primary)" }}>{t("dash_my_certs")}</h2>
                        <Link href="/dashboard/certificates" className="dash-badge flex items-center gap-1" style={{ cursor: "pointer" }}>
                            {t("dash_view_all")} <ChevronRight size={11} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
                        </Link>
                    </div>
                    <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.6s" }}>
                        {data.issued_certificates === 0 ? (
                            <div className="text-center py-4">
                                <Award size={32} className="mx-auto mb-2" style={{ color: "var(--dt-muted)" }} strokeWidth={1.5} />
                                <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("dash_no_certs_yet")}</p>
                                <p className="text-xs mt-1" style={{ color: "var(--dt-muted)" }}>{t("dash_complete_to_earn")}</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                                    <Award size={24} style={{ color: "#f59e0b" }} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>{data.issued_certificates}</p>
                                    <p className="text-sm" style={{ color: "var(--dt-secondary)" }}>{t("dash_certificates_earned")}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>
                                        {data.total_certificates - data.issued_certificates} {t("dash_pending")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="space-y-3">
                    <h2 className="font-semibold text-base dash-anim-up" style={{ color: "var(--dt-primary)", animationDelay: "0.55s" }}>
                        {t("dash_quick_actions")}
                    </h2>
                    <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.6s" }}>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { labelKey: "dash_browse_courses",  icon: BookOpen,   href: "/dashboard/courses"     },
                                { labelKey: "dash_my_enrollments",  icon: ListChecks, href: "/dashboard/enrollments" },
                                { labelKey: "dash_my_certificates", icon: Award,      href: "/dashboard/certificates" },
                                { labelKey: "dash_my_wishlist",     icon: Star,       href: "/dashboard/wishlist"    },
                                /* Future: { labelKey: "dash_leaderboard", icon: BarChart2, href: "/dashboard/leaderboard" }, */
                                /* Future: { labelKey: "dash_schedule",    icon: Calendar,  href: "/dashboard/schedule"    }, */
                            ].map(({ labelKey, icon: Icon, href }) => (
                                <Link key={labelKey} href={href}
                                    className="dash-pill-btn flex items-center gap-2 px-3 py-2.5 text-xs font-medium"
                                    style={{ color: "var(--dt-secondary)" }}>
                                    <Icon size={14} strokeWidth={1.7} style={{ color: "var(--dash-gradient-from)" }} />
                                    {t(labelKey)}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular courses — 2 tables side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-4">
                {/* Top enrolled courses */}
                <div className="space-y-3 dash-anim-up" style={{ animationDelay: "0.7s" }}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-sm" style={{ color: "var(--dt-primary)" }}>
                            {t("dash_top_enrolled")}
                        </h2>
                        <Link href="/dashboard/courses" className="dash-badge flex items-center gap-1" style={{ cursor: "pointer" }}>
                            {t("dash_explore_courses")} <ChevronRight size={11} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
                        </Link>
                    </div>
                    <div className="dash-card overflow-hidden">
                        {data.top_enrolled_courses.length === 0 ? (
                            <div className="p-8 text-center" style={{ color: "var(--dt-muted)" }}>
                                <BookOpen size={28} className="mx-auto mb-2" strokeWidth={1.5} />
                                <p className="text-xs">{t("dash_no_courses_yet")}</p>
                            </div>
                        ) : (
                            <table className="w-full text-xs">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                                        <th className="px-4 py-2.5 text-left font-semibold w-6" style={{ color: "var(--dt-muted)" }}>#</th>
                                        <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--dt-muted)" }}>{t("dash_col_course")}</th>
                                        <th className="px-4 py-2.5 text-right font-semibold" style={{ color: "var(--dt-muted)", whiteSpace: "nowrap" }}>{t("dash_col_enrollments")}</th>
                                        <th className="px-4 py-2.5 text-right font-semibold" style={{ color: "var(--dt-muted)" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.top_enrolled_courses.map((c, i) => (
                                        <tr key={c.course_id}
                                            style={{ borderBottom: i < data.top_enrolled_courses.length - 1 ? "1px solid var(--dash-border)" : "none" }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 font-bold" style={{ color: "var(--dt-muted)" }}>{i + 1}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium leading-tight" style={{ color: "var(--dt-primary)" }}>{c.course_title}</p>
                                                {c.category_name && (
                                                    <p className="text-[10px] mt-0.5" style={{ color: "var(--dt-muted)" }}>{c.category_name}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold" style={{ color: "#14b8a6" }}>{c.count}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/courses/${c.course_id}`}
                                                    className="flex items-center justify-end gap-0.5 font-medium"
                                                    style={{ color: "var(--dash-gradient-from)" }}>
                                                    {t("dash_explore")} <ArrowUpRight size={11} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Top wishlisted courses */}
                <div className="space-y-3 dash-anim-up" style={{ animationDelay: "0.77s" }}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-sm" style={{ color: "var(--dt-primary)" }}>
                            {t("dash_top_wishlisted")}
                        </h2>
                        <Link href="/dashboard/wishlist" className="dash-badge flex items-center gap-1" style={{ cursor: "pointer" }}>
                            {t("dash_view_wishlist")} <ChevronRight size={11} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
                        </Link>
                    </div>
                    <div className="dash-card overflow-hidden">
                        {data.top_wishlisted_courses.length === 0 ? (
                            <div className="p-8 text-center" style={{ color: "var(--dt-muted)" }}>
                                <Star size={28} className="mx-auto mb-2" strokeWidth={1.5} />
                                <p className="text-xs">{t("dash_no_courses_yet")}</p>
                            </div>
                        ) : (
                            <table className="w-full text-xs">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                                        <th className="px-4 py-2.5 text-left font-semibold w-6" style={{ color: "var(--dt-muted)" }}>#</th>
                                        <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--dt-muted)" }}>{t("dash_col_course")}</th>
                                        <th className="px-4 py-2.5 text-right font-semibold" style={{ color: "var(--dt-muted)", whiteSpace: "nowrap" }}>{t("dash_col_saves")}</th>
                                        <th className="px-4 py-2.5 text-right font-semibold" style={{ color: "var(--dt-muted)" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.top_wishlisted_courses.map((c, i) => (
                                        <tr key={c.course_id}
                                            style={{ borderBottom: i < data.top_wishlisted_courses.length - 1 ? "1px solid var(--dash-border)" : "none" }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 font-bold" style={{ color: "var(--dt-muted)" }}>{i + 1}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium leading-tight" style={{ color: "var(--dt-primary)" }}>{c.course_title}</p>
                                                {c.category_name && (
                                                    <p className="text-[10px] mt-0.5" style={{ color: "var(--dt-muted)" }}>{c.category_name}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold" style={{ color: "#f59e0b" }}>{c.count}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/courses/${c.course_id}`}
                                                    className="flex items-center justify-end gap-0.5 font-medium"
                                                    style={{ color: "var(--dash-gradient-from)" }}>
                                                    {t("dash_explore")} <ArrowUpRight size={11} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Instructor view ───────────────────────────────────────────────────────── */

function InstructorDashboard({ data }) {
    const { t, isRTL } = useLocale();

    const stats = [
        { icon: Users,    label: t("dash_stat_total_students"), value: data.total_students, sub: t("dash_across_all_batches"), color: "#14b8a6" },
        { icon: Layers,   label: t("dash_stat_batches"),        value: data.total_batches,  sub: `${data.active_batches} ${t("dash_active")}`,     color: "#06b6d4" },
        { icon: BookOpen, label: t("dash_stat_courses"),        value: data.unique_courses, sub: t("dash_unique_courses"),                          color: "#8b5cf6" },
        /* Future: { icon: Star, label: t("dash_stat_rating"), value: "—", sub: t("dash_coming_soon"), color: "#f59e0b" }, */
    ];

    return (
        <div className="space-y-7">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-4">
                <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.28s" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={16} style={{ color: "var(--dash-gradient-from)" }} />
                        <h3 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_students_overview")}</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: t("dash_total_students"),   value: data.total_students,  color: "#14b8a6" },
                            { label: t("dash_active_batches"),   value: data.active_batches,  color: "#34d399" },
                            { label: t("dash_total_batches"),    value: data.total_batches,   color: "#06b6d4" },
                            { label: t("dash_courses_teaching"), value: data.unique_courses,  color: "#8b5cf6" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between py-1.5 border-b last:border-b-0 dash-divider">
                                <span className="text-xs" style={{ color: "var(--dt-secondary)" }}>{label}</span>
                                <span className="text-sm font-bold" style={{ color }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.35s" }}>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--dt-primary)" }}>{t("dash_quick_actions")}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { labelKey: "dash_my_batches",   icon: Calendar,   href: "/dashboard/batches"   },
                            { labelKey: "dash_my_students",  icon: Users,      href: "/dashboard/students"  },
                            { labelKey: "dash_my_courses",   icon: BookOpen,   href: "/dashboard/courses"   },
                            { labelKey: "dash_my_reviews",   icon: Star,       href: "/dashboard/reviews"   },
                            /* Future: { labelKey: "dash_analytics", icon: BarChart2, href: "/dashboard/analytics" }, */
                        ].map(({ labelKey, icon: Icon, href }) => (
                            <Link key={labelKey} href={href}
                                className="dash-pill-btn flex items-center gap-2 px-3 py-2.5 text-xs font-medium"
                                style={{ color: "var(--dt-secondary)" }}>
                                <Icon size={14} strokeWidth={1.7} style={{ color: "var(--dash-gradient-from)" }} />
                                {t(labelKey)}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Admin view ────────────────────────────────────────────────────────────── */

function AdminDashboard({ data }) {
    const { t, isRTL } = useLocale();

    const stats = [
        { icon: Users,         label: t("dash_stat_total_users"),       value: data.total_users,               sub: `${data.total_students} ${t("dash_students_label")}`, color: "#14b8a6" },
        { icon: ListChecks,    label: t("dash_stat_active_enrollments"),value: data.total_active_enrollments,  sub: t("dash_enrolled_now"),                                color: "#06b6d4" },
        // Revenue only shown to SUPER_ADMIN — null means current user is ADMIN
        ...(data.total_revenue != null ? [
            { icon: TrendingUp, label: t("dash_stat_revenue"), value: `${Number(data.total_revenue).toLocaleString()} EGP`, sub: t("dash_total_collected"), color: "#34d399" },
        ] : []),
        { icon: BookOpen,      label: t("dash_stat_published_courses"), value: data.published_courses_count,   sub: t("dash_live_courses"),                                color: "#8b5cf6" },
        { icon: Award,         label: t("dash_stat_issued_certs"),      value: data.total_certificates_issued, sub: t("dash_certificates_total"),                          color: "#f59e0b" },
        { icon: Tag,           label: t("dash_stat_active_discounts"),  value: data.active_discounts,          sub: t("dash_promo_codes"),                                 color: "#ec4899" },
        { icon: AlertTriangle, label: t("dash_stat_overdue"),           value: data.monthly_overdue_count,     sub: t("dash_need_follow_up"),                              color: data.monthly_overdue_count > 0 ? "#f87171" : "#94a3b8" },
        /* Future: { icon: BarChart2, label: t("dash_stat_avg_completion"), value: "—", sub: t("dash_coming_soon"), color: "#6366f1" }, */
    ];

    return (
        <div className="space-y-7">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-4">
                {/* Overdue alert */}
                {data.monthly_overdue_count > 0 && (
                    <div className="xl:col-span-2 dash-anim-up" style={{ animationDelay: "0.28s" }}>
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-800/40 bg-red-50/60 dark:bg-red-900/10">
                            <AlertTriangle size={20} className="text-red-500 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    {data.monthly_overdue_count} {t("dash_overdue_alert_title")}
                                </p>
                                <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5">{t("dash_overdue_alert_desc")}</p>
                            </div>
                            <Link href="/dashboard/monthly-payments"
                                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition">
                                {t("dash_view_overdue")}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Quick actions */}
                <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.32s" }}>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--dt-primary)" }}>{t("dash_quick_actions")}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { labelKey: "dash_manage_users",    icon: Users,      href: "/dashboard/users"             },
                            { labelKey: "dash_manage_courses",  icon: BookOpen,   href: "/dashboard/courses"           },
                            { labelKey: "dash_manage_batches",  icon: Calendar,   href: "/dashboard/batches"           },
                            { labelKey: "dash_discounts",       icon: Tag,        href: "/dashboard/discounts"         },
                            { labelKey: "dash_monthly_payments",icon: CreditCard, href: "/dashboard/monthly-payments"  },
                            /* Future: { labelKey: "dash_analytics", icon: BarChart2, href: "/dashboard/analytics" }, */
                            /* Future: { labelKey: "dash_reports",   icon: TrendingUp, href: "/dashboard/reports"   }, */
                        ].map(({ labelKey, icon: Icon, href }) => (
                            <Link key={labelKey} href={href}
                                className="dash-pill-btn flex items-center gap-2 px-3 py-2.5 text-xs font-medium"
                                style={{ color: "var(--dt-secondary)" }}>
                                <Icon size={14} strokeWidth={1.7} style={{ color: "var(--dash-gradient-from)" }} />
                                {t(labelKey)}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Platform health */}
                <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.38s" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 size={16} style={{ color: "var(--dash-gradient-from)" }} />
                        <h3 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_platform_health")}</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: t("dash_enrollment_rate"),  value: data.total_active_enrollments > 0 ? `${Math.round((data.total_active_enrollments / Math.max(data.total_students, 1)) * 100)}%` : "0%", color: "#14b8a6" },
                            { label: t("dash_cert_rate"),        value: data.total_active_enrollments > 0 ? `${Math.round((data.total_certificates_issued / Math.max(data.total_active_enrollments, 1)) * 100)}%` : "0%", color: "#34d399" },
                            { label: t("dash_payment_health"),   value: data.monthly_overdue_count === 0 ? "100%" : `${Math.round(((data.total_active_enrollments - data.monthly_overdue_count) / Math.max(data.total_active_enrollments, 1)) * 100)}%`, color: data.monthly_overdue_count > 0 ? "#f87171" : "#34d399" },
                            /* Future: { label: t("dash_avg_completion"), value: "—", color: "#06b6d4" }, */
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between py-1.5 border-b last:border-b-0 dash-divider">
                                <span className="text-xs" style={{ color: "var(--dt-secondary)" }}>{label}</span>
                                <span className="text-sm font-bold" style={{ color }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
    const { user }             = useUser();
    const { t }                = useLocale();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardSummary()
            .then(setSummary)
            .finally(() => setLoading(false));
    }, []);

    const hour        = new Date().getHours();
    const greetingTime = hour < 12 ? t("dash_good_morning") : hour < 17 ? t("dash_good_afternoon") : t("dash_good_evening");
    const displayName = user?.first_name ?? "…";

    const greetingKey = summary?.role === "admin" ? "dash_hello" : summary?.role === "instructor" ? "dash_hello" : "dash_welcome_back";
    const subtitleKey = summary?.role === "admin" ? "dash_subtitle_admin" : summary?.role === "instructor" ? "dash_subtitle_teacher" : "dash_subtitle_student";

    return (
        <div className="max-w-[1280px] mx-auto space-y-7">

            {/* ── Header */}
            <div className="dash-anim-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ animationDelay: "0s" }}>
                <div>
                    <p className="text-sm mb-0.5" style={{ color: "var(--dt-muted)" }}>{greetingTime} 👋</p>
                    <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--dt-primary)" }}>
                        {t(greetingKey)},{" "}
                        <span className="dash-text-gradient">{displayName}</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--dt-tertiary)" }}>{t(subtitleKey)}</p>
                </div>
            </div>

            {/* ── Content */}
            {loading ? (
                <StatsSkeleton />
            ) : !summary ? (
                <div className="dash-card p-8 text-center">
                    <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("dash_load_error")}</p>
                </div>
            ) : summary.role === "admin" ? (
                <AdminDashboard data={summary.admin} />
            ) : summary.role === "instructor" ? (
                <InstructorDashboard data={summary.instructor} />
            ) : (
                <StudentDashboard data={summary.student} />
            )}
        </div>
    );
}
