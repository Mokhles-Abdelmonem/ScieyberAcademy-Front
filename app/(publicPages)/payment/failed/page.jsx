"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function PaymentFailedPage() {
    const { t } = useLocale();
    const params = useSearchParams();
    const enrollmentId = params.get("enrollment_id");

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="text-center max-w-md w-full">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-6">
                    <XCircle size={40} className="text-red-500" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("pay_failed_title")}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t("pay_failed_desc")}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/#courses"
                        className="bg-teal-500 hover:bg-teal-600 transition text-white font-semibold px-6 py-3 rounded-xl">
                        {t("pay_try_again")}
                    </Link>
                    <Link href="/dashboard"
                        className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        {t("pay_go_dashboard")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
