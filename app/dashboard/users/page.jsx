"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Search, Plus, ChevronRight, Shield, Edit2, Trash2,
  CheckCircle, XCircle, Mail, User as UserIcon, Filter,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { fetchAllUsers, adminDeleteUser } from "@/utils/academyApi";

const ROLE_STYLE = {
  SUPER_ADMIN: { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", border: "rgba(239,68,68,0.3)"  },
  ADMIN:       { bg: "rgba(168,85,247,0.12)", text: "#a855f7", border: "rgba(168,85,247,0.3)" },
  STAFF:       { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  CLIENT:      { bg: "rgba(20,184,166,0.12)", text: "#14b8a6", border: "rgba(20,184,166,0.3)" },
};

const TYPE_STYLE = {
  STUDENT:    { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
  STAFF:      { bg: "rgba(59,130,246,0.12)",  text: "#3b82f6" },
  PARENT:     { bg: "rgba(167,139,250,0.12)", text: "#a78bfa" },
  INSTRUCTOR: { bg: "rgba(20,184,166,0.12)",  text: "#14b8a6" },
};

function RoleBadge({ role, t }) {
  const s = ROLE_STYLE[role] ?? ROLE_STYLE.CLIENT;
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {t(`dash_role_${role.toLowerCase()}`)}
    </span>
  );
}

function TypeBadge({ type, t }) {
  const s = TYPE_STYLE[type] ?? TYPE_STYLE.STUDENT;
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}>
      {t(`dash_type_${type.toLowerCase()}`)}
    </span>
  );
}

