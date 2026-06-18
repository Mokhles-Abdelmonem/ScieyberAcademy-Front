"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, CreditCard, Calendar, MapPin,
  BarChart2, CheckCircle2, XCircle, Clock,
  AlertCircle, Wifi, Building2,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
  fetchEnrollmentDetail,
  fetchEnrollmentPayments,
  fetchAttendanceSummary,
} from "@/utils/academyApi";

const ENROLLMENT_STATUS = {
  ACTIVE:    { text: "#14b8a6", bg: "rgba(20,184,166,0.15)",  border: "rgba(20,184,166,0.3)"  },
  COMPLETED: { text: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.3)"  },
  DROPPED:   { text: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.3)" },
  PENDING:   { text: "#fbbf24", bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.3)"  },
};

const PAYMENT_METHODS = {
  CASH:          "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD:          "Card",
  ONLINE:        "Online",
};

const ATTENDANCE_ICON = {
  PRESENT: { icon: CheckCircle2, color: "#34d399" },
  ABSENT:  { icon: XCircle,      color: "#f87171" },
  LATE:    { icon: Clock,        color: "#fbbf24" },
  EXCUSED: { icon: AlertCircle,  color: "#94a3b8" },
};

function Skeleton({ className = "" }) {
  return (
    <div className={`rounded-full animate-pulse ${className}`}
      style={{ background: "rgba(var(--dash-border-a),0.1)" }} />
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-b-0 dash-divider">
      <span className="text-xs shrink-0" style={{ color: "var(--dt-muted)" }}>{label}</span>
      <span className="text-xs font-medium text-end" style={{ color: "var(--dt-secondary)" }}>{value ?? "—"}</span>
    </div>
  );
}

