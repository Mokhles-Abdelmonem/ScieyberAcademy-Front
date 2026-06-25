"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen, ChevronRight, CreditCard, Calendar,
  BarChart2, CheckCircle2, Clock, AlertCircle,
  LayoutGrid, LayoutList, X, Smartphone, Copy, Check,
  Upload, Loader2, ArrowLeft,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
  fetchMyEnrollments, payInstallment,
  fetchInstapayInfo, uploadInstapayScreenshot, submitInstapayInstallment,
} from "@/utils/academyApi";

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

/* ── Pay Installment Modal ─────────────────────────────────────── */

function PayInstallmentModal({ enrollment, onClose, onSuccess }) {
  const { t } = useLocale();
  const fileRef = useRef(null);

  const [method, setMethod]             = useState(null); // null | "card" | "instapay"
  const [step, setStep]                 = useState(1);    // 1 = transfer info, 2 = upload
  const [phone, setPhone]               = useState(null);
  const [copied, setCopied]             = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sending, setSending]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [cardLoading, setCardLoading]   = useState(false);
  const [error, setError]               = useState(null);

  const amount = Number(enrollment.installment_amount ?? 0);

  useEffect(() => {
    fetchInstapayInfo().then((info) => setPhone(info?.phone ?? null));
  }, []);

  async function handleCardPay() {
    setCardLoading(true);
    setError(null);
    try {
      const res = await payInstallment(enrollment.id);
      if (res.payment_url) {
        sessionStorage.setItem("paymob_enrollment_id", enrollment.id);
        window.location.href = res.payment_url;
      }
    } catch {
      setError(t("instapay_action_error"));
    } finally { setCardLoading(false); }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const result = await uploadInstapayScreenshot(file, setUploadProgress);
      setScreenshotUrl(result.url);
      setUploadProgress(100);
    } catch {
      setError(t("instapay_action_error"));
    } finally { setUploading(false); }
  }

  async function handleSend() {
    if (!screenshotUrl) return;
    setSending(true);
    setError(null);
    try {
      await submitInstapayInstallment(enrollment.id, screenshotUrl);
      setSuccess(true);
      onSuccess(enrollment.id);
    } catch (err) {
      const code = err?.body?.error_code;
      if (code === "INSTAPAY_REQUEST_DUPLICATE") {
        setSuccess(true);
        onSuccess(enrollment.id);
      } else {
        setError(t("instapay_action_error"));
      }
    } finally { setSending(false); }
  }

  function copyPhone() {
    if (phone) {
      navigator.clipboard.writeText(phone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            {method === "instapay" && step === 2 && (
              <button onClick={() => setStep(1)} className="p-1 rounded-lg hover:opacity-70 transition me-1"
                style={{ color: "var(--dt-muted)" }}>
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="text-base font-bold" style={{ color: "var(--dt-primary)" }}>
              {success ? t("instapay_success_title") : t("instapay_installment_title")}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition"
            style={{ color: "var(--dt-muted)" }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* ── Success state ── */}
          {success && (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
                <Check size={28} className="text-teal-500" />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--dt-primary)" }}>
                {t("instapay_installment_success")}
              </p>
            </div>
          )}

          {/* ── Method selection ── */}
          {!success && method === null && (
            <>
              <p className="text-sm" style={{ color: "var(--dt-muted)" }}>
                {t("instapay_installment_desc")}
              </p>
              <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--dt-muted)" }}>
                {t("instapay_installment_amount")}:
                <span className="ms-2 text-base font-bold" style={{ color: "var(--dt-primary)" }}>
                  {amount.toLocaleString()} EGP
                </span>
              </div>

              <button onClick={handleCardPay} disabled={cardLoading}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-teal-400 transition-all duration-150 text-start disabled:opacity-60">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  {cardLoading
                    ? <Loader2 size={18} className="text-blue-500 animate-spin" />
                    : <CreditCard size={18} className="text-blue-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>
                    {t("instapay_pay_with_card")}
                  </p>
                  <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
                    {t("instapay_pay_with_card_desc")}
                  </p>
                </div>
              </button>

              <button onClick={() => setMethod("instapay")}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-teal-400 transition-all duration-150 text-start">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                  <Smartphone size={18} className="text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>
                    {t("instapay_pay_with_instapay")}
                  </p>
                  <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
                    {t("instapay_pay_with_instapay_desc")}
                  </p>
                </div>
              </button>
            </>
          )}

          {/* ── InstaPay: Step 1 — transfer info ── */}
          {!success && method === "instapay" && step === 1 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dt-muted)" }}>
                {t("instapay_installment_step1")}
              </p>

              {/* Amount box */}
              <div className="rounded-xl px-4 py-3 text-center"
                style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--dt-muted)" }}>
                  {t("instapay_installment_amount")}
                </p>
                <p className="text-2xl font-bold" style={{ color: "#14b8a6" }}>
                  {amount.toLocaleString()} EGP
                </p>
              </div>

              {/* Phone number */}
              <div className="rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs mb-1.5" style={{ color: "var(--dt-muted)" }}>
                  {t("instapay_phone_label") ?? "InstaPay Number"}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold tracking-wide" style={{ color: "var(--dt-primary)", direction: "ltr" }}>
                    {phone ?? "—"}
                  </span>
                  <button onClick={copyPhone}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
                    style={{
                      background: copied ? "rgba(20,184,166,0.15)" : "rgba(20,184,166,0.08)",
                      color: "#14b8a6",
                      border: "1px solid rgba(20,184,166,0.2)",
                    }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? t("instapay_copied") ?? "Copied!" : t("instapay_copy") ?? "Copy"}
                  </button>
                </div>
              </div>

              <button onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition"
                style={{ background: "linear-gradient(135deg,#14b8a6,#0891b2)" }}>
                {t("instapay_next") ?? "Next"} →
              </button>
            </>
          )}

          {/* ── InstaPay: Step 2 — upload receipt ── */}
          {!success && method === "instapay" && step === 2 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dt-muted)" }}>
                {t("instapay_installment_step2")}
              </p>

              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={handleFileChange} />

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={`w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed transition-all duration-150 ${
                  screenshotUrl
                    ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20"
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-400 dark:hover:border-slate-500"
                }`}>
                {screenshotUrl
                  ? <Check size={24} className="text-teal-500" />
                  : <Upload size={24} />}
                <p className="text-sm font-medium" style={{ color: screenshotUrl ? "#14b8a6" : "var(--dt-muted)" }}>
                  {screenshotUrl
                    ? (t("instapay_screenshot_uploaded") ?? "Screenshot uploaded")
                    : (t("instapay_upload_screenshot") ?? "Upload screenshot")}
                </p>
              </button>

              {/* Upload progress bar */}
              {uploading && (
                <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(20,184,166,0.08)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
                      <Loader2 size={11} className="animate-spin" />
                      {t("instapay_uploading")}
                    </span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(20,184,166,0.2)" }}>
                    <div className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg,#0d9488,#0891b2)" }} />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
              )}

              <button
                onClick={handleSend}
                disabled={!screenshotUrl || uploading || sending}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#14b8a6,#0891b2)" }}>
                {sending
                  ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> {t("instapay_sending") ?? "Sending…"}</span>
                  : (t("instapay_send_request") ?? "Send Request")}
              </button>
            </>
          )}

          {/* Card error */}
          {!success && method === null && error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}


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

