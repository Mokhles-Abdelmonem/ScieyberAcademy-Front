"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getPaymentStatus, processPaymobCallback } from "@/utils/academyApi";

// outcome: null (loading) | "success" | "pending"
export default function PaymentSuccessPage() {
    const { t } = useLocale();
    const router  = useRouter();
    const params  = useSearchParams();

    const isFree = params.get("free") === "1";

    const enrollmentId =
        params.get("enrollment_id") ??
        (typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem("paymob_enrollment_id")
            : null);

    const [outcome, setOutcome] = useState(isFree ? "success" : null);

    const clearSession = () => {
        sessionStorage.removeItem("paymob_enrollment_id");
        sessionStorage.removeItem("paymob_course_id");
    };

    const goFailed = () => {
        clearSession();
        const courseId =
            typeof sessionStorage !== "undefined"
                ? sessionStorage.getItem("paymob_course_id")
                : null;
        const qs = new URLSearchParams();
        if (enrollmentId) qs.set("enrollment_id", enrollmentId);
        if (courseId)     qs.set("course_id", courseId);
        router.replace(`/payment/failed?${qs}`);
    };

    useEffect(() => {
        if (isFree || !enrollmentId) return;

        const run = async () => {
            // ── Path A: Paymob just redirected here ──────────────────────
            if (params.get("hmac")) {
                const allParams = Object.fromEntries(params.entries());
                try {
                    const s = await processPaymobCallback(enrollmentId, allParams);
                    if (s.paymob_status === "SUCCESS" || s.enrollment_status === "ACTIVE") {
                        clearSession();
                        setOutcome("success");
                    } else if (s.paymob_status === "FAILED") {
                        goFailed();
                    } else {
                        // Unexpected PENDING — fall back on the Paymob URL param
                        const paymobSays = params.get("success") === "true" &&
                                           params.get("pending") !== "true";
                        if (paymobSays) { clearSession(); setOutcome("success"); }
                        else            { goFailed(); }
                    }
                } catch {
                    // Callback API failed — trust Paymob's redirect param for display
                    const paymobSays = params.get("success") === "true" &&
                                       params.get("pending") !== "true";
                    if (paymobSays) { clearSession(); setOutcome("success"); }
                    else            { goFailed(); }
                }
                return;
            }

            // ── Path B: webhook already fired — poll payment-status ──────
            let tries = 0;
            const poll = async () => {
                try {
                    const s = await getPaymentStatus(enrollmentId);
                    if (s.paymob_status === "SUCCESS" || s.enrollment_status === "ACTIVE") {
                        clearSession(); setOutcome("success"); return;
                    }
                    if (s.paymob_status === "FAILED") { goFailed(); return; }
                } catch { /* network hiccup — keep trying */ }

                tries++;
                if (tries < 10) { setTimeout(poll, 2000); }
                else            { setOutcome("pending"); } // genuinely unknown
            };
            poll();
        };

        run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (outcome === null) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-20">
                <div className="text-center max-w-md w-full">
                    <Loader2 size={52} className="mx-auto text-teal-500 animate-spin mb-6" strokeWidth={1.5} />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("pay_verifying")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("pay_verifying_desc")}</p>
                </div>
            </div>
        );
    }

    if (outcome === "pending") {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-20">
                <div className="text-center max-w-md w-full">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mx-auto mb-6">
                        <Clock size={40} className="text-yellow-500" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("pay_pending_title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">{t("pay_pending_desc")}</p>
                    <Link href="/dashboard/enrollments"
                        className="inline-block bg-teal-500 hover:bg-teal-600 transition text-white font-semibold px-8 py-3 rounded-xl">
                        {t("pay_go_enrollments")}
                    </Link>
                </div>
            </div>
        );
    }

    // outcome === "success"
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="text-center max-w-md w-full">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("pay_success_title")}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t("pay_success_desc")}</p>
                <Link href="/dashboard/enrollments"
                    className="inline-block bg-teal-500 hover:bg-teal-600 transition text-white font-semibold px-8 py-3 rounded-xl">
                    {t("pay_go_enrollments")}
                </Link>
            </div>
        </div>
    );
}
