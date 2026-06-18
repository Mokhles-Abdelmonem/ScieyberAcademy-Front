"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquareQuote, Star, CheckCircle2, Clock,
  XCircle, FileText, Trash2, AlertCircle,
  Plus, ChevronDown, Send, Loader2, Eye,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser }   from "@/context/UserContext";
import {
  submitTestimonial,
  fetchMyTestimonials,
  adminFetchTestimonials,
  adminUpdateTestimonialStatus,
  adminDeleteTestimonial,
} from "@/utils/academyApi";

// ── Status config ───────────────────────────────────────────────────────────────

const STATUS_CFG = {
  PENDING:   { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24", border: "rgba(251,191,36,0.3)",  icon: Clock,        labelKey: "test_status_pending"   },
  PUBLISHED: { bg: "rgba(20,184,166,0.15)",  text: "#14b8a6", border: "rgba(20,184,166,0.3)",  icon: CheckCircle2, labelKey: "test_status_published"  },
  DRAFTED:   { bg: "rgba(148,163,184,0.15)", text: "#94a3b8", border: "rgba(148,163,184,0.3)", icon: FileText,     labelKey: "test_status_drafted"    },
  REJECTED:  { bg: "rgba(248,113,113,0.15)", text: "#f87171", border: "rgba(248,113,113,0.3)", icon: XCircle,      labelKey: "test_status_rejected"   },
};

// ── Primitives ──────────────────────────────────────────────────────────────────

function StatusBadge({ status, t }) {
  const cfg  = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <Icon size={10} />
      {t(cfg.labelKey)}
    </span>
  );
}

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(value === i ? null : i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={20}
            fill={value && i <= value ? "#f59e0b" : "none"}
            strokeWidth={1.5}
            className={value && i <= value ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= rating ? "#f59e0b" : "none"}
          strokeWidth={1.5}
          className={i <= rating ? "text-amber-400" : "text-slate-400"}
        />
      ))}
    </div>
  );
}

function AuthorAvatar({ author, size = 10 }) {
  const initials = author
    ? `${author.first_name?.[0] ?? ""}${author.last_name?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";
  const cls = `w-${size} h-${size} rounded-full shrink-0 object-cover`;
  if (author?.profile_picture_url) {
    return <img src={author.profile_picture_url} alt={initials} className={cls} />;
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold`}
      style={{ background: "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))" }}
    >
      {initials}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="dash-card p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.12)" }} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "40%" }} />
          <div className="h-2.5 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "28%" }} />
        </div>
      </div>
      <div className="h-12 rounded-lg" style={{ background: "rgba(var(--dash-border-a),0.07)" }} />
      <div className="flex gap-2">
        <div className="h-6 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "22%" }} />
        <div className="h-6 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "18%" }} />
      </div>
    </div>
  );
}

// ── Submit form ─────────────────────────────────────────────────────────────────

function SubmitForm({ t, onSubmitted }) {
  const [content, setContent]   = useState("");
  const [rating,  setRating]    = useState(null);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState("");
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (content.trim().length < 10) { setError(t("test_error_min")); return; }
    setSaving(true);
    try {
      await submitTestimonial({ content: content.trim(), rating });
      setSuccess(true);
      setContent("");
      setRating(null);
      onSubmitted();
    } catch {
      setError(t("test_error_submit"));
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="dash-card p-6 flex flex-col items-center gap-3 text-center dash-anim-up">
        <div className="dash-icon-wrap w-14 h-14">
          <CheckCircle2 size={24} style={{ color: "var(--dash-gradient-from)" }} />
        </div>
        <p className="font-semibold" style={{ color: "var(--dt-primary)" }}>{t("test_submitted_title")}</p>
        <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("test_submitted_desc")}</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-xs px-4 py-2 rounded-xl font-medium"
          style={{ background: "rgba(var(--dash-border-a),0.1)", color: "var(--dt-secondary)" }}
        >
          {t("test_submit_another")}
        </button>
      </div>
    );
  }

  return (
    <div className="dash-card p-6 dash-anim-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="dash-icon-wrap w-10 h-10 shrink-0">
          <Plus size={16} style={{ color: "var(--dash-gradient-from)" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("test_form_title")}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>{t("test_form_desc")}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--dash-gradient-from)" }}>
          {t("test_form_rating")} <span style={{ color: "var(--dt-muted)", fontWeight: 400, textTransform: "none" }}>({t("test_optional")})</span>
        </label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--dash-gradient-from)" }}>
          {t("test_form_content")}
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          placeholder={t("test_form_placeholder")}
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(var(--dash-border-a), 0.14)",
            background: "rgba(var(--dash-glass-a), 0.06)",
            color: "var(--dt-primary)",
            fontSize: "0.8125rem",
            resize: "vertical",
            outline: "none",
          }}
        />
        <p className="text-[10px] mt-1" style={{ color: "var(--dt-muted)" }}>
          {content.length} / 2000
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-3 text-red-400 text-xs">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all active:scale-[0.97]"
        style={{ background: "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))", boxShadow: "0 6px 20px rgba(20,184,166,0.25)" }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {saving ? t("test_submitting") : t("test_submit_btn")}
      </button>
    </div>
  );
}

