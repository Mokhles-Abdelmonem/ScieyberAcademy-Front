"use client";

import { useEffect, useState } from "react";
import {
    Loader2, Check, X, ExternalLink, Smartphone, MessageSquare,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
    fetchInstapayRequests,
    approveInstapayRequest,
    rejectInstapayRequest,
} from "@/utils/academyApi";

const STATUS_TABS = [
    { key: "PENDING",  labelKey: "instapay_tab_pending"  },
    { key: "APPROVED", labelKey: "instapay_tab_approved" },
    { key: "REJECTED", labelKey: "instapay_tab_rejected" },
    { key: null,       labelKey: "instapay_tab_all"      },
];

function StatusBadge({ status }) {
    const { t } = useLocale();
    const cfg = {
        PENDING:  { cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",   label: t("instapay_tab_pending")  },
        APPROVED: { cls: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/40",   label: t("instapay_tab_approved") },
        REJECTED: { cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40",               label: t("instapay_tab_rejected") },
    }[status] ?? { cls: "bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600", label: status };
    return (
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

function RejectModal({ request, onConfirm, onCancel, loading }) {
    const { t } = useLocale();
    const [note, setNote] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <X size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t("instapay_reject")}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {request.user_name ?? request.user_id?.slice(0, 8)}
                        </p>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                        {t("instapay_reject_note")}
                    </label>
                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-3 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                        placeholder="…"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50">
                        {t("instapay_cancel")}
                    </button>
                    <button onClick={() => onConfirm(note)} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 transition text-white text-sm font-semibold flex items-center justify-center gap-2">
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {t("instapay_reject")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function InstapayAdminPage() {
    const { t } = useLocale();
    const [requests, setRequests]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [activeTab, setActiveTab]   = useState("PENDING");
    const [approving, setApproving]   = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejecting, setRejecting]   = useState(false);
    const [actionError, setActionError] = useState("");

    function load(tab) {
        setLoading(true);
        fetchInstapayRequests(tab === null ? undefined : tab)
            .then(setRequests)
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(activeTab); }, [activeTab]);

    function applyUpdate(id, updated) {
        setRequests(prev => {
            if (activeTab === null) return prev.map(r => r.id === id ? updated : r);
            // Remove from current tab if status no longer matches
            return updated.status === activeTab
                ? prev.map(r => r.id === id ? updated : r)
                : prev.filter(r => r.id !== id);
        });
    }

    async function handleApprove(id) {
        setApproving(id);
        setActionError("");
        try {
            const updated = await approveInstapayRequest(id);
            applyUpdate(id, updated);
        } catch {
            setActionError(t("instapay_action_error"));
        } finally { setApproving(null); }
    }

    async function handleRejectConfirm(note) {
        if (!rejectTarget) return;
        setRejecting(true);
        setActionError("");
        try {
            const updated = await rejectInstapayRequest(rejectTarget.id, note);
            applyUpdate(rejectTarget.id, updated);
            setRejectTarget(null);
        } catch {
            setActionError(t("instapay_action_error"));
        } finally { setRejecting(false); }
    }

    return (
        <div className="p-6 max-w-screen-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-1">
                    <Smartphone size={20} className="text-teal-500" />
                    <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
                        {t("instapay_admin_title")}
                    </h1>
                </div>
                <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("instapay_admin_desc")}</p>
            </div>

            {/* Action error banner */}
            {actionError && (
                <div className="mb-4 flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    <X size={15} className="shrink-0" />
                    {actionError}
                    <button onClick={() => setActionError("")} className="ms-auto p-0.5 hover:opacity-60 transition">
                        <X size={13} />
                    </button>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1.5 flex-wrap mb-5">
                {STATUS_TABS.map(({ key, labelKey }) => {
                    const active = activeTab === key;
                    return (
                        <button
                            key={String(key)}
                            onClick={() => setActiveTab(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                                active
                                    ? "bg-teal-500 text-white border-teal-500"
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                            }`}
                            style={active ? {} : { color: "var(--dt-secondary)" }}
                        >
                            {t(labelKey)}
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20">
                    <Smartphone size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" strokeWidth={1} />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t("instapay_no_requests")}</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_student")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("dash_my_courses")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("dash_batches")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_amount")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_screenshot")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_submitted")}</th>
                                    <th className="text-start px-5 py-3 font-semibold">{t("instapay_col_status")}</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req, i) => (
                                    <tr key={req.id}
                                        className={`border-t border-slate-100 dark:border-slate-700/50 ${
                                            i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/20"
                                        }`}
                                    >
                                        {/* Student */}
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-slate-700 dark:text-slate-200">
                                                {req.user_name ?? "—"}
                                            </p>
                                        </td>

                                        {/* Course */}
                                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-[280px]">
                                            <p className="truncate" title={req.course_title ?? ""}>{req.course_title ?? "—"}</p>
                                        </td>

                                        {/* Batch */}
                                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                                            {req.batch_name ?? "—"}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            {req.payment_type === "MONTHLY" && req.installment_count ? (
                                                <div>
                                                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                        {Math.ceil(Number(req.final_amount) / req.installment_count).toLocaleString()} EGP
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {t("instapay_per_month")} × {req.installment_count}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {Number(req.final_amount).toLocaleString()} EGP
                                                </p>
                                            )}
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
                                            <StatusBadge status={req.status} />
                                            {req.status === "REJECTED" && req.admin_note && (
                                                <p className="text-xs text-slate-400 mt-1 max-w-[120px] truncate" title={req.admin_note}>
                                                    {req.admin_note}
                                                </p>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5">
                                            {req.status === "PENDING" && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={approving === req.id}
                                                        title={t("instapay_approve")}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/40 text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition disabled:opacity-40"
                                                    >
                                                        {approving === req.id
                                                            ? <Loader2 size={13} className="animate-spin" />
                                                            : <Check size={13} />
                                                        }
                                                        {t("instapay_approve")}
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectTarget(req)}
                                                        title={t("instapay_reject")}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800/40 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                                                    >
                                                        <X size={13} />
                                                        {t("instapay_reject")}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reject modal */}
            {rejectTarget && (
                <RejectModal
                    request={rejectTarget}
                    onConfirm={handleRejectConfirm}
                    onCancel={() => setRejectTarget(null)}
                    loading={rejecting}
                />
            )}
        </div>
    );
}