function EnrollmentCard({ enrollment, index, onOpenPayModal }) {
  const { t } = useLocale();
  const status  = STATUS_STYLE[enrollment.status]   ?? STATUS_STYLE.PENDING;
  const payment = PAYMENT_STYLE[enrollment.payment_status] ?? PAYMENT_STYLE.PENDING;

  const isMonthlyPartial = enrollment.payment_type === "MONTHLY" && enrollment.payment_status === "PARTIAL";
  const paidInstallments = isMonthlyPartial && enrollment.installment_amount > 0
    ? Math.floor(Number(enrollment.paid_amount) / Number(enrollment.installment_amount))
    : null;

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

      {/* Monthly installment progress */}
      {isMonthlyPartial && paidInstallments !== null && (
        <div className="mb-3 flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg"
          style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
          <CreditCard size={11} />
          {t("dash_installments_progress")
            .replace("{paid}", paidInstallments)
            .replace("{total}", enrollment.installment_count)}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs flex items-center gap-1" style={{ color: "var(--dt-muted)" }}>
          <Calendar size={11} />
          {enrollment.batch?.start_date
            ? new Date(enrollment.batch.start_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })
            : "—"}
        </span>
        <div className="flex items-center gap-1.5">
          {isMonthlyPartial && (
            <button onClick={() => onOpenPayModal(enrollment)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition">
              <CreditCard size={11} />
              {t("dash_pay_installment")}
            </button>
          )}
          <Link
            href={`/dashboard/enrollments/${enrollment.id}`}
            className="dash-pill-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5"
            style={{ color: "var(--dt-secondary)" }}
          >
            {t("dash_view_enrollment")} <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── List row ──────────────────────────────────────────────────── */

function EnrollmentRow({ enrollment, index, onOpenPayModal }) {
  const { t } = useLocale();
  const status  = STATUS_STYLE[enrollment.status]          ?? STATUS_STYLE.PENDING;
  const payment = PAYMENT_STYLE[enrollment.payment_status] ?? PAYMENT_STYLE.PENDING;

  const isMonthlyPartial = enrollment.payment_type === "MONTHLY" && enrollment.payment_status === "PARTIAL";

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
        <div className="flex items-center gap-2">
          {isMonthlyPartial && (
            <button onClick={() => onOpenPayModal(enrollment)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition whitespace-nowrap">
              <CreditCard size={11} />
              {t("dash_pay_installment")}
            </button>
          )}
          <Link
            href={`/dashboard/enrollments/${enrollment.id}`}
            className="dash-pill-btn inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 whitespace-nowrap"
            style={{ color: "var(--dt-secondary)" }}
          >
            {t("dash_view_enrollment")} <ChevronRight size={11} />
          </Link>
        </div>
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
  const [payModal, setPayModal]             = useState(null); // enrollment | null

  function openPayModal(enrollment) { setPayModal(enrollment); }
  function closePayModal() { setPayModal(null); }

  function handleInstallmentSubmitted(enrollmentId) {
    // Mark the enrollment as having a pending instapay installment (no more button)
    // We can't change paid_amount yet (pending approval), but we hide the button
    // by temporarily treating the enrollment as if it's awaiting review.
    // Simplest: just close the modal — admin approval will update the actual state.
    closePayModal();
  }

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
              ? enrollments.map((e, i) => <EnrollmentCard key={e.id} enrollment={e} index={i} onOpenPayModal={openPayModal} />)
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
                    ? enrollments.map((e, i) => <EnrollmentRow key={e.id} enrollment={e} index={i} onOpenPayModal={openPayModal} />)
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

      {/* ── Pay Installment Modal ── */}
      {payModal && (
        <PayInstallmentModal
          enrollment={payModal}
          onClose={closePayModal}
          onSuccess={handleInstallmentSubmitted}
        />
      )}
    </div>
  );
}
