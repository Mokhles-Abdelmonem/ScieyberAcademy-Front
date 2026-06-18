"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { fetchAdminUser, adminUpdateUser } from "@/utils/academyApi";

const ROLES   = ["CLIENT", "STAFF", "ADMIN", "SUPER_ADMIN"];
const TYPES   = ["STUDENT", "STAFF", "PARENT", "INSTRUCTOR"];

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold" style={{ color: "var(--dt-secondary)" }}>{label}</label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: "var(--dt-muted)" }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="dash-glass w-full px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
      style={{ color: "var(--dt-secondary)", background: "transparent" }}
    />
  );
}

function Select({ value, onChange, children, disabled }) {
  return (
    <select
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className="dash-glass w-full px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
      style={{ color: "var(--dt-secondary)", background: "var(--dash-glass-bg)" }}
    >
      {children}
    </select>
  );
}

function Toggle({ value, onChange, onLabel, offLabel, disabled }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: "rgba(var(--dash-border-a),0.06)", border: "1px solid var(--dash-border)" }}
    >
      <span className="text-xs" style={{ color: "var(--dt-muted)" }}>{value ? onLabel : offLabel}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        disabled={disabled}
        className="relative w-10 h-5 rounded-full transition-all duration-200"
        style={{ background: value ? "linear-gradient(135deg,#14b8a6,#0d9488)" : "var(--dash-glass-bg)", border: "1px solid var(--dash-border)" }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ insetInlineStart: value ? "calc(100% - 1.1rem)" : "0.1rem" }}
        />
      </button>
    </div>
  );
}

export default function EditUserPage() {
  const { id }   = useParams();
  const { t }    = useLocale();
  const { user } = useUser();
  const router   = useRouter();

  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchAdminUser(id).then((data) => {
      if (data) {
        setForm({
          first_name:   data.first_name ?? "",
          last_name:    data.last_name ?? "",
          title:        data.title ?? "",
          email:        data.email ?? "",
          phone_number: data.phone_number ?? "",
          user_type:    data.user_type ?? "STUDENT",
          role:         data.role ?? "CLIENT",
          is_active:    data.is_active ?? true,
          is_verified:  data.is_verified ?? false,
          bio:          data.bio ?? "",
          gender:       data.gender ?? "",
          country:      data.country ?? "",
          city:         data.city ?? "",
        });
      }
      setLoading(false);
    });
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const availableRoles = isSuperAdmin ? ROLES : ROLES.filter((r) => r !== "ADMIN" && r !== "SUPER_ADMIN");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {};
      for (const [k, v] of Object.entries(form)) {
        if (v !== "" && v !== null && v !== undefined) payload[k] = v;
      }
      await adminUpdateUser(id, payload);
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/users/${id}`), 1200);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 rounded-xl" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "40%" }} />
        <div className="dash-card p-6 space-y-4">
          {[60, 80, 50, 70].map((w, i) => (
            <div key={i} className="h-4 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!form) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 dash-anim-up">
        <Link
          href={`/dashboard/users/${id}`}
          className="dash-glass p-2 rounded-xl"
          style={{ color: "var(--dt-muted)" }}
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>{t("dash_edit_user")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic Info */}
        <div className="dash-card p-5 space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_section_basic_info")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("settings_first_name")}>
              <Input value={form.first_name} onChange={set("first_name")} disabled={saving} />
            </Field>
            <Field label={t("settings_last_name")}>
              <Input value={form.last_name} onChange={set("last_name")} disabled={saving} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("settings_email")}>
              <Input type="email" value={form.email} onChange={set("email")} disabled={saving} />
            </Field>
            <Field label={t("dash_user_phone")}>
              <Input value={form.phone_number} onChange={set("phone_number")} disabled={saving} />
            </Field>
          </div>

          <Field label={t("dash_user_title")} hint={t("dash_user_title_hint")}>
            <Input value={form.title} onChange={set("title")} disabled={saving} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("settings_country")}>
              <Input value={form.country} onChange={set("country")} disabled={saving} />
            </Field>
            <Field label={t("settings_city")}>
              <Input value={form.city} onChange={set("city")} disabled={saving} />
            </Field>
          </div>

          <Field label={t("settings_bio")}>
            <textarea
              value={form.bio}
              onChange={set("bio")}
              disabled={saving}
              rows={3}
              className="dash-glass w-full px-3 py-2 rounded-xl text-sm outline-none resize-none disabled:opacity-50"
              style={{ color: "var(--dt-secondary)", background: "transparent" }}
            />
          </Field>
        </div>

        {/* Role & Access */}
        <div className="dash-card p-5 space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_section_classification")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={t("dash_user_role_label")}
              hint={!isSuperAdmin ? t("dash_role_upgrade_hint") : undefined}
            >
              <Select value={form.role} onChange={set("role")} disabled={saving}>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{t(`dash_role_${r.toLowerCase()}`)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("dash_user_type_label")}>
              <Select value={form.user_type} onChange={set("user_type")} disabled={saving}>
                {TYPES.map((tp) => (
                  <option key={tp} value={tp}>{t(`dash_type_${tp.toLowerCase()}`)}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("dash_user_is_active")}>
              <Toggle
                value={form.is_active}
                onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                onLabel={t("dash_user_active")}
                offLabel={t("dash_user_inactive")}
                disabled={saving}
              />
            </Field>
            <Field label={t("dash_user_is_verified")}>
              <Toggle
                value={form.is_verified}
                onChange={(v) => setForm((f) => ({ ...f, is_verified: v }))}
                onLabel={t("dash_user_verified")}
                offLabel={t("dash_user_not_verified")}
                disabled={saving}
              />
            </Field>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-xs font-medium"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 rounded-xl text-xs font-medium"
            style={{ background: "rgba(20,184,166,0.1)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.3)" }}>
            {t("dash_user_updated_success")}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/users/${id}`}
            className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--dash-glass-bg)", color: "var(--dt-secondary)", border: "1px solid var(--dash-border)" }}
          >
            {t("dash_cancel")}
          </Link>
          <button
            type="submit"
            disabled={saving || success}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}
          >
            <Save size={14} />
            {saving ? t("dash_saving") : t("dash_update_user")}
          </button>
        </div>
      </form>
    </div>
  );
}
