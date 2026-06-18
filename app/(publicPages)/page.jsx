"use client"
import SectionTitle from "@/components/SectionTitle";
import { useLocale } from "@/context/LocaleContext";
import { featuresData } from "@/data/featuresData";
import ContactSection from "@/sections/ContactSection";
import CoursesSection from "@/sections/CoursesSection";
import { FaqSection } from "@/sections/FaqSection";
import TechStackMarquee from "@/sections/TechStackMarquee";
import TestimonialsSection from "@/sections/TestimonialsSection";
import { ArrowRightIcon, PlayCircleIcon } from "lucide-react";

export default function Page() {
    const { t, locale } = useLocale();

    return (
        <>
            {/* ── HERO ─────────────────────────────────────────────── */}
            <div
                id="home"
                className="flex flex-col items-center justify-center text-center px-4 bg-[url('/assets/light-hero-gradient.svg')] dark:bg-[url('/assets/dark-hero-gradient.svg')] bg-no-repeat bg-cover"
            >
                {/* Social proof pill */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 pr-4 mt-46 rounded-full border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-600/20">
                    <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{t("hero_badge")}</span>
                    <p className="text-xs">{t("hero_badge_sub")}</p>
                </div>

                {/* Headline */}
                <h1 className="mt-4 text-5xl/15 md:text-[64px]/19 font-semibold max-w-2xl">
                    {t("hero_headline_1")}{" "}
                    <span className="bg-gradient-to-r from-[#2DD4C4] dark:from-[#8FF6E9] to-[#0E9499] dark:to-[#5EEAD8] bg-clip-text text-transparent">
                        {t("hero_headline_2")}
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base dark:text-slate-300 max-w-lg mt-3">
                    {t("hero_subtitle")}
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-4 mt-8">
                    <a href="#courses">
                        <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 transition text-white rounded-md px-6 h-11">
                            {t("hero_cta_start")} <ArrowRightIcon size={16} className="rtl:rotate-180" />
                        </button>
                    </a>
                    <a href="#courses">
                        <button className="flex items-center gap-2 border border-teal-600 transition text-slate-600 dark:text-white rounded-md px-6 h-11">
                            <PlayCircleIcon strokeWidth={1.3} size={20} />
                            <span>{t("hero_cta_explore")}</span>
                        </button>
                    </a>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-center">
                    <div>
                        <p className="text-2xl font-bold text-teal-500">{t("stat_students_count")}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t("stat_students_label")}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <div>
                        <p className="text-2xl font-bold text-teal-500">{t("stat_tracks_count")}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t("stat_tracks_label")}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <div>
                        <p className="text-2xl font-bold text-teal-500">{t("stat_months_count")}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t("stat_months_label")}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <div>
                        <p className="text-2xl font-bold text-teal-500">{t("stat_mentorship_count")}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t("stat_mentorship_label")}</p>
                    </div>
                </div>

                {/* Tech stack marquee — inside hero to inherit the gradient background */}
                <TechStackMarquee />
            </div>

            {/* ── WHY CHOOSE US ─────────────────────────────────────── */}
            <div id="about">
                <SectionTitle
                    text1={t("section_why_label")}
                    text2={t("section_why_title")}
                    text3={t("section_why_subtitle")}
                />

                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-4 mt-10 px-6 md:px-16 lg:px-24 xl:px-32">
                    {featuresData.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-xl space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-80 md:max-w-66"
                        >
                            <feature.icon className="text-teal-500 size-8 mt-4" strokeWidth={1.3} />
                            <h3 className="text-base font-medium">{feature.title[locale]}</h3>
                            <p className="text-slate-400 line-clamp-2">{feature.description[locale]}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── COURSES ───────────────────────────────────────────── */}
            <CoursesSection />

            {/* ── TESTIMONIALS ──────────────────────────────────────── */}
            <TestimonialsSection />

            {/* ── FAQ ───────────────────────────────────────────────── */}
            <FaqSection />

            {/* ── CONTACT ───────────────────────────────────────────── */}
            <ContactSection />

            {/* ── FINAL CTA ─────────────────────────────────────────── */}
            <div className="flex flex-col items-center text-center justify-center mt-20 mb-8">
                <h3 className="text-3xl font-semibold mt-16 mb-4">{t("cta_title")}</h3>
                <p className="text-slate-600 dark:text-slate-200 max-w-xl mx-auto">
                    {t("cta_subtitle")}
                </p>
                <div className="flex items-center gap-4 mt-8">
                    <a href="#courses">
                        <button className="bg-teal-500 hover:bg-teal-600 transition text-white rounded-md px-6 h-11">
                            {t("cta_explore")}
                        </button>
                    </a>
                    <a href="#contact">
                        <button className="border border-teal-600 transition text-slate-600 dark:text-white rounded-md px-6 h-11">
                            {t("cta_contact")}
                        </button>
                    </a>
                </div>
            </div>
        </>
    );
}
