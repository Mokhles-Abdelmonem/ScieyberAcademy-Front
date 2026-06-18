"use client";

import { useState, useEffect, useRef } from "react";
import {
  User, Bell, Palette, Shield,
  Camera, Save, Eye, EyeOff, Lock,
  Sun, Moon, Globe, LogOut,
  CheckCircle, AlertCircle, Settings,
} from "lucide-react";
import { useLocale }       from "@/context/LocaleContext";
import { useThemeContext }  from "@/context/ThemeContext";
import { useUser }         from "@/context/UserContext";
import { changePassword, logoutAllSessions, updateProfile, uploadAvatar } from "@/utils/auth";

// ── Shared primitive components ────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="dash-card p-6 dash-anim-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="dash-icon-wrap w-10 h-10 shrink-0">
          <Icon size={18} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--dt-primary)" }}>{title}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
      style={{ color: "var(--dash-gradient-from)" }}>
      {children}
    </label>
  );
}

function FieldHint({ children }) {
  return (
    <p className="mt-1.5 text-[10px]" style={{ color: "var(--dt-muted)" }}>{children}</p>
  );
}

function GlassInput({ type = "text", value, onChange, placeholder, readOnly, rightSlot, ...rest }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        {...rest}
        style={{
          width: "100%",
          padding: "0.625rem 0.875rem",
          borderRadius: "0.75rem",
          border: "1px solid rgba(var(--dash-border-a), 0.14)",
          background: readOnly
            ? "rgba(var(--dash-border-a), 0.04)"
            : "rgba(var(--dash-glass-a), 0.06)",
          color: readOnly ? "var(--dt-tertiary)" : "var(--dt-primary)",
          fontSize: "0.8125rem",
          outline: "none",
          transition: "border-color 0.2s ease, background 0.2s ease",
          paddingInlineEnd: rightSlot ? "2.5rem" : "0.875rem",
          cursor: readOnly ? "not-allowed" : "text",
        }}
        onFocus={e => {
          if (!readOnly) {
            e.target.style.borderColor = "rgba(20,184,166,0.55)";
            e.target.style.background  = "rgba(var(--dash-glass-a), 0.10)";
          }
        }}
        onBlur={e => {
          if (!readOnly) {
            e.target.style.borderColor = "rgba(var(--dash-border-a), 0.14)";
            e.target.style.background  = "rgba(var(--dash-glass-a), 0.06)";
          }
        }}
      />
      {rightSlot && (
        <span className="absolute top-1/2 -translate-y-1/2 flex items-center"
          style={{ insetInlineEnd: "0.75rem" }}>
          {rightSlot}
        </span>
      )}
    </div>
  );
}

function GlassTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(var(--dash-border-a), 0.14)",
        background: "rgba(var(--dash-glass-a), 0.06)",
        color: "var(--dt-primary)",
        fontSize: "0.8125rem",
        outline: "none",
        resize: "vertical",
        transition: "border-color 0.2s ease",
      }}
      onFocus={e => {
        e.target.style.borderColor = "rgba(20,184,166,0.55)";
        e.target.style.background  = "rgba(var(--dash-glass-a), 0.10)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "rgba(var(--dash-border-a), 0.14)";
        e.target.style.background  = "rgba(var(--dash-glass-a), 0.06)";
      }}
    />
  );
}

function GlassSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(var(--dash-border-a), 0.14)",
        background: "rgba(var(--dash-glass-a), 0.06)",
        color: "var(--dt-primary)",
        fontSize: "0.8125rem",
        outline: "none",
        appearance: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </select>
  );
}

function SaveButton({ loading, saved, label, savingLabel, savedLabel, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-60"
      style={{
        background: saved
          ? "linear-gradient(135deg,#34d399,#10b981)"
          : "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))",
        color: "#fff",
        boxShadow: "0 6px 20px rgba(20,184,166,0.28)",
      }}
    >
      {saved
        ? <><CheckCircle size={15} /> {savedLabel}</>
        : loading
          ? <>{savingLabel}</>
          : <><Save size={15} /> {label}</>}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        background: checked
          ? "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))"
          : "rgba(var(--dash-border-a), 0.14)",
        boxShadow: checked ? "0 2px 10px rgba(20,184,166,0.30)" : "none",
      }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm"
        style={{ insetInlineStart: checked ? "calc(100% - 1.25rem)" : "0.25rem" }}
      />
    </button>
  );
}

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile",       icon: User    },
  { id: "notifications", icon: Bell    },
  { id: "appearance",    icon: Palette },
  { id: "security",      icon: Shield  },
];

