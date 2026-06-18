"use client";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocale } from "@/context/LocaleContext";
import { parseApiError } from "@/utils/parseApiError";
import { saveTokens } from "@/utils/auth";
import { useUser } from "@/context/UserContext";
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LoginPage() {
    const { t } = useLocale();
    const router = useRouter();
    const { loadUser } = useUser();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(parseApiError(body, t));
                return;
            }
            const { access_token, refresh_token } = await res.json();
            saveTokens(access_token, refresh_token);
            await loadUser();
            router.push("/dashboard");
        } catch {
            setError(t("error_server"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-slate-100 to-cyan-50 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900">

            {/* ── Background orbs ─────────────────────────────────── */}
            <div aria-hidden className="pointer-events-none absolute -top-32 -start-32 w-[560px] h-[560px] rounded-full bg-teal-300/30 dark:bg-teal-500/20 blur-[130px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-40 -end-20 w-[640px] h-[640px] rounded-full bg-teal-400/20 dark:bg-teal-600/25 blur-[150px]" />
            <div aria-hidden className="pointer-events-none absolute top-1/3 end-[8%] w-[320px] h-[320px] rounded-full bg-cyan-300/20 dark:bg-teal-400/12 blur-[100px]" />
            <div aria-hidden className="pointer-events-none absolute bottom-[20%] start-[12%] w-[260px] h-[260px] rounded-full bg-teal-200/25 dark:bg-teal-300/10 blur-[90px]" />
            {/* Tilted elongated blobs for depth */}
            <div aria-hidden className="pointer-events-none absolute top-[15%] start-[5%] w-[180px] h-[480px] rounded-full bg-teal-300/15 dark:bg-teal-500/8 blur-[80px] rotate-[25deg]" />
            <div aria-hidden className="pointer-events-none absolute bottom-[10%] end-[15%] w-[160px] h-[420px] rounded-full bg-teal-200/20 dark:bg-teal-400/10 blur-[70px] -rotate-[20deg]" />

            {/* ── Top controls ────────────────────────────────────── */}
            <div className="absolute top-5 end-5 z-20 flex items-center gap-2.5">
                <LanguageToggle />
                <ThemeToggle />
            </div>

            <Link
                href="/"
                className="absolute top-5 start-5 z-20 text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 transition flex items-center gap-1"
            >
                ← {t("login_back_home")}
            </Link>

            {/* ── Glass card ──────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-[420px] px-4">

                {/* Outer glow ring */}
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

                    {/* Divider */}
                    <div className="w-full h-px bg-slate-200/80 dark:bg-white/[0.08] mb-7" />

                    {/* Heading */}
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1.5">{t("login_heading")}</h1>
                        <p className="text-sm text-slate-500 dark:text-white/45">{t("login_subheading")}</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="mb-5 flex items-center gap-2.5 bg-red-500/10 border border-red-400/20 rounded-2xl px-4 py-3 text-sm text-red-500 dark:text-red-300">
                            <span className="shrink-0">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email or Username */}
                        <div>
                            <label htmlFor="identifier" className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-2">
                                {t("login_identifier")}
                            </label>
                            <div className="relative">
                                <UserIcon
                                    size={15}
                                    className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400 dark:text-white/30 pointer-events-none"
                                    strokeWidth={1.8}
                                />
                                <input
                                    id="identifier"
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={t("login_identifier_placeholder")}
                                    className="w-full ps-10 pe-4 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.06] text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-teal-400/40 focus:border-teal-400 dark:focus:border-teal-400/30 focus:bg-white/80 dark:focus:bg-white/[0.09] transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40">
                                    {t("login_password")}
                                </label>
                                <button type="button" className="text-xs text-teal-600/80 dark:text-teal-400/70 hover:text-teal-500 dark:hover:text-teal-300 transition">
                                    {t("login_forgot")}
                                </button>
                            </div>
                            <div className="relative">
                                <LockIcon
                                    size={15}
                                    className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400 dark:text-white/30 pointer-events-none"
                                    strokeWidth={1.8}
                                />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("login_password_placeholder")}
                                    className="w-full ps-10 pe-11 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.06] text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-teal-400/40 focus:border-teal-400 dark:focus:border-teal-400/30 focus:bg-white/80 dark:focus:bg-white/[0.09] transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 -translate-y-1/2 end-3.5 text-slate-400 dark:text-white/30 hover:text-teal-500 dark:hover:text-teal-300 transition"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword
                                        ? <EyeOffIcon size={15} strokeWidth={1.8} />
                                        : <EyeIcon size={15} strokeWidth={1.8} />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] text-white font-semibold py-3 rounded-2xl text-sm mt-1 shadow-[0_8px_24px_rgba(20,184,166,0.30)]"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin size-4 shrink-0" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                    </svg>
                                    {t("login_signing_in")}
                                </>
                            ) : t("login_submit")}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-white/35">
                        {t("login_no_account")}{" "}
                        <Link href="/register" className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium transition">
                            {t("login_register")}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