function Avatar({ user }) {
  if (user.profile_picture_url) {
    return <img src={user.profile_picture_url} alt={user.first_name} className="w-8 h-8 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="w-8 h-8 rounded-full dash-bg-gradient flex items-center justify-center shrink-0 text-white text-xs font-bold">
      {user.first_name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[40, 22, 20, 14, 12, 14, 10].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

function DeleteModal({ user, onConfirm, onCancel, busy, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="dash-card p-6 max-w-sm w-full space-y-4 dash-anim-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <Trash2 size={18} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_delete_user")}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>
              {user.first_name} {user.last_name} · @{user.username}
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--dt-muted)" }}>
          {t("dash_delete_user_confirm")}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "var(--dash-glass-bg)", color: "var(--dt-secondary)", border: "1px solid var(--dash-border)" }}
          >
            {t("dash_cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: busy ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.9)", color: "#fff" }}
          >
            {busy ? "…" : t("dash_delete_user")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { t }    = useLocale();
  const { user } = useUser();
  const router   = useRouter();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter]       = useState("");
  const [typeFilter, setTypeFilter]       = useState("");
  const [activeFilter, setActiveFilter]   = useState("");
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteBusy, setDeleteBusy]       = useState(false);
  const [toast, setToast]                 = useState(null);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const load = () => {
    setLoading(true);
    fetchAllUsers({
      search:    search || undefined,
      role:      roleFilter || undefined,
      user_type: typeFilter || undefined,
      is_active: activeFilter === "" ? undefined : activeFilter === "true",
    }).then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [search, roleFilter, typeFilter, activeFilter]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await adminDeleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showToast(t("dash_user_deleted_success"));
    } catch (e) {
      showToast(e.message);
    } finally {
      setDeleteBusy(false);
      setDeleteTarget(null);
    }
  };

  const COLS = [
    t("dash_col_name"),
    t("dash_col_email"),
    t("dash_col_role"),
    t("dash_col_type"),
    t("dash_col_active"),
    t("dash_col_joined"),
    t("dash_col_action"),
  ];

  const ROLES = ["", "SUPER_ADMIN", "ADMIN", "STAFF", "CLIENT"];
  const TYPES = ["", "STUDENT", "STAFF", "PARENT", "INSTRUCTOR"];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 dash-anim-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>
            {t("dash_user_management")}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
            {t("dash_user_management_desc")}
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}
        >
          <Plus size={15} />
          {t("dash_create_user")}
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 dash-anim-up" style={{ animationDelay: "0.06s" }}>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--dt-muted)", insetInlineStart: "0.75rem" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("dash_search_users")}
            className="dash-glass w-full py-2 rounded-xl text-xs outline-none"
            style={{ color: "var(--dt-secondary)", background: "transparent", paddingInlineStart: "2.25rem", paddingInlineEnd: "1rem" }}
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1 dash-glass p-1 rounded-xl">
          <Filter size={12} style={{ color: "var(--dt-muted)", marginInlineStart: "0.5rem" }} />
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
              style={roleFilter === r
                ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
                : { color: "var(--dt-muted)" }}
            >
              {r === "" ? t("dash_all_roles") : t(`dash_role_${r.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="dash-glass rounded-xl text-xs py-2 px-3 outline-none"
          style={{ color: "var(--dt-secondary)", background: "var(--dash-glass-bg)" }}
        >
          <option value="">{t("dash_all_types")}</option>
          {TYPES.filter(Boolean).map((tp) => (
            <option key={tp} value={tp}>{t(`dash_type_${tp.toLowerCase()}`)}</option>
          ))}
        </select>

        {/* Active filter */}
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="dash-glass rounded-xl text-xs py-2 px-3 outline-none"
          style={{ color: "var(--dt-secondary)", background: "var(--dash-glass-bg)" }}
        >
          <option value="">{t("dash_all_statuses")}</option>
          <option value="true">{t("dash_user_active")}</option>
          <option value="false">{t("dash_user_inactive")}</option>
        </select>
      </div>

      {/* ── Count ── */}
      {!loading && (
        <p className="text-xs dash-anim-up" style={{ color: "var(--dt-muted)", animationDelay: "0.1s" }}>
          {users.length} {t("dash_users_found")}
        </p>
      )}

      {/* ── Table ── */}
      <div className="dash-card overflow-hidden dash-anim-up" style={{ animationDelay: "0.12s" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--dash-border)", background: "rgba(var(--dash-border-a),0.04)" }}>
                {COLS.map((col) => (
                  <th key={col} className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--dt-muted)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
                : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={COLS.length} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users size={28} strokeWidth={1.2} style={{ color: "var(--dt-muted)" }} />
                          <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>{t("dash_no_users")}</p>
                          <p className="text-xs" style={{ color: "var(--dt-muted)" }}>{t("dash_no_users_desc")}</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : users.map((u, i) => (
                    <tr
                      key={u.id}
                      className="dash-anim-up transition-colors duration-150"
                      style={{ animationDelay: `${i * 0.03}s`, borderBottom: "1px solid var(--dash-border)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--dash-border-a),0.04)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Name */}
                      <td className="px-4 py-3 min-w-[180px]">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={u} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "var(--dt-primary)" }}>
                              {u.first_name} {u.last_name}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: "var(--dt-muted)" }}>@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--dt-muted)" }}>{u.email}</span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} t={t} />
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <TypeBadge type={u.user_type} t={t} />
                      </td>

                      {/* Active */}
                      <td className="px-4 py-3">
                        {u.is_active
                          ? <CheckCircle size={15} style={{ color: "#34d399" }} />
                          : <XCircle size={15} style={{ color: "#f87171" }} />
                        }
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3">
                        <span className="text-xs whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/users/${u.id}`}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "var(--dt-muted)" }}
                            title={t("dash_view_details")}
                          >
                            <ChevronRight size={14} />
                          </Link>
                          <Link
                            href={`/dashboard/users/${u.id}/edit`}
                            className="p-1.5 rounded-lg transition-colors hover:text-teal-400"
                            style={{ color: "var(--dt-muted)" }}
                            title={t("dash_edit_user")}
                          >
                            <Edit2 size={13} />
                          </Link>
                          {isSuperAdmin && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 rounded-lg transition-colors hover:text-red-400"
                              style={{ color: "var(--dt-muted)" }}
                              title={t("dash_delete_user")}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleteBusy}
          t={t}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 inset-x-0 mx-auto w-fit z-50 px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg"
          style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
