"use client";
import SectionTitle from "@/components/SectionTitle";
import { useLocale } from "@/context/LocaleContext";
import { fetchPublishedCourses } from "@/utils/academyApi";
import {
    BookOpenIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon,
    ClockIcon, UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/* ── Level config ────────────────────────────────────────────────── */

const LEVEL = {
    BEGINNER: {
        key:    "dash_course_beginner",
        badge:  { bg: "rgba(52,211,153,0.15)", color: "#34d399" },
        header: "from-teal-500 to-emerald-600",
    },
    INTERMEDIATE: {
        key:    "dash_course_intermediate",
        badge:  { bg: "rgba(251,191,36,0.15)", color: "#f59e0b" },
        header: "from-amber-400 to-orange-500",
    },
    ADVANCED: {
        key:    "dash_course_advanced",
        badge:  { bg: "rgba(167,139,250,0.18)", color: "#a78bfa" },
        header: "from-violet-500 to-indigo-600",
    },
};

/* ── Slot positions — always 3 cards max ─────────────────────────── */

const SLOT = {
    "-1": { x: -350, scale: 0.82, opacity: 0.72, z: 3 },
     "0": { x:    0, scale: 1.00, opacity: 1.00, z: 5 },
     "1": { x:  350, scale: 0.82, opacity: 0.72, z: 3 },
};

// Max visible slots on each side (always 1, or 0 for single course)
const getMaxPos = (total) => (total >= 2 ? 1 : 0);

// Shortest-path position of courseIdx relative to activeIdx
function slotOf(courseIdx, activeIdx, total) {
    let d = courseIdx - activeIdx;
    const half = Math.floor(total / 2);
    if (d >  half) d -= total;
    if (d < -half) d += total;
    return d;
}

// Resolve style for a slot (handles out-of-range by parking behind edge)
function styleOf(slot, mxPos) {
    const cfg = SLOT[String(slot)];
    if (cfg) return Math.abs(slot) <= mxPos ? cfg : { ...cfg, opacity: 0 };
    const sign  = slot >= 0 ? 1 : -1;
    const edge  = SLOT[String(sign * 1)]; // ±1 is our outermost
    return { x: edge.x + sign * 220, scale: edge.scale * 0.88, opacity: 0, z: 0 };
}

/* ── Course card ─────────────────────────────────────────────────── */

function CourseCard({ course, activeIndex, courseIndex, total, onNavigate, t }) {
    const [hovered, setHovered] = useState(false);

    const slot    = slotOf(courseIndex, activeIndex, total);
    const mxPos   = getMaxPos(total);
    const visible = Math.abs(slot) <= mxPos;
    const cfg     = styleOf(slot, mxPos);
    const isCenter = slot === 0;

    // Keep one buffer card per side in DOM for smooth enter/exit transitions
    if (Math.abs(slot) > mxPos + 1) return null;

    const lvl  = LEVEL[course.level] ?? LEVEL.BEGINNER;
    const inst = course.instructors?.[0];
    const desc = course.short_description || course.description || "";

    const hasPrice     = course.price > 0;
    const finalPrice   = course.discounted_price ?? course.price;
    const wasPrice     = course.discounted_price ? course.price : null;
    const discLabel    = course.discount_label;

    const scaleVal = cfg.scale + (hovered && visible ? (isCenter ? 0.025 : 0.035) : 0);
    const opacVal  = cfg.opacity + (hovered && visible ? 0.08 : 0);

    return (
        <div
            className="absolute top-1/2 left-1/2 w-[350px]"
            style={{
                transform:    `translate(-50%, -50%) translateX(${cfg.x}px) scale(${scaleVal})`,
                opacity:       opacVal,
                zIndex:        cfg.z ?? 0,
                transition:   "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.45s ease",
                willChange:   "transform, opacity",
                pointerEvents: visible ? "auto" : "none",
                cursor:        isCenter ? "default" : "pointer",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => !isCenter && onNavigate(slot)}
        >
            <div
                className={[
                    "relative rounded-3xl flex flex-col overflow-hidden",
                    "bg-white dark:bg-slate-800/95",
                    "border border-slate-200/80 dark:border-slate-700/60",
                    "transition-shadow duration-400",
                    isCenter
                        ? hovered
                            ? "shadow-2xl shadow-teal-500/18 dark:shadow-teal-500/25"
                            : "shadow-xl shadow-black/8 dark:shadow-black/30"
                        : "shadow-md shadow-black/6 dark:shadow-black/20",
                ].join(" ")}
            >
                {/* ── Visual header ─────────────────────────────── */}
                <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${lvl.header}`}>
                    {/* Dot mesh pattern */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)",
                            backgroundSize: "18px 18px",
                        }}
                    />
                    {/* Large background initial */}
                    <span className="absolute inset-0 flex items-center justify-center text-[110px] font-black text-white/10 select-none leading-none">
                        {course.title?.[0] ?? "?"}
                    </span>

                    {/* Enrollment status — top right */}
                    <div className="absolute top-3.5 end-3.5">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                            course.enrollment_open
                                ? "bg-white/20 text-white border border-white/30"
                                : "bg-black/20 text-white/70 border border-white/10"
                        }`}>
                            {course.enrollment_open ? t("course_enrollment_open") : t("course_enrollment_closed")}
                        </span>
                    </div>

                    {/* Category — bottom left */}
                    {course.category_name && (
                        <div className="absolute bottom-3 start-4">
                            <span className="text-[11px] text-white/80 bg-black/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                                {course.category_name}
                            </span>
                        </div>
                    )}

                    {/* Discount label — bottom right */}
                    {discLabel && (
                        <div className="absolute bottom-3 end-4">
                            <span className="text-[10px] font-bold text-white bg-red-500/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                {discLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Card body ─────────────────────────────────── */}
                <div className="p-5 flex flex-col gap-3.5">

                    {/* Level badge + duration */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: lvl.badge.bg, color: lvl.badge.color }}
                        >
                            {t(lvl.key)}
                        </span>
                        {course.duration_weeks && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                                <ClockIcon size={10} /> {course.duration_weeks} {t("dash_course_weeks")}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-[17px] leading-snug text-slate-900 dark:text-white line-clamp-2 min-h-[2.8rem]">
                        {course.title}
                    </h3>

                    {/* Instructor */}
                    {inst && (
                        <Link
                            href={`/instructor/${inst.id}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors truncate w-fit"
                        >
                            <span className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                                {inst.first_name?.[0] ?? <UserIcon size={9} />}
                            </span>
                            {inst.first_name} {inst.last_name}
                        </Link>
                    )}

                    {/* Description */}
                    {desc && (
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 min-h-[3.8rem]">
                            {desc}
                        </p>
                    )}

                    {/* Curriculum preview */}
                    {course.curriculum?.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                            {course.curriculum.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <CheckCircleIcon size={12} className="text-teal-500 mt-0.5 shrink-0" strokeWidth={2.2} />
                                    <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Price row */}
                    {hasPrice && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                                    {finalPrice.toLocaleString()} EGP
                                </span>
                                {wasPrice && (
                                    <span className="text-xs text-slate-400 line-through">
                                        {wasPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-0.5">
                        {isCenter ? (
                            <Link
                                href={`/courses/${course.id}`}
                                onClick={e => e.stopPropagation()}
                                className="block w-full text-center py-3 rounded-2xl text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all shadow-md shadow-teal-500/25"
                            >
                                {course.enrollment_open ? t("cd_enroll") : t("course_view_btn")}
                            </Link>
                        ) : (
                            <div className="w-full text-center py-2.5 rounded-2xl text-xs font-medium text-teal-500 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20">
                                {t("course_click_to_view")}
                            </div>
                        )}
                    </div>

                </div>

                {/* Dim overlay for non-center — fades on hover */}
                <div
                    className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
                    style={{ background: "rgba(0,0,0,0.13)", opacity: !isCenter && !hovered ? 1 : 0 }}
                />
            </div>
        </div>
    );
}

/* ── Skeleton card ───────────────────────────────────────────────── */

function SkeletonCard({ slot }) {
    const cfg = SLOT[String(slot)] ?? SLOT["0"];
    return (
        <div
            className="absolute top-1/2 left-1/2 w-[350px]"
            style={{
                transform: `translate(-50%, -50%) translateX(${cfg.x}px) scale(${cfg.scale})`,
                opacity:   cfg.opacity,
                zIndex:    cfg.z,
            }}
        >
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl animate-pulse">
                {/* Header skeleton */}
                <div className="h-40" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.25) 0%, rgba(13,148,136,0.25) 100%)" }} />
                <div className="p-5 space-y-3.5">
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full" style={{ background: "rgba(148,163,184,0.15)" }} />
                        <div className="h-6 w-16 rounded-full" style={{ background: "rgba(148,163,184,0.1)" }} />
                    </div>
                    <div className="space-y-2">
                        <div className="h-5 w-full rounded-full"  style={{ background: "rgba(148,163,184,0.14)" }} />
                        <div className="h-5 w-4/5 rounded-full"  style={{ background: "rgba(148,163,184,0.11)" }} />
                    </div>
                    <div className="h-3.5 w-2/5 rounded-full"  style={{ background: "rgba(148,163,184,0.1)" }} />
                    <div className="space-y-1.5">
                        <div className="h-3.5 w-full rounded-full"  style={{ background: "rgba(148,163,184,0.09)" }} />
                        <div className="h-3.5 w-11/12 rounded-full" style={{ background: "rgba(148,163,184,0.08)" }} />
                        <div className="h-3.5 w-4/5 rounded-full"  style={{ background: "rgba(148,163,184,0.07)" }} />
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                        {[85, 75, 65].map((w, i) => (
                            <div key={i} className="h-3 rounded-full" style={{ background: "rgba(148,163,184,0.09)", width: `${w}%` }} />
                        ))}
                    </div>
                    <div className="h-12 rounded-2xl mt-1" style={{ background: "rgba(148,163,184,0.13)" }} />
                </div>
            </div>
        </div>
    );
}

/* ── Dot indicators ──────────────────────────────────────────────── */

function Dots({ total, active, onGo }) {
    if (total <= 1) return null;
    const count = Math.min(total, 10);
    return (
        <div className="flex items-center justify-center gap-2.5 mt-10">
            {Array.from({ length: count }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onGo(i)}
                    aria-label={`Course ${i + 1}`}
                    className={[
                        "rounded-full transition-all duration-300",
                        i === active
                            ? "w-7 h-2.5 bg-teal-500 shadow-sm shadow-teal-500/40"
                            : "w-2.5 h-2.5 bg-slate-200 dark:bg-slate-600 hover:bg-teal-300 dark:hover:bg-teal-600",
                    ].join(" ")}
                />
            ))}
        </div>
    );
}

/* ── Section ─────────────────────────────────────────────────────── */

export default function CoursesSection() {
    const { t, locale } = useLocale();
    const [courses,     setCourses]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetchPublishedCourses({ limit: 10, lang: locale })
            .then(data => setCourses(Array.isArray(data) ? data : []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, [locale]);

    const prev = useCallback(() =>
        setActiveIndex(i => (i - 1 + courses.length) % courses.length),
    [courses.length]);

    const next = useCallback(() =>
        setActiveIndex(i => (i + 1) % courses.length),
    [courses.length]);

    const navigateBySlot = useCallback((slot) =>
        setActiveIndex(i => ((i + slot) % courses.length + courses.length) % courses.length),
    [courses.length]);

    const showNav = !loading && courses.length >= 2;

    return (
        <div id="courses">
            <SectionTitle
                text1={t("section_courses_label")}
                text2={t("section_courses_title")}
                text3={t("section_courses_subtitle")}
            />

            <div className="relative mt-16">

                {/* Prev arrow */}
                {showNav && (
                    <button
                        onClick={prev}
                        className="absolute left-3 sm:left-8 lg:left-12 top-[calc(50%-22px)] z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-500 dark:text-slate-400 hover:border-teal-400 hover:text-teal-500 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-all duration-200 active:scale-90"
                        aria-label="Previous course"
                    >
                        <ChevronLeftIcon size={20} />
                    </button>
                )}

                {/* Next arrow */}
                {showNav && (
                    <button
                        onClick={next}
                        className="absolute right-3 sm:right-8 lg:right-12 top-[calc(50%-22px)] z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-500 dark:text-slate-400 hover:border-teal-400 hover:text-teal-500 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-all duration-200 active:scale-90"
                        aria-label="Next course"
                    >
                        <ChevronRightIcon size={20} />
                    </button>
                )}

                {/* Carousel stage */}
                <div className="relative overflow-hidden" style={{ height: 610 }}>
                    {loading ? (
                        [-1, 0, 1].map(s => <SkeletonCard key={s} slot={s} />)
                    ) : courses.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
                            <BookOpenIcon size={44} className="text-slate-300 dark:text-slate-600" strokeWidth={1.2} />
                            <p className="text-slate-500 dark:text-slate-400 text-sm">{t("courses_empty")}</p>
                        </div>
                    ) : (
                        courses.map((course, i) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                activeIndex={activeIndex}
                                courseIndex={i}
                                total={courses.length}
                                onNavigate={navigateBySlot}
                                t={t}
                            />
                        ))
                    )}
                </div>

                {/* Dots */}
                {!loading && courses.length > 1 && (
                    <Dots total={courses.length} active={activeIndex} onGo={setActiveIndex} />
                )}

            </div>
        </div>
    );
}