export default function EnrollmentDetailPage({ params }) {
  const { id } = use(params);
  const { t, isRTL } = useLocale();

  const [enrollment, setEnrollment] = useState(null);
  const [payments, setPayments]     = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchEnrollmentDetail(id),
      fetchEnrollmentPayments(id),
      fetchAttendanceSummary(id),
    ]).then(([enrl, pmts, att]) => {
      setEnrollment(enrl);
      setPayments(pmts ?? []);
      setAttendance(att);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto space-y-5 dash-anim-up">
        <Skeleton className="h-5 w-40" />
        <div className="dash-card p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="max-w-[900px] mx-auto">
        <div className="dash-card p-10 text-center">
          <XCircle size={32} style={{ color: "var(--dt-muted)" }} className="mx-auto mb-3" strokeWidth={1.2} />
          <p className="text-sm" style={{ color: "var(--dt-secondary)" }}>{t("dash_not_found")}</p>
          <Link href="/dashboard/enrollments"
            className="mt-4 dash-pill-btn inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2"
            style={{ color: "var(--dt-secondary)" }}>
            <ArrowLeft size={12} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
            {t("dash_back_to_enrollments")}
          </Link>
        </div>
      </div>
    );
  }

  const status  = ENROLLMENT_STATUS[enrollment.status] ?? ENROLLMENT_STATUS.PENDING;
  const paid    = Number(enrollment.paid_amount ?? 0);
  const total   = Number(enrollment.total_amount ?? 0);
  const remaining = total - paid;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 100;

  const batchStatus = enrollment.batch?.status;
  const startDate   = enrollment.batch?.start_date
    ? new Date(enrollment.batch.start_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;
  const endDate     = enrollment.batch?.end_date
    ? new Date(enrollment.batch.end_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  const completionPct = enrollment.progress?.completion_percentage ?? 0;
  const attended      = enrollment.progress?.sessions_attended ?? 0;
  const sessionTotal  = enrollment.progress?.sessions_total ?? 0;

  return (
    <div className="max-w-[900px] mx-auto space-y-5">

      {/* Back link */}
      <Link href="/dashboard/enrollments"
        className="dash-anim-up flex items-center gap-1.5 text-xs font-medium w-fit"
        style={{ color: "var(--dt-muted)", animationDelay: "0s" }}>
        <ArrowLeft size={13} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
        {t("dash_back_to_enrollments")}
      </Link>

      {/* ── Page header ── */}
      <div className="dash-anim-up flex items-start justify-between gap-4" style={{ animationDelay: "0.05s" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
            {enrollment.batch?.name ?? t("dash_enrollment_detail")}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>
            ID: <span className="font-mono">{enrollment.id.slice(0, 8)}…</span>
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full"
          style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
          {t(`dash_enroll_status_${enrollment.status.toLowerCase()}`)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── Progress ── */}
        <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} style={{ color: "var(--dash-gradient-from)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_your_progress")}</h2>
          </div>

          {/* Completion ring */}
          <div className="flex items-center gap-5 mb-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke="rgba(var(--dash-border-a),0.08)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke="url(#progGrad)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${Math.round(completionPct)} 100`} />
                <defs>
                  <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ color: "var(--dt-primary)" }}>
                {Math.round(completionPct)}%
              </span>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--dt-muted)" }}>{t("dash_sessions_attended")}</span>
                <span className="font-semibold" style={{ color: "var(--dt-secondary)" }}>
                  {attended}/{sessionTotal}
                </span>
              </div>
              {attendance && (
                <>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--dt-muted)" }}>{t("dash_attendance_rate")}</span>
                    <span className="font-semibold" style={{ color: "var(--dt-secondary)" }}>
                      {attendance.attendance_rate != null
                        ? `${Math.round(attendance.attendance_rate)}%`
                        : "—"}
                    </span>
                  </div>
                  {Object.entries({ present: "#34d399", absent: "#f87171", late: "#fbbf24", excused: "#94a3b8" }).map(([key, color]) => {
                    const count = attendance[key] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div key={key} className="flex justify-between text-[10px]">
                        <span style={{ color: "var(--dt-muted)" }}>{t(`dash_${key}`)}</span>
                        <span className="font-semibold" style={{ color }}>{count}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          <div className="dash-progress-track h-1.5">
            <div className="dash-progress-fill h-full" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* ── Batch info ── */}
        <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.13s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} style={{ color: "var(--dash-gradient-from)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_batch_info")}</h2>
          </div>
          <InfoRow label={t("dash_start_date")} value={startDate} />
          <InfoRow label={t("dash_end_date")} value={endDate} />
          {enrollment.batch?.location && (
            <InfoRow label={t("dash_location")} value={
              <span className="flex items-center gap-1">
                <Building2 size={10} /> {enrollment.batch.location}
              </span>
            } />
          )}
          {enrollment.batch?.online_link && (
            <InfoRow label={t("dash_online_link")} value={
              <a href={enrollment.batch.online_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1" style={{ color: "#14b8a6" }}>
                <Wifi size={10} /> Join link
              </a>
            } />
          )}
          {batchStatus && (
            <InfoRow label="Status" value={batchStatus} />
          )}
        </div>

        {/* ── Payment summary ── */}
        <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.16s" }}>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={15} style={{ color: "var(--dash-gradient-from)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_payment_summary")}</h2>
          </div>

          {/* Payment bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: "var(--dt-muted)" }}>
                ${paid.toFixed(0)} / ${total.toFixed(0)}
              </span>
              <span className="text-xs font-semibold" style={{ color: "#34d399" }}>{paidPct}%</span>
            </div>
            <div className="dash-progress-track h-2">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%`, background: "linear-gradient(90deg,#34d39966,#34d399)" }} />
            </div>
          </div>

          <InfoRow label={t("dash_total_amount")} value={`$${total.toFixed(2)}`} />
          <InfoRow label={t("dash_paid_amount")}  value={`$${paid.toFixed(2)}`} />
          {remaining > 0 && (
            <InfoRow label={t("dash_remaining")}
              value={<span style={{ color: "#f87171" }}>${remaining.toFixed(2)}</span>} />
          )}
        </div>

        {/* ── Payment history ── */}
        <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.19s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} style={{ color: "var(--dash-gradient-from)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_payment_history")}</h2>
          </div>

          {payments.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--dt-muted)" }}>
              {t("dash_no_payments")}
            </p>
          ) : (
            <div className="space-y-0">
              {payments.map((p, i) => (
                <div key={p.id ?? i}
                  className="flex items-center justify-between py-2.5 border-b last:border-b-0 dash-divider">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--dt-secondary)" }}>
                      ${Number(p.amount).toFixed(2)}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--dt-muted)" }}>
                      {PAYMENT_METHODS[p.payment_method] ?? p.payment_method}
                      {p.reference_number ? ` · ${p.reference_number}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--dt-muted)" }}>
                    {new Date(p.payment_date).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
