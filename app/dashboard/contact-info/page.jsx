"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Phone, Mail, MapPin, Clock, Facebook, Linkedin, Instagram,
    MessageCircle, Save, Loader2, CheckCircle2, AlertCircle, Info,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser }   from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { fetchContactInfo, adminUpdateContactInfo } from "@/utils/academyApi";

// TikTok icon (not in lucide)
function TikTokIcon({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z" />
        </svg>
    );
}

const FIELD_GROUPS = [
    {
        groupKey: "ci_group_contact",
        fields: [
            { key: "email",         icon: Mail,           labelKey: "ci_field_email",         type: "email",  placeholderKey: "ci_ph_email"    },
            { key: "phone",         icon: Phone,          labelKey: "ci_field_phone",         type: "tel",    placeholderKey: "ci_ph_phone"    },
            { key: "whatsapp",      icon: MessageCircle,  labelKey: "ci_field_whatsapp",      type: "tel",    placeholderKey: "ci_ph_whatsapp" },
            { key: "address",       icon: MapPin,         labelKey: "ci_field_address",       type: "text",   placeholderKey: "ci_ph_address"  },
            { key: "response_time", icon: Clock,          labelKey: "ci_field_response_time", type: "text",   placeholderKey: "ci_ph_response" },
        ],
    },
    {
        groupKey: "ci_group_social",
        fields: [
            { key: "facebook_url",  icon: Facebook,  labelKey: "ci_field_facebook",  type: "url", placeholderKey: "ci_ph_facebook"  },
            { key: "linkedin_url",  icon: Linkedin,  labelKey: "ci_field_linkedin",  type: "url", placeholderKey: "ci_ph_linkedin"  },
            { key: "instagram_url", icon: Instagram, labelKey: "ci_field_instagram", type: "url", placeholderKey: "ci_ph_instagram" },
            { key: "tiktok_url",    icon: TikTokIcon, labelKey: "ci_field_tiktok",  type: "url", placeholderKey: "ci_ph_tiktok"    },
        ],
    },
];

const EMPTY_FORM = {
    email: "", phone: "", whatsapp: "", address: "", response_time: "",
    facebook_url: "", linkedin_url: "", instagram_url: "", tiktok_url: "",
};

export default function ContactInfoPage() {
    const { t }    = useLocale();
    const { user } = useUser();
    const router   = useRouter();

    const [form,    setForm]    = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [success, setSuccess] = useState(false);
    const [error,   setError]   = useState("");

    // Super-admin gate
    useEffect(() => {
        if (user && user.role !== "SUPER_ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchContactInfo();
            if (data) {
                setForm({
                    email:         data.email         ?? "",
                    phone:         data.phone         ?? "",
                    whatsapp:      data.whatsapp      ?? "",
                    address:       data.address       ?? "",
                    response_time: data.response_time ?? "",
                    facebook_url:  data.facebook_url  ?? "",
                    linkedin_url:  data.linkedin_url  ?? "",
                    instagram_url: data.instagram_url ?? "",
                    tiktok_url:    data.tiktok_url    ?? "",
                });
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setSuccess(false);
        setError("");
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        setError("");
        try {
            // Send only non-empty values; clear a field by sending empty string as null
            const payload = {};
            for (const [k, v] of Object.entries(form)) {
                payload[k] = v.trim() === "" ? null : v.trim();
            }
            await adminUpdateContactInfo(payload);
            setSuccess(true);
        } catch (err) {
            setError(err.message || t("ci_save_error"));
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.55rem 0.875rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(var(--dash-border-a), 0.14)",
        background: "rgba(var(--dash-glass-a), 0.06)",
        color: "var(--dt-primary)",
        fontSize: "0.8125rem",
        outline: "none",
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-5 pt-7">
                <div className="dash-card p-6 animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 rounded-xl" style={{ background: "rgba(var(--dash-border-a),0.1)" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-5 pt-7">

            {/* ── Page header ──────────────────────────────── */}
            <div className="dash-card relative overflow-hidden px-7 py-6 dash-anim-up">
                <div aria-hidden className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(ellipse 55% 100% at 100% 50%, rgba(20,184,166,0.12) 0%, transparent 70%)" }} />
                <div aria-hidden className="pointer-events-none absolute inset-y-0 rounded-full"
                    style={{ insetInlineStart: 0, width: 3, background: "linear-gradient(180deg,var(--dash-gradient-from),var(--dash-gradient-to))" }} />
                <div className="relative flex items-center gap-4">
                    <div className="dash-icon-wrap w-12 h-12 shrink-0">
                        <Mail size={22} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.7} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--dt-primary)" }}>
                            {t("ci_page_title")}
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
                            {t("ci_page_subtitle")}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Info notice ───────────────────────────────── */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)", color: "var(--dt-secondary)" }}>
                <Info size={15} className="mt-0.5 shrink-0" style={{ color: "var(--dash-gradient-from)" }} />
                {t("ci_notice")}
            </div>

            {/* ── Field groups ──────────────────────────────── */}
            {FIELD_GROUPS.map(({ groupKey, fields }) => (
                <div key={groupKey} className="dash-card p-6 dash-anim-up space-y-5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest"
                        style={{ color: "var(--dash-gradient-from)" }}>
                        {t(groupKey)}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map(({ key, icon: Icon, labelKey, type, placeholderKey }) => (
                            <div key={key}>
                                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-2"
                                    style={{ color: "var(--dt-secondary)" }}>
                                    <Icon size={12} />
                                    {t(labelKey)}
                                    <span className="font-normal normal-case tracking-normal" style={{ color: "var(--dt-muted)" }}>
                                        ({t("ci_optional")})
                                    </span>
                                </label>
                                <input
                                    type={type}
                                    value={form[key]}
                                    onChange={e => handleChange(key, e.target.value)}
                                    placeholder={t(placeholderKey)}
                                    style={inputStyle}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* ── Feedback + Save ───────────────────────────── */}
            <div className="flex flex-col gap-3 pb-7">
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400"
                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)" }}>
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                        style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "#14b8a6" }}>
                        <CheckCircle2 size={14} />
                        {t("ci_save_success")}
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 self-start px-6 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all active:scale-[0.97]"
                    style={{ background: "linear-gradient(135deg,var(--dash-gradient-from),var(--dash-gradient-to))", boxShadow: "0 6px 20px rgba(20,184,166,0.25)" }}
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? t("ci_saving") : t("ci_save_btn")}
                </button>
            </div>
        </div>
    );
}
