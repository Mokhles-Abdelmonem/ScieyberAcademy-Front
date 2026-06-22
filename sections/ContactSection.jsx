"use client";
import SectionTitle from "@/components/SectionTitle";
import { useLocale } from "@/context/LocaleContext";
import {
    AlertCircleIcon, CheckCircleIcon, ClockIcon, MailIcon, MapPinIcon,
    PhoneIcon, MessageCircleIcon, SendIcon, FacebookIcon, LinkedinIcon,
    InstagramIcon, YoutubeIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { parseApiError } from "@/utils/parseApiError";
import { fetchContactInfo } from "@/utils/academyApi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// TikTok icon (not in lucide)
function TikTokIcon({ size = 17, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z" />
        </svg>
    );
}

function buildInfoItems(info, t) {
    const items = [];

    if (info?.email) {
        items.push({ icon: MailIcon, label: t("contact_email_label"), value: info.email, href: `mailto:${info.email}` });
    }
    if (info?.phone) {
        items.push({ icon: PhoneIcon, label: t("contact_phone_label"), value: info.phone, href: `tel:${info.phone}` });
    }
    if (info?.whatsapp) {
        items.push({ icon: MessageCircleIcon, label: t("contact_whatsapp_label"), value: info.whatsapp, href: `https://wa.me/${info.whatsapp.replace(/\D/g, "")}` });
    }
    if (info?.address) {
        items.push({ icon: MapPinIcon, label: t("contact_location_label"), value: info.address, href: null });
    }
    if (info?.response_time) {
        items.push({ icon: ClockIcon, label: t("contact_time_label"), value: info.response_time, href: null });
    }
    return items;
}

function buildSocialItems(info) {
    const socials = [];
    if (info?.facebook_url)  socials.push({ icon: FacebookIcon,  href: info.facebook_url,  label: "Facebook"  });
    if (info?.linkedin_url)  socials.push({ icon: LinkedinIcon,  href: info.linkedin_url,  label: "LinkedIn"  });
    if (info?.instagram_url) socials.push({ icon: InstagramIcon, href: info.instagram_url, label: "Instagram" });
    if (info?.tiktok_url)    socials.push({ icon: TikTokIcon,    href: info.tiktok_url,    label: "TikTok"    });
    return socials;
}

export default function ContactSection() {
    const { t } = useLocale();
    const [form, setForm]           = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);
    const [info, setInfo]           = useState(null);

    useEffect(() => {
        fetchContactInfo().then(data => setInfo(data)).catch(() => {});
    }, []);

    const infoItems   = buildInfoItems(info, t);
    const socialItems = buildSocialItems(info);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/contact/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: form.name,
                    email: form.email,
                    subject: form.subject,
                    message: form.message,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(parseApiError(body, t));
            }
            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({ name: "", email: "", subject: "", message: "" });
        setSubmitted(false);
        setError(null);
    };

    return (
        <section id="contact">
            <SectionTitle
                text1={t("section_contact_label")}
                text2={t("section_contact_title")}
                text3={t("section_contact_subtitle")}
            />

            <div className="mt-10 px-6 md:px-16 lg:px-24 xl:px-32 grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ── Left info panel ─────────────────────────────── */}
                <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-teal-500/30 dark:border-teal-700/40 bg-gradient-to-br from-teal-500 to-teal-700 p-8 flex flex-col justify-between gap-8 min-h-64">
                    {/* Dot grid */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                    />
                    <div aria-hidden className="pointer-events-none absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-teal-300/30 blur-3xl" />

                    <div className="relative z-10">
                        <h4 className="text-white font-semibold text-lg mb-1">{t("contact_info_title")}</h4>
                        <p className="text-teal-100 text-sm leading-relaxed">{t("contact_info_desc")}</p>
                    </div>

                    {infoItems.length > 0 && (
                        <ul className="relative z-10 flex flex-col gap-5">
                            {infoItems.map(({ icon: Icon, label, value, href }) => (
                                <li key={label} className="flex items-start gap-4">
                                    <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm">
                                        <Icon size={17} className="text-white" strokeWidth={1.6} />
                                    </span>
                                    <div>
                                        <p className="text-teal-200 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
                                        {href ? (
                                            <a href={href} className="text-white text-sm hover:text-teal-200 transition-colors">
                                                {value}
                                            </a>
                                        ) : (
                                            <p className="text-white text-sm">{value}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {socialItems.length > 0 && (
                        <div className="relative z-10 flex items-center gap-3">
                            {socialItems.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
                                >
                                    <Icon size={17} className="text-white" strokeWidth={1.6} />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right form panel ────────────────────────────── */}
                <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 p-8">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
                            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/30">
                                <CheckCircleIcon className="text-teal-500" size={28} strokeWidth={1.6} />
                            </span>
                            <h4 className="text-xl font-semibold">{t("contact_success_title")}</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">{t("contact_success_desc")}</p>
                            <button onClick={handleReset} className="mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline">
                                {t("contact_success_another")}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircleIcon size={15} className="flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                                        {t("contact_form_name")} <span className="text-teal-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder={t("contact_form_name_placeholder")}
                                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 px-4 py-2.5 w-full text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                                        {t("contact_form_email")} <span className="text-teal-500">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder={t("contact_form_email_placeholder")}
                                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 px-4 py-2.5 w-full text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    {t("contact_form_subject")} <span className="text-slate-400 font-normal">{t("contact_form_subject_optional")}</span>
                                </label>
                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    value={form.subject}
                                    onChange={handleChange}
                                    placeholder={t("contact_form_subject_placeholder")}
                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 px-4 py-2.5 w-full text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                                    {t("contact_form_message")} <span className="text-teal-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    required
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder={t("contact_form_message_placeholder")}
                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 px-4 py-2.5 w-full text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="self-start flex items-center gap-2 bg-teal-500 hover:bg-teal-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition text-white rounded-lg px-7 h-11 text-sm font-medium"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        {t("contact_form_submit")}
                                    </span>
                                ) : (
                                    <>{t("contact_form_submit")} <SendIcon size={15} /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
