"use client";
import LanguageToggle from "@/components/LanguageToggle";
import { useLocale } from "@/context/LocaleContext";
import { navLinks } from "@/data/navLinks";
import { logout, isAuthenticated } from "@/utils/auth";
import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const { t } = useLocale();
    const router = useRouter();

    useEffect(() => {
        setLoggedIn(isAuthenticated());
    }, []);

    useEffect(() => {
        if (openMobileMenu) {
            document.body.classList.add("max-md:overflow-hidden");
        } else {
            document.body.classList.remove("max-md:overflow-hidden");
        }
    }, [openMobileMenu]);

    const handleLogout = async () => {
        setOpenMobileMenu(false);
        await logout();
        setLoggedIn(false);
        router.push("/");
    };

    const AuthButton = ({ mobile = false }) => {
        const base = mobile
            ? "px-6 py-2 rounded-md font-medium"
            : "hidden md:block px-4 py-2 rounded-md text-sm transition";

        if (loggedIn) {
            return (
                <div className={mobile ? "flex flex-col items-center gap-3" : "hidden md:flex items-center gap-2"}>
                    <Link
                        href="/dashboard"
                        onClick={() => setOpenMobileMenu(false)}
                        className={`${mobile ? "px-6 py-2 rounded-md font-medium" : "px-4 py-2 rounded-md text-sm transition"} border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40`}
                    >
                        {t("nav_dashboard")}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={`${mobile ? "px-6 py-2 rounded-md font-medium" : "px-4 py-2 rounded-md text-sm transition"} border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30`}
                    >
                        {t("nav_logout")}
                    </button>
                </div>
            );
        }
        return (
            <Link
                href="/login"
                onClick={() => setOpenMobileMenu(false)}
                className={`${base} border border-teal-500 hover:bg-slate-100 dark:hover:bg-teal-950`}
            >
                {t("nav_login")}
            </Link>
        );
    };

    return (
        <nav className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 transition-all duration-300 ${openMobileMenu ? "" : "bg-white/55 dark:bg-white/[0.055] backdrop-blur-3xl border-b border-white/70 dark:border-white/[0.13]"}`}>
            <Link href="/" className="shrink-0 flex items-center gap-0 font-semibold text-lg tracking-tight">
                <Image src="/assets/main-logo/logo-colored.svg" alt="Scieyber Academy logo" width={54} height={54} priority className="-me-2" />
                <span dir="ltr">
                    <span className="text-teal-500">Scieyber</span>
                    <span className="dark:text-white text-slate-800">Academy</span>
                </span>
            </Link>

            <div className="hidden items-center md:gap-8 lg:gap-9 md:flex lg:ps-20">
                {navLinks.map((link) => (
                    <a key={link.key} href={link.href} className="hover:text-teal-500 transition">
                        {t(link.key)}
                    </a>
                ))}
            </div>

            {/* Mobile menu overlay */}
            <div className={`fixed inset-0 flex flex-col items-center justify-center gap-6 text-lg font-medium bg-white/60 dark:bg-black/40 backdrop-blur-md md:hidden transition duration-300 ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
                {navLinks.map((link) => (
                    <a key={link.key} href={link.href} onClick={() => setOpenMobileMenu(false)}>
                        {t(link.key)}
                    </a>
                ))}
                <AuthButton mobile />
                <a href="/#courses" onClick={() => setOpenMobileMenu(false)} className="px-6 py-2 bg-teal-500 text-white rounded-md font-medium">
                    {t("nav_enroll")}
                </a>
                <button
                    className="aspect-square size-10 p-1 items-center justify-center bg-teal-500 hover:bg-teal-600 transition text-white rounded-md flex"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    <XIcon />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <LanguageToggle />
                <ThemeToggle />
                <AuthButton />
                <a href="/#courses" className="hidden md:block px-4 py-2 bg-teal-500 hover:bg-teal-600 transition text-white rounded-md text-sm">
                    {t("nav_enroll")}
                </a>
                <button onClick={() => setOpenMobileMenu(!openMobileMenu)} className="md:hidden">
                    <MenuIcon size={26} className="active:scale-90 transition" />
                </button>
            </div>
        </nav>
    );
}
