"use client";

import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen, Filter, Search, Clock, Users, XCircle,
  ChevronRight, Wifi, Building2, Layers, GraduationCap, Plus,
  LayoutGrid, LayoutList, CalendarDays, Loader2,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { fetchPublishedCourses, searchCourses } from "@/utils/academyApi";

const LEVEL_COLOR = {
  BEGINNER:     { bg: "rgba(52,211,153,0.15)",  text: "#34d399", border: "rgba(52,211,153,0.3)"  },
  INTERMEDIATE: { bg: "rgba(251,191,36,0.15)",   text: "#fbbf24", border: "rgba(251,191,36,0.3)"  },
  ADVANCED:     { bg: "rgba(248,113,113,0.15)",  text: "#f87171", border: "rgba(248,113,113,0.3)" },
};

const MODE_ICON = {
  ONLINE_LIVE: Wifi,
  IN_OFFICE:   Building2,
  HYBRID:      Layers,
};

/* ── Skeletons ─────────────────────────────────────────────────── */

function CourseSkeleton() {
  return (
    <div className="dash-card p-5 animate-pulse">
      <div className="h-3 rounded-full mb-4" style={{ background: "rgba(var(--dash-border-a),0.12)", width: "40%" }} />
      <div className="h-5 rounded-full mb-2" style={{ background: "rgba(var(--dash-border-a),0.1)",  width: "80%" }} />
      <div className="h-3 rounded-full mb-4" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "60%" }} />
      <div className="h-px mb-4"             style={{ background: "rgba(var(--dash-border-a),0.08)" }} />
      <div className="flex justify-between">
        <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "30%" }} />
        <div className="h-7 rounded-lg"   style={{ background: "rgba(var(--dash-border-a),0.1)", width: "28%" }} />
      </div>
    </div>
  );
}

function CourseRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[55, 18, 14, 16, 12, 12, 14, 10].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Grid card ─────────────────────────────────────────────────── */

