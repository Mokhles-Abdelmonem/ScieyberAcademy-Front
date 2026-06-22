"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, X, Search, ChevronDown,
  User as UserIcon, BookOpen, ListChecks, Award, Heart,
  CreditCard, LogOut, HelpCircle, LayoutDashboard,
  Users, ShieldCheck,
} from "lucide-react";
import Sidebar from "./_components/Sidebar";
import { useThemeContext } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { logout } from "@/utils/auth";

/* ── User menu definition ─────────────────────────────────────────── */

const MENU_LEARNING = [
  { icon: LayoutDashboard, labelKey: "dash_overview",      href: "/dashboard"             },
  { icon: BookOpen,        labelKey: "dash_my_courses",    href: "/dashboard/courses"     },
  { icon: ListChecks,      labelKey: "dash_enrollments",   href: "/dashboard/enrollments" },
  { icon: Award,           labelKey: "dash_certificates",  href: "/dashboard/certificates"},
  { icon: Heart,           labelKey: "dash_menu_wishlist", href: "/dashboard/wishlist"    },
];

const MENU_ACCOUNT = [
  { icon: UserIcon,   labelKey: "dash_menu_profile", href: "/dashboard/settings"              },
  { icon: CreditCard, labelKey: "dash_menu_billing", href: "/dashboard/billing", soon: true   },
];

const MENU_SUPPORT = [
  { icon: HelpCircle, labelKey: "dash_menu_help", href: "/contact" },
];

/* ── Notification mock data ───────────────────────────────────────── */
// TODO: Notifications feature — to be implemented in a future release.
// const NOTIFICATIONS = [
//   { text: "New certificate available for Python Basics", time: "2h ago"     },
//   { text: "Your ML course progress: 78%",               time: "Yesterday"   },
//   { text: "Instructor posted a new lecture",            time: "3d ago"      },
// ];

/* ── Helpers ──────────────────────────────────────────────────────── */

function DropdownDivider() {
  return <hr className="dash-dropdown-divider border-0 border-t" />;
}

function MenuSection({ items, onClose, t }) {
  return (
    <div className="space-y-0.5 px-1.5">
      {items.map(({ icon: Icon, labelKey, href, soon }) =>
        soon ? (
          <div key={labelKey} className="dash-dropdown-item opacity-45 cursor-not-allowed select-none">
            <Icon size={15} className="dash-dropdown-item-icon" />
            <span className="flex-1">{t(labelKey)}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(20,184,166,0.2)", color: "#14b8a6" }}>
              {t("dash_coming_soon")}
            </span>
          </div>
        ) : (
          <Link key={labelKey} href={href} onClick={onClose} className="dash-dropdown-item">
            <Icon size={15} className="dash-dropdown-item-icon" />
            <span>{t(labelKey)}</span>
          </Link>
        )
      )}
    </div>
  );
}

/* ── Reusable topbar sub-components ──────────────────────────────── */

function HamburgerBtn({ sidebarOpen, onClick }) {
  return (
    <button
      className="dash-glass relative w-9 h-9 flex items-center justify-center rounded-lg shrink-0 active:scale-90 transition-transform duration-200"
      style={{ color: "var(--dt-secondary)" }}
      onClick={onClick}
      aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
    >
      <Menu size={18} className="absolute transition-all duration-200"
        style={{ opacity: sidebarOpen ? 0 : 1, transform: sidebarOpen ? "rotate(90deg) scale(0.7)" : "rotate(0deg) scale(1)" }} />
      <X size={18} className="absolute transition-all duration-200"
        style={{ opacity: sidebarOpen ? 1 : 0, transform: sidebarOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.7)" }} />
    </button>
  );
}

function SearchBar({ placeholder, isRTL }) {
  return (
    <div className="relative hidden sm:flex w-52 lg:w-72">
      <Search size={14} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--dt-muted)", [isRTL ? "right" : "left"]: "0.75rem" }} />
      <input
        type="text"
        placeholder={placeholder}
        className="dash-glass w-full py-2 rounded-xl text-xs outline-none"
        style={{
          color: "var(--dt-secondary)",
          background: "transparent",
          [isRTL ? "paddingRight" : "paddingLeft"]: "2.25rem",
          [isRTL ? "paddingLeft"  : "paddingRight"]: "1rem",
          direction: isRTL ? "rtl" : "ltr",
        }}
      />
    </div>
  );
}

