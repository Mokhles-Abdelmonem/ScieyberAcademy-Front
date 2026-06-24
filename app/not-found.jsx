"use client";

import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, HomeIcon } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function NotFound() {
    const { t, isRTL } = useLocale();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-white dark:bg-slate-950">
            {/* Ambient orbs */}
            <div className="pointer-events-none absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-teal-300/20 blur-[140px] dark:bg-teal-500/10" />
            <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-teal-400/15 blur-[130px] dark:bg-teal-700/10" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                {/* Big 404 number */}
                <p className="text-[7rem] sm:text-[9rem] font-black leading-none bg-gradient-to-br from-teal-400 to-teal-600 bg-clip-text text-transparent select-none">
                    {t("notfound_code")}
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 mb-3">
                    {t("notfound_title")}
                </h1>

                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10">
                    {t("notfound_desc")}
                </p>

                <div className={`flex items-center gap-3 flex-wrap justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-teal-500/25"
                    >
                        <HomeIcon size={15} />
                        {t("notfound_home")}
                    </Link>

                    <Link
                        href="/#courses"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:border-teal-400 dark:hover:border-teal-500/50 transition-colors"
                    >
                        <BookOpenIcon size={15} />
                        {t("notfound_courses")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