function CourseCard({ course, index, canManage }) {
  const { t } = useLocale();
  const level   = LEVEL_COLOR[course.level] ?? LEVEL_COLOR.BEGINNER;
  const ModeIcon = MODE_ICON[course.delivery_mode] ?? BookOpen;

  return (
    <div
      className="dash-card p-5 flex flex-col dash-anim-up"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {course.category_name && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(20,184,166,0.12)", color: "var(--dash-gradient-from)", border: "1px solid rgba(20,184,166,0.2)" }}>
              {course.category_name}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: level.bg, color: level.text, border: `1px solid ${level.border}` }}>
          {t(`dash_course_${course.level.toLowerCase()}`)}
        </span>
      </div>

      <h3 className="text-sm font-semibold leading-snug mb-1.5 line-clamp-2" style={{ color: "var(--dt-primary)" }}>
        {course.title}
      </h3>
      {course.short_description && (
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--dt-muted)" }}>
          {course.short_description}
        </p>
      )}

      <div className="flex-1" />
      <div className="dash-divider border-t my-3" />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--dt-muted)" }}>
          <ModeIcon size={11} />
          {t(`dash_course_mode_${course.delivery_mode.toLowerCase()}`)}
        </span>
        {course.duration_weeks && (
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--dt-muted)" }}>
            <Clock size={11} /> {course.duration_weeks} {t("dash_course_weeks")}
          </span>
        )}
        {course.max_students && (
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--dt-muted)" }}>
            <Users size={11} /> {t("dash_max")} {course.max_students}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          {Number(course.price) > 0 ? (
            <p className="text-base font-bold" style={{ color: "var(--dt-primary)" }}>
              ${Number(course.price).toFixed(0)}
              <span className="text-xs font-normal ms-1" style={{ color: "var(--dt-muted)" }}>
                / {t("dash_course_batch")}
              </span>
            </p>
          ) : (
            <span className="text-sm font-bold" style={{ color: "#34d399" }}>{t("dash_course_free")}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <Link
              href={`/dashboard/courses/${course.id}/batches`}
              className="dash-pill-btn flex items-center gap-1 text-xs font-medium px-2.5 py-1.5"
              style={{ color: "var(--dt-muted)" }}
            >
              <CalendarDays size={11} /> {t("dash_manage_batches")}
            </Link>
          )}
          <Link
            href={`/course/${course.id}`}
            className="dash-pill-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5"
            style={{ color: "var(--dt-secondary)" }}
          >
            {t("dash_view_details")} <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── List row ──────────────────────────────────────────────────── */

function CourseRow({ course, index, canManage }) {
  const { t } = useLocale();
  const level    = LEVEL_COLOR[course.level] ?? LEVEL_COLOR.BEGINNER;
  const ModeIcon = MODE_ICON[course.delivery_mode] ?? BookOpen;

  return (
    <tr
      className="dash-anim-up transition-colors duration-150"
      style={{ animationDelay: `${index * 0.04}s`, borderBottom: "1px solid var(--dash-border)" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--dash-border-a),0.04)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <td className="px-4 py-3 min-w-[220px]">
        <p className="text-sm font-semibold line-clamp-1" style={{ color: "var(--dt-primary)" }}>{course.title}</p>
        {course.short_description && (
          <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: "var(--dt-muted)" }}>{course.short_description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        {course.category_name ? (
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: "rgba(20,184,166,0.12)", color: "var(--dash-gradient-from)", border: "1px solid rgba(20,184,166,0.2)" }}>
            {course.category_name}
          </span>
        ) : <span style={{ color: "var(--dt-muted)" }}>—</span>}
      </td>
      <td className="px-4 py-3">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: level.bg, color: level.text, border: `1px solid ${level.border}` }}>
          {t(`dash_course_${course.level.toLowerCase()}`)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
          <ModeIcon size={12} /> {t(`dash_course_mode_${course.delivery_mode.toLowerCase()}`)}
        </span>
      </td>
      <td className="px-4 py-3">
        {course.duration_weeks ? (
          <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
            <Clock size={12} /> {course.duration_weeks} {t("dash_course_weeks")}
          </span>
        ) : <span style={{ color: "var(--dt-muted)" }}>—</span>}
      </td>
      <td className="px-4 py-3">
        {course.max_students ? (
          <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
            <Users size={12} /> {course.max_students}
          </span>
        ) : <span style={{ color: "var(--dt-muted)" }}>—</span>}
      </td>
      <td className="px-4 py-3">
        {Number(course.price) > 0 ? (
          <span className="text-sm font-bold" style={{ color: "var(--dt-primary)" }}>${Number(course.price).toFixed(0)}</span>
        ) : (
          <span className="text-xs font-bold" style={{ color: "#34d399" }}>{t("dash_course_free")}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <Link
              href={`/dashboard/courses/${course.id}/batches`}
              className="dash-pill-btn inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 whitespace-nowrap"
              style={{ color: "var(--dt-muted)" }}
            >
              <CalendarDays size={11} /> {t("dash_manage_batches")}
            </Link>
          )}
          <Link
            href={`/course/${course.id}`}
            className="dash-pill-btn inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 whitespace-nowrap"
            style={{ color: "var(--dt-secondary)" }}
          >
            {t("dash_view_details")} <ChevronRight size={11} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

/* ── Empty state helpers ───────────────────────────────────────── */

function EmptyState({ t, mineOnly, isInstructor, onShowAll, isSearch, onClearSearch }) {
  return (
    <div className="col-span-full dash-card p-10 flex flex-col items-center gap-3 text-center">
      <BookOpen size={32} style={{ color: "var(--dt-muted)" }} strokeWidth={1.2} />
      <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>
        {isSearch ? t("search_no_results") : t("dash_no_courses")}
      </p>
      <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
        {isSearch ? t("search_no_results_desc") : mineOnly ? t("dash_no_my_courses_desc") : t("dash_no_courses_desc")}
      </p>
      {isSearch && (
        <button onClick={onClearSearch} className="mt-2 dash-pill-btn text-xs font-medium px-4 py-2" style={{ color: "var(--dt-secondary)" }}>
          {t("dash_show_all_courses")}
        </button>
      )}
      {!isSearch && mineOnly && !isInstructor && (
        <button onClick={onShowAll} className="mt-2 dash-pill-btn text-xs font-medium px-4 py-2" style={{ color: "var(--dt-secondary)" }}>
          {t("dash_show_all_courses")}
        </button>
      )}
    </div>
  );
}

function EmptyStateInline({ t, mineOnly, isInstructor, onShowAll, isSearch, onClearSearch }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <BookOpen size={28} style={{ color: "var(--dt-muted)" }} strokeWidth={1.2} />
      <p className="text-sm font-medium" style={{ color: "var(--dt-secondary)" }}>
        {isSearch ? t("search_no_results") : t("dash_no_courses")}
      </p>
      <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
        {isSearch ? t("search_no_results_desc") : mineOnly ? t("dash_no_my_courses_desc") : t("dash_no_courses_desc")}
      </p>
      {isSearch && (
        <button onClick={onClearSearch} className="mt-1 dash-pill-btn text-xs font-medium px-4 py-2" style={{ color: "var(--dt-secondary)" }}>
          {t("dash_show_all_courses")}
        </button>
      )}
      {!isSearch && mineOnly && !isInstructor && (
        <button onClick={onShowAll} className="mt-1 dash-pill-btn text-xs font-medium px-4 py-2" style={{ color: "var(--dt-secondary)" }}>
          {t("dash_show_all_courses")}
        </button>
      )}
    </div>
  );
}

