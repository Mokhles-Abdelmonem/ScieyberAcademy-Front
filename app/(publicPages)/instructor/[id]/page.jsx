"use client";
import { useLocale } from "@/context/LocaleContext";
import { fetchInstructorProfile } from "@/utils/academyApi";
import {
    ArrowLeftIcon, BookOpenIcon, CheckCircleIcon, ClockIcon,
    GraduationCapIcon, LayersIcon, UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ── Level config ────────────────────────────────────────────────── */

const LEVEL_KEY = {
    BEGINNER:     "dash_course_beginner",
    INTERMEDIATE: "dash_course_intermediate",
    ADVANCED:     "dash_course_advanced",
};

const LEVEL_STYLE = {
    BEGINNER:     { bg: "rgba(52,211,153,0.15)",  color: "#34d399", bar: "from-teal-500 to-emerald-600" },
    INTERMEDIATE: { bg: "rgba(251,191,36,0.15)",   color: "#f59e0b", bar: "from-amber-400 to-orange-500" },
    ADVANCED:     { bg: "rgba(167,139,250,0.18)",  color: "#a78bfa", bar: "from-violet-500 to-indigo-600" },
};

/* ── Avatar ──────────────────────────────────────────────────────── */

function Avatar({ instructor, size = "lg" }) {
    const initials = `${instructor.first_name?.[0] ?? ""}${instructor.last_name?.[0] ?? ""}`.toUpperCase();
    const dim = size === "lg" ? "size-24 text-3xl" : "size-10 text-sm";
    return (
        <div className={`${dim} rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white font-bold overflow-hidden shrink-0`}>
            {instructor.profile_picture_url ? (
                <img src={instructor.profile_picture_url} alt={instructor.first_name} className="size-full object-cover" />
            ) : initials}
        </div>
    );
}

/* ── Course card ─────────────────────────────────────────────────── */

function CourseCard({ course, t }) {
    const lvl     = LEVEL_STYLE[course.level] ?? LEVEL_STYLE.BEGINNER;
    const price   = course.discounted_price ?? course.price;
    const wasFull = course.discounted_price ? course.price : null;

    return (
        <Link
            href={`/courses/${course.id}`}
            className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-md shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-teal-500/10 dark:hover:shadow-teal-500/15 hover:-translate-y-0.5 transition-all duration-300"
        >
            {/* Top gradient bar */}
            <div className={`h-1.5 bg-gradient-to-r ${lvl.bar}`} />

            <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: lvl.bg, color: lvl.color }}
                    >
                        {t(LEVEL_KEY[course.level] ?? LEVEL_KEY.BEGINNER)}
                    </span>
                    {course.enrollment_open && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20">
                            {t("course_enrollment_open")}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-base leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {course.title}
                </h3>

                {/* Description */}
                {(course.short_description || course.description) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {course.short_description || course.description}
                    </p>
                )}

                {/* Curriculum preview */}
                {course.curriculum?.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        {course.curriculum.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                                <CheckCircleIcon size={11} className="text-teal-500 mt-0.5 shrink-0" strokeWidth={2.2} />
                                <span className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">{item.title}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer: duration + price */}
                <div className="mt-auto pt-3 flex items-center justify-between">
                    {course.duration_weeks ? (
                        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <ClockIcon size={11} /> {course.duration_weeks} {t("dash_course_weeks")}
                        </span>
                    ) : <span />}

                    {Number(price) > 0 ? (
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                {Number(price).toLocaleString()} EGP
                            </span>
                            {wasFull && (
                                <span className="text-[11px] text-slate-400 line-through">
                                    {Number(wasFull).toLocaleString()}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{t("ip_free")}</span>
                    )}
                </div>

                {/* CTA */}
                <div className="py-2.5 rounded-xl text-center text-[13px] font-semibold text-white bg-teal-500 group-hover:bg-teal-600 transition-colors">
                    {course.enrollment_open ? t("cd_enroll") : t("course_view_btn")}
                </div>
            </div>
        </Link>
    );
}

/* ── Skeleton ────────────────────────────────────────────────────── */

function SkeletonHero() {
    return (
        <div className="animate-pulse">
            <div className="bg-gradient-to-br from-teal-50/60 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-teal-950 pt-28 pb-16 border-b border-teal-100/60 dark:border-slate-800">
                <div className="mx-auto max-w-5xl px-6 md:px-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="size-24 rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
                        <div className="flex-1 space-y-3 pt-1">
                            <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700/40" />
                            <div className="h-7 w-48 rounded-full bg-slate-200 dark:bg-slate-700/30" />
                            <div className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-slate-700/25" />
                            <div className="h-3 w-72 rounded-full bg-slate-200/70 dark:bg-slate-700/20 mt-2" />
                            <div className="h-3 w-56 rounded-full bg-slate-200/60 dark:bg-slate-700/15" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-6 md:px-12 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl h-64 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700" />
                ))}
            </div>
        </div>
    );
}

