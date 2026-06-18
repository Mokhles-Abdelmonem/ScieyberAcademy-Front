"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, GraduationCap, BookOpen,
  LayoutGrid, LayoutList, AlertCircle,
  CheckCircle2, Clock, XCircle, CreditCard,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { fetchInstructorStudents } from "@/utils/academyApi";

// ── Status styles ───────────────────────────────────────────────────────────────

const ENROLLMENT_STATUS = {
  ACTIVE:    { bg: "rgba(20,184,166,0.15)",  text: "#14b8a6", border: "rgba(20,184,166,0.3)",  icon: CheckCircle2 },
  COMPLETED: { bg: "rgba(52,211,153,0.15)",  text: "#34d399", border: "rgba(52,211,153,0.3)",  icon: CheckCircle2 },
  PENDING:   { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24", border: "rgba(251,191,36,0.3)",  icon: Clock        },
  DROPPED:   { bg: "rgba(248,113,113,0.15)", text: "#f87171", border: "rgba(248,113,113,0.3)", icon: XCircle      },
  REJECTED:  { bg: "rgba(248,113,113,0.15)", text: "#f87171", border: "rgba(248,113,113,0.3)", icon: XCircle      },
};

const PAYMENT_STATUS = {
  PAID:    { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
  PARTIAL: { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24" },
  PENDING: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
  WAIVED:  { bg: "rgba(20,184,166,0.12)",  text: "#14b8a6" },
};

// ── Skeleton ────────────────────────────────────────────────────────────────────

function StudentCardSkeleton() {
  return (
    <div className="dash-card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full shrink-0" style={{ background: "rgba(var(--dash-border-a),0.12)" }} />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "55%" }} />
          <div className="h-2.5 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "40%" }} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "70%" }} />
        <div className="h-2.5 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.06)", width: "50%" }} />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "30%" }} />
        <div className="h-6 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "25%" }} />
      </div>
    </div>
  );
}

function StudentRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[38, 25, 18, 12, 10, 14].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────────────

function Avatar({ student, size = 11 }) {
  const initials = `${student.first_name?.[0] ?? ""}${student.last_name?.[0] ?? ""}`.toUpperCase() || "S";
  const cls = `w-${size} h-${size} rounded-full shrink-0`;

  if (student.profile_picture_url) {
    return (
      <img
        src={student.profile_picture_url}
        alt={initials}
        className={`${cls} object-cover`}
      />
    );
  }
  return (
    <div
      className={`${cls} flex items-center justify-center text-white font-bold text-sm`}
      style={{ background: "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))" }}
    >
      {initials}
    </div>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const style = ENROLLMENT_STATUS[status] ?? ENROLLMENT_STATUS.PENDING;
  const Icon  = style.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      <Icon size={10} />
      {status}
    </span>
  );
}

function PaymentBadge({ status }) {
  const style = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.PENDING;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: style.bg, color: style.text }}
    >
      <CreditCard size={9} />
      {status}
    </span>
  );
}

// ── Grid card ───────────────────────────────────────────────────────────────────

function StudentCard({ record, index, t }) {
  const { student, batch, status, payment_status, enrolled_at } = record;
  const courseName = batch?.course?.name ?? "—";
  const enrolledDate = new Date(enrolled_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div
      className="dash-card p-5 flex flex-col gap-3 dash-anim-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Student info */}
      <div className="flex items-center gap-3">
        <Avatar student={student} size={11} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: "var(--dt-primary)" }}>
            {student.first_name} {student.last_name}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--dt-muted)" }}>
            {student.email}
          </p>
        </div>
      </div>

      {/* Course + batch */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <BookOpen size={11} style={{ color: "var(--dash-gradient-from)" }} />
          <span className="text-xs truncate font-medium" style={{ color: "var(--dt-secondary)" }}>
            {courseName}
          </span>
        </div>
        {batch && (
          <div className="flex items-center gap-1.5">
            <GraduationCap size={11} style={{ color: "var(--dt-muted)" }} />
            <span className="text-xs truncate" style={{ color: "var(--dt-muted)" }}>
              {batch.name}
            </span>
          </div>
        )}
      </div>

      {/* Badges + date */}
      <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t dash-divider">
        <StatusBadge status={status} />
        <PaymentBadge status={payment_status} />
        <span className="ms-auto text-[10px]" style={{ color: "var(--dt-muted)" }}>
          {t("students_enrolled_on")} {enrolledDate}
        </span>
      </div>
    </div>
  );
}

// ── List row ────────────────────────────────────────────────────────────────────

