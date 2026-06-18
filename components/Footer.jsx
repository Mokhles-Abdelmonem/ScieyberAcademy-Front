"use client";
import { useLocale } from "@/context/LocaleContext";
import { navLinks } from "@/data/navLinks";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    const { t } = useLocale();

    return (
        <footer className="relative px-6 md:px-16 lg:px-24 xl:px-32 mt-20 w-full dark:text-slate-50">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-200 dark:border-slate-700 pb-6">
                <div className="md:max-w-96">
                    <Link href="/" className="flex items-center gap-0 font-semibold text-lg tracking-tight">
                        <Image src="/assets/main-logo/logo-colored.svg" alt="Scieyber Academy logo" width={54} height={54} className="-me-2" />
                        <span dir="ltr">
                            <span className="text-teal-500">Scieyber</span>
                            <span className="dark:text-white text-slate-800">Academy</span>
                        </span>
                    </Link>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t("footer_desc")}
                    </p>
                </div>

                <div className="flex-1 flex items-start md:justify-end gap-20">
                    <div>
                        <h2 className="font-semibold mb-5">{t("footer_nav_title")}</h2>
                        <ul className="space-y-2 text-sm">
                            {navLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition">
                                        {t(link.key)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-semibold mb-5">{t("footer_contact_title")}</h2>
                        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <p>{t("contact_location_value")}</p>
                            <p>contact@scieyber.com</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="pt-4 text-center pb-5 text-sm text-slate-400">
                {t("footer_copyright")}
            </p>
        </footer>
    );
}
