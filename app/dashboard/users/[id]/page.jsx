"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Trash2, Mail, Phone, MapPin,
  Calendar, Shield, CheckCircle, XCircle,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { fetchAdminUser, adminDeleteUser } from "@/utils/academyApi";

const ROLE_STYLE = {
  SUPER_ADMIN: { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", border: "rgba(239,68,68,0.3)"  },
  ADMIN:       { bg: "rgba(168,85,247,0.12)", text: "#a855f7", border: "rgba(168,85,247,0.3)" },
  STAFF:       { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  CLIENT:      { bg: "rgba(20,184,166,0.12)", text: "#14b8a6", border: "rgba(20,184,166,0.3)" },
};

const TYPE_STYLE = {
  STUDENT: { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
  STAFF:   { bg: "rgba(59,130,246,0.12)",  text: "#3b82f6" },
  PARENT:  { bg: "rgba(167,139,250,0.12)", text: "#a78bfa" },
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid var(--dash-border)" }}>
      <Icon size={15} className="mt-0.5 shrink-0" style={{ color: "var(--dt-muted)" }} />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--dt-muted)" }}>{label}</p>
        <p className="text-sm mt-0.5" style={{ color: "var(--dt-secondary)" }}>{value}</p>
      </div>
    </div>
  );
}

function DeleteModal({ member, onConfirm, onCancel, busy, t }) {
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
              {member.first_name} {member.last_name}
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--dt-muted)" }}>
          {t("dash_delete_user_confirm")}
        </p>
        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} disabled={busy}
            className="flex-1 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "var(--dash-glass-bg)", color: "var(--dt-secondary)", border: "1px solid var(--dash-border)" }}>
            {t("dash_cancel")}
          </button>
          <button onClick={onConfirm} disabled={busy}
            className="flex-1 py-2 rounded-xl text-xs font-semibold"
            style={{ background: busy ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.9)", color: "#fff" }}>
            {busy ? "…" : t("dash_delete_user")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { id }   = useParams();
  const { t }    = useLocale();
  const { user } = useUser();
  const router   = useRouter();

  const [member, setMember]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showDelete, setShowDelete]   = useState(false);
  const [deleteBusy, setDeleteBusy]   = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchAdminUser(id).then((data) => {
      setMember(data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await adminDeleteUser(id);
      router.push("/dashboard/users");
    } catch {
      setDeleteBusy(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 dash-anim-up">
        <div className="h-8 rounded-xl animate-pulse" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "30%" }} />
        <div className="dash-card p-6 space-y-4 animate-pulse">
          {[60, 40, 80, 50].map((w, i) => (
            <div key={i} className="h-4 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-sm" style={{ color: "var(--dt-muted)" }}>{t("dash_not_found")}</p>
        <Link href="/dashboard/users" className="mt-4 inline-block dash-pill-btn text-xs px-4 py-2"
          style={{ color: "var(--dt-secondary)" }}>
          {t("dash_back_to_users")}
        </Link>
      </div>
    );
  }

  const roleStyle = ROLE_STYLE[member.role] ?? ROLE_STYLE.CLIENT;
  const typeStyle = TYPE_STYLE[member.user_type] ?? TYPE_STYLE.STUDENT;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 dash-anim-up">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/users"
            className="dash-glass p-2 rounded-xl"
            style={{ color: "var(--dt-muted)" }}
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>{t("dash_user_detail")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/users/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "var(--dash-glass-bg)", color: "var(--dt-secondary)", border: "1px solid var(--dash-border)" }}
          >
            <Edit2 size={13} /> {t("dash_edit_user")}
          </Link>
          {isSuperAdmin && (
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <Trash2 size={13} /> {t("dash_delete_user")}
            </button>
          )}
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="dash-card p-6 dash-anim-up" style={{ animationDelay: "0.06s" }}>
        {/* Avatar + name + badges */}
        <div className="flex items-center gap-4 mb-6">
          {member.profile_picture_url ? (
            <img src={member.profile_picture_url} alt={member.first_name}
              className="w-16 h-16 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full dash-bg-gradient flex items-center justify-center shrink-0 text-white text-xl font-bold">
              {member.first_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate" style={{ color: "var(--dt-primary)" }}>
              {member.first_name} {member.last_name}
            </h2>
            <p className="text-sm" style={{ color: "var(--dt-muted)" }}>@{member.username}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: roleStyle.bg, color: roleStyle.text, border: `1px solid ${roleStyle.border}` }}>
                {t(`dash_role_${member.role.toLowerCase()}`)}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: typeStyle.bg, color: typeStyle.text }}>
                {t(`dash_type_${member.user_type.toLowerCase()}`)}
              </span>
              {member.is_active
                ? <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#34d399" }}>
                    <CheckCircle size={11} /> {t("dash_user_active")}
                  </span>
                : <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#f87171" }}>
                    <XCircle size={11} /> {t("dash_user_inactive")}
                  </span>
              }
              {member.is_verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#60a5fa" }}>
                  <Shield size={11} /> {t("dash_user_verified")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <InfoRow icon={Mail}     label={t("settings_email")}   value={member.email} />
        <InfoRow icon={Phone}    label={t("dash_user_phone")}  value={member.phone_number} />
        {(member.country || member.city) && (
          <InfoRow icon={MapPin} label={t("settings_city")}
            value={[member.city, member.country].filter(Boolean).join(", ")} />
        )}
        <InfoRow icon={Calendar} label={t("dash_user_joined")}
          value={new Date(member.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} />

        {member.bio && (
          <div className="pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--dt-muted)" }}>
              {t("settings_bio")}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--dt-secondary)" }}>{member.bio}</p>
          </div>
        )}
      </div>

      {showDelete && (
        <DeleteModal
          member={member}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          busy={deleteBusy}
          t={t}
        />
      )}
    </div>
  );
}
