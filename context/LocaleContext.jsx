"use client";
import { ar } from "@/locales/ar";
import { en } from "@/locales/en";
import { createContext, useContext, useEffect, useState } from "react";

const translations = { en, ar };

export const LocaleContext = createContext();

export function LocaleContextProvider({ children }) {
    const [locale, setLocaleState] = useState("en");

    useEffect(() => {
        const stored = localStorage.getItem("locale");
        if (stored === "en" || stored === "ar") {
            setLocaleState(stored);
            document.documentElement.lang = stored;
            document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
        }
    }, []);

    const setLocale = (newLocale) => {
        setLocaleState(newLocale);
        localStorage.setItem("locale", newLocale);
        document.cookie = `locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
        document.documentElement.lang = newLocale;
        document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
    };

    const t = (key) => translations[locale]?.[key] ?? key;
    const isRTL = locale === "ar";

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t, isRTL }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    return useContext(LocaleContext);
}