/* ── Not found ───────────────────────────────────────────────────── */

function NotFound({ t }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
            <UserIcon size={48} className="text-slate-300 dark:text-slate-600" strokeWidth={1.2} />
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("ip_not_found")}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t("ip_not_found_desc")}</p>
            </div>
            <Link href="/#courses" className="flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline">
                <ArrowLeftIcon size={14} /> {t("ip_back")}
            </Link>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function InstructorProfilePage({ params }) {
    const { t } = useLocale();
    const [instructor, setInstructor] = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [notFound,   setNotFound]   = useState(false);

    useEffect(() => {
        const load = async () => {
            const { id } = await params;
            const data = await fetchInstructorProfile(id);
            if (!data) setNotFound(true);
            else       setInstructor(data);
            setLoading(false);
        };
        load();
    }, [params]);

    if (loading)  return <SkeletonHero />;
    if (notFound) return <NotFound t={t} />;

    const { courses = [] } = instructor;
    const initials = `${instructor.first_name?.[0] ?? ""}${instructor.last_name?.[0] ?? ""}`.toUpperCase();

    return (
        <div className="min-h-screen bg-white dark:bg-transparent">

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/60 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-teal-950 pt-28 pb-16 border-b border-teal-100/60 dark:border-slate-800">
                {/* Light mode orbs */}
                <div className="pointer-events-none absolute -top-32 left-1/4 w-[500px] h-[400px] rounded-full bg-teal-300/20 blur-[120px] dark:hidden" />
                <div className="pointer-events-none absolute top-10 right-0 w-[400px] h-[300px] rounded-full bg-teal-200/25 blur-[100px] dark:hidden" />
                {/* Dark mode orbs */}
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-teal-500/10 blur-[100px] hidden dark:block" />
                <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-teal-700/10 blur-[80px] hidden dark:block" />

                <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-12">

                    {/* Back link */}
                    <Link
                        href="/#courses"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition mb-8"
                    >
                        <ArrowLeftIcon size={12} /> {t("ip_back")}
                    </Link>

                    {/* Profile card */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="shrink-0 size-24 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white font-black text-3xl overflow-hidden shadow-lg shadow-teal-500/20 dark:shadow-black/30 ring-4 ring-teal-100 dark:ring-white/10">
                            {instructor.profile_picture_url ? (
                                <img src={instructor.profile_picture_url} alt={instructor.first_name} className="size-full object-cover" />
                            ) : initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-start">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                                    <GraduationCapIcon size={11} /> {t("ip_instructor_badge")}
                                </span>
                                {instructor.title && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{instructor.title}</span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                {instructor.first_name} {instructor.last_name}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">@{instructor.username}</p>

                            {instructor.bio && (
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl">
                                    {instructor.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 mt-5 pt-5 border-t border-slate-200 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center">
                                        <BookOpenIcon size={15} className="text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-bold text-base leading-none">{courses.length}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{t("ip_courses_label")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Courses ───────────────────────────────────────── */}
            <section className="mx-auto max-w-5xl px-6 md:px-12 py-14">
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                        <LayersIcon size={40} className="text-slate-300 dark:text-slate-600" strokeWidth={1.2} />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t("ip_no_courses")}</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8">
                            {t("ip_courses_by")} {instructor.first_name}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} t={t} />
                            ))}
                        </div>
                    </>
                )}
            </section>

        </div>
    );
}
