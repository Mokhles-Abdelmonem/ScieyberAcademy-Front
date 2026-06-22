"use client";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocale } from "@/context/LocaleContext";
import { requestPasswordReset } from "@/utils/auth";
import { ArrowLeftIcon, MailIcon, SendIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const { t } = useLocale();
    const [email, setEmail]     = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent]       = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await requestPasswordReset(email);
        setSent(true);
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-slate-100 to-cyan-50 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900">

            {/* ── Background orbs ─────────────────────────────────── */}
            <div aria-hidden className="pointer-events-none absolute -top-32 -start-32 w-[560px] h-[560px] rounded-full bg-teal-300/30 dark:bg-teal-500/20 blur-[130px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-40 -end-20 w-[640px] h-[640px] rounded-full bg-teal-400/20 dark:bg-teal-600/25 blur-[150px]" />
            <div aria-hidden className="pointer-events-none absolute top-1/3 end-[8%] w-[320px] h-[320px] rounded-full bg-cyan-300/20 dark:bg-teal-400/12 blur-[100px]" />

            {/* ── Top controls ────────────────────────────────────── */}
            <div className="absolute top-5 end-5 z-20 flex items-center gap-2.5">
                <LanguageToggle />
                <ThemeToggle />
            </div>

            <Link
                href="/login"
                className="absolute top-5 start-5 z-20 text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 transition flex items-center gap-1"
            >
                <ArrowLeftIcon size={12} /> {t("login_back_home")}
            </Link>

            {/* ── Glass card ──────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-[420px] px-4">

                <div aria-hidden className="absolute inset-0 rounded-[28px] bg-teal-300/20 dark:bg-teal-400/10 blur-xl scale-105 pointer-events-none" />

                <div className="relative rounded-[24px] border border-white/70 dark:border-white/[0.13] bg-white/55 dark:bg-white/[0.055] backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] px-8 py-10">

                    {/* Logo */}
                    <div className="flex justify-center mb-7">
                        <Link href="/" className="flex items-center gap-0">
                            <Image
                                src="/assets/main-logo/logo-colored.svg"
                                alt="Scieyber Academy"
                                width={54}
                                height={54}
                                className="-me-1.5 dark:brightness-0 dark:invert dark:opacity-90"
                            />
                            <span dir="ltr" className="font-semibold text-[17px] tracking-tight">
                                <span className="text-teal-500 dark:text-teal-300">Scieyber</span>
                                <span className="text-slate-800 dark:text-white/75">Academy</span>
                            </span>
                        </Link>
                    </div>

                    <div className="w-full h-px bg-slate-200/80 dark:bg-white/[0.08] mb-7" />

                    {sent ? (
                        /* ── Success state ─────────────────────────── */
                        <div className="text-center py-4">
                            <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center mb-5">
                                <MailIcon size={26} className="text-teal-500 dark:text-teal-400" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                {t("fp_success_heading")}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-white/45 leading-relaxed mb-7">
                                {t("fp_success_msg")}
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition"
                            >
                                <ArrowLeftIcon size={14} /> {t("fp_back_to_login")}
                            </Link>
                        </div>
                    ) : (
                        /* ── Form state ────────────────────────────── */
                        <>
                            <div className="mb-7">
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1.5">
                                    {t("fp_heading")}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-white/45">
                                    {t("fp_subheading")}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-2">
                                        {t("fp_email_label")}
                                    </label>
                                    <div className="relative">
                                        <MailIcon
                                            size={15}
                                            className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400 dark:text-white/30 pointer-events-none"
                                            strokeWidth={1.8}
                                        />
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t("fp_email_placeholder")}
                                            className="w-full ps-10 pe-4 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.06] text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-teal-400/40 focus:border-teal-400 dark:focus:border-teal-400/30 transition"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] text-white font-semibold py-3 rounded-2xl text-sm shadow-[0_8px_24px_rgba(20,184,166,0.30)]"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin size-4 shrink-0" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                            </svg>
                                            {t("fp_submitting")}
                                        </>
                                    ) : (
                                        <>
                                            <SendIcon size={14} strokeWidth={2} />
                                            {t("fp_submit")}
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-slate-500 dark:text-white/35">
                                <Link href="/login" className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium transition flex items-center justify-center gap-1">
                                    <ArrowLeftIcon size={13} /> {t("fp_back_to_login")}
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
