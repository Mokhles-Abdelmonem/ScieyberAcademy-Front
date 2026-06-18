"use client";
import SectionTitle from "@/components/SectionTitle";
import { useLocale } from "@/context/LocaleContext";
import { coursesData } from "@/data/coursesData";
import { CheckCircleIcon, ClockIcon, LayersIcon, UserIcon } from "lucide-react";
import Link from "next/link";

export default function CoursesSection() {
    const { t, locale } = useLocale();

    return (
        <div id="courses">
            <SectionTitle
                text1={t("section_courses_label")}
                text2={t("section_courses_title")}
                text3={t("section_courses_subtitle")}
            />

            <div className="flex flex-wrap items-stretch justify-center gap-6 mt-16 px-6 md:px-16 lg:px-24 xl:px-32">
                {coursesData.map((course, index) => (
                    <div
                        key={index}
                        className={`relative rounded-2xl max-w-sm w-full shadow-[0px_4px_26px] shadow-black/8 flex flex-col ${
                            course.featured
                                ? "pt-12 bg-gradient-to-b from-teal-500 to-teal-700"
                                : "bg-white/50 dark:bg-gray-800/50 border border-slate-200 dark:border-slate-800"
                        }`}
                    >
                        {course.featured && (
                            <div className="flex items-center text-xs gap-1 py-1.5 px-3 text-teal-600 absolute top-4 end-4 rounded-full bg-white font-medium">
                                <span>{t("course_most_popular")}</span>
                            </div>
                        )}

                        <div className="p-7 flex flex-col flex-1">
                            <h3 className={`text-xl font-bold mb-1 ${course.featured ? "text-white" : ""}`}>
                                {course.title[locale]}
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-3 mb-4">
                                <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                                    course.featured
                                        ? "border-white/30 text-white/80"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}>
                                    <ClockIcon size={12} /> {course.duration[locale]}
                                </span>
                                <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                                    course.featured
                                        ? "border-white/30 text-white/80"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}>
                                    <LayersIcon size={12} /> {course.level[locale]}
                                </span>
                                <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                                    course.featured
                                        ? "border-white/30 text-white/80"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}>
                                    <UserIcon size={12} /> {course.instructor}
                                </span>
                            </div>

                            <p className={`text-sm leading-relaxed mb-5 ${
                                course.featured ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                            }`}>
                                {course.description[locale]}
                            </p>

                            <hr className={`mb-5 ${course.featured ? "border-white/20" : "border-slate-200 dark:border-slate-700"}`} />

                            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${
                                course.featured ? "text-white/60" : "text-teal-600 dark:text-teal-400"
                            }`}>
                                {t("course_curriculum_label")}
                            </p>
                            <div className="space-y-2 flex-1">
                                {course.curriculum.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <CheckCircleIcon
                                            size={15}
                                            className={course.featured ? "text-white/70" : "text-teal-500"}
                                            strokeWidth={1.8}
                                        />
                                        <span className={`text-sm ${
                                            course.featured ? "text-white/90" : "text-slate-600 dark:text-slate-300"
                                        }`}>
                                            {item.title[locale]}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={`/courses/${course.id}`}
                                className={`w-full mt-7 py-3 rounded-xl font-semibold text-sm transition text-center block ${
                                    course.featured
                                        ? "bg-white hover:bg-slate-100 text-teal-700"
                                        : "bg-teal-500 hover:bg-teal-600 text-white"
                                }`}
                            >
                                {course.buttonText[locale]}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
