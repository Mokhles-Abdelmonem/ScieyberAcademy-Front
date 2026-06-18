"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, Plus, Trash2, Search, UserCheck, X,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { fetchCourse, updateCourse, fetchCourseCategories, fetchInstructors } from "@/utils/academyApi";

const LEVELS   = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const MODES    = ["ONLINE_LIVE", "IN_OFFICE", "HYBRID"];
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const EMPTY_SKILL = "";
const EMPTY_MODULE = { title: "", weeks: "" };

/* ── Shared form primitives (same as new/page.jsx) ─────────────── */

function Field({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: "var(--dt-secondary)" }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px]" style={{ color: "var(--dt-muted)" }}>{hint}</p>}
      {error && (
        <p className="text-[10px] flex items-center gap-1" style={{ color: "#f87171" }}>
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", min, step }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
      className="dash-glass w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
      style={{ color: "var(--dt-primary)", background: "transparent" }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="dash-glass w-full px-3 py-2 rounded-xl text-sm outline-none transition-all resize-y"
      style={{ color: "var(--dt-primary)", background: "transparent" }}
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="dash-glass w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
      style={{ color: "var(--dt-primary)", background: "var(--dash-glass-bg)" }}
    >
      {children}
    </select>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="dash-card p-6 space-y-5">
      <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: "var(--dt-secondary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 p-1.5 rounded-lg transition hover:opacity-70"
      style={{ color: "#f87171" }}
    >
      <Trash2 size={14} />
    </button>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function EditCoursePage() {
  const { t }    = useLocale();
  const { user } = useUser();
  const router   = useRouter();
  const params   = useParams();
  const courseId = params.id;

  const [form, setForm]             = useState(null);
  const [skills, setSkills]         = useState([EMPTY_SKILL]);
  const [curriculum, setCurriculum] = useState([{ ...EMPTY_MODULE }]);
  const [categories, setCategories] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);

  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [instructorSearch, setInstructorSearch]       = useState("");
  const [instructorPool, setInstructorPool]           = useState([]);

  /* Redirect non-admins */
  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard/courses");
    }
  }, [user, router]);

  /* Load existing course + categories */
  useEffect(() => {
    Promise.all([
      fetchCourse(courseId),
      fetchCourseCategories(),
      fetchInstructors(),
    ]).then(([course, cats, pool]) => {
      if (!course) {
        router.replace("/dashboard/courses");
        return;
      }
      setCategories(cats);
      setInstructorPool(pool);
      if (course.instructors?.length) {
        setSelectedInstructors(course.instructors);
      }
      setForm({
        title:                  course.title ?? "",
        short_description:      course.short_description ?? "",
        description:            course.description ?? "",
        requirements:           course.requirements ?? "",
        objectives:             course.objectives ?? "",
        category_id:            course.category_id ?? "",
        level:                  course.level ?? "BEGINNER",
        delivery_mode:          course.delivery_mode ?? "ONLINE_LIVE",
        status:                 course.status ?? "DRAFT",
        enrollment_open:        course.enrollment_open ?? false,
        duration_weeks:         course.duration_weeks != null ? String(course.duration_weeks) : "",
        sessions_per_week:      course.sessions_per_week != null ? String(course.sessions_per_week) : "",
        session_duration_hours: course.session_duration_hours != null ? String(course.session_duration_hours) : "",
        price:                  course.price != null ? String(course.price) : "0",
        max_students:           course.max_students != null ? String(course.max_students) : "",
      });
      setSkills(course.what_you_learn?.length ? course.what_you_learn : [EMPTY_SKILL]);
      setCurriculum(
        course.curriculum?.length
          ? course.curriculum.map((m) => ({ title: m.title, weeks: String(m.weeks) }))
          : [{ ...EMPTY_MODULE }]
      );
      setLoadingCourse(false);
    });
  }, [courseId, router]);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError(t("dash_course_title_required"));
      return;
    }

    setSubmitting(true);
    try {
      const filteredSkills = skills.map((s) => s.trim()).filter(Boolean);
      const filteredCurriculum = curriculum
        .filter((m) => m.title.trim() && m.weeks)
        .map((m) => ({ title: m.title.trim(), weeks: Number(m.weeks) }));

      const payload = {
        title:                  form.title.trim(),
        short_description:      form.short_description.trim() || null,
        description:            form.description.trim() || null,
        requirements:           form.requirements.trim() || null,
        objectives:             form.objectives.trim() || null,
        category_id:            form.category_id || null,
        level:                  form.level,
        delivery_mode:          form.delivery_mode,
        status:                 form.status,
        duration_weeks:         form.duration_weeks ? Number(form.duration_weeks) : null,
        sessions_per_week:      form.sessions_per_week ? Number(form.sessions_per_week) : null,
        session_duration_hours: form.session_duration_hours ? Number(form.session_duration_hours) : null,
        price:                  form.price || "0",
        max_students:           form.max_students ? Number(form.max_students) : null,
        what_you_learn:         filteredSkills.length ? filteredSkills : null,
        curriculum:             filteredCurriculum.length ? filteredCurriculum : null,
        enrollment_open:        form.enrollment_open,
        instructor_ids:         selectedInstructors.map((i) => i.id),
      };
      await updateCourse(courseId, payload);
      setSuccess(true);
      setTimeout(() => router.push(`/course/${courseId}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* Loading skeleton */
  if (loadingCourse) {
    return (
      <div className="max-w-[860px] mx-auto space-y-5 animate-pulse">
        <div className="h-8 rounded-full w-48" style={{ background: "rgba(var(--dash-border-a),0.1)" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="dash-card p-6 space-y-4">
            <div className="h-4 rounded-full w-32" style={{ background: "rgba(var(--dash-border-a),0.1)" }} />
            <div className="h-10 rounded-xl" style={{ background: "rgba(var(--dash-border-a),0.08)" }} />
            <div className="h-10 rounded-xl" style={{ background: "rgba(var(--dash-border-a),0.06)" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 dash-anim-up" style={{ animationDelay: "0s" }}>
        <Link
          href={`/course/${courseId}`}
          className="dash-pill-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5"
          style={{ color: "var(--dt-muted)" }}
        >
          <ArrowLeft size={13} /> {t("dash_back_to_course")}
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>
            {t("dash_edit_course")}
          </h1>
          <p className="text-sm mt-0.5 line-clamp-1" style={{ color: "var(--dt-muted)" }}>
            {form.title}
          </p>
        </div>
      </div>

      {/* ── Success banner ── */}
      {success && (
        <div className="dash-card p-4 flex items-center gap-3" style={{ borderColor: "rgba(52,211,153,0.4)" }}>
          <CheckCircle2 size={18} style={{ color: "#34d399" }} />
          <p className="text-sm font-medium" style={{ color: "#34d399" }}>
            {t("dash_course_updated_success")}
          </p>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="dash-card p-4 flex items-center gap-3" style={{ borderColor: "rgba(248,113,113,0.4)" }}>
          <AlertCircle size={18} style={{ color: "#f87171" }} />
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic info ── */}
        <SectionCard title={t("dash_section_basic_info")}>
          <Field label={t("dash_course_title_label")} hint={t("dash_course_title_hint")}>
            <Input value={form.title} onChange={set("title")} placeholder={t("dash_course_title_placeholder")} />
          </Field>

          <Field label={t("dash_course_short_desc_label")} hint={t("dash_course_short_desc_hint")}>
            <Input value={form.short_description} onChange={set("short_description")} placeholder={t("dash_course_short_desc_placeholder")} />
          </Field>

          <Field label={t("dash_course_description_label")}>
            <Textarea value={form.description} onChange={set("description")} placeholder={t("dash_course_description_placeholder")} rows={5} />
          </Field>
        </SectionCard>

        {/* ── Content details ── */}
        <SectionCard title={t("dash_section_content")}>
          <Field label={t("dash_course_requirements_label")} hint={t("dash_course_requirements_hint")}>
            <Textarea value={form.requirements} onChange={set("requirements")} placeholder={t("dash_course_requirements_placeholder")} />
          </Field>

          <Field label={t("dash_course_objectives_label")} hint={t("dash_course_objectives_hint")}>
            <Textarea value={form.objectives} onChange={set("objectives")} placeholder={t("dash_course_objectives_placeholder")} />
          </Field>
        </SectionCard>

        {/* ── What You'll Learn ── */}
        <SectionCard title={t("dash_section_skills")}>
          <div className="space-y-2">
            {skills.map((skill, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={skill}
                  onChange={(e) => setSkills((prev) => prev.map((s, idx) => idx === i ? e.target.value : s))}
                  placeholder={t("dash_skill_placeholder")}
                />
                {skills.length > 1 && (
                  <RemoveBtn onClick={() => setSkills((prev) => prev.filter((_, idx) => idx !== i))} />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSkills((prev) => [...prev, EMPTY_SKILL])}
            className="flex items-center gap-1.5 text-xs font-semibold mt-1 transition hover:opacity-70"
            style={{ color: "#14b8a6" }}
          >
            <Plus size={13} /> {t("dash_add_skill")}
          </button>
        </SectionCard>

        {/* ── Course Curriculum ── */}
        <SectionCard title={t("dash_section_curriculum")}>
          <div className="space-y-2">
            {curriculum.map((mod, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={mod.title}
                    onChange={(e) => setCurriculum((prev) => prev.map((m, idx) => idx === i ? { ...m, title: e.target.value } : m))}
                    placeholder={t("dash_curriculum_module_placeholder")}
                  />
                </div>
                <div className="w-20 shrink-0">
                  <Input
                    type="number"
                    min="1"
                    value={mod.weeks}
                    onChange={(e) => setCurriculum((prev) => prev.map((m, idx) => idx === i ? { ...m, weeks: e.target.value } : m))}
                    placeholder={t("dash_curriculum_weeks_label")}
                  />
                </div>
                {curriculum.length > 1 && (
                  <RemoveBtn onClick={() => setCurriculum((prev) => prev.filter((_, idx) => idx !== i))} />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCurriculum((prev) => [...prev, { ...EMPTY_MODULE }])}
            className="flex items-center gap-1.5 text-xs font-semibold mt-1 transition hover:opacity-70"
            style={{ color: "#14b8a6" }}
          >
            <Plus size={13} /> {t("dash_add_module")}
          </button>
        </SectionCard>

        {/* ── Classification ── */}
        <SectionCard title={t("dash_section_classification")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t("dash_course_category_label")}>
              <Select value={form.category_id} onChange={set("category_id")}>
                <option value="">{t("dash_course_category_none")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>

            <Field label={t("dash_course_level_label")}>
              <Select value={form.level} onChange={set("level")}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{t(`dash_course_${l.toLowerCase()}`)}</option>
                ))}
              </Select>
            </Field>

            <Field label={t("dash_course_mode_label")}>
              <Select value={form.delivery_mode} onChange={set("delivery_mode")}>
                {MODES.map((m) => (
                  <option key={m} value={m}>{t(`dash_course_mode_${m.toLowerCase()}`)}</option>
                ))}
              </Select>
            </Field>

            <Field label={t("dash_course_status_label")}>
              <Select value={form.status} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{t(`dash_course_status_${s.toLowerCase()}`)}</option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Enrollment open toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.enrollment_open}
                onChange={(e) => setForm((prev) => ({ ...prev, enrollment_open: e.target.checked }))}
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${form.enrollment_open ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-600"}`} />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.enrollment_open ? "translate-x-5" : ""}`} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--dt-primary)" }}>
                {t("dash_enrollment_open_label")}
              </p>
              <p className="text-[10px]" style={{ color: "var(--dt-muted)" }}>
                {form.enrollment_open ? t("dash_enrollment_open_on") : t("dash_enrollment_open_off")}
              </p>
            </div>
          </label>
        </SectionCard>

        {/* ── Schedule ── */}
        <SectionCard title={t("dash_section_schedule")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label={t("dash_course_duration_label")} hint={t("dash_course_duration_hint")}>
              <Input type="number" min="1" value={form.duration_weeks} onChange={set("duration_weeks")} placeholder="e.g. 8" />
            </Field>

            <Field label={t("dash_course_sessions_per_week_label")}>
              <Input type="number" min="1" value={form.sessions_per_week} onChange={set("sessions_per_week")} placeholder="e.g. 3" />
            </Field>

            <Field label={t("dash_course_session_hours_label")}>
              <Input type="number" min="1" value={form.session_duration_hours} onChange={set("session_duration_hours")} placeholder="e.g. 2" />
            </Field>
          </div>
        </SectionCard>

        {/* ── Pricing ── */}
        <SectionCard title={t("dash_section_pricing")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t("dash_course_price_label")} hint={t("dash_course_price_hint")}>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00" />
            </Field>

            <Field label={t("dash_course_max_students_label")} hint={t("dash_course_max_students_hint")}>
              <Input type="number" min="1" value={form.max_students} onChange={set("max_students")} placeholder="e.g. 30" />
            </Field>
          </div>
        </SectionCard>

        {/* ── Instructors ── */}
        <SectionCard title={t("dash_section_instructors")}>
          <p className="text-xs" style={{ color: "var(--dt-muted)" }}>{t("dash_instructors_hint")}</p>

          {selectedInstructors.length > 0 && (
            <div className="space-y-2">
              {selectedInstructors.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                      {inst.profile_picture_url
                        ? <img src={inst.profile_picture_url} alt="" className="size-full object-cover" />
                        : (inst.first_name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--dt-primary)" }}>
                        {inst.first_name} {inst.last_name}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--dt-muted)" }}>{inst.title || `@${inst.username}`}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedInstructors((prev) => prev.filter((i) => i.id !== inst.id))}
                    className="p-1 rounded-lg transition hover:opacity-70" style={{ color: "#f87171" }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedInstructors.length < 3 && (
            <div className="relative">
              <Search size={12} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--dt-muted)", insetInlineStart: "0.75rem" }} />
              <input
                value={instructorSearch}
                onChange={(e) => setInstructorSearch(e.target.value)}
                placeholder={t("dash_instructors_search")}
                className="dash-glass w-full py-2 rounded-xl text-xs outline-none"
                style={{ color: "var(--dt-secondary)", background: "transparent", paddingInlineStart: "2.25rem", paddingInlineEnd: "1rem" }}
              />
              {instructorSearch && (
                <div className="mt-1 rounded-xl overflow-hidden border" style={{ borderColor: "var(--dash-border)" }}>
                  {instructorPool
                    .filter((u) =>
                      !selectedInstructors.find((s) => s.id === u.id) &&
                      (`${u.first_name} ${u.last_name} ${u.username}`.toLowerCase().includes(instructorSearch.toLowerCase()))
                    )
                    .slice(0, 5)
                    .map((u) => (
                      <button key={u.id} type="button"
                        onClick={() => { setSelectedInstructors((prev) => [...prev, u]); setInstructorSearch(""); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-start transition-colors hover:opacity-80"
                        style={{ background: "var(--dash-glass-bg)", borderBottom: "1px solid var(--dash-border)" }}>
                        <UserCheck size={13} className="text-teal-500 shrink-0" />
                        <span className="text-xs font-medium" style={{ color: "var(--dt-primary)" }}>
                          {u.first_name} {u.last_name}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--dt-muted)" }}>{u.title || `@${u.username}`}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {selectedInstructors.length >= 3 && (
            <p className="text-xs" style={{ color: "#f59e0b" }}>{t("dash_instructors_max")}</p>
          )}
        </SectionCard>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 dash-anim-up" style={{ animationDelay: "0.1s" }}>
          <Link
            href={`/course/${courseId}`}
            className="dash-pill-btn flex items-center gap-1.5 text-sm font-medium px-5 py-2.5"
            style={{ color: "var(--dt-muted)" }}
          >
            {t("dash_cancel")}
          </Link>
          <button
            type="submit"
            disabled={submitting || success}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {submitting ? t("dash_updating") : t("dash_update_course")}
          </button>
        </div>

      </form>
    </div>
  );
}
