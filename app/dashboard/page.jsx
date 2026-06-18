"use client";

import { useState } from "react";
import {
  BookOpen, ListChecks, Award, Clock,
  Play, CheckCircle2, ChevronRight,
  Users, Star, BarChart2, ArrowUpRight,
  Flame, Calendar, Target,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";

/* ─── Mock data (labels use i18n keys) ─────────────────────── */

const ROLES = {
  student: {
    greetingKey: "dash_welcome_back",
    name: "Alex Johnson",
    subtitleKey: "dash_subtitle_student",
    stats: [
      { labelKey: "dash_stat_enrolled",   value: "8",   sub: "+2 this month", icon: BookOpen,     trend: "+25%", up: true },
      { labelKey: "dash_stat_completed",  value: "3",   sub: "37.5%",         icon: CheckCircle2, trend: "+1",   up: true },
      { labelKey: "dash_stat_certificates", value: "3", sub: "+1 pending",    icon: Award,        trend: "+1",   up: true },
      { labelKey: "dash_stat_hours",      value: "142", sub: "12h this week", icon: Clock,        trend: "+18%", up: true },
    ],
    courses: [
      { id: 1, title: "Machine Learning Fundamentals", instructor: "Dr. Sarah Chen", progress: 78, category: "AI & ML",      lessons: 42, lessonsCompleted: 33, lastAccessed: "2h ago",     color: "#14b8a6" },
      { id: 2, title: "Advanced React & Next.js",      instructor: "John Martinez",  progress: 45, category: "Web Dev",     lessons: 56, lessonsCompleted: 25, lastAccessed: "Yesterday",  color: "#06b6d4" },
      { id: 3, title: "Python for Data Science",       instructor: "Emily Park",     progress: 92, category: "Data Science", lessons: 38, lessonsCompleted: 35, lastAccessed: "3 days ago", color: "#8b5cf6" },
      { id: 4, title: "Cybersecurity Essentials",      instructor: "Mike Thompson",  progress: 30, category: "Security",    lessons: 44, lessonsCompleted: 13, lastAccessed: "1 week ago", color: "#f59e0b" },
    ],
    certificates: [
      { id: 1, title: "Introduction to Artificial Intelligence", issueDate: "Dec 2024", credentialId: "SA-2024-AI-001", grade: "Distinction" },
      { id: 2, title: "Web Development Bootcamp",                issueDate: "Oct 2024", credentialId: "SA-2024-WD-089", grade: "Merit" },
      { id: 3, title: "Python Fundamentals",                     issueDate: "Aug 2024", credentialId: "SA-2024-PY-034", grade: "Pass" },
    ],
    activity: [
      { text: "Completed Lesson 33 in ML Fundamentals", time: "2h ago",   type: "lesson" },
      { text: "Earned 'ML Basics' badge",               time: "Yesterday", type: "badge"  },
      { text: "Started Cybersecurity Essentials",        time: "1w ago",   type: "enroll" },
      { text: "Certificate issued: Web Dev Bootcamp",   time: "Oct 2024",  type: "cert"   },
    ],
    weeklyGoal: 68,
    streak: 7,
    ringValue: 62,
    ringStats: [
      { labelKey: "dash_courses_done",  val: "37.5%" },
      { labelKey: "dash_lessons_done",  val: "62%"   },
      { labelKey: "dash_quizzes_passed",val: "88%"   },
    ],
    upcomingItems: [
      { label: "ML Quiz 3",            date: "Jun 15" },
      { label: "React Project submit", date: "Jun 20" },
      { label: "Live workshop",        date: "Jun 25" },
    ],
    quickActions: [
      { labelKey: "dash_browse_courses",  icon: BookOpen   },
      { labelKey: "dash_my_certificates", icon: Award      },
      { labelKey: "dash_leaderboard",     icon: BarChart2  },
      { labelKey: "dash_schedule",        icon: Calendar   },
    ],
    upcomingTitleKey: "dash_upcoming",
    courseSectionKey: "dash_continue_learning",
    certSectionKey:   "dash_my_certs",
    progressTitleKey: "dash_overall_progress",
  },

  teacher: {
    greetingKey: "dash_hello",
    name: "Dr. Sarah Chen",
    subtitleKey: "dash_subtitle_teacher",
    stats: [
      { labelKey: "dash_stat_published",       value: "5",     sub: "1 draft",       icon: BookOpen, trend: "+1",   up: true },
      { labelKey: "dash_stat_total_students",  value: "1,240", sub: "+84 this month", icon: Users,   trend: "+7.3%",up: true },
      { labelKey: "dash_stat_rating",          value: "4.8",   sub: "312 reviews",   icon: Star,    trend: "+0.1", up: true },
      { labelKey: "dash_stat_issued",          value: "387",   sub: "+23 this month", icon: Award,  trend: "+6.3%",up: true },
    ],
    courses: [
      { id: 1, title: "Machine Learning Fundamentals", instructor: "You", progress: 100, category: "AI & ML",      lessons: 42, lessonsCompleted: 42, lastAccessed: "Live",  color: "#14b8a6", students: 480  },
      { id: 2, title: "Deep Learning with PyTorch",    instructor: "You", progress: 100, category: "AI & ML",      lessons: 38, lessonsCompleted: 38, lastAccessed: "Live",  color: "#8b5cf6", students: 312  },
      { id: 3, title: "Data Visualization Mastery",    instructor: "You", progress: 85,  category: "Data Science", lessons: 28, lessonsCompleted: 24, lastAccessed: "Draft", color: "#f59e0b", students: 0    },
    ],
    certificates: [
      { id: 1, title: "Machine Learning Fundamentals", issueDate: "Dec 2024", credentialId: "SA-2024-ML-*", grade: "Issued: 210" },
      { id: 2, title: "Deep Learning with PyTorch",    issueDate: "Nov 2024", credentialId: "SA-2024-DL-*", grade: "Issued: 177" },
    ],
    activity: [
      { text: "12 students enrolled in ML Fundamentals",   time: "Today",      type: "enroll" },
      { text: "New 5-star review on Deep Learning course", time: "Yesterday",  type: "badge"  },
      { text: "Lesson 38 published in PyTorch course",     time: "3d ago",     type: "lesson" },
      { text: "23 certificates issued this month",         time: "This month", type: "cert"   },
    ],
    weeklyGoal: 90,
    streak: 14,
    ringValue: 82,
    ringStats: [
      { labelKey: "dash_active_this_week", val: "73%"  },
      { labelKey: "dash_completion_rate",  val: "31%"  },
      { labelKey: "dash_avg_rating",       val: "4.8★" },
    ],
    upcomingItems: [
      { label: "Lecture upload due", date: "Jun 15" },
      { label: "Monthly review",     date: "Jun 20" },
      { label: "Certificate batch",  date: "Jun 25" },
    ],
    quickActions: [
      { labelKey: "dash_new_course",    icon: BookOpen  },
      { labelKey: "dash_view_students", icon: Users     },
      { labelKey: "dash_analytics",     icon: BarChart2 },
      { labelKey: "dash_reviews",       icon: Star      },
    ],
    upcomingTitleKey: "dash_upcoming_deadlines",
    courseSectionKey: "dash_your_courses",
    certSectionKey:   "dash_issued_certs",
    progressTitleKey: "dash_student_engagement",
  },
};

/* ─── Sub-components ────────────────────────────────────────── */

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  const { t } = useLocale();
  return (
    <div className="dash-stat-card p-5 dash-anim-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="dash-icon-wrap w-10 h-10">
          <Icon size={18} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.8} />
        </div>
        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: stat.up ? "#34d399" : "#f87171" }}>
          <ArrowUpRight size={13} />
          {stat.trend}
        </span>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: "var(--dt-primary)" }}>{stat.value}</p>
      <p className="text-sm font-medium mb-0.5" style={{ color: "var(--dt-secondary)" }}>{t(stat.labelKey)}</p>
      <p className="text-xs" style={{ color: "var(--dt-muted)" }}>{stat.sub}</p>
    </div>
  );
}