// ── Settings page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme }       = useThemeContext();
  const { user, setUser } = useUser();

  const [activeTab, setActiveTab] = useState("profile");

  const handleThemeChange = (value) => {
    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", value);
    setTheme(value);
  };

  // ── Profile form ──────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    first_name: "",
    last_name:  "",
    title:      "",
    username:   "",
    email:      "",
    bio:        "",
    gender:     "",
    country:    "",
    city:       "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);
  const [profileError,  setProfileError]  = useState("");

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name ?? "",
        last_name:  user.last_name  ?? "",
        title:      user.title      ?? "",
        username:   user.username   ?? "",
        email:      user.email      ?? "",
        bio:        user.bio        ?? "",
        gender:     user.gender     ?? "",
        country:    user.country    ?? "",
        city:       user.city       ?? "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSaving(true);
    try {
      const payload = {
        first_name: profile.first_name || undefined,
        last_name:  profile.last_name  || undefined,
        title:      profile.title      || undefined,
        bio:        profile.bio        || undefined,
        gender:     profile.gender     || undefined,
        country:    profile.country    || undefined,
        city:       profile.city       || undefined,
      };
      const updated = await updateProfile(payload);
      setUser(prev => ({ ...prev, ...updated }));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      setProfileError(t("settings_save_error"));
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Notifications ─────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({ email: true, push: true, marketing: false });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved,  setNotifSaved]  = useState(false);

  const handleSaveNotifs = async () => {
    setNotifSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setNotifSaving(false);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  // ── Security ──────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw]       = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError]     = useState("");
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwSaved,  setPwSaved]    = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleUpdatePassword = async () => {
    setPwError("");
    if (passwords.next.length < 8) { setPwError(t("register_error_length")); return; }
    if (passwords.next !== passwords.confirm) { setPwError(t("register_error_match")); return; }
    setPwSaving(true);
    try {
      await changePassword(passwords.current, passwords.next);
      setPwSaved(true);
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err?.status === 401 ? t("settings_wrong_password") : t("settings_save_error"));
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutLoading(true);
    await logoutAllSessions();
    setLogoutLoading(false);
  };

  // ── Avatar upload ─────────────────────────────────────────────────────
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    setAvatarUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setUser(prev => ({ ...prev, ...updated }));
    } catch (err) {
      setAvatarError(err?.body?.message || t("settings_save_error"));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Avatar initials ───────────────────────────────────────────────────
  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  // ── Render ────────────────────────────────────────────────────────────

  const NOTIF_ITEMS = [
    { key: "email",     labelKey: "settings_notif_email",     descKey: "settings_notif_email_desc",     icon: Bell   },
    { key: "push",      labelKey: "settings_notif_push",      descKey: "settings_notif_push_desc",      icon: Globe  },
    { key: "marketing", labelKey: "settings_notif_marketing", descKey: "settings_notif_marketing_desc", icon: Globe  },
  ];

  return (
    <div className="max-w-[1080px] mx-auto space-y-0 pt-7">

      {/* ── Page header card ───────────────────────────────────────── */}
      <div
        className="dash-card relative overflow-hidden px-7 py-6 mb-6 dash-anim-up"
        style={{ animationDelay: "0s" }}
      >
        {/* Decorative radial glow — trailing edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 55% 100% at 100% 50%, rgba(20,184,166,0.13) 0%, transparent 70%)",
          }}
        />
        {/* Teal accent bar — leading edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 rounded-full"
          style={{
            insetInlineStart: 0,
            width: 3,
            background: "linear-gradient(180deg, var(--dash-gradient-from), var(--dash-gradient-to))",
          }}
        />

        <div className="relative flex items-center gap-4">
          <div className="dash-icon-wrap w-12 h-12 shrink-0">
            <Settings size={22} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.7} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
              {t("dash_settings")}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
              {t("settings_page_desc")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left: vertical tab list (desktop) / horizontal (mobile) ── */}
        <nav
          className="dash-card p-2 flex flex-row lg:flex-col gap-1 lg:w-52 shrink-0 dash-anim-up overflow-x-auto"
          style={{ animationDelay: "0.06s", height: "fit-content" }}
        >
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                "dash-nav-item flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap w-full",
                activeTab === id ? "dash-nav-active" : "",
              ].join(" ")}
              style={activeTab === id ? {} : { color: "var(--dt-tertiary)" }}
            >
              <Icon size={16} strokeWidth={activeTab === id ? 2 : 1.7} />
              {t(`settings_${id}`)}
            </button>
          ))}
        </nav>

        {/* ── Right: content ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ═══════════════════ PROFILE ═══════════════════ */}
          {activeTab === "profile" && (
            <SectionCard
              icon={User}
              title={t("settings_profile_title")}
              subtitle={t("settings_profile_desc")}
            >
              {/* Avatar row */}
              <div className="flex items-center gap-5 mb-7 pb-6 border-b dash-divider">
                <div className="relative shrink-0">
                  {user?.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={initials}
                      className="w-[72px] h-[72px] rounded-full object-cover ring-2"
                      style={{ ringColor: "rgba(20,184,166,0.40)" }}
                    />
                  ) : (
                    <div
                      className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{
                        background: "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))",
                        boxShadow: "0 0 0 3px rgba(20,184,166,0.25)",
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 flex items-center justify-center w-7 h-7 rounded-full disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))",
                      insetInlineEnd: "-2px",
                      boxShadow: "0 2px 8px rgba(20,184,166,0.35)",
                    }}
                    aria-label="Change photo"
                  >
                    <Camera size={13} color="#fff" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--dt-primary)" }}>
                    {user ? `${user.first_name} ${user.last_name}` : "—"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>
                    @{user?.username ?? ""}
                  </p>
                  <span className="dash-badge mt-2 inline-block">
                    {user?.user_type ?? ""}
                  </span>
                  {avatarUploading && (
                    <p className="text-[11px] mt-1.5" style={{ color: "var(--dash-gradient-from)" }}>
                      {t("settings_uploading") || "Uploading…"}
                    </p>
                  )}
                  {avatarError && (
                    <p className="text-[11px] mt-1.5 text-red-400">{avatarError}</p>
                  )}
                </div>
              </div>

              {/* Form grid */}
              <div className="space-y-4">
                {/* First + Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>{t("settings_first_name")}</FieldLabel>
                    <GlassInput
                      value={profile.first_name}
                      onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))}
                      placeholder={t("register_first_name_placeholder")}
                    />
                  </div>
                  <div>
                    <FieldLabel>{t("settings_last_name")}</FieldLabel>
                    <GlassInput
                      value={profile.last_name}
                      onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))}
                      placeholder={t("register_last_name_placeholder")}
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <FieldLabel>{t("settings_title")}</FieldLabel>
                  <GlassInput
                    value={profile.title}
                    onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                    placeholder={t("settings_title_placeholder")}
                    maxLength={100}
                    readOnly={user?.user_type === "STUDENT"}
                  />
                  <FieldHint>
                    {user?.user_type === "STUDENT"
                      ? t("settings_title_student_hint")
                      : t("settings_title_hint")}
                  </FieldHint>
                </div>

                {/* Username + Email (read-only) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>{t("settings_username")}</FieldLabel>
                    <GlassInput value={profile.username} readOnly />
                    <FieldHint>{t("settings_username_hint")}</FieldHint>
                  </div>
                  <div>
                    <FieldLabel>{t("settings_email")}</FieldLabel>
                    <GlassInput type="email" value={profile.email} readOnly />
                    <FieldHint>{t("settings_email_hint")}</FieldHint>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <FieldLabel>{t("settings_bio")}</FieldLabel>
                  <GlassTextarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    placeholder={t("settings_bio_placeholder")}
                    rows={3}
                  />
                </div>

                {/* Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel>{t("settings_gender")}</FieldLabel>
                    <GlassSelect
                      value={profile.gender}
                      onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                    >
                      <option value="">{t("settings_gender_unset")}</option>
                      <option value="MALE">{t("settings_gender_male")}</option>
                      <option value="FEMALE">{t("settings_gender_female")}</option>
                    </GlassSelect>
                  </div>
                  <div>
                    <FieldLabel>{t("settings_country")}</FieldLabel>
                    <GlassInput
                      value={profile.country}
                      onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
                      placeholder={t("settings_country_placeholder")}
                    />
                  </div>
                  <div>
                    <FieldLabel>{t("settings_city")}</FieldLabel>
                    <GlassInput
                      value={profile.city}
                      onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                      placeholder={t("settings_city_placeholder")}
                    />
                  </div>
                </div>

                {profileError && (
                  <div
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(239,68,68,0.10)",
                      border: "1px solid rgba(239,68,68,0.20)",
                      color: "#f87171",
                    }}
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    {profileError}
                  </div>
                )}

                <SaveButton
                  loading={profileSaving}
                  saved={profileSaved}
                  label={t("settings_save_changes")}
                  savingLabel={t("settings_saving")}
                  savedLabel={t("settings_saved")}
                  onClick={handleSaveProfile}
                />
              </div>
            </SectionCard>
          )}

          {/* ═══════════════════ NOTIFICATIONS ═══════════════════ */}
          {activeTab === "notifications" && (
            <SectionCard
              icon={Bell}
              title={t("settings_notif_title")}
              subtitle={t("settings_notif_desc")}
            >
              <div className="space-y-3">
                {NOTIF_ITEMS.map(({ key, labelKey, descKey, icon: Icon }) => (
                  <div
                    key={key}
                    className="dash-glass flex items-center justify-between gap-4 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="dash-icon-wrap w-9 h-9 shrink-0">
                        <Icon size={15} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--dt-primary)" }}>
                          {t(labelKey)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>
                          {t(descKey)}
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={notifs[key]}
                      onChange={val => setNotifs(n => ({ ...n, [key]: val }))}
                    />
                  </div>
                ))}

                <div className="pt-1">
                  <SaveButton
                    loading={notifSaving}
                    saved={notifSaved}
                    label={t("settings_save_preferences")}
                    savingLabel={t("settings_saving")}
                    savedLabel={t("settings_saved")}
                    onClick={handleSaveNotifs}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ═══════════════════ APPEARANCE ═══════════════════ */}
          {activeTab === "appearance" && (
            <div className="space-y-5">

              {/* Theme toggle */}
              <SectionCard
                icon={Palette}
                title={t("settings_theme_label")}
                subtitle={t("settings_theme_desc")}
              >
                <div className="flex items-center gap-3">
                  {[
                    { value: "dark",  icon: Moon, labelKey: "settings_theme_dark"  },
                    { value: "light", icon: Sun,  labelKey: "settings_theme_light" },
                  ].map(({ value, icon: Icon, labelKey }) => {
                    const active = theme === value;
                    return (
                      <button
                        key={value}
                        onClick={() => handleThemeChange(value)}
                        className="flex-1 flex flex-col items-center gap-2.5 py-5 rounded-xl transition-all"
                        style={{
                          background: active
                            ? "linear-gradient(135deg,rgba(20,184,166,0.18),rgba(13,148,136,0.12))"
                            : "rgba(var(--dash-glass-a),0.04)",
                          border: active
                            ? "1px solid rgba(20,184,166,0.40)"
                            : "1px solid rgba(var(--dash-border-a),0.10)",
                          boxShadow: active ? "0 0 20px rgba(20,184,166,0.12)" : "none",
                        }}
                      >
                        <Icon
                          size={22}
                          strokeWidth={1.6}
                          style={{ color: active ? "var(--dash-gradient-from)" : "var(--dt-tertiary)" }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: active ? "var(--dash-gradient-from)" : "var(--dt-tertiary)" }}
                        >
                          {t(labelKey)}
                        </span>
                        {active && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "var(--dash-gradient-from)" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Language */}
              <SectionCard
                icon={Globe}
                title={t("settings_language_label")}
                subtitle={t("settings_language_desc")}
              >
                <div className="flex items-center gap-3">
                  {[
                    { value: "en", labelKey: "settings_language_en", dir: "ltr" },
                    { value: "ar", labelKey: "settings_language_ar", dir: "rtl" },
                  ].map(({ value, labelKey, dir }) => {
                    const active = locale === value;
                    return (
                      <button
                        key={value}
                        dir={dir}
                        onClick={() => setLocale(value)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: active
                            ? "linear-gradient(135deg,rgba(20,184,166,0.18),rgba(13,148,136,0.12))"
                            : "rgba(var(--dash-glass-a),0.04)",
                          border: active
                            ? "1px solid rgba(20,184,166,0.40)"
                            : "1px solid rgba(var(--dash-border-a),0.10)",
                          color: active ? "var(--dash-gradient-from)" : "var(--dt-tertiary)",
                          boxShadow: active ? "0 0 20px rgba(20,184,166,0.12)" : "none",
                        }}
                      >
                        {t(labelKey)}
                        {active && <CheckCircle size={14} />}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ═══════════════════ SECURITY ═══════════════════ */}
          {activeTab === "security" && (
            <div className="space-y-5">

              {/* Change password */}
              <SectionCard
                icon={Shield}
                title={t("settings_security_title")}
                subtitle={t("settings_security_desc")}
              >
                <div className="space-y-4">
                  {/* Current password */}
                  <div>
                    <FieldLabel>{t("settings_current_password")}</FieldLabel>
                    <GlassInput
                      type={showPw.current ? "text" : "password"}
                      value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                      placeholder={t("settings_current_pw_hint")}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                          style={{ color: "var(--dt-muted)" }}
                        >
                          {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                  </div>

                  {/* New password */}
                  <div>
                    <FieldLabel>{t("settings_new_password")}</FieldLabel>
                    <GlassInput
                      type={showPw.next ? "text" : "password"}
                      value={passwords.next}
                      onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                      placeholder={t("settings_new_pw_hint")}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPw(s => ({ ...s, next: !s.next }))}
                          style={{ color: "var(--dt-muted)" }}
                        >
                          {showPw.next ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                  </div>

                  {/* Confirm password */}
                  <div>
                    <FieldLabel>{t("settings_confirm_password")}</FieldLabel>
                    <GlassInput
                      type={showPw.confirm ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      placeholder={t("settings_confirm_pw_hint")}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                          style={{ color: "var(--dt-muted)" }}
                        >
                          {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                  </div>

                  {/* Error */}
                  {pwError && (
                    <div
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                      style={{
                        background: "rgba(239,68,68,0.10)",
                        border: "1px solid rgba(239,68,68,0.20)",
                        color: "#f87171",
                      }}
                    >
                      <AlertCircle size={14} className="shrink-0" />
                      {pwError}
                    </div>
                  )}

                  <SaveButton
                    loading={pwSaving}
                    saved={pwSaved}
                    label={t("settings_update_password")}
                    savingLabel={t("settings_saving")}
                    savedLabel={t("settings_saved")}
                    onClick={handleUpdatePassword}
                  />
                </div>
              </SectionCard>

              {/* Active sessions */}
              <SectionCard
                icon={Lock}
                title={t("settings_sessions_title")}
                subtitle={t("settings_sessions_desc")}
              >
                <div
                  className="dash-glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="dash-icon-wrap w-9 h-9 shrink-0 mt-0.5">
                      <LogOut size={15} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.8} />
                    </div>
                    <p className="text-sm" style={{ color: "var(--dt-secondary)" }}>
                      {t("settings_logout_all_confirm")}
                    </p>
                  </div>
                  <button
                    onClick={handleLogoutAll}
                    disabled={logoutLoading}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60"
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.22)",
                      color: "#f87171",
                    }}
                  >
                    <LogOut size={14} />
                    {t("settings_logout_all_btn")}
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
