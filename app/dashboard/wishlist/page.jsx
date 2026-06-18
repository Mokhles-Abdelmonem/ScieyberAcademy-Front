"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart, HeartOff, Search, BookOpen, Layers,
  Wifi, Building2, ChevronRight, BellIcon,
  LayoutGrid, LayoutList, Loader2,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { fetchMyWishlist, toggleWishlist } from "@/utils/academyApi";

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

const MODE_LABEL_KEY = {
  ONLINE_LIVE: "dash_course_mode_online_live",
  IN_OFFICE:   "dash_course_mode_in_office",
  HYBRID:      "dash_course_mode_hybrid",
};

/* ── Skeletons ─────────────────────────────────────────────────── */

function CardSkeleton() {
  return (
    <div className="dash-card p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "35%" }} />
        <div className="h-5 w-5 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)" }} />
      </div>
      <div className="h-5 rounded-full mb-2" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "75%" }} />
      <div className="h-3 rounded-full mb-4" style={{ background: "rgba(var(--dash-border-a),0.06)", width: "55%" }} />
      <div className="h-px mb-4" style={{ background: "rgba(var(--dash-border-a),0.08)" }} />
      <div className="flex justify-between items-center">
        <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.08)", width: "25%" }} />
        <div className="h-7 rounded-lg" style={{ background: "rgba(var(--dash-border-a),0.1)", width: "30%" }} />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[48, 16, 14, 14, 14, 12].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full" style={{ background: "rgba(var(--dash-border-a),0.1)", width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Wishlist card (grid) ──────────────────────────────────────── */

function WishlistCard({ entry, onRemove, removing, index }) {
  const { t } = useLocale();
  const { course } = entry;
  const level    = LEVEL_COLOR[course.level] ?? LEVEL_COLOR.BEGINNER;
  const ModeIcon = MODE_ICON[course.delivery_mode] ?? BookOpen;
  const isFree   = !Number(course.price) || Number(course.price) === 0;
  const addedDate = new Date(entry.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="dash-card p-5 flex flex-col dash-anim-up" style={{ animationDelay: `${index * 0.06}s` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
            style={{ background: level.bg, color: level.text, borderColor: level.border }}>
            {t(`dash_course_${course.level.toLowerCase()}`)}
          </span>
          {course.category_name && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(20,184,166,0.1)", color: "#14b8a6" }}>
              {course.category_name}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(entry)}
          disabled={removing}
          title={t("wish_remove")}
          className="shrink-0 p-1.5 rounded-lg transition-colors hover:opacity-80 disabled:opacity-40"
          style={{ color: "#ef4444" }}
        >
          {removing ? <Loader2 size={15} className="animate-spin" /> : <HeartOff size={15} />}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-2" style={{ color: "var(--dt-primary)" }}>
        {course.title}
      </h3>

      {/* Short description */}
      {course.short_description && (
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--dt-muted)" }}>
          {course.short_description}
        </p>
      )}

      {/* Mode + enrollment */}
      <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--dt-muted)" }}>
        <span className="flex items-center gap-1.5">
          <ModeIcon size={12} className="text-teal-500" />
          {t(MODE_LABEL_KEY[course.delivery_mode])}
        </span>
        {!course.enrollment_open && (
          <span className="flex items-center gap-1" style={{ color: "#f59e0b" }}>
            <BellIcon size={11} />
            {t("wish_enrollment_closed")}
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="border-t pt-3 mt-1 flex items-center justify-between gap-2" style={{ borderColor: "var(--dash-border)" }}>
        {/* Price */}
        <span className="text-sm font-bold" style={{ color: isFree ? "#34d399" : "var(--dt-primary)" }}>
          {isFree ? t("wish_free") : Number(course.price).toLocaleString()}
        </span>

        {/* Action */}
        <Link href={`/course/${course.id}`}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}>
          {t("wish_view_course")}
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Added date */}
      <p className="text-[10px] mt-2" style={{ color: "var(--dt-muted)" }}>
        {t("wish_added")} {addedDate}
      </p>
    </div>
  );
}

/* ── Wishlist row (list) ───────────────────────────────────────── */