/* ── Layout ───────────────────────────────────────────────────────── */

export default function DashboardLayout({ children }) {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { theme }    = useThemeContext();
  const { t, isRTL } = useLocale();
  const { user }     = useUser();
  const router       = useRouter();

  const userMenuRef = useRef(null);
  const isLight     = theme === "light";
  const isAdmin     = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  /* Click-outside — close user menu dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Scroll lock */
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  /* Escape key */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push("/");
  };

  const closeUserMenu = () => setUserMenuOpen(false);

  const orbDark  = "rgba(20,184,166,0.20)";
  const orbLight = "rgba(20,184,166,0.30)";
  const orb      = isLight ? orbLight : orbDark;

  /* Dropdown side: opens inward from the action cluster edge */
  const dropdownSide = isRTL ? { left: 0 } : { right: 0 };

  /* ── Action cluster (notifications + user menu) ── */
  const ActionCluster = (
    <div className={`flex items-center gap-2 shrink-0${isRTL ? " flex-row-reverse" : ""}`}>

      {/* Language & theme */}
      <div className="hidden sm:flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* TODO: Notifications — to be implemented in a future release. */}
      {/* <div className="relative" ref={notifRef}>
        <button
          className="dash-glass relative flex items-center justify-center w-9 h-9 rounded-full"
          style={{ color: "var(--dt-secondary)" }}
          onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
          aria-label={t("dash_notifications")}
        >
          <Bell size={16} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full dash-bg-gradient" aria-hidden />
        </button>

        {notifOpen && (
          <div className="dash-dropdown absolute mt-2 w-72 p-2 z-50"
            style={{ ...dropdownSide, top: "100%" }}>
            <p className="text-xs font-semibold px-2 py-1.5" style={{ color: "var(--dt-secondary)" }}>
              {t("dash_notifications")}
            </p>
            <div className="space-y-0.5">
              {NOTIFICATIONS.map((n, i) => (
                <div key={i}
                  className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors"
                  style={{ color: "var(--dt-secondary)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--dash-border-a),0.07)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 dash-bg-gradient" />
                  <div>
                    <p className="text-xs leading-snug" style={{ color: "var(--dt-secondary)" }}>{n.text}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--dt-muted)" }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div> */}

      {/* User menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          className="dash-glass flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-all duration-150"
          style={{ color: "var(--dt-secondary)" }}
          onClick={() => setUserMenuOpen((v) => !v)}
          aria-label="User menu"
        >
          {user?.profile_picture_url ? (
            <img src={user.profile_picture_url} alt={user.first_name}
              className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="dash-bg-gradient w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user ? user.first_name[0].toUpperCase() : "?"}
            </div>
          )}
          <span className="hidden sm:block text-xs font-medium max-w-[7rem] truncate"
            style={{ color: "var(--dt-secondary)" }}>
            {user?.first_name ?? ""}
          </span>
          <ChevronDown size={12} style={{
            color: "var(--dt-muted)",
            transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }} />
        </button>

        {userMenuOpen && (
          <div className="dash-dropdown absolute mt-2 w-72 z-50 overflow-hidden"
            style={{ ...dropdownSide, top: "100%" }}>

            {/* Profile header */}
            <div className="px-4 py-3.5 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(var(--dash-border-a),0.09)" }}>
              {user?.profile_picture_url ? (
                <img src={user.profile_picture_url} alt={user.first_name}
                  className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="dash-bg-gradient w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user?.first_name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--dt-primary)" }}>
                  {user ? `${user.first_name} ${user.last_name}` : ""}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--dt-muted)" }}>{user?.email ?? ""}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {isAdmin ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
                      <ShieldCheck size={9} />
                      {user?.role === "SUPER_ADMIN" ? t("dash_role_super_admin") : t("dash_role_admin")}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(20,184,166,0.12)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.2)" }}>
                      {t(`dash_role_${(user?.role ?? "client").toLowerCase()}`)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu sections */}
            <div className="p-1.5">
              <MenuSection items={MENU_LEARNING} onClose={closeUserMenu} t={t} />

              {isAdmin && (
                <>
                  <DropdownDivider />
                  <div className="space-y-0.5 px-1.5">
                    <Link href="/dashboard/users" onClick={closeUserMenu} className="dash-dropdown-item">
                      <Users size={15} className="dash-dropdown-item-icon" />
                      <span>{t("dash_users")}</span>
                      <span className="ms-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
                        Admin
                      </span>
                    </Link>
                  </div>
                </>
              )}

              <DropdownDivider />
              <MenuSection items={MENU_ACCOUNT} onClose={closeUserMenu} t={t} />

              <DropdownDivider />
              <MenuSection items={MENU_SUPPORT} onClose={closeUserMenu} t={t} />

              <DropdownDivider />

              <div className="px-1.5 pb-0.5">
                <button onClick={handleLogout}
                  className="dash-dropdown-item w-full text-start"
                  style={{ color: "#f87171" }}>
                  <LogOut size={15} style={{ color: "#f87171", flexShrink: 0 }} />
                  <span>{t("dash_logout")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={["dash-root relative min-h-screen", isLight ? "dash-light" : ""].join(" ")}
      style={{ background: "var(--dash-bg)" }}
    >
      {/* ── Ambient orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute rounded-full blur-[130px]"
          style={{ width: 700, height: 700, top: "-20%", left: isRTL ? "auto" : "-12%", right: isRTL ? "-12%" : "auto", background: orb }} />
        <div className="absolute rounded-full blur-[110px]"
          style={{ width: 550, height: 550, bottom: "-15%", right: isRTL ? "auto" : "-8%", left: isRTL ? "-8%" : "auto", background: isLight ? "rgba(20,184,166,0.22)" : "rgba(20,184,166,0.16)" }} />
        <div className="absolute rounded-full blur-[90px]"
          style={{ width: 320, height: 320, top: "38%", right: "22%", background: isLight ? "rgba(20,184,166,0.16)" : "rgba(20,184,166,0.12)" }} />
        <div className="absolute rounded-full blur-[70px]"
          style={{ width: 220, height: 480, top: "10%", left: "30%", background: isLight ? "rgba(20,184,166,0.12)" : "rgba(20,184,166,0.09)", transform: "rotate(30deg)" }} />
      </div>

      {/* ── Main row: [sidebar] [content column] ── */}
      <div className="relative flex min-h-screen">

        {/* Sidebar */}
        <div className={`dash-sidebar-layout ${sidebarOpen ? "is-open" : ""}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} role={user?.user_type ?? ""} user={user} />
        </div>

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">

          {/* ── Topbar ──
              dir="ltr" is forced so physical position always matches markup order.
              isRTL swaps layout: actions LEFT + hamburger RIGHT in RTL,
                                  hamburger LEFT + actions RIGHT in LTR.
          */}
          <header
            className="dash-header fixed top-0 inset-x-0 z-30 flex items-center gap-3 px-4 lg:px-6 h-14"
            dir="ltr"
          >
            {isRTL ? (
              <>
                {ActionCluster}
                <div className="flex-1" />
                <SearchBar placeholder={t("dash_search")} isRTL={true} />
                <HamburgerBtn sidebarOpen={sidebarOpen} onClick={() => setSidebarOpen((v) => !v)} />
              </>
            ) : (
              <>
                <HamburgerBtn sidebarOpen={sidebarOpen} onClick={() => setSidebarOpen((v) => !v)} />
                <SearchBar placeholder={t("dash_search")} isRTL={false} />
                <div className="flex-1" />
                {ActionCluster}
              </>
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto pt-28 px-4 pb-4 lg:px-7 lg:pb-7">
            {children}
          </main>
        </div>
      </div>

      {/* Glass overlay — sidebar */}
      <div
        className={[
          "dash-overlay fixed inset-0 z-40",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />
    </div>
  );
}
