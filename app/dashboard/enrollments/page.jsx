"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, ChevronRight, CreditCard, Calendar,
  BarChart2, CheckCircle2, Clock, AlertCircle,
  LayoutGrid, LayoutList,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { fetchMyEnrollments } from "@/utils/academyApi";

const STATUS_STYLE = {
  ACTIVE:    { bg: "rgba(20,184,166,0.15)",  text: "#14b8a6", border: "rgba(20,184,166,0.3)"  },
  COMPLETED: { bg: "rgba(52,211,153,0.15)",  text: "#34d399", border: "rgba(52,211,153,0.3)"  },
  DROPPED:   { bg: "rgba(248,113,113,0.15)", text: "#f87171", border: "rgba(248,113,113,0.3)" },
  PENDING:   { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24", border: "rgba(251,191,36,0.3)"  },
};

const PAYMENT_STYLE = {
  PAID:    { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
  PARTIAL: { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24" },
  PENDING: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
};

/* ── Skeletons ─────────────────────────────────────────────────── */

function EnrollmentSkeleton() {
  return (
    <div className="dash-card p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "50%" }} />
        <div className="h-5 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "15%" }} />
      </div>
      <div className="h-4 rounded-full mb-2" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "70%" }} />
      <div className="h-3 rounded-full mb-4" style={{ background: "rgba(var(--dash-border-a),0.06)", width: "40%" }} />
      <div className="h-1.5 rounded-full mb-4" style={{ background: "rgba(var(--dash-border-a),0.08)" }} />
      <div className="flex justify-between">
        <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "30%" }} />
        <div className="h-7 rounded-lg" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "25%" }} />
      </div>
    </div>
  );
}

function EnrollmentRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[42, 14, 14, 16, 12, 14, 10].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Grid card ─────────────────────────────────────────────────── */

function EnrollmentCard({ enrollment, index }) {
  const { t } = useLocale();
  const status  = STATUS_STYLE[enrollment.status]   ?? STATUS_STYLE.PENDING;
  const payment = PAYMENT_STYLE[enrollment.payment_status] ?? PAYMENT_STYLE.PENDING;

  const progress  = enrollment.progress?.completion_percentage ?? 0;
  const attended  = enrollment.progress?.sessions_attended ?? 0;
  const total     = enrollment.progress?.sessions_total ?? 0;
  const batchName = enrollment.batch?.name ?? `Batch ${enrollment.batch_id?.slice(0, 8)}`;
  const enrolledDate = new Date(enrollment.enrolled_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  const paidPct = enrollment.total_amount > 0
    ? Math.round((Number(enrollment.paid_amount) / Number(enrollment.total_amount)) * 100)
    : 100;

  return (
    <div className="dash-card p-5 flex flex-col dash-anim-up" style={{ animationDelay: `${index * 0.07}s` }}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
            {t(`dash_enroll_status_${enrollment.status.toLowerCase()}`)}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: payment.bg, color: payment.text }}>
            {t(`dash_payment_status_${enrollment.payment_status.toLowerCase()}`)}
          </span>
        </div>
        <span className="text-[10px] shrink-0" style={{ color: "var(--dt-muted)" }}>
          {enrolledDate}
        </span>
      </div>

      {/* Batch name */}
      <h3 className="text-sm font-semibold leading-snug mb-1" style={{ color: "var(--dt-primary)" }}>
        {batchName}
      </h3>

      {/* Sessions count */}
      <p className="text-xs mb-4 flex items-center gap-1" style={{ color: "var(--dt-muted)" }}>
        <BarChart2 size={11} />
        {attended}/{total} {t("dash_sessions_attended")}
      </p>

      {/* Progress bar */}
      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px]" style={{ color: "var(--dt-tertiary)" }}>{t("dash_completion")}</span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--dt-secondary)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="dash-progress-track h-1.5">
          <div className="dash-progress-fill h-full" style={{
            width: `${progress}%`,
            background: enrollment.status === "COMPLETED"
              ? "linear-gradient(90deg,#34d39999,#34d399)"
              : "linear-gradient(90deg,#14b8a6cc,#14b8a6)",
          }} />
        </div>
      </div>

      {/* Payment bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px]" style={{ color: "var(--dt-muted)" }}>
            <CreditCard size={10} className="inline me-1" />
            ${Number(enrollment.paid_amount).toFixed(0)} / ${Number(enrollment.total_amount).toFixed(0)}
          </span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--dt-muted)" }}>{paidPct}%</span>
        </div>
        <div className="dash-progress-track h-1">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${paidPct}%`, background: "linear-gradient(90deg,#34d39966,#34d399)" }} />
        </div>
      </div>

      <div className="flex-1" />

      {/* CTA */}
      <div className="flex items-center justify-between">
        <span className="text-xs flex items-center gap-1" style={{ color: "var(--dt-muted)" }}>
          <Calendar size={11} />
          {enrollment.batch?.start_date
            ? new Date(enrollment.batch.start_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })
            : "—"}
        </span>
        <Link
          href={`/dashboard/enrollments/${enrollment.id}`}
          className="dash-pill-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5"
          style={{ color: "var(--dt-secondary)" }}
        >
          {t("dash_view_enrollment")} <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