function WishlistRow({ entry, onRemove, removing }) {
  const { t } = useLocale();
  const { course } = entry;
  const level    = LEVEL_COLOR[course.level] ?? LEVEL_COLOR.BEGINNER;
  const ModeIcon = MODE_ICON[course.delivery_mode] ?? BookOpen;
  const isFree   = !Number(course.price) || Number(course.price) === 0;
  const addedDate = new Date(entry.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <tr style={{ borderBottom: "1px solid var(--dash-border)" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--dash-border-a),0.04)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

      {/* Course */}
      <td className="px-4 py-3 min-w-[220px]">
        <p className="text-sm font-semibold line-clamp-1" style={{ color: "var(--dt-primary)" }}>{course.title}</p>
        {course.category_name && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--dt-muted)" }}>{course.category_name}</p>
        )}
      </td>

      {/* Level */}
      <td className="px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
          style={{ background: level.bg, color: level.text, borderColor: level.border }}>
          {t(`dash_course_${course.level.toLowerCase()}`)}
        </span>
      </td>

      {/* Mode */}
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>
          <ModeIcon size={12} className="text-teal-500" />
          {t(MODE_LABEL_KEY[course.delivery_mode])}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <span className="text-sm font-bold" style={{ color: isFree ? "#34d399" : "var(--dt-primary)" }}>
          {isFree ? t("wish_free") : Number(course.price).toLocaleString()}
        </span>
      </td>

      {/* Added */}
      <td className="px-4 py-3">
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--dt-muted)" }}>{addedDate}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href={`/course/${course.id}`}
            className="p-1.5 rounded-lg transition-colors hover:text-teal-400"
            style={{ color: "var(--dt-muted)" }}
            title={t("wish_view_course")}>
            <ChevronRight size={14} />
          </Link>
          <button type="button" onClick={() => onRemove(entry)} disabled={removing}
            className="p-1.5 rounded-lg transition-colors hover:text-red-400 disabled:opacity-40"
            style={{ color: "var(--dt-muted)" }}
            title={t("wish_remove")}>
            {removing ? <Loader2 size={13} className="animate-spin" /> : <HeartOff size={13} />}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */

export default function WishlistPage() {
  const { t } = useLocale();

  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [removing, setRemoving] = useState(null);
  const [search, setSearch]     = useState("");
  const [view, setView]         = useState("grid");
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    fetchMyWishlist()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemove = async (entry) => {
    setRemoving(entry.id);
    try {
      await toggleWishlist(entry.course_id);
      setItems((prev) => prev.filter((i) => i.id !== entry.id));
      showToast(t("wish_remove") + " ✓");
    } catch {
      showToast("Failed to remove course.");
    } finally {
      setRemoving(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((e) =>
      e.course.title.toLowerCase().includes(q) ||
      (e.course.category_name ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 dash-anim-up">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: "var(--dt-primary)" }}>
            <Heart size={22} className="text-red-400" />
            {t("wish_title")}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--dt-muted)" }}>{t("wish_desc")}</p>
        </div>

        {/* View toggle */}
        <div className="shrink-0 flex items-center gap-1 dash-glass p-1 rounded-xl">
          {[
            { id: "grid", Icon: LayoutGrid },
            { id: "list", Icon: LayoutList },
          ].map(({ id, Icon }) => (
            <button key={id} type="button" onClick={() => setView(id)}
              className="p-2 rounded-lg transition-all"
              style={view === id
                ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
                : { color: "var(--dt-muted)" }}>
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Search + count ── */}
      <div className="flex flex-wrap items-center gap-3 dash-anim-up" style={{ animationDelay: "0.05s" }}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--dt-muted)", insetInlineStart: "0.75rem" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("wish_search")}
            className="dash-glass w-full py-2 rounded-xl text-xs outline-none"
            style={{ color: "var(--dt-secondary)", background: "transparent", paddingInlineStart: "2.25rem", paddingInlineEnd: "1rem" }}
          />
        </div>

        {!loading && (
          <p className="text-xs" style={{ color: "var(--dt-muted)" }}>
            {filtered.length} {t("wish_saved_count")}
          </p>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        view === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="dash-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="dash-card py-16 flex flex-col items-center gap-4 text-center dash-anim-up">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Heart size={28} strokeWidth={1.2} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <p className="font-semibold text-base" style={{ color: "var(--dt-primary)" }}>
              {search ? `No results for "${search}"` : t("wish_empty")}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--dt-muted)" }}>
              {search ? "Try a different search term." : t("wish_empty_desc")}
            </p>
          </div>
          {!search && (
            <Link href="/#courses"
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}>
              <BookOpen size={14} />
              {t("wish_browse")}
            </Link>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 dash-anim-up">
          {filtered.map((entry, i) => (
            <WishlistCard
              key={entry.id}
              entry={entry}
              index={i}
              onRemove={handleRemove}
              removing={removing === entry.id}
            />
          ))}
        </div>
      ) : (
        <div className="dash-card overflow-hidden dash-anim-up">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dash-border)", background: "rgba(var(--dash-border-a),0.04)" }}>
                  {[t("dash_col_name"), t("dash_col_level"), t("dash_col_mode"), t("dash_col_price"), t("wish_added"), ""].map((col) => (
                    <th key={col} className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--dt-muted)" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <WishlistRow
                    key={entry.id}
                    entry={entry}
                    onRemove={handleRemove}
                    removing={removing === entry.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 inset-x-0 mx-auto w-fit z-50 px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg"
          style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