// ── My testimonial card ─────────────────────────────────────────────────────────

function MyTestimonialCard({ item, t, index }) {
  const date = new Date(item.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
  return (
    <div className="dash-card p-5 flex flex-col gap-3 dash-anim-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={item.status} t={t} />
        {item.rating && <StarDisplay rating={item.rating} />}
      </div>
      <p className="text-sm italic leading-relaxed" style={{ color: "var(--dt-secondary)" }}>
        &ldquo;{item.content}&rdquo;
      </p>
      {item.admin_note && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(var(--dash-border-a),0.08)", color: "var(--dt-muted)" }}>
          <span className="font-semibold" style={{ color: "var(--dt-secondary)" }}>{t("test_admin_note")}: </span>
          {item.admin_note}
        </div>
      )}
      <p className="text-[10px]" style={{ color: "var(--dt-muted)" }}>{date}</p>
    </div>
  );
}

// ── Admin testimonial card ──────────────────────────────────────────────────────

function AdminCard({ item, t, onUpdated, onDeleted }) {
  const [noteOpen,  setNoteOpen]  = useState(false);
  const [note,      setNote]      = useState(item.admin_note ?? "");
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const update = async (status) => {
    setSaving(true);
    try { await adminUpdateTestimonialStatus(item.id, status, noteOpen ? note : item.admin_note); onUpdated(); }
    catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirm(t("test_admin_confirm_delete"))) return;
    setDeleting(true);
    try { await adminDeleteTestimonial(item.id); onDeleted(item.id); }
    catch { /* ignore */ }
    finally { setDeleting(false); }
  };

  const date = new Date(item.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="dash-card p-5 flex flex-col gap-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        <AuthorAvatar author={item.author} size={10} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--dt-primary)" }}>
            {item.author ? `${item.author.first_name} ${item.author.last_name}` : "Unknown"}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--dt-muted)" }}>
            @{item.author?.username ?? "—"}
            {item.author?.title ? ` · ${item.author.title}` : ""}
          </p>
        </div>
        <StatusBadge status={item.status} t={t} />
      </div>

      {/* Content */}
      <p className="text-sm italic leading-relaxed" style={{ color: "var(--dt-secondary)" }}>
        &ldquo;{item.content}&rdquo;
      </p>

      {item.rating && <StarDisplay rating={item.rating} />}

      {/* Existing admin note */}
      {item.admin_note && !noteOpen && (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(var(--dash-border-a),0.08)", color: "var(--dt-muted)" }}>
          <span className="font-semibold" style={{ color: "var(--dt-secondary)" }}>{t("test_admin_note")}: </span>
          {item.admin_note}
        </div>
      )}

      {/* Note editor */}
      {noteOpen && (
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder={t("test_admin_note_placeholder")}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.625rem",
            border: "1px solid rgba(var(--dash-border-a),0.14)",
            background: "rgba(var(--dash-glass-a),0.06)",
            color: "var(--dt-primary)",
            fontSize: "0.75rem",
            resize: "vertical",
            outline: "none",
          }}
        />
      )}

      <p className="text-[10px]" style={{ color: "var(--dt-muted)" }}>{date}</p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t dash-divider">
        <button
          onClick={() => update("PUBLISHED")}
          disabled={saving || item.status === "PUBLISHED"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
          style={{ background: "rgba(20,184,166,0.15)", color: "#14b8a6" }}
        >
          <CheckCircle2 size={12} />
          {t("test_admin_publish")}
        </button>
        <button
          onClick={() => update("DRAFTED")}
          disabled={saving || item.status === "DRAFTED"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
          style={{ background: "rgba(148,163,184,0.15)", color: "#94a3b8" }}
        >
          <FileText size={12} />
          {t("test_admin_draft")}
        </button>
        <button
          onClick={() => update("REJECTED")}
          disabled={saving || item.status === "REJECTED"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
          style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}
        >
          <XCircle size={12} />
          {t("test_admin_reject")}
        </button>
        <button
          onClick={() => setNoteOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ms-auto transition-all"
          style={{ background: "rgba(var(--dash-border-a),0.1)", color: "var(--dt-muted)" }}
        >
          <Eye size={12} />
          {t("test_admin_add_note")}
        </button>
        <button
          onClick={remove}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
        >
          <Trash2 size={12} />
          {t("test_admin_delete")}
        </button>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function TestimonialsPage() {
  const { t }    = useLocale();
  const { user } = useUser();

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // ── Student state ────────────────────────────────────────────────────────────
  const [mine,        setMine]        = useState([]);
  const [mineLoading, setMineLoading] = useState(true);

  // ── Admin state ──────────────────────────────────────────────────────────────
  const [all,          setAll]          = useState([]);
  const [allLoading,   setAllLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadMine = useCallback(async () => {
    setMineLoading(true);
    try { setMine(await fetchMyTestimonials()); }
    finally { setMineLoading(false); }
  }, []);

  const loadAll = useCallback(async () => {
    setAllLoading(true);
    try { setAll(await adminFetchTestimonials({ status: statusFilter || undefined })); }
    finally { setAllLoading(false); }
  }, [statusFilter]);

  useEffect(() => { if (!isAdmin) loadMine(); }, [isAdmin, loadMine]);
  useEffect(() => { if (isAdmin)  loadAll();  }, [isAdmin, loadAll]);

  const handleDeleted = (id) => setAll(prev => prev.filter(t => t.id !== id));

  const inputStyle = {
    padding: "0.5rem 0.875rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(var(--dash-border-a), 0.14)",
    background: "rgba(var(--dash-glass-a), 0.06)",
    color: "var(--dt-primary)",
    fontSize: "0.8125rem",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
  };

  // Stats for admin
  const stats = {
    total:     all.length,
    pending:   all.filter(t => t.status === "PENDING").length,
    published: all.filter(t => t.status === "PUBLISHED").length,
    drafted:   all.filter(t => t.status === "DRAFTED").length,
    rejected:  all.filter(t => t.status === "REJECTED").length,
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pt-7">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="dash-card relative overflow-hidden px-7 py-6 dash-anim-up">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 55% 100% at 100% 50%, rgba(20,184,166,0.12) 0%, transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 rounded-full"
          style={{ insetInlineStart: 0, width: 3, background: "linear-gradient(180deg,var(--dash-gradient-from),var(--dash-gradient-to))" }} />
        <div className="relative flex items-center gap-4">
          <div className="dash-icon-wrap w-12 h-12 shrink-0">
            <MessageSquareQuote size={22} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.7} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
              {isAdmin ? t("test_admin_title") : t("test_title")}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
              {isAdmin ? t("test_admin_subtitle") : t("test_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════ STUDENT VIEW ════════════════ */}
      {!isAdmin && (
        <>
          <SubmitForm t={t} onSubmitted={loadMine} />

          <div>
            <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: "var(--dt-secondary)" }}>
              {t("test_my_submissions")} {!mineLoading && `(${mine.length})`}
            </h2>
            {mineLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => <Skeleton key={i} />)}
              </div>
            ) : mine.length === 0 ? (
              <div className="dash-card py-12 flex flex-col items-center gap-3 text-center dash-anim-up">
                <div className="dash-icon-wrap w-14 h-14">
                  <MessageSquareQuote size={24} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.4} />
                </div>
                <p className="font-medium" style={{ color: "var(--dt-primary)" }}>{t("test_empty_mine_title")}</p>
                <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("test_empty_mine_desc")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mine.map((item, i) => <MyTestimonialCard key={item.id} item={item} t={t} index={i} />)}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════════ ADMIN VIEW ════════════════ */}
      {isAdmin && (
        <>
          {/* Stats */}
          {!allLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: t("test_stat_total"),     value: stats.total,     color: "var(--dt-primary)" },
                { label: t("test_status_pending"),  value: stats.pending,   color: "#fbbf24" },
                { label: t("test_status_published"),value: stats.published, color: "#14b8a6" },
                { label: t("test_status_drafted"),  value: stats.drafted,   color: "#94a3b8" },
                { label: t("test_status_rejected"), value: stats.rejected,  color: "#f87171" },
              ].map((s, i) => (
                <div key={i} className="dash-card px-4 py-3 dash-anim-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>{t("test_filter_status")}</p>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
                <option value="">{t("test_filter_all")}</option>
                {["PENDING", "PUBLISHED", "DRAFTED", "REJECTED"].map(s => (
                  <option key={s} value={s}>{t(`test_status_${s.toLowerCase()}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {allLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} />)}
            </div>
          ) : all.length === 0 ? (
            <div className="dash-card py-12 flex flex-col items-center gap-3 text-center dash-anim-up">
              <div className="dash-icon-wrap w-14 h-14">
                <MessageSquareQuote size={24} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.4} />
              </div>
              <p className="font-medium" style={{ color: "var(--dt-primary)" }}>{t("test_admin_empty_title")}</p>
              <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("test_admin_empty_desc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {all.map(item => (
                <AdminCard
                  key={item.id}
                  item={item}
                  t={t}
                  onUpdated={loadAll}
                  onDeleted={handleDeleted}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