/* ── Inner page (needs Suspense for useSearchParams) ───────────── */

function CoursesContent() {
  const { t, locale }  = useLocale();
  const { user }       = useUser();
  const searchParams   = useSearchParams();

  const isInstructor = user?.user_type === "STAFF" || user?.user_type === "INSTRUCTOR";
  const canManage    = ["ADMIN","SUPER_ADMIN"].includes(user?.role) || ["INSTRUCTOR","STAFF"].includes(user?.user_type);

  // Search state — initialised from URL ?q=
  const [search,      setSearch]      = useState(searchParams.get("q") ?? "");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [mineOnly,    setMineOnly]    = useState(false);
  const [view,        setView]        = useState("grid");

  // Data states
  const [browseCourses,  setBrowseCourses]  = useState([]);
  const [searchResults,  setSearchResults]  = useState([]);
  const [browseLoading,  setBrowseLoading]  = useState(true);
  const [searchLoading,  setSearchLoading]  = useState(false);

  const debounceRef = useRef(null);
  const isSearchMode = search.trim().length > 0;

  const LEVELS = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

  /* ── Browse fetch (level + mine filters via API) ─────────────── */
  useEffect(() => {
    if (isSearchMode) return; // search mode handles its own fetch
    setBrowseLoading(true);
    fetchPublishedCourses({
      level: levelFilter !== "ALL" ? levelFilter : undefined,
      my:    mineOnly && !!user,
      lang:  locale,
    }).then((data) => {
      setBrowseCourses(data);
      setBrowseLoading(false);
    });
  }, [levelFilter, mineOnly, user, locale, isSearchMode]);

  /* ── DB search (debounced) ───────────────────────────────────── */
  const runSearch = useCallback(async (q) => {
    const term = q.trim();
    if (!term) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    const data = await searchCourses({ q: term, lang: locale, limit: 100 });
    setSearchResults(data);
    setSearchLoading(false);
    // Sync URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set("q", term);
    window.history.replaceState({}, "", url.toString());
  }, [locale]);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (!v.trim()) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(v), 400);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchResults([]);
    window.history.replaceState({}, "", window.location.pathname);
  };

  // Run initial search if page loaded with ?q=
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    if (q) runSearch(q);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-run search when locale switches while searching
  useEffect(() => {
    if (isSearchMode) runSearch(search);
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Apply level filter client-side on search results ─────────── */
  const displayedCourses = useMemo(() => {
    const base = isSearchMode ? searchResults : browseCourses;
    if (!isSearchMode || levelFilter === "ALL") return base;
    return base.filter((c) => c.level === levelFilter);
  }, [isSearchMode, searchResults, browseCourses, levelFilter]);

  const loading = isSearchMode ? searchLoading : browseLoading;

  const TABLE_COLS = [
    t("dash_col_course"),
    t("dash_col_category"),
    t("dash_col_level"),
    t("dash_col_mode"),
    t("dash_col_duration"),
    t("dash_col_capacity"),
    t("dash_col_price"),
    t("dash_col_action"),
  ];

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 dash-anim-up" style={{ animationDelay: "0s" }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>
            {isSearchMode
              ? t("search_results_for") + " \"" + search.trim() + "\""
              : mineOnly && isInstructor
                ? t("dash_my_assigned_courses")
                : t("dash_course_catalog")}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>
            {isSearchMode
              ? null
              : mineOnly && isInstructor
                ? t("dash_my_assigned_courses_desc")
                : t("dash_course_catalog_desc")}
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
          <Link
            href="/dashboard/courses/new"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}
          >
            <Plus size={15} />
            {t("dash_create_course")}
          </Link>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 dash-anim-up" style={{ animationDelay: "0.08s" }}>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--dt-muted)", insetInlineStart: "0.75rem" }} />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder={t("dash_search_courses")}
            className="dash-glass w-full py-2 rounded-xl text-xs outline-none"
            style={{
              color: "var(--dt-secondary)",
              background: "transparent",
              paddingInlineStart: "2.25rem",
              paddingInlineEnd: search ? "2.25rem" : "1rem",
            }}
          />
          {search && !searchLoading && (
            <button
              onClick={handleClearSearch}
              className="absolute top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
              style={{ insetInlineEnd: "0.6rem", color: "var(--dt-muted)" }}
            >
              <XCircle size={13} />
            </button>
          )}
          {searchLoading && (
            <Loader2
              size={13}
              className="absolute top-1/2 -translate-y-1/2 animate-spin"
              style={{ insetInlineEnd: "0.6rem", color: "var(--dash-gradient-from)" }}
            />
          )}
        </div>

        {/* "My Courses" toggle — hidden in search mode */}
        {user && !isSearchMode && (
          <button
            onClick={() => setMineOnly((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-150"
            style={mineOnly
              ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" }
              : { background: "var(--dash-glass-bg)", color: "var(--dt-muted)", border: "1px solid var(--dash-border)" }}
          >
            <GraduationCap size={12} />
            {isInstructor ? t("dash_my_assigned_courses_short") : t("dash_mine_only")}
          </button>
        )}

        {/* Level filter */}
        <div className="flex items-center gap-1 dash-glass p-1 rounded-xl">
          <Filter size={12} style={{ color: "var(--dt-muted)", marginInlineStart: "0.5rem" }} />
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className="px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all duration-150"
              style={levelFilter === lvl
                ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
                : { color: "var(--dt-muted)" }}
            >
              {lvl === "ALL" ? t("dash_all") : t(`dash_course_${lvl.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div
          className="flex items-center p-1 rounded-xl gap-0.5"
          style={{ background: "var(--dash-glass-bg)", border: "1px solid var(--dash-border)" }}
        >
          <button
            onClick={() => setView("grid")}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={view === "grid"
              ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
              : { color: "var(--dt-muted)" }}
            title={t("dash_view_grid")}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={view === "list"
              ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
              : { color: "var(--dt-muted)" }}
            title={t("dash_view_list")}
          >
            <LayoutList size={14} />
          </button>
        </div>
      </div>

      {/* ── Count ── */}
      {!loading && (
        <p className="text-xs dash-anim-up" style={{ color: "var(--dt-muted)", animationDelay: "0.1s" }}>
          {displayedCourses.length} {t("dash_courses_found")}
          {isSearchMode && (
            <span className="ms-2 font-semibold" style={{ color: "var(--dash-gradient-from)" }}>
              · {t("search_results_for")} &ldquo;{search.trim()}&rdquo;
            </span>
          )}
          {!isSearchMode && mineOnly && (
            <span className="ms-2 font-semibold" style={{ color: "#a78bfa" }}>
              · {isInstructor ? t("dash_my_assigned_courses_short") : t("dash_mine_only")}
            </span>
          )}
        </p>
      )}

      {/* ── Grid view ── */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)
            : displayedCourses.length > 0
              ? displayedCourses.map((c, i) => <CourseCard key={c.id} course={c} index={i} canManage={canManage} />)
              : <EmptyState
                  t={t}
                  mineOnly={mineOnly}
                  isInstructor={isInstructor}
                  onShowAll={() => setMineOnly(false)}
                  isSearch={isSearchMode}
                  onClearSearch={handleClearSearch}
                />
          }
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dash-border)", background: "rgba(var(--dash-border-a),0.04)" }}>
                  {TABLE_COLS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--dt-muted)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <CourseRowSkeleton key={i} />)
                  : displayedCourses.length > 0
                    ? displayedCourses.map((c, i) => <CourseRow key={c.id} course={c} index={i} canManage={canManage} />)
                    : (
                      <tr>
                        <td colSpan={TABLE_COLS.length} className="px-4 py-10 text-center">
                          <EmptyStateInline
                            t={t}
                            mineOnly={mineOnly}
                            isInstructor={isInstructor}
                            onShowAll={() => setMineOnly(false)}
                            isSearch={isSearchMode}
                            onClearSearch={handleClearSearch}
                          />
                        </td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page (Suspense required for useSearchParams) ──────────────── */

export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesContent />
    </Suspense>
  );
}