function StudentRow({ record, t }) {
  const { student, batch, status, payment_status, enrolled_at } = record;
  const courseName = batch?.course?.name ?? "—";
  const enrolledDate = new Date(enrolled_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <tr
      className="border-b transition-colors hover:bg-[rgba(var(--dash-border-a),0.04)]"
      style={{ borderColor: "rgba(var(--dash-border-a),0.08)" }}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar student={student} size={8} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--dt-primary)" }}>
              {student.first_name} {student.last_name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--dt-muted)" }}>
              {student.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm truncate max-w-[180px] block" style={{ color: "var(--dt-secondary)" }}>
          {courseName}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs" style={{ color: "var(--dt-muted)" }}>
          {batch?.name ?? "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3.5">
        <PaymentBadge status={payment_status} />
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
          {enrolledDate}
        </span>
      </td>
    </tr>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────────

function EmptyState({ t }) {
  return (
    <div className="dash-card py-16 flex flex-col items-center gap-4 dash-anim-up">
      <div className="dash-icon-wrap w-16 h-16">
        <Users size={28} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.4} />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold" style={{ color: "var(--dt-primary)" }}>
          {t("students_empty_title")}
        </p>
        <p className="text-sm mt-1.5 max-w-sm" style={{ color: "var(--dt-muted)" }}>
          {t("students_empty_desc")}
        </p>
      </div>
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "var(--dash-gradient-from)", delay = 0 }) {
  return (
    <div className="dash-card px-5 py-4 dash-anim-up" style={{ animationDelay: `${delay}s` }}>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--dt-muted)" }}>{label}</p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { t } = useLocale();

  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [view, setView]         = useState("grid");

  useEffect(() => {
    fetchInstructorStudents()
      .then(data => setRecords(data))
      .catch(() => setError("Failed to load students."))
      .finally(() => setLoading(false));
  }, []);

  // Derived course list for filter
  const courseOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const r of records) {
      const name = r.batch?.course?.name;
      if (name && !seen.has(name)) { seen.add(name); list.push(name); }
    }
    return list.sort();
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(r => {
      const s = r.student;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterCourse && r.batch?.course?.name !== filterCourse) return false;
      if (q) {
        const haystack = `${s.first_name} ${s.last_name} ${s.email} ${r.batch?.course?.name ?? ""} ${r.batch?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [records, search, filterStatus, filterCourse]);

  // Stats
  const stats = useMemo(() => ({
    total:     records.length,
    active:    records.filter(r => r.status === "ACTIVE").length,
    completed: records.filter(r => r.status === "COMPLETED").length,
    dropped:   records.filter(r => r.status === "DROPPED").length,
  }), [records]);

  const inputStyle = {
    padding: "0.5rem 0.875rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(var(--dash-border-a), 0.14)",
    background: "rgba(var(--dash-glass-a), 0.06)",
    color: "var(--dt-primary)",
    fontSize: "0.8125rem",
    outline: "none",
  };

  const selectStyle = {
    ...inputStyle,
    paddingInlineEnd: "2rem",
    cursor: "pointer",
    appearance: "none",
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pt-7">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div
        className="dash-card relative overflow-hidden px-7 py-6 dash-anim-up"
        style={{ animationDelay: "0s" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 55% 100% at 100% 50%, rgba(20,184,166,0.12) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 rounded-full"
          style={{
            insetInlineStart: 0, width: 3,
            background: "linear-gradient(180deg, var(--dash-gradient-from), var(--dash-gradient-to))",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="dash-icon-wrap w-12 h-12 shrink-0">
            <Users size={22} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.7} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
              {t("students_title")}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
              {t("students_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("students_stat_total")}     value={stats.total}     delay={0.05} />
          <StatCard label={t("students_stat_active")}    value={stats.active}    color="#14b8a6" delay={0.10} />
          <StatCard label={t("students_stat_completed")} value={stats.completed} color="#34d399" delay={0.15} />
          <StatCard label={t("students_stat_dropped")}   value={stats.dropped}   color="#f87171" delay={0.20} />
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ insetInlineStart: "0.75rem", color: "var(--dt-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("students_search")}
            style={{ ...inputStyle, width: "100%", paddingInlineStart: "2.25rem" }}
          />
        </div>

        {/* Course filter */}
        <div className="relative">
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            style={selectStyle}
          >
            <option value="">{t("students_filter_course")}</option>
            {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={selectStyle}
          >
            <option value="">{t("students_filter_all")}</option>
            {["ACTIVE", "COMPLETED", "PENDING", "DROPPED", "REJECTED"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 ms-auto">
          {[["grid", LayoutGrid], ["list", LayoutList]].map(([id, Icon]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
              style={{
                background: view === id
                  ? "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))"
                  : "rgba(var(--dash-border-a),0.08)",
                color: view === id ? "#fff" : "var(--dt-tertiary)",
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="dash-card p-4 flex items-center gap-3" style={{ borderColor: "rgba(248,113,113,0.3)" }}>
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────── */}
      {loading ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => <StudentCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="dash-card overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Array.from({ length: 6 }, (_, i) => <StudentRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        )
      ) : !error && filtered.length === 0 ? (
        <EmptyState t={t} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((record, i) => (
            <StudentCard key={record.id} record={record} index={i} t={t} />
          ))}
        </div>
      ) : (
        <div className="dash-card overflow-hidden dash-anim-up">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(var(--dash-border-a),0.1)" }}>
                  {[
                    "students_col_student",
                    "students_col_course",
                    "students_col_batch",
                    "students_col_status",
                    "students_col_payment",
                    "students_col_enrolled",
                  ].map(key => (
                    <th
                      key={key}
                      className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "var(--dash-gradient-from)" }}
                    >
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <StudentRow key={record.id} record={record} t={t} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
