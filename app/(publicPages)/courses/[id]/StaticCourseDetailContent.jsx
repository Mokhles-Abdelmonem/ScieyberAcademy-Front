"use client";
import { useLocale } from "@/context/LocaleContext";
import { coursesData } from "@/data/coursesData";
import {
    AwardIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ClockIcon,
    LayersIcon,
    MonitorPlayIcon,
    StarIcon,
    UserIcon,
    UsersIcon,
    VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function CurriculumItem({ module, index, locale, t }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-start"
            >
                <div className="flex items-center gap-3">
                    <span className="shrink-0 flex items-center justify-center size-7 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold">
                        {index + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-white text-sm">
                        {module.title[locale]}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:block text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                        {module.weeks} {module.weeks === 1 ? t("cd_week") : t("cd_weeks")}
                    </span>
                    <ChevronDownIcon
                        size={16}
                        className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                </div>
            </button>
            {open && (
                <div className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    {t("cd_module_pre")}{" "}
                    <span className="font-medium text-teal-600 dark:text-teal-400">{module.title[locale]}</span>{" "}
                    {t("cd_module_post")}
                </div>
            )}
        </div>
    );
}

export default function StaticCourseDetailContent({ courseId, savePct }) {
    const { locale, t } = useLocale();
    const course = coursesData.find((c) => c.id === courseId);

    const includeIcons = [MonitorPlayIcon, VideoIcon, LayersIcon, AwardIcon];

    return (
        <div className="min-h-screen relative overflow-hidden bg-white dark:bg-transparent">
            {/* Page-wide teal glow orbs (light mode only) */}
            <div className="pointer-events-none fixed top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-teal-300/20 blur-[140px] dark:hidden" />
            <div className="pointer-events-none fixed top-[40%] right-[-8%] w-[450px] h-[450px] rounded-full bg-teal-400/15 blur-[130px] dark:hidden" />
            <div className="pointer-events-none fixed bottom-[10%] left-[30%] w-[400px] h-[300px] rounded-full bg-teal-200/20 blur-[120px] dark:hidden" />

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/60 via-white to-teal-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 dark:bg-none pt-28 pb-16 border-b border-teal-100/60 dark:border-slate-800">
                <div className="pointer-events-none absolute -top-32 left-1/4 w-[600px] h-[400px] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px]" />
                <div className="pointer-events-none absolute top-10 right-0 w-[400px] h-[300px] rounded-full bg-teal-300/20 dark:bg-teal-700/10 blur-[100px]" />

                <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-16">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-6">
                        <Link href="/#courses" className="hover:text-teal-500 dark:hover:text-teal-400 transition">
                            {t("cd_breadcrumb")}
                        </Link>
                        <span>/</span>
                        <span className="text-slate-500 dark:text-slate-400">{course.title[locale]}</span>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
                        {/* Left — info */}
                        <div>
                            <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 px-3 py-1.5 rounded-full">
                                {course.level[locale]}
                            </span>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-slate-900 dark:text-white">
                                {course.title[locale]}
                            </h1>

                            <p className="text-slate-500 dark:text-slate-300 text-base leading-relaxed max-w-2xl mb-7">
                                {course.description[locale]}
                            </p>

                            {/* Stats row */}
                            <div className="flex flex-wrap gap-5 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-2">
                                    <ClockIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                    {course.duration[locale]}
                                </span>
                                <span className="flex items-center gap-2">
                                    <LayersIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                    {course.level[locale]}
                                </span>
                                <span className="flex items-center gap-2">
                                    <UsersIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                    {course.students} {t("cd_students")}
                                </span>
                                <span className="flex items-center gap-2">
                                    <StarIcon size={15} className="text-teal-500 dark:text-teal-400 fill-teal-500 dark:fill-teal-400" />
                                    {course.rating} {t("cd_rating")}
                                </span>
                                <span className="flex items-center gap-2">
                                    <UserIcon size={15} className="text-teal-500 dark:text-teal-400" />
                                    {course.instructor}
                                </span>
                            </div>
                        </div>

                        {/* Right — hero pricing card (desktop only) */}
                        <div className="hidden lg:block">
                            <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/60 dark:shadow-none backdrop-blur-sm p-6">
                                <p className="text-xs text-red-500 dark:text-red-400 font-semibold uppercase tracking-wider mb-3">
                                    {t("cd_limited_offer")}
                                </p>

                                <div className="mb-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">{t("cd_one_time")}</p>
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-3xl font-bold text-teal-500 dark:text-teal-400">
                                            {course.discountedPrice.toLocaleString()}
                                        </span>
                                        <span className="text-slate-400 dark:text-slate-300 text-sm">{course.currency}</span>
                                        <span className="text-slate-400 line-through text-sm">{course.price.toLocaleString()}</span>
                                        <span className="text-xs bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 px-2 py-0.5 rounded-full font-medium">
                                            {t("cd_save")} {savePct}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-teal-500/80 mt-1">{t("cd_best_value")}</p>
                                </div>

                                <div className="flex items-center gap-2 my-4">
                                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/10" />
                                    <span className="text-xs text-slate-400 uppercase">{t("cd_or")}</span>
                                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/10" />
                                </div>

                                <div className="mb-5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">{t("cd_monthly")}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{course.discountedMonthlyPrice}</span>
                                        <span className="text-slate-400 text-sm">{course.currency} {t("cd_per_mo")}</span>
                                        <span className="text-slate-400 line-through text-sm">{course.monthlyPrice}</span>
                                    </div>
                                    <p className="text-xs text-yellow-500 dark:text-yellow-400/80 mt-1">{t("cd_pay_go")}</p>
                                </div>

                                <a href="mailto:contact@scieyber.com">
                                    <button className="w-full bg-teal-500 hover:bg-teal-600 transition text-white font-semibold py-3 rounded-xl text-sm">
                                        {t("cd_enroll")}
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MAIN CONTENT ──────────────────────────────────────── */}
            <div className="mx-auto max-w-6xl px-6 md:px-16 py-14 grid lg:grid-cols-[1fr_340px] gap-10 items-start">

                {/* ── LEFT COLUMN ──────────────────────────────────── */}
                <div className="space-y-10">

                    {/* What You'll Learn */}
                    <section>
                        <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5 text-slate-800 dark:text-white">
                            <CheckCircleIcon size={20} className="text-teal-500" strokeWidth={2} />
                            {t("cd_what_learn")}
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {course.skills[locale].map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                                    <CheckCircleIcon size={15} className="text-teal-500 shrink-0" strokeWidth={2.2} />
                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Course Curriculum */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t("cd_curriculum")}</h2>
                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                {course.curriculum.length} {t("cd_modules")}
                            </span>
                        </div>
                        <div className="space-y-2.5">
                            {course.curriculum.map((module, i) => (
                                <CurriculumItem key={i} module={module} index={i} locale={locale} t={t} />
                            ))}
                        </div>
                    </section>

                    {/* Instructor */}
                    <section>
                        <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white">{t("cd_instructor")}</h2>
                        <div className="flex items-start gap-5 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                            <div className="shrink-0 size-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white font-bold text-lg">
                                {course.instructor.split(" ").pop()[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white">{course.instructor}</p>
                                <p className="text-teal-500 text-xs font-medium mt-0.5 mb-3">{t("cd_instructor_role")}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t("cd_instructor_bio")}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── RIGHT SIDEBAR ─────────────────────────────────── */}
                <div className="lg:sticky lg:top-24 space-y-5">

                    {/* Pricing card */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-lg shadow-black/5">
                        {/* Visual header */}
                        <div className="relative flex items-center justify-center h-36 bg-gradient-to-br from-gray-900 to-teal-950 overflow-hidden">
                            <div className="absolute inset-0 bg-teal-500/5" />
                            <MonitorPlayIcon size={48} className="text-teal-400/60" strokeWidth={1} />
                            <span className="absolute bottom-0 inset-x-0 text-center text-xs text-white/50 pb-2 bg-black/20 pt-1">
                                {t("cd_course_content")}
                            </span>
                        </div>

                        <div className="p-5">
                            <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/40 px-3 py-1 rounded-full mb-4">
                                {t("cd_limited_offer")}
                            </span>

                            <div className="mb-3">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t("cd_one_time")}</p>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-3xl font-bold text-slate-800 dark:text-white">
                                        {course.discountedPrice.toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-sm">{course.currency}</span>
                                    <span className="text-slate-400 line-through text-sm">{course.price.toLocaleString()}</span>
                                    <span className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50 px-2 py-0.5 rounded-full">
                                        {t("cd_save")} {savePct}%
                                    </span>
                                </div>
                                <p className="text-xs text-teal-500 mt-1 font-medium">{t("cd_best_value")}</p>
                            </div>

                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                                <span className="text-xs text-slate-400 uppercase">{t("cd_or")}</span>
                                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl px-4 py-3 mb-5">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t("cd_monthly")}</p>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="text-xl font-bold text-slate-800 dark:text-white">{course.discountedMonthlyPrice}</span>
                                    <span className="text-slate-400 text-sm">{course.currency}</span>
                                    <span className="text-slate-400 text-xs">{t("cd_per_mo")}</span>
                                    <span className="text-slate-400 line-through text-xs">{course.monthlyPrice}</span>
                                </div>
                                <p className="text-xs text-yellow-500 mt-0.5 font-medium">{t("cd_pay_go")}</p>
                            </div>

                            <a href="mailto:contact@scieyber.com" className="block">
                                <button className="w-full bg-teal-500 hover:bg-teal-600 transition text-white font-semibold py-3 rounded-xl text-sm">
                                    {t("cd_enroll")}
                                </button>
                            </a>

                            <p className="text-center text-xs text-slate-400 mt-3">
                                {t("cd_questions")}{" "}
                                <a href="mailto:contact@scieyber.com" className="text-teal-500 hover:underline">
                                    {t("cd_contact_link")}
                                </a>
                            </p>
                        </div>

                        {/* Course includes */}
                        <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                                {t("cd_includes")}
                            </p>
                            <ul className="space-y-3">
                                {course.includes[locale].map((item, i) => {
                                    const Icon = includeIcons[i] ?? CheckCircleIcon;
                                    return (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                            <Icon size={16} className="text-teal-500 shrink-0" strokeWidth={1.8} />
                                            {item}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Back link */}
                    <Link
                        href="/#courses"
                        className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-500 transition py-2"
                    >
                        {t("cd_back")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
