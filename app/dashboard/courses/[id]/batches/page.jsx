"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
    ArrowLeft, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
    CalendarDays, Users, Wifi, Building2, Link2, Clock, Loader2,
    X, ListChecks, BookOpen, CheckCircle2, XCircle, RotateCcw,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
    fetchCourse,
    fetchBatchesByCourse,
    adminCreateBatch,
    adminUpdateBatch,
    adminDeleteBatch,
    fetchBatchSessions,
    adminCreateSession,
    adminUpdateSession,
    adminDeleteSession,
} from "@/utils/academyApi";

// ── Constants ────────────────────────────────────────────────────────────────

const BATCH_STATUS_CFG = {
    UPCOMING:  { label: "batch_status_upcoming",  bg: "rgba(20,184,166,0.12)",   text: "#14b8a6", border: "rgba(20,184,166,0.3)"  },
    ONGOING:   { label: "batch_status_ongoing",   bg: "rgba(59,130,246,0.12)",   text: "#3b82f6", border: "rgba(59,130,246,0.3)"  },
    COMPLETED: { label: "batch_status_completed", bg: "rgba(148,163,184,0.12)",  text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
    CANCELLED: { label: "batch_status_cancelled", bg: "rgba(239,68,68,0.12)",    text: "#ef4444", border: "rgba(239,68,68,0.3)"   },
};

const SESSION_STATUS_CFG = {
    SCHEDULED:   { icon: Clock,       color: "#3b82f6" },
    COMPLETED:   { icon: CheckCircle2,color: "#22c55e" },
    CANCELLED:   { icon: XCircle,     color: "#ef4444" },
    RESCHEDULED: { icon: RotateCcw,   color: "#f59e0b" },
};

const BATCH_STATUSES   = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
const SESSION_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"];

const EMPTY_BATCH = {
    name: "", status: "UPCOMING", start_date: "", end_date: "",
    max_students: "", location: "", online_link: "", notes: "",
};

const EMPTY_SESSION = {
    session_number: "", topic: "", scheduled_date: "", start_time: "",
    end_time: "", location: "", online_link: "", notes: "", status: "SCHEDULED",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function GlassInput({ className = "", ...props }) {
    return (
        <input
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 ${className}`}
            {...props}
        />
    );
}

function GlassSelect({ className = "", children, ...props }) {
    return (
        <select
            className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

function FieldLabel({ children }) {
    return (
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
            {children}
        </label>
    );
}

function StatusBadge({ status }) {
    const { t } = useLocale();
    const cfg = BATCH_STATUS_CFG[status] ?? BATCH_STATUS_CFG.UPCOMING;
    return (
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
            {t(cfg.label)}
        </span>
    );
}

// ── Batch form modal ─────────────────────────────────────────────────────────

function BatchModal({ courseId, batch, onClose, onSaved }) {
    const { t } = useLocale();
    const [form, setForm]     = useState(batch ? {
        name:         batch.name,
        status:       batch.status,
        start_date:   batch.start_date,
        end_date:     batch.end_date ?? "",
        max_students: batch.max_students != null ? String(batch.max_students) : "",
        location:     batch.location ?? "",
        online_link:  batch.online_link ?? "",
        notes:        batch.notes ?? "",
    } : { ...EMPTY_BATCH });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState("");

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSave() {
        if (!form.name.trim() || !form.start_date) { setError(t("batch_form_required")); return; }
        setSaving(true); setError("");
        const payload = {
            course_id:    courseId,
            name:         form.name.trim(),
            status:       form.status,
            start_date:   form.start_date,
            end_date:     form.end_date || undefined,
            max_students: form.max_students ? parseInt(form.max_students) : undefined,
            location:     form.location || undefined,
            online_link:  form.online_link || undefined,
            notes:        form.notes || undefined,
        };
        try {
            const saved = batch
                ? await adminUpdateBatch(batch.id, payload)
                : await adminCreateBatch(payload);
            onSaved(saved);
        } catch (err) {
            setError(err?.body?.detail || t("batch_form_error"));
        } finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {batch ? t("batch_edit_title") : t("batch_create_title")}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <FieldLabel>{t("batch_field_name")}</FieldLabel>
                        <GlassInput value={form.name} onChange={e => set("name", e.target.value)}
                            placeholder={t("batch_field_name_hint")} />
                    </div>

                    <div>
                        <FieldLabel>{t("batch_field_status")}</FieldLabel>
                        <GlassSelect value={form.status} onChange={e => set("status", e.target.value)}>
                            {BATCH_STATUSES.map(s => (
                                <option key={s} value={s}>{t(`batch_status_${s.toLowerCase()}`)}</option>
                            ))}
                        </GlassSelect>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>{t("batch_field_start_date")}</FieldLabel>
                            <GlassInput type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>{t("batch_field_end_date")}</FieldLabel>
                            <GlassInput type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>{t("batch_field_max_students")}</FieldLabel>
                        <GlassInput type="number" min="1" value={form.max_students}
                            onChange={e => set("max_students", e.target.value)}
                            placeholder={t("batch_field_max_students_hint")} />
                    </div>

                    <div>
                        <FieldLabel>{t("batch_field_location")}</FieldLabel>
                        <GlassInput value={form.location} onChange={e => set("location", e.target.value)}
                            placeholder={t("batch_field_location_hint")} />
                    </div>

                    <div>
                        <FieldLabel>{t("batch_field_online_link")}</FieldLabel>
                        <GlassInput value={form.online_link} onChange={e => set("online_link", e.target.value)}
                            placeholder="https://meet.google.com/…" />
                    </div>

                    <div>
                        <FieldLabel>{t("batch_field_notes")}</FieldLabel>
                        <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                            rows={3} placeholder={t("batch_field_notes_hint")}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                        />
                    </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        {t("batch_cancel")}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 transition text-white text-sm font-semibold flex items-center justify-center gap-2">
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {t("batch_save")}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Session form modal ────────────────────────────────────────────────────────

function SessionModal({ batchId, session, nextNumber, onClose, onSaved }) {
    const { t } = useLocale();
    const [form, setForm]     = useState(session ? {
        session_number: String(session.session_number),
        topic:          session.topic ?? "",
        scheduled_date: session.scheduled_date,
        start_time:     session.start_time,
        end_time:       session.end_time,
        location:       session.location ?? "",
        online_link:    session.online_link ?? "",
        notes:          session.notes ?? "",
        status:         session.status,
    } : { ...EMPTY_SESSION, session_number: String(nextNumber) });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState("");

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSave() {
        if (!form.scheduled_date || !form.start_time || !form.end_time) {
            setError(t("session_form_required")); return;
        }
        setSaving(true); setError("");
        const payload = {
            session_number: parseInt(form.session_number) || nextNumber,
            topic:          form.topic || undefined,
            scheduled_date: form.scheduled_date,
            start_time:     form.start_time,
            end_time:       form.end_time,
            location:       form.location || undefined,
            online_link:    form.online_link || undefined,
            notes:          form.notes || undefined,
            status:         form.status,
        };
        try {
            const saved = session
                ? await adminUpdateSession(batchId, session.id, payload)
                : await adminCreateSession(batchId, payload);
            onSaved(saved);
        } catch (err) {
            setError(err?.body?.detail || t("session_form_error"));
        } finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {session ? t("session_edit_title") : t("session_create_title")}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>{t("session_field_number")}</FieldLabel>
                            <GlassInput type="number" min="1" value={form.session_number}
                                onChange={e => set("session_number", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>{t("session_field_status")}</FieldLabel>
                            <GlassSelect value={form.status} onChange={e => set("status", e.target.value)}>
                                {SESSION_STATUSES.map(s => (
                                    <option key={s} value={s}>{t(`session_status_${s.toLowerCase()}`)}</option>
                                ))}
                            </GlassSelect>
                        </div>
                    </div>

                    <div>
                        <FieldLabel>{t("session_field_topic")}</FieldLabel>
                        <GlassInput value={form.topic} onChange={e => set("topic", e.target.value)}
                            placeholder={t("session_field_topic_hint")} />
                    </div>

                    <div>
                        <FieldLabel>{t("session_field_date")}</FieldLabel>
                        <GlassInput type="date" value={form.scheduled_date}
                            onChange={e => set("scheduled_date", e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>{t("session_field_start_time")}</FieldLabel>
                            <GlassInput type="time" value={form.start_time}
                                onChange={e => set("start_time", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>{t("session_field_end_time")}</FieldLabel>
                            <GlassInput type="time" value={form.end_time}
                                onChange={e => set("end_time", e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>{t("session_field_location")}</FieldLabel>
                        <GlassInput value={form.location} onChange={e => set("location", e.target.value)}
                            placeholder={t("batch_field_location_hint")} />
                    </div>

                    <div>
                        <FieldLabel>{t("batch_field_online_link")}</FieldLabel>
                        <GlassInput value={form.online_link} onChange={e => set("online_link", e.target.value)}
                            placeholder="https://meet.google.com/…" />
                    </div>

                    <div>
                        <FieldLabel>{t("batch_field_notes")}</FieldLabel>
                        <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                            rows={2} placeholder={t("batch_field_notes_hint")}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                        />
                    </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>}

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        {t("batch_cancel")}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 transition text-white text-sm font-semibold flex items-center justify-center gap-2">
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {t("batch_save")}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Sessions panel (inside expanded batch) ────────────────────────────────────

function SessionsPanel({ batch }) {
    const { t } = useLocale();
    const [sessions,  setSessions]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [modal,     setModal]     = useState(null); // null | "create" | session object
    const [deleting,  setDeleting]  = useState(null);

    useEffect(() => {
        fetchBatchSessions(batch.id)
            .then(data => setSessions(data.sort((a, b) => a.session_number - b.session_number)))
            .finally(() => setLoading(false));
    }, [batch.id]);

    function handleSaved(saved) {
        setSessions(prev => {
            const idx = prev.findIndex(s => s.id === saved.id);
            const next = idx >= 0
                ? prev.map(s => s.id === saved.id ? saved : s)
                : [...prev, saved];
            return next.sort((a, b) => a.session_number - b.session_number);
        });
        setModal(null);
    }

    async function handleDelete(id) {
        if (!confirm(t("session_confirm_delete"))) return;
        setDeleting(id);
        try {
            await adminDeleteSession(batch.id, id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } finally { setDeleting(null); }
    }

    const nextNumber = sessions.length > 0 ? Math.max(...sessions.map(s => s.session_number)) + 1 : 1;

    return (
        <div className="border-t border-slate-100 dark:border-slate-700/50 mt-4 pt-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ListChecks size={13} />
                    {t("batch_sessions")} {!loading && `(${sessions.length})`}
                </h4>
                <button onClick={() => setModal("create")}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-500 hover:text-teal-600 transition">
                    <Plus size={13} /> {t("session_add_btn")}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="animate-spin text-teal-400" />
                </div>
            ) : sessions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">{t("session_empty")}</p>
            ) : (
                <div className="space-y-2">
                    {sessions.map(s => {
                        const cfg = SESSION_STATUS_CFG[s.status] ?? SESSION_STATUS_CFG.SCHEDULED;
                        const Icon = cfg.icon;
                        return (
                            <div key={s.id}
                                className="flex items-start gap-3 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                                <Icon size={14} className="mt-0.5 shrink-0" style={{ color: cfg.color }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            #{s.session_number}
                                        </span>
                                        {s.topic && (
                                            <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{s.topic}</span>
                                        )}
                                        <span className="text-[10px] text-slate-400">{s.scheduled_date}</span>
                                        <span className="text-[10px] text-slate-400">{s.start_time} – {s.end_time}</span>
                                    </div>
                                    {(s.location || s.online_link) && (
                                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                            {s.location || s.online_link}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => setModal(s)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 transition">
                                        <Pencil size={12} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition disabled:opacity-40">
                                        {deleting === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modal && (
                <SessionModal
                    batchId={batch.id}
                    session={modal === "create" ? null : modal}
                    nextNumber={nextNumber}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

// ── Batch card ────────────────────────────────────────────────────────────────

function BatchCard({ courseId, batch, onEdit, onDelete }) {
    const { t } = useLocale();
    const [expanded, setExpanded] = useState(false);

    const hasLink     = !!batch.online_link;
    const hasLocation = !!batch.location;

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 overflow-hidden">
            {/* Header row */}
            <div className="flex items-start gap-4 p-5">
                {/* Status dot */}
                <div className="shrink-0 mt-1 w-2 h-2 rounded-full"
                    style={{ background: BATCH_STATUS_CFG[batch.status]?.text ?? "#94a3b8" }} />

                {/* Main info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{batch.name}</h3>
                        <StatusBadge status={batch.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <CalendarDays size={11} />
                            {batch.start_date}
                            {batch.end_date ? ` → ${batch.end_date}` : ""}
                        </span>
                        {batch.max_students && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Users size={11} /> {t("batch_max")} {batch.max_students}
                            </span>
                        )}
                        {hasLocation && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Building2 size={11} /> {batch.location}
                            </span>
                        )}
                        {hasLink && (
                            <a href={batch.online_link} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 text-xs text-teal-500 hover:underline">
                                <Link2 size={11} /> {t("batch_join_link")}
                            </a>
                        )}
                    </div>
                    {batch.notes && (
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{batch.notes}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1">
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-teal-400 hover:text-teal-500 transition"
                    >
                        <ListChecks size={12} />
                        {t("batch_sessions")}
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    <button onClick={() => onEdit(batch)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 transition">
                        <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(batch.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Sessions panel */}
            {expanded && (
                <div className="px-5 pb-5">
                    <SessionsPanel batch={batch} />
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BatchesPage({ params }) {
    const { id: courseId } = use(params);
    const { t } = useLocale();

    const [course,   setCourse]   = useState(null);
    const [batches,  setBatches]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null); // null | "create" | batch object
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        Promise.all([
            fetchCourse(courseId),
            fetchBatchesByCourse(courseId),
        ]).then(([c, b]) => {
            setCourse(c);
            setBatches(b.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)));
        }).finally(() => setLoading(false));
    }, [courseId]);

    function handleSaved(saved) {
        setBatches(prev => {
            const idx = prev.findIndex(b => b.id === saved.id);
            const next = idx >= 0
                ? prev.map(b => b.id === saved.id ? saved : b)
                : [...prev, saved];
            return next.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        });
        setModal(null);
    }

    async function handleDelete(id) {
        if (!confirm(t("batch_confirm_delete"))) return;
        setDeleting(id);
        try {
            await adminDeleteBatch(id);
            setBatches(prev => prev.filter(b => b.id !== id));
        } finally { setDeleting(null); }
    }

    const statusCount = (status) => batches.filter(b => b.status === status).length;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Breadcrumb + header */}
            <div>
                <Link href="/dashboard/courses"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-500 transition mb-3">
                    <ArrowLeft size={13} /> {t("batch_back_to_courses")}
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <BookOpen size={16} className="text-teal-500" />
                            <span className="text-xs text-slate-400 truncate max-w-xs">{course?.title ?? "…"}</span>
                        </div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
                            {t("batch_page_title")}
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
                            {t("batch_page_subtitle")}
                        </p>
                    </div>
                    <button
                        onClick={() => setModal("create")}
                        className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition"
                    >
                        <Plus size={16} /> {t("batch_create_btn")}
                    </button>
                </div>
            </div>

            {/* Stats row */}
            {!loading && batches.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BATCH_STATUSES.map(s => (
                        <div key={s} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 px-4 py-3 flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BATCH_STATUS_CFG[s].text }} />
                            <div>
                                <p className="text-lg font-bold leading-none" style={{ color: "var(--dt-primary)" }}>{statusCount(s)}</p>
                                <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--dt-muted)" }}>
                                    {t(BATCH_STATUS_CFG[s].label)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Batch list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
            ) : batches.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CalendarDays size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" strokeWidth={1} />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t("batch_empty_title")}</p>
                    <p className="text-sm text-slate-400 mt-1 mb-4">{t("batch_empty_desc")}</p>
                    <button onClick={() => setModal("create")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition">
                        <Plus size={15} /> {t("batch_create_btn")}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {batches.map(batch => (
                        <BatchCard
                            key={batch.id}
                            courseId={courseId}
                            batch={batch}
                            onEdit={b => setModal(b)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {modal && (
                <BatchModal
                    courseId={courseId}
                    batch={modal === "create" ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
