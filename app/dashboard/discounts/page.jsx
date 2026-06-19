"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight, Loader2, X, Check, ArchiveRestore, Archive } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
    adminFetchDiscounts,
    adminCreateDiscount,
    adminUpdateDiscount,
    adminDeleteDiscount,
    adminRestoreDiscount,
    fetchPublishedCourses,
} from "@/utils/academyApi";

const EMPTY_FORM = {
    code: "", description: "", discount_type: "PERCENTAGE", value: "",
    max_uses: "", valid_from: "", valid_until: "", is_active: true,
    scope: "global_promo", course_id: "",
};

function ScopeBadge({ discount }) {
    const { t } = useLocale();
    const cfg = discount.is_system
        ? { cls: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/40", label: t("disc_scope_system") }
        : discount.course_id
            ? { cls: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600", label: t("disc_scope_course") }
            : { cls: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40", label: t("disc_scope_global") };
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

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

function ConfirmDeleteModal({ discount, onConfirm, onCancel, loading }) {
    const { t } = useLocale();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <Trash2 size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t("disc_delete_title")}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("disc_delete_desc")}</p>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 mb-4">
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">{discount.code}</span>
                    {discount.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{discount.description}</p>
                    )}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 mb-4">
                    {t("disc_delete_code_note")}
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50">
                        {t("disc_cancel")}
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 transition text-white text-sm font-semibold flex items-center justify-center gap-2">
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {t("disc_delete_confirm_btn")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DiscountFormModal({ discount, onClose, onSaved, hasActiveGlobal }) {
    const { t } = useLocale();
    const scopeFromDiscount = (d) => d.is_system ? "system" : d.course_id ? "course" : "global_promo";
    const [form, setForm]   = useState(discount ? {
        code:          discount.code,
        description:   discount.description ?? "",
        discount_type: discount.discount_type,
        value:         String(discount.value),
        max_uses:      discount.max_uses != null ? String(discount.max_uses) : "",
        valid_from:    discount.valid_from ? discount.valid_from.slice(0, 16) : "",
        valid_until:   discount.valid_until ? discount.valid_until.slice(0, 16) : "",
        is_active:     discount.is_active,
        scope:         scopeFromDiscount(discount),
        course_id:     discount.course_id ?? "",
    } : { ...EMPTY_FORM });
    const [saving, setSaving]   = useState(false);
    const [error,  setError]    = useState("");
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    useEffect(() => {
        setLoadingCourses(true);
        fetchPublishedCourses({ limit: 200 })
            .then(setCourses)
            .finally(() => setLoadingCourses(false));
    }, []);

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
            is_system:     form.scope === "system",
            course_id:     form.scope === "course" ? (form.course_id || undefined) : null,
        };
        try {
            const saved = discount
                ? await adminUpdateDiscount(discount.id, payload)
                : await adminCreateDiscount(payload);
            onSaved(saved);
        } catch (err) {
            const code = err?.body?.error_code;
            setError(code === "GLOBAL_DISCOUNT_EXISTS" ? t("disc_global_exists_error") : (err?.body?.detail || t("disc_form_error")));
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
                        <input value={form.code} onChange={e => set("code", e.target.value)}
                            placeholder="SUMMER20"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono uppercase"
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

                    {/* Scope */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t("disc_field_scope")}</label>
                        <div className="flex flex-col gap-2">
                            {[
                                { value: "system",      labelKey: "disc_scope_system",      descKey: "disc_scope_system_desc" },
                                { value: "global_promo",labelKey: "disc_scope_global",      descKey: "disc_scope_global_desc" },
                                { value: "course",      labelKey: "disc_scope_course",      descKey: "disc_scope_course_desc" },
                            ].map(({ value: s, labelKey, descKey }) => (
                                <label key={s} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition ${
                                    form.scope === s
                                        ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20"
                                        : "border-slate-200 dark:border-slate-700"
                                }`}>
                                    <input type="radio" name="scope" value={s} checked={form.scope === s}
                                        onChange={() => set("scope", s)}
                                        className="mt-0.5 accent-teal-500 shrink-0" />
                                    <div>
                                        <p className={`text-sm font-semibold ${form.scope === s ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-slate-200"}`}>
                                            {t(labelKey)}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t(descKey)}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {form.scope === "course" && (
                            <div className="mt-2">
                                <select
                                    value={form.course_id}
                                    onChange={e => set("course_id", e.target.value)}
                                    disabled={loadingCourses}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-60"
                                >
                                    <option value="">{loadingCourses ? t("disc_courses_loading") : t("disc_courses_placeholder")}</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {form.scope === "system" && form.is_active && hasActiveGlobal && !(discount && discount.is_system) && (
                            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2">
                                {t("disc_global_exists_warning")}
                            </p>
                        )}
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
    const [discounts, setDiscounts]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [modal, setModal]               = useState(null);
    const [deleting, setDeleting]         = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // discount object | null
    const [restoring, setRestoring]       = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    function reload(archived) {
        setLoading(true);
        adminFetchDiscounts({ includeArchived: archived ?? showArchived })
            .then(setDiscounts)
            .finally(() => setLoading(false));
    }

    useEffect(() => { reload(false); }, []);

    function handleToggleArchived() {
        const next = !showArchived;
        setShowArchived(next);
        reload(next);
    }

    function handleSaved(saved) {
        setDiscounts(prev => {
            const idx = prev.findIndex(d => d.id === saved.id);
            return idx >= 0 ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev];
        });
        setModal(null);
    }

    async function handleDelete() {
        if (!confirmDelete) return;
        const id = confirmDelete.id;
        setDeleting(id);
        try {
            await adminDeleteDiscount(id);
            setDiscounts(prev => showArchived
                ? prev.map(d => d.id === id ? { ...d, is_deleted: true, is_active: false } : d)
                : prev.filter(d => d.id !== id)
            );
        } finally {
            setDeleting(null);
            setConfirmDelete(null);
        }
    }

    async function handleRestore(disc) {
        setRestoring(disc.id);
        try {
            const restored = await adminRestoreDiscount(disc.id);
            setDiscounts(prev => prev.map(d => d.id === restored.id ? restored : d));
        } finally { setRestoring(null); }
    }

    async function handleToggle(disc) {
        if (disc.is_deleted) return;
        try {
            const updated = await adminUpdateDiscount(disc.id, { is_active: !disc.is_active });
            setDiscounts(prev => prev.map(d => d.id === disc.id ? updated : d));
        } catch {}
    }

    const active   = discounts.filter(d => !d.is_deleted);
    const archived = discounts.filter(d => d.is_deleted);

    function DiscountRow({ d, i }) {
        const isArchived = d.is_deleted;
        return (
            <tr key={d.id} className={`border-t border-slate-100 dark:border-slate-700/50 ${
                isArchived
                    ? "opacity-60 bg-slate-50/80 dark:bg-slate-800/40"
                    : i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-slate-800/20"
            }`}>
                <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono font-semibold ${isArchived ? "line-through text-slate-400 dark:text-slate-500" : "text-teal-600 dark:text-teal-400"}`}>
                            {d.code}
                        </span>
                        {isArchived && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                                {t("disc_archived")}
                            </span>
                        )}
                    </div>
                    {d.description && <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>}
                </td>
                <td className="px-5 py-3.5"><ScopeBadge discount={d} /></td>
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
                    {isArchived ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-slate-100 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600">
                            <Archive size={10} /> {t("disc_archived")}
                        </span>
                    ) : (
                        <button onClick={() => handleToggle(d)} className="flex items-center">
                            <Badge active={d.is_active} />
                        </button>
                    )}
                </td>
                <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                        {isArchived ? (
                            <button onClick={() => handleRestore(d)} disabled={restoring === d.id}
                                title={t("disc_restore_btn")}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 transition disabled:opacity-40">
                                {restoring === d.id ? <Loader2 size={15} className="animate-spin" /> : <ArchiveRestore size={15} />}
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setModal(d)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 transition">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => setConfirmDelete(d)} disabled={deleting === d.id}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition disabled:opacity-40">
                                    {deleting === d.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>
        );
    }

    const rows = showArchived ? discounts : active;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>{t("disc_title")}</h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>{t("disc_subtitle")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggleArchived}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition ${
                            showArchived
                                ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                        }`}
                    >
                        <Archive size={15} />
                        {t("disc_show_archived")}
                        {archived.length > 0 && showArchived && (
                            <span className="ml-1 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{archived.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setModal("create")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition"
                    >
                        <Plus size={16} />
                        {t("disc_create_btn")}
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
            ) : rows.length === 0 ? (
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
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_scope")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_type")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_value")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_uses")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_expires")}</th>
                                <th className="text-start px-5 py-3 font-semibold">{t("disc_col_status")}</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((d, i) => <DiscountRow key={d.id} d={d} i={i} />)}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <DiscountFormModal
                    discount={modal === "create" ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                    hasActiveGlobal={discounts.some(d => d.is_system && d.is_active && !d.is_deleted)}
                />
            )}

            {confirmDelete && (
                <ConfirmDeleteModal
                    discount={confirmDelete}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete(null)}
                    loading={!!deleting}
                />
            )}
        </div>
    );
}