function CourseCard({ course, index, isTeacher }) {
  const { t } = useLocale();
  return (
    <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: `${0.35 + index * 0.09}s` }}>
      {/* Category + meta */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: `${course.color}22`, color: course.color, border: `1px solid ${course.color}33` }}
        >
          {course.category}
        </span>
        {isTeacher && course.students !== undefined ? (
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--dt-muted)" }}>
            <Users size={12} /> {course.students.toLocaleString()} {t("dash_students_count")}
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--dt-muted)" }}>{course.lastAccessed}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-2" style={{ color: "var(--dt-primary)" }}>
        {course.title}
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--dt-muted)" }}>
        {isTeacher
          ? `${course.lessonsCompleted}/${course.lessons} ${t("dash_lessons")}`
          : `by ${course.instructor}`}
      </p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: "var(--dt-tertiary)" }}>
            {isTeacher ? t("dash_content") : t("dash_progress")}
          </span>
          <span className="text-xs font-semibold" style={{ color: course.color }}>{course.progress}%</span>
        </div>
        <div className="dash-progress-track h-1.5">
          <div className="dash-progress-fill h-full" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg,${course.color}cc,${course.color})` }} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--dt-muted)" }}>
          {course.lessonsCompleted}/{course.lessons} {t("dash_lessons")}
        </span>
        <button className="dash-pill-btn flex items-center gap-1.5 text-xs font-medium px-3 py-1.5" style={{ color: "var(--dt-secondary)" }}>
          <Play size={11} fill="currentColor" />
          {isTeacher ? t("dash_manage") : t("dash_continue")}
        </button>
      </div>
    </div>
  );
}

function CertificateCard({ cert, index }) {
  return (
    <div className="dash-card p-4 flex items-center gap-4 dash-anim-up" style={{ animationDelay: `${0.6 + index * 0.07}s` }}>
      <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.25)" }}>
        <Award size={20} style={{ color: "var(--dash-gradient-from)" }} strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--dt-primary)" }}>{cert.title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--dt-muted)" }}>{cert.credentialId} · {cert.issueDate}</p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className="dash-badge">{cert.grade}</span>
        <button className="text-[10px] font-medium flex items-center gap-0.5" style={{ color: "var(--dt-muted)" }}>
          View <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ item, index }) {
  const colorMap = { lesson: "#14b8a6", badge: "#f59e0b", enroll: "#8b5cf6", cert: "#34d399" };
  const color = colorMap[item.type] ?? "#94a3b8";
  return (
    <div className="flex items-start gap-3 dash-anim-right" style={{ animationDelay: `${0.7 + index * 0.07}s` }}>
      <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}66` }} />
      <div className="flex-1 pb-3 border-b last:border-b-0 dash-divider">
        <p className="text-xs leading-snug" style={{ color: "var(--dt-secondary)" }}>{item.text}</p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--dt-muted)" }}>{item.time}</p>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user }       = useUser();
  const defaultRole    = (user?.user_type === "STAFF" || user?.user_type === "INSTRUCTOR") ? "teacher" : "student";
  const [role, setRole] = useState(defaultRole);
  const { t, isRTL }   = useLocale();
  const data            = ROLES[role];
  const isTeacher       = role === "teacher";
  const displayName     = user?.first_name ?? data.name.split(" ")[0];

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? t("dash_good_morning") : hour < 17 ? t("dash_good_afternoon") : t("dash_good_evening");

  return (
    <div className="max-w-[1280px] mx-auto space-y-7">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="dash-anim-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ animationDelay: "0s" }}>
        <div>
          <p className="text-sm mb-0.5" style={{ color: "var(--dt-muted)" }}>{greetingTime} 👋</p>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--dt-primary)" }}>
            {t(data.greetingKey)},{" "}
            <span className="dash-text-gradient">{displayName}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dt-tertiary)" }}>{t(data.subtitleKey)}</p>
        </div>

        {/* Role switcher (demo) */}
        <div className="dash-glass flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto">
          {["student", "teacher"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200"
              style={role === r
                ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff" }
                : { color: "var(--dt-muted)" }}
            >
              {r === "student" ? t("dash_role_student") : t("dash_role_instructor")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat, i) => <StatCard key={stat.labelKey} stat={stat} index={i} />)}
      </div>

      {/* ── Middle row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Courses — spans 2 xl columns */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between dash-anim-up" style={{ animationDelay: "0.28s" }}>
            <h2 className="font-semibold text-base" style={{ color: "var(--dt-primary)" }}>
              {t(data.courseSectionKey)}
            </h2>
            <button className="dash-badge flex items-center gap-1" style={{ cursor: "pointer" }}>
              {t("dash_view_all")} <ChevronRight size={11} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.courses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} isTeacher={isTeacher} />
            ))}
          </div>
        </div>

        {/* Right column widgets */}
        <div className="space-y-4">

          {/* Streak & weekly goal */}
          <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.32s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} style={{ color: "#f97316" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t("dash_your_progress")}</h3>
            </div>

            {/* Streak heatmap */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: "var(--dt-muted)" }}>{t("dash_day_streak")}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--dt-primary)" }}>
                  {data.streak}
                  <span className="text-sm font-normal ms-1" style={{ color: "var(--dt-muted)" }}>{t("dash_days")}</span>
                </p>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-md" style={{
                    background: i < (data.streak % 7 || 7)
                      ? "linear-gradient(135deg,#14b8a6,#0d9488)"
                      : "rgba(var(--dash-border-a),0.08)",
                  }} />
                ))}
              </div>
            </div>

            {/* Weekly goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Target size={13} style={{ color: "var(--dash-gradient-from)" }} />
                  <p className="text-xs font-medium" style={{ color: "var(--dt-secondary)" }}>{t("dash_weekly_goal")}</p>
                </div>
                <p className="text-xs font-semibold" style={{ color: "var(--dash-gradient-from)" }}>{data.weeklyGoal}%</p>
              </div>
              <div className="dash-progress-track h-2.5">
                <div className="dash-progress-fill h-full" style={{ width: `${data.weeklyGoal}%` }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "var(--dt-muted)", textAlign: isRTL ? "left" : "right" }}>
                {Math.round(data.weeklyGoal * 0.1)}{t("dash_h_target")}
              </p>
            </div>
          </div>

          {/* Ring progress */}
          <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.38s" }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={16} style={{ color: "var(--dash-gradient-from)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t(data.progressTitleKey)}</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(var(--dash-border-a),0.08)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#dashGrad)" strokeWidth="3"
                    strokeLinecap="round" strokeDasharray={`${data.ringValue} 100`} />
                  <defs>
                    <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: "var(--dt-primary)" }}>
                  {data.ringValue}%
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {data.ringStats.map((item) => (
                  <div key={item.labelKey} className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: "var(--dt-muted)" }}>{t(item.labelKey)}</span>
                    <span className="text-[10px] font-semibold" style={{ color: "var(--dt-secondary)" }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming events */}
          <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.44s" }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={15} style={{ color: "var(--dash-gradient-from)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--dt-primary)" }}>{t(data.upcomingTitleKey)}</h3>
            </div>
            {data.upcomingItems.map((ev, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0 dash-divider">
                <p className="text-xs" style={{ color: "var(--dt-secondary)" }}>{ev.label}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(20,184,166,0.12)", color: "var(--dash-gradient-from)" }}>
                  {ev.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Certificates & Activity ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-4">

        {/* Certificates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between dash-anim-up" style={{ animationDelay: "0.55s" }}>
            <h2 className="font-semibold text-base" style={{ color: "var(--dt-primary)" }}>{t(data.certSectionKey)}</h2>
            <button className="dash-badge flex items-center gap-1" style={{ cursor: "pointer" }}>
              {t("dash_view_all")} <ChevronRight size={11} style={{ transform: isRTL ? "scaleX(-1)" : "" }} />
            </button>
          </div>
          {data.certificates.map((cert, i) => <CertificateCard key={cert.id} cert={cert} index={i} />)}
        </div>

        {/* Activity + quick actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between dash-anim-up" style={{ animationDelay: "0.58s" }}>
            <h2 className="font-semibold text-base" style={{ color: "var(--dt-primary)" }}>{t("dash_recent_activity")}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full dash-bg-gradient animate-pulse" />
              <span className="text-xs" style={{ color: "var(--dt-muted)" }}>{t("dash_live")}</span>
            </div>
          </div>

          <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.62s" }}>
            <div className="space-y-0">
              {data.activity.map((item, i) => <ActivityItem key={i} item={item} index={i} />)}
            </div>
          </div>

          {/* Quick actions */}
          <div className="dash-card p-5 dash-anim-up" style={{ animationDelay: "0.68s" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--dt-primary)" }}>{t("dash_quick_actions")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {data.quickActions.map(({ labelKey, icon: Icon }) => (
                <button key={labelKey} className="dash-pill-btn flex items-center gap-2 px-3 py-2.5 text-xs font-medium"
                  style={{ color: "var(--dt-secondary)" }}>
                  <Icon size={14} strokeWidth={1.7} style={{ color: "var(--dash-gradient-from)" }} />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