/* ── List row ──────────────────────────────────────────────────── */

function EnrollmentRow({ enrollment, index }) {
  const { t } = useLocale();
  const status  = STATUS_STYLE[enrollment.status]          ?? STATUS_STYLE.PENDING;
  const payment = PAYMENT_STYLE[enrollment.payment_status] ?? PAYMENT_STYLE.PENDING;

  const progress  = enrollment.progress?.completion_percentage ?? 0;
  const attended  = enrollment.progress?.sessions_attended ?? 0;
  const total     = enrollment.progress?.sessions_total ?? 0;
  const batchName = enrollment.batch?.name ?? `Batch ${enrollment.batch_id?.slice(0, 8)}`;
  const paidPct   = enrollment.total_amount > 0
    ? Math.round((Number(enrollment.paid_amount) / Number(enrollment.total_amount)) * 100)
    : 100;

  return (
    <tr
      className="dash-anim-up transition-colors duration-150"
      style={{ animationDelay: `${index * 0.04}s`, borderBottom: "1px solid var(--dash-border)" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--dash-border-a),0.04)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      {/* Batch */}
      <td className="px-4 py-3 min-w-[200px]">
        <p className="text-sm font-semibold line-clamp-1" style={{ color: "var(--dt-primary)" }}>
          {batchName}
        </p>
      </td>

      {/* Enrollment status */}
      <td className="px-4 py-3">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
          {t(`dash_enroll_status_${enrollment.status.toLowerCase()}`)}
        </span>
      </td>

      {/* Payment */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap w-fit"
            style={{ background: payment.bg, color: payment.text }}>
            {t(`dash_payment_status_${enrollment.payment_status.toLowerCase()}`)}
          </span>
          <span className="text-[10px]" style={{ color: "var(--dt-muted)" }}>
            ${Number(enrollment.paid_amount).toFixed(0)} / ${Number(enrollment.total_amount).toFixed(0)} ({paidPct}%)
          </span>
        </div>
      </td>

      {/* Sessions */}
      <td className="px-4 py-3">
        <span className="text-xs flex items-center gap-1 whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
          <BarChart2 size={12} /> {attended}/{total}
        </span>
      </td>

      {/* Completion */}
      <td className="px-4 py-3 min-w-[110px]">
        <div className="flex items-center gap-2">
          <div className="flex-1 dash-progress-track h-1.5" style={{ minWidth: 60 }}>
            <div className="h-full dash-progress-fill" style={{
              width: `${progress}%`,
              background: enrollment.status === "COMPLETED"
                ? "linear-gradient(90deg,#34d399,#34d399)"
                : "linear-gradient(90deg,#14b8a6,#14b8a6)",
            }} />
          </div>
          <span className="text-[11px] font-semibold shrink-0" style={{ color: "var(--dt-secondary)" }}>
            {Math.round(progress)}%
          </span>
        </div>
      </td>

      {/* Start date */}
      <td className="px-4 py-3">
        <span className="text-xs flex items-center gap-1 whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
          <Calendar size={12} />
          {enrollment.batch?.start_date
            ? new Date(enrollment.batch.start_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })
            : "—"}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/enrollments/${enrollment.id}`}
          className="dash-pill-btn inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 whitespace-nowrap"
          style={{ color: "var(--dt-secondary)" }}
        >
          {t("dash_view_enrollment")} <ChevronRight size={11} />
        </Link>
      </td>
    </tr>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function EnrollmentsPage() {
  const { t } = useLocale();
  const [enrollments, setEnrollments]       = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState("ALL");
  const [view, setView]                     = useState("grid");

  useEffect(() => {
    fetchMyEnrollments().then((data) => setAllEnrollments(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMyEnrollments({ status: filter !== "ALL" ? filter : undefined }).then((data) => {
      setEnrollments(data);
      setLoading(false);
    });
  }, [filter]);

  const statuses = ["ALL", "ACTIVE", "COMPLETED", "PENDING", "DROPPED"];

  const active    = allEnrollments.filter((e) => e.status === "ACTIVE").length;
  const completed = allEnrollments.filter((e) => e.status === "COMPLETED").length;

  const TABLE_COLS = [
    t("dash_col_batch"),
    t("dash_col_status"),
    t("dash_col_payment"),
    t("dash_col_sessions"),
    t("dash_col_completion"),
    t("dash_col_start_date"),
    t("dash_col_action"),
  ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="dash-anim-up" style={{ animationDelay: "0s" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>
          {t("dash_my_enrollments")}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
          {t("dash_my_enrollments_desc")}
        </p>
      </div>

      {/* ── Mini stats ── */}
      {allEnrollments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 dash-anim-up" style={{ animationDelay: "0.06s" }}>
          {[
            { icon: BookOpen,     label: t("dash_stat_enrolled"),          value: allEnrollments.length,                                                           color: "#14b8a6" },
            { icon: CheckCircle2, label: t("dash_stat_completed"),         value: completed,                                                                       color: "#34d399" },
            { icon: Clock,        label: t("dash_enroll_status_active"),   value: active,                                                                          color: "#fbbf24" },
            { icon: AlertCircle,  label: t("dash_payment_status_partial"), value: allEnrollments.filter((e) => e.payment_status === "PARTIAL").length,             color: "#f87171" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <div key={i} className="dash-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}22`, border: `1px solid ${color}33` }}>
                <Icon size={16} style={{ color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none" style={{ color: "var(--dt-primary)" }}>{value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--dt-muted)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 dash-anim-up" style={{ animationDelay: "0.1s" }}>
        {/* Status filter */}
        <div className="flex items-center gap-1 dash-glass p-1 rounded-xl">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all duration-150"
              style={filter === s
                ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
                : { color: "var(--dt-muted)" }}
            >
              {s === "ALL" ? t("dash_all") : t(`dash_enroll_status_${s.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div
          className="flex items-center p-1 rounded-xl gap-0.5"
          style={{ background: "var(--dash-glass-bg)", border: "1px solid var(--dash-border)" }}
        >
          <button
            onClick={() => setView("grid")}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={view === "grid"
              ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
              : { color: "var(--dt-muted)" }}
            title={t("dash_view_grid")}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={view === "list"
              ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
              : { color: "var(--dt-muted)" }}
            title={t("dash_view_list")}
          >
            <LayoutList size={14} />
          </button>
        </div>
      </div>

      {/* ── Count ── */}
      {!loading && (
        <p className="text-xs dash-anim-up" style={{ color: "var(--dt-muted)", animationDelay: "0.12s" }}>
          {enrollments.length} {t("dash_courses_found")}
        </p>
      )}

      {/* ── Grid view ── */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <EnrollmentSkeleton key={i} />)
            : enrollments.length > 0
              ? enrollments.map((e, i) => <EnrollmentCard key={e.id} enrollment={e} index={i} />)
              : (
                <div className="col-span-full dash-card p-10 flex flex-col items-center gap-3 text-center">
                  <BookOpen size={32} style={{ color: "var(--dt-muted)" }} strokeWidth={1.2} />
                  <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>
                    {t("dash_no_enrollments")}
                  </p>
                  <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
                    {t("dash_no_enrollments_desc")}
                  </p>
                  <Link
                    href="/dashboard/courses"
                    className="mt-2 dash-pill-btn flex items-center gap-1.5 text-xs font-medium px-4 py-2"
                    style={{ color: "var(--dt-secondary)" }}
                  >
                    {t("dash_browse_courses")} <ChevronRight size={12} />
                  </Link>
                </div>
              )
          }
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dash-border)", background: "rgba(var(--dash-border-a),0.04)" }}>
                  {TABLE_COLS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--dt-muted)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <EnrollmentRowSkeleton key={i} />)
                  : enrollments.length > 0
                    ? enrollments.map((e, i) => <EnrollmentRow key={e.id} enrollment={e} index={i} />)
                    : (
                      <tr>
                        <td colSpan={TABLE_COLS.length} className="px-4 py-10 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <BookOpen size={28} style={{ color: "var(--dt-muted)" }} strokeWidth={1.2} />
                            <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>
                              {t("dash_no_enrollments")}
                            </p>
                            <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
                              {t("dash_no_enrollments_desc")}
                            </p>
                            <Link
                              href="/dashboard/courses"
                              className="mt-1 dash-pill-btn inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2"
                              style={{ color: "var(--dt-secondary)" }}
                            >
                              {t("dash_browse_courses")} <ChevronRight size={12} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
