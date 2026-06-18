"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CalendarDays, BookOpen, ChevronRight, Loader2, Search,
    Plus, Wifi, Building2,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { fetchPublishedCourses, fetchBatchesByCourse } from "@/utils/academyApi";

const BATCH_STATUS_CFG = {
    UPCOMING:  { label: "batch_status_upcoming",  color: "#14b8a6" },
    ONGOING:   { label: "batch_status_ongoing",   color: "#3b82f6" },
    COMPLETED: { label: "batch_status_completed", color: "#94a3b8" },
    CANCELLED: { label: "batch_status_cancelled", color: "#ef4444" },
};

function CourseBatchCard({ course }) {
    const { t } = useLocale();
    const [batches, setBatches] = useState(null);

    useEffect(() => {
        fetchBatchesByCourse(course.id).then(setBatches);
    }, [course.id]);

    const counts = batches
        ? Object.fromEntries(
            Object.keys(BATCH_STATUS_CFG).map(s => [
                s, batches.filter(b => b.status === s).length,
            ])
          )
        : null;

    return (
        <div className="dash-card p-5 flex flex-col gap-4">
            {/* Course info */}
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(20,184,166,0.1)" }}>
                    <BookOpen size={16} className="text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold leading-snug line-clamp-2"
                        style={{ color: "var(--dt-primary)" }}>
                        {course.title}
                    </h3>
                    {course.category_name && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: "var(--dt-muted)" }}>
                            {course.category_name}
                        </span>
                    )}
                </div>
            </div>

            {/* Batch counts */}
            {batches === null ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--dt-muted)" }}>
                    <Loader2 size={12} className="animate-spin" />
                    {t("batch_loading")}
                </div>
            ) : batches.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--dt-muted)" }}>{t("batch_none_yet")}</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(BATCH_STATUS_CFG).map(([status, cfg]) =>
                        counts[status] > 0 ? (
                            <span key={status}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                                style={{
                                    background: `${cfg.color}18`,
                                    color: cfg.color,
                                    borderColor: `${cfg.color}44`,
                                }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block"
                                    style={{ background: cfg.color }} />
                                {counts[status]} {t(cfg.label)}
                            </span>
                        ) : null
                    )}
                </div>
            )}

            {/* CTA */}
            <div className="mt-auto pt-1 flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--dt-muted)" }}>
                    {batches !== null ? `${batches.length} ${t("batch_total")}` : ""}
                </span>
                <Link
                    href={`/dashboard/courses/${course.id}/batches`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                    style={{
                        background: "linear-gradient(135deg,#14b8a6,#0d9488)",
                        color: "#fff",
                    }}
                >
                    <CalendarDays size={12} />
                    {t("batch_manage_btn")}
                    <ChevronRight size={11} />
                </Link>
            </div>
        </div>
    );
}

export default function BatchesHubPage() {
    const { t } = useLocale();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");

    useEffect(() => {
        fetchPublishedCourses().then(data => {
            setCourses(data);
            setLoading(false);
        });
    }, []);

    const filtered = search
        ? courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
        : courses;

    return (
        <div className="max-w-[1280px] mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 dash-anim-up">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>
                        {t("batch_hub_title")}
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
                        {t("batch_hub_subtitle")}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xs dash-anim-up" style={{ animationDelay: "0.06s" }}>
                <Search size={13} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--dt-muted)", insetInlineStart: "0.75rem" }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t("dash_search_courses")}
                    className="dash-glass w-full py-2 rounded-xl text-xs outline-none"
                    style={{
                        color: "var(--dt-secondary)",
                        background: "transparent",
                        paddingInlineStart: "2.25rem",
                        paddingInlineEnd: "1rem",
                    }}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 size={28} className="animate-spin text-teal-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CalendarDays size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" strokeWidth={1} />
                    <p className="font-semibold" style={{ color: "var(--dt-primary)" }}>
                        {t("batch_hub_empty")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((c, i) => (
                        <div key={c.id} className="dash-anim-up" style={{ animationDelay: `${i * 0.05}s` }}>
                            <CourseBatchCard course={c} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
