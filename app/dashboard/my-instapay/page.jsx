"use client";

import { useEffect, useState } from "react";
import { Loader2, Smartphone, ExternalLink } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { fetchMyInstapayRequests } from "@/utils/academyApi";

function StatusBadge({ status, t }) {
    const cfg = {
        PENDING:  { cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",  label: t("instapay_tab_pending")  },
        APPROVED: { cls: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/40",  label: t("instapay_tab_approved") },
        REJECTED: { cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40",              label: t("instapay_tab_rejected") },
    }[status] ?? { cls: "bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600", label: status };
    return (
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

export default function MyInstapayRequestsPage() {
    const { t } = useLocale();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        fetchMyInstapayRequests()
            .then(setRequests)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-1">
                    <Smartphone size={20} className="text-teal-500" />
                    <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
                        {t("instapay_my_title")}
                    </h1>
                </div>
                <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("instapay_my_desc")}</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20">
                    <Smartphone size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" strokeWidth={1} />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t("instapay_my_no_requests")}</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_course")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("dash_batches")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_installment_type")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_amount")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_plan")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_screenshot")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_submitted")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_status")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_note")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req, i) => {
                                    const isMonthly  = req.payment_type === "MONTHLY" && req.installment_count;
                                    const displayAmt = isMonthly
                                        ? Math.ceil(Number(req.final_amount) / req.installment_count)
                                        : Number(req.final_amount);

                                    return (
                                        <tr key={req.id}
                                            className={`border-t border-slate-100 dark:border-slate-700/50 ${
                                                i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/20"
                                            }`}
                                        >
                                            {/* Course */}
                                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                                                {req.course_title ?? "—"}
                                            </td>

                                            {/* Batch */}
                                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                                                {req.batch_name ?? "—"}
                                            </td>

                                            {/* Type */}
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border ${
                                                    req.enrollment_id
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40"
                                                        : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40"
                                                }`}>
                                                    {req.enrollment_id ? t("instapay_type_installment") : t("instapay_type_enrollment")}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {isMonthly ? (
                                                    <div>
                                                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                            {displayAmt.toLocaleString()} EGP
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {t("instapay_per_month")} × {req.installment_count}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                        {displayAmt.toLocaleString()} EGP
                                                    </p>
                                                )}
                                            </td>

                                            {/* Plan */}
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border ${
                                                    isMonthly
                                                        ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/40"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                                }`}>
                                                    {isMonthly ? t("instapay_plan_monthly") : t("instapay_plan_full")}
                                                </span>
                                            </td>

                                            {/* Screenshot */}
                                            <td className="px-5 py-3.5">
                                                <a
                                                    href={req.screenshot_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-teal-500 hover:text-teal-600 text-xs font-medium"
                                                >
                                                    {t("instapay_col_screenshot")}
                                                    <ExternalLink size={12} />
                                                </a>
                                            </td>

                                            {/* Submitted at */}
                                            <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5">
                                                <StatusBadge status={req.status} t={t} />
                                            </td>

                                            {/* Admin note */}
                                            <td className="px-5 py-3.5 max-w-[200px]">
                                                {req.admin_note ? (
                                                    <p className={`text-xs truncate ${
                                                        req.status === "REJECTED"
                                                            ? "text-red-500 dark:text-red-400"
                                                            : "text-slate-500 dark:text-slate-400"
                                                    }`} title={req.admin_note}>
                                                        {req.admin_note}
                                                    </p>
                                                ) : (
                                                    <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
