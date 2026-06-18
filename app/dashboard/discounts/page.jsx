"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight, Loader2, X, Check } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
    adminFetchDiscounts,
    adminCreateDiscount,
    adminUpdateDiscount,
    adminDeleteDiscount,
} from "@/utils/academyApi";

const EMPTY_FORM = {
    code: "", description: "", discount_type: "PERCENTAGE", value: "",
    max_uses: "", valid_from: "", valid_until: "", is_active: true, course_id: "",
};

function Badge({ active }) {
    const { t } = useLocale();
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            active
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/40"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600"
        }`}>
            {active ? <Check size={10} /> : <X size={10} />}
            {active ? t("disc_active") : t("disc_inactive")}
        </span>
    );
}

function TypeBadge({ type }) {
    const { t } = useLocale();
    const pct = type === "PERCENTAGE";
    return (
        <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${
            pct
                ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
        }`}>
            {pct ? t("disc_type_percentage") : t("disc_type_fixed")}
        </span>
    );
}

function DiscountFormModal({ discount, onClose, onSaved }) {
    const { t } = useLocale();
    const [form, setForm]   = useState(discount ? {
        code:          discount.code,
        description:   discount.description ?? "",
        discount_type: discount.discount_type,
        value:         String(discount.value),
        max_uses:      discount.max_uses != null ? String(discount.max_uses) : "",
        valid_from:    discount.valid_from ? discount.valid_from.slice(0, 16) : "",
        valid_until:   discount.valid_until ? discount.valid_until.slice(0, 16) : "",
        is_active:     discount.is_active,
        course_id:     discount.course_id ?? "",
    } : { ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState("");

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSave() {
        if (!form.code.trim() || !form.value) { setError(t("disc_form_required")); return; }
        setSaving(true); setError("");
        const payload = {
            code:          form.code.trim().toUpperCase(),
            description:   form.description || undefined,
            discount_type: form.discount_type,
            value:         parseFloat(form.value),
            max_uses:      form.max_uses ? parseInt(form.max_uses) : undefined,
            valid_from:    form.valid_from || undefined,
            valid_until:   form.valid_until || undefined,
            is_active:     form.is_active,
            course_id:     form.course_id || undefined,
        };
        try {
            const saved = discount
                ? await adminUpdateDiscount(discount.id, payload)
                : await adminCreateDiscount(payload);
            onSaved(saved);
        } catch (err) {
            setError(err?.body?.detail || t("disc_form_error"));
        } finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {discount ? t("disc_edit_title") : t("disc_create_title")}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                </div>

                <div className="space-y-4">
                    {/* Code */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t("disc_field_code")}</label>
                        <input value={form.code} onChange={e => set("code", e.target.value)} disabled={!!discount}
                            placeholder="SUMMER20"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-60 font-mono uppercase"
                        />
                    </div>

                    {/* Type + Value */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t("disc_field_type")}</label>
                            <select value={form.discount_type} onChange={e => set("discount_type", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400">
                                <option value="PERCENTAGE">{t("disc_type_percentage")}</option>
                                <option value="FIXED">{t("disc_type_fixed")}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                {form.discount_type === "PERCENTAGE" ? t("disc_field_value_pct") : t("disc_field_value_egp")}
                            </label>
                            <input type="number" min="0" value={form.value} onChange={e => set("value", e.target.value)}
                                placeholder={form.discount_type === "PERCENTAGE" ? "20" : "100"}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    {/* Max uses + Description */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t("disc_field_max_uses")}</label>
                            <input type="number" min="1" value={form.max_uses} onChange={e => set("max_uses", e.target.value)}
                                placeholder={t("disc_field_max_uses_hint")}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t("disc_field_description")}</label>
                            <input value={form.description} onChange={e => set("description", e.target.value)}
                                placeholder={t("disc_field_description_hint")}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    {/* Valid dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t("disc_field_valid_from")}</label>
                            <input type="datetime-local" value={form.valid_from} onChange={e => set("valid_from", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t("disc_field_valid_until")}</label>
                            <input type="datetime-local" value={form.valid_until} onChange={e => set("valid_until", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => set("is_active", !form.is_active)}>
                            {form.is_active
                                ? <ToggleRight size={28} className="text-teal-500" />
                                : <ToggleLeft  size={28} className="text-slate-400" />}
                        </button>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {form.is_active ? t("disc_active") : t("disc_inactive")}
                        </span>
                    </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        {t("disc_cancel")}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 transition text-white text-sm font-semibold flex items-center justify-center gap-2">
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {t("disc_save")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DiscountsPage() {
    const { t } = useLocale();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [modal, setModal]         = useState(null); // null | "create" | discount object
    const [deleting, setDeleting]   = useState(null);

    useEffect(() => {
        adminFetchDiscounts().then(setDiscounts).finally(() => setLoading(false));
    }, []);

    function handleSaved(saved) {
        setDiscounts(prev => {
            const idx = prev.findIndex(d => d.id === saved.id);
            return idx >= 0 ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev];
        });
        setModal(null);
    }

    async function handleDelete(id) {
        if (!confirm(t("disc_confirm_delete"))) return;
        setDeleting(id);
        try {
            await adminDeleteDiscount(id);
            setDiscounts(prev => prev.filter(d => d.id !== id));
        } finally { setDeleting(null); }
    }

    async function handleToggle(disc) {
        try {
            const updated = await adminUpdateDiscount(disc.id, { is_active: !disc.is_active });
            setDiscounts(prev => prev.map(d => d.id === disc.id ? updated : d));
        } catch {}
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>{t("disc_title")}</h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>{t("disc_subtitle")}</p>
                </div>
                <button
                    onClick={() => setModal("create")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition"
                >
                    <Plus size={16} />
                    {t("disc_create_btn")}
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
            ) : discounts.length === 0 ? (
                <div className="text-center py-20">
                    <Tag size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" strokeWidth={1} />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t("disc_empty_title")}</p>
                    <p className="text-sm text-slate-400 mt-1">{t("disc_empty_desc")}</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_code")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_type")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_value")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_uses")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_expires")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_status")}</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((d, i) => (
                                <tr key={d.id} className={`border-t border-slate-100 dark:border-slate-700/50 ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/20"}`}>
                                    <td className="px-5 py-3.5">
                                        <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">{d.code}</span>
                                        {d.description && <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>}
                                    </td>
                                    <td className="px-5 py-3.5"><TypeBadge type={d.discount_type} /></td>
                                    <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                                        {d.discount_type === "PERCENTAGE" ? `${d.value}%` : `${Number(d.value).toLocaleString()} EGP`}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                                        {d.used_count}{d.max_uses != null ? ` / ${d.max_uses}` : ""}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                                        {d.valid_until ? new Date(d.valid_until).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => handleToggle(d)} className="flex items-center">
                                            <Badge active={d.is_active} />
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1 justify-end">
                                            <button onClick={() => setModal(d)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 transition">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(d.id)} disabled={deleting === d.id}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition disabled:opacity-40">
                                                {deleting === d.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <DiscountFormModal
                    discount={modal === "create" ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
