"use client";
import { useLocale } from "@/context/LocaleContext";
import { LanguagesIcon } from "lucide-react";

export default function LanguageToggle() {
    const { locale, setLocale, t } = useLocale();

    return (
        <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition text-xs font-medium"
            aria-label="Switch language"
        >
            <LanguagesIcon size={14} strokeWidth={1.8} />
            <span>{t("lang_switch")}</span>
        </button>
    );
}
