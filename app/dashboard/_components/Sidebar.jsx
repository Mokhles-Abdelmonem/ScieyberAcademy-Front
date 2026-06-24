"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ListChecks,
  Award,
  Users,
  Star,
  Settings,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Presentation,
  Heart,
  MessageSquareQuote,
  Tag,
  CalendarDays,
  CreditCard,
  Phone,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import { logout } from "@/utils/auth";

const studentNav = [
  { href: "/dashboard",                 labelKey: "dash_overview",      icon: LayoutDashboard     },
  { href: "/dashboard/courses",         labelKey: "dash_my_courses",    icon: BookOpen             },
  { href: "/dashboard/enrollments",     labelKey: "dash_enrollments",   icon: ListChecks           },
  { href: "/dashboard/certificates",    labelKey: "dash_certificates",  icon: Award                },
  { href: "/dashboard/wishlist",        labelKey: "dash_wishlist",      icon: Heart                },
  { href: "/dashboard/testimonials",    labelKey: "dash_testimonials",  icon: MessageSquareQuote   },
];

const teacherNav = [
  { href: "/dashboard",              labelKey: "dash_overview",      icon: LayoutDashboard },
  { href: "/dashboard/courses",      labelKey: "dash_my_courses",    icon: BookOpen        },
  { href: "/dashboard/batches",      labelKey: "dash_batches",       icon: CalendarDays    },
  { href: "/dashboard/students",     labelKey: "dash_students",      icon: Users           },
  { href: "/dashboard/reviews",      labelKey: "dash_reviews",       icon: Star            },
  { href: "/dashboard/certificates", labelKey: "dash_certificates",  icon: Award           },
];

const adminNav = [
  { href: "/dashboard/courses",           labelKey: "dash_my_courses",        icon: BookOpen,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/dashboard/batches",           labelKey: "dash_batches",           icon: CalendarDays,       roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/dashboard/users",             labelKey: "dash_users",             icon: Users,              roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/dashboard/discounts",         labelKey: "dash_discounts",         icon: Tag,                roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/dashboard/monthly-payments",  labelKey: "dash_monthly_payments",  icon: CreditCard,         roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/dashboard/testimonials",      labelKey: "dash_testimonials",      icon: MessageSquareQuote, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/dashboard/contact-info",      labelKey: "dash_contact_info",      icon: Phone,              roles: ["SUPER_ADMIN"]          },
];

export default function Sidebar({ onClose, role = "student", user }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { t }    = useLocale();
  const { clearUser } = useUser();

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const filteredAdminNav = adminNav.filter(item => item.roles.includes(user?.role));
  const navItems = isAdmin
    ? filteredAdminNav
    : (role === "STAFF" || role === "teacher" || role === "INSTRUCTOR") ? teacherNav : studentNav;

  const handleLogout = async () => {
    onClose();
    await logout();
    clearUser();
    router.replace("/login");
  };

  return (
    /* dash-sidebar → glass visuals only (position/width is owned by the parent .dash-sidebar-layout wrapper) */
    <aside className="dash-sidebar w-64 min-h-full flex flex-col">
      {/* ── Header: logo ── */}
      <div className="flex items-center px-5 pt-6 pb-5 shrink-0">
        <Link href="/" className="flex items-center gap-1.5 group">
          <Image
            src="/assets/main-logo/logo-colored.svg"
            alt="Scieyber Academy"
            width={34}
            height={34}
            className="brightness-0 invert opacity-90 group-hover:opacity-100 transition"
          />
          <span dir="ltr" className="font-semibold text-[15px] tracking-tight">
            <span className="text-teal-400">Scieyber</span>
            <span style={{ color: "var(--dt-secondary)" }}>Academy</span>
          </span>
        </Link>
      </div>

      {/* ── Divider ── */}
      <div className="dash-divider border-t mx-4 mb-4" />

      {/* ── Role badge ── */}
      <div className="px-4 mb-3">
        {isAdmin ? (
          <span
            className="dash-badge flex items-center gap-1.5 w-fit"
            style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}
          >
            <ShieldCheck size={11} />
            {user?.role === "SUPER_ADMIN" ? t("dash_role_super_admin") : t("dash_role_admin")}
          </span>
        ) : (role === "INSTRUCTOR" || role === "STAFF" || role === "teacher") ? (
          <span className="dash-badge flex items-center gap-1.5 w-fit"
            style={{ background: "rgba(20,184,166,0.12)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.3)" }}>
            <Presentation size={11} />
            {t("dash_role_instructor")}
          </span>
        ) : (
          <span className="dash-badge flex items-center gap-1.5 w-fit">
            <GraduationCap size={11} />
            {t("dash_role_student")}
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                "dash-nav-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all",
                active ? "dash-nav-active" : "",
              ].join(" ")}
              style={active ? {} : { color: "var(--dt-tertiary)" }}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.7} />
              {t(labelKey)}
            </Link>
          );
        })}

        <div className="dash-divider border-t my-3" />

        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className={[
            "dash-nav-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium",
            pathname === "/dashboard/settings" ? "dash-nav-active" : "",
          ].join(" ")}
          style={pathname === "/dashboard/settings" ? {} : { color: "var(--dt-tertiary)" }}
        >
          <Settings size={17} strokeWidth={1.7} />
          {t("dash_settings")}
        </Link>
      </nav>

      {/* ── User profile footer ── */}
      <div className="shrink-0 p-3 mt-2">
        <div className="dash-glass rounded-xl p-3 flex items-center gap-3">
          {/* Avatar */}
          {user?.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.first_name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="dash-bg-gradient w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm">
              {user?.first_name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--dt-primary)" }}>
              {user ? `${user.first_name} ${user.last_name}` : "User"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--dt-muted)" }}>
              {user?.email ?? ""}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="shrink-0 p-1.5 rounded-lg transition-colors hover:text-red-400"
            style={{ color: "var(--dt-muted)" }}
            title={t("dash_logout")}
            aria-label={t("dash_logout")}
          >
            <LogOut size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}
