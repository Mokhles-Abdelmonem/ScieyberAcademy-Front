"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { adminCreateUser } from "@/utils/academyApi";

const ROLES     = ["CLIENT", "STAFF", "ADMIN", "SUPER_ADMIN"];
const TYPES     = ["STUDENT", "STAFF", "PARENT", "INSTRUCTOR"];
const GENDERS   = ["MALE", "FEMALE"];

const INITIAL = {
  first_name:   "",
  last_name:    "",
  username:     "",
  email:        "",
  password:     "",
  title:        "",
  phone_number: "",
  user_type:    "STUDENT",
  role:         "CLIENT",
  is_active:    true,
};

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
      value={value}
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
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="dash-glass w-full px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
      style={{ color: "var(--dt-secondary)", background: "var(--dash-glass-bg)" }}
    >
      {children}
    </select>
  );
}

export default function NewUserPage() {
  const { t }    = useLocale();
  const { user } = useUser();
  const router   = useRouter();

  const [form, setForm]     = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setBool = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value === "true" }));

  const availableRoles = isSuperAdmin ? ROLES : ROLES.filter((r) => r !== "ADMIN" && r !== "SUPER_ADMIN");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.username || !form.email || !form.password) {
      setError(t("dash_user_fields_required"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.phone_number) delete payload.phone_number;
      if (!payload.title) delete payload.title;
      await adminCreateUser(payload);
      router.push("/dashboard/users");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 dash-anim-up">
        <Link
          href="/dashboard/users"
          className="dash-glass p-2 rounded-xl transition-colors"
          style={{ color: "var(--dt-muted)" }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>{t("dash_create_user")}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>{t("dash_create_user_desc")}</p>
        </div>
      </div>

      {/* ── Form ── */}
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

          <Field label={t("dash_user_title")} hint={t("dash_user_title_hint")}>
            <Input value={form.title} onChange={set("title")} disabled={saving} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("settings_username")}>
              <Input value={form.username} onChange={set("username")} disabled={saving} />
            </Field>
            <Field label={t("settings_email")}>
              <Input type="email" value={form.email} onChange={set("email")} disabled={saving} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("dash_user_password")} hint={t("dash_user_password_hint")}>
              <Input type="password" value={form.password} onChange={set("password")} disabled={saving} />
            </Field>
            <Field label={t("dash_user_phone")}>
              <Input value={form.phone_number} onChange={set("phone_number")} disabled={saving} />
            </Field>
          </div>
        </div>

        {/* Role & Type */}
        <div className="dash-card p-5 space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_section_classification")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("dash_user_role_label")}>
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

          {/* is_active toggle */}
          <Field label={t("dash_user_is_active")}>
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "rgba(var(--dash-border-a),0.06)", border: "1px solid var(--dash-border)" }}
            >
              <span className="text-xs" style={{ color: "var(--dt-muted)" }}>
                {form.is_active ? t("dash_user_active") : t("dash_user_inactive")}
              </span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                disabled={saving}
                className="relative w-10 h-5 rounded-full transition-all duration-200"
                style={{ background: form.is_active ? "linear-gradient(135deg,#14b8a6,#0d9488)" : "var(--dash-glass-bg)", border: "1px solid var(--dash-border)" }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  style={{ insetInlineStart: form.is_active ? "calc(100% - 1.1rem)" : "0.1rem" }}
                />
              </button>
            </div>
          </Field>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-xs font-medium"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/users"
            className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--dash-glass-bg)", color: "var(--dt-secondary)", border: "1px solid var(--dash-border)" }}
          >
            {t("dash_cancel")}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}
          >
            <Save size={14} />
            {saving ? t("dash_saving") : t("dash_user_created_success_btn")}
          </button>
        </div>
      </form>
    </div>
  );
}
