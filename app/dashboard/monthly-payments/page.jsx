"use client";

import { useEffect, useState } from "react";
import {
    CreditCard, Loader2, AlertTriangle, CheckCircle2, Clock,
    ChevronDown, RefreshCw, Filter,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { adminFetchMonthlyInstallments, adminUpdateEnrollmentStatus } from "@/utils/academyApi";

const STATUS_OPTIONS = ["ACTIVE", "DROPPED", "COMPLETED"];

function OverdueBadge({ days }) {
    if (days === 0) return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/40">
            <CheckCircle2 size={10} /> On Track
        </span>
    );
    if (days <= 7) return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            <Clock size={10} /> {days}d late
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
            <AlertTriangle size={10} /> {days}d overdue
        </span>
    );
}

function StatusDropdown({ enrollment, onUpdated }) {
    const { t } = useLocale();
    const [open, setOpen]       = useState(false);
    const [saving, setSaving]   = useState(false);

    async function change(newStatus) {
        if (newStatus === enrollment.status) { setOpen(false); return; }
        setSaving(true); setOpen(false);
        try {
            await adminUpdateEnrollmentStatus(enrollment.enrollment_id, newStatus);
            onUpdated(enrollment.enrollment_id, newStatus);
        } catch {}
        finally { setSaving(false); }
    }

    const colors = {
        ACTIVE:    "text-teal-600 dark:text-teal-400",
        DROPPED:   "text-red-500 dark:text-red-400",
        COMPLETED: "text-green-600 dark:text-green-400",
        PENDING:   "text-amber-500 dark:text-amber-400",
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(o => !o)} disabled={saving}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition disabled:opacity-50 ${colors[enrollment.status] ?? ""}`}>
                {saving ? <Loader2 size={11} className="animate-spin" /> : enrollment.status}
                <ChevronDown size={11} />
            </button>
            {open && (
                <div className="absolute end-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[110px]">
                    {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => change(s)}
                            className={`w-full text-start px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition ${colors[s] ?? ""}`}>
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MonthlyPaymentsPage() {
    const { t } = useLocale();
    const [rows, setRows]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState("all"); // all | overdue

    function reload() {
        setLoading(true);
        adminFetchMonthlyInstallments()
            .then(setRows)
            .finally(() => setLoading(false));
    }

    useEffect(() => { reload(); }, []);

    function handleStatusUpdated(enrollmentId, newStatus) {
        setRows(prev => prev.map(r =>
            r.enrollment_id === enrollmentId ? { ...r, status: newStatus } : r
        ));
    }

    const visible = filter === "overdue" ? rows.filter(r => r.days_overdue > 0) : rows;
    const overdueCount = rows.filter(r => r.days_overdue > 0).length;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--dt-primary)" }}>
                        <CreditCard size={20} />
                        {t("mp_title")}
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>{t("mp_subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        {[
                            { key: "all",     label: t("mp_filter_all") },
                            { key: "overdue", label: `${t("mp_filter_overdue")}${overdueCount > 0 ? ` (${overdueCount})` : ""}` },
                        ].map(({ key, label }) => (
                            <button key={key} onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 text-xs font-semibold transition ${
                                    filter === key
                                        ? "bg-teal-500 text-white"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <button onClick={reload} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-teal-500 transition">
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
            ) : visible.length === 0 ? (
                <div className="text-center py-24">
                    <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" strokeWidth={1.5} />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t("mp_empty_title")}</p>
                    <p className="text-sm text-slate-400 mt-1">{t("mp_empty_desc")}</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <th className="text-start px-4 py-3 font-semibold">{t("mp_col_student")}</th>
                                <th className="text-start px-4 py-3 font-semibold">{t("mp_col_course")}</th>
                                <th className="text-start px-4 py-3 font-semibold">{t("mp_col_installments")}</th>
                                <th className="text-start px-4 py-3 font-semibold">{t("mp_col_amount")}</th>
                                <th className="text-start px-4 py-3 font-semibold">{t("mp_col_next_due")}</th>
                                <th className="text-start px-4 py-3 font-semibold">{t("mp_col_overdue")}</th>
                                <th className="text-start px-4 py-3 font-semibold">{t("mp_col_status")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((row, i) => {
                                const isOverdue = row.days_overdue > 0;
                                return (
                                    <tr key={row.enrollment_id}
                                        className={`border-t border-slate-100 dark:border-slate-700/50 ${
                                            isOverdue ? "bg-red-50/40 dark:bg-red-900/10" : i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/20"
                                        }`}>
                                        {/* Student */}
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800 dark:text-white text-xs">{row.student_name}</p>
                                            {row.student_email && (
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">{row.student_email}</p>
                                            )}
                                        </td>

                                        {/* Course / Batch */}
                                        <td className="px-4 py-3">
                                            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{row.course_title}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{row.batch_name}</p>
                                        </td>

                                        {/* Installment progress */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                    {row.paid_installments} / {row.installment_count}
                                                </div>
                                                <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <div className="h-full rounded-full bg-teal-500"
                                                        style={{ width: `${(row.paid_installments / row.installment_count) * 100}%` }} />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                {Number(row.installment_amount).toLocaleString()} EGP/{t("mp_month")}
                                            </p>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-3">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                {Number(row.paid_amount).toLocaleString()} EGP
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                / {Number(row.total_amount).toLocaleString()} EGP
                                            </p>
                                        </td>

                                        {/* Next due */}
                                        <td className="px-4 py-3">
                                            {row.next_due_date ? (
                                                <p className={`text-xs font-medium ${isOverdue ? "text-red-500 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}`}>
                                                    {new Date(row.next_due_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>

                                        {/* Overdue badge */}
                                        <td className="px-4 py-3">
                                            <OverdueBadge days={row.days_overdue} />
                                        </td>

                                        {/* Status dropdown */}
                                        <td className="px-4 py-3">
                                            <StatusDropdown enrollment={row} onUpdated={handleStatusUpdated} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary cards */}
            {!loading && rows.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[
                        { label: t("mp_stat_total"),   value: rows.length,      color: "text-teal-600 dark:text-teal-400" },
                        { label: t("mp_stat_overdue"),  value: overdueCount,     color: "text-red-500 dark:text-red-400"   },
                        { label: t("mp_stat_on_track"), value: rows.length - overdueCount, color: "text-green-600 dark:text-green-400" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
