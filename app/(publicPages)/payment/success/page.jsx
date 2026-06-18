"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getPaymentStatus } from "@/utils/academyApi";

export default function PaymentSuccessPage() {
    const { t } = useLocale();
    const router = useRouter();
    const params = useSearchParams();

    const enrollmentId = params.get("enrollment_id");
    const isFree       = params.get("free") === "1";

    const [status, setStatus]   = useState(null);
    const [loading, setLoading] = useState(!isFree);

    useEffect(() => {
        if (isFree || !enrollmentId) { setLoading(false); return; }

        let tries = 0;
        const poll = async () => {
            try {
                const s = await getPaymentStatus(enrollmentId);
                if (s.paymob_status === "SUCCESS" || s.enrollment_status === "ACTIVE") {
                    setStatus(s); setLoading(false); return;
                }
                if (s.paymob_status === "FAILED") {
                    router.replace(`/payment/failed?enrollment_id=${enrollmentId}`); return;
                }
            } catch {}
            tries++;
            if (tries < 10) setTimeout(poll, 2000);
            else setLoading(false);
        };
        poll();
    }, [enrollmentId, isFree]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="text-center max-w-md w-full">
                {loading ? (
                    <>
                        <Loader2 size={52} className="mx-auto text-teal-500 animate-spin mb-6" strokeWidth={1.5} />
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("pay_verifying")}</h1>
                        <p className="text-slate-500 dark:text-slate-400">{t("pay_verifying_desc")}</p>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t("pay_success_title")}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">{t("pay_success_desc")}</p>
                        <Link href="/dashboard/enrollments"
                            className="inline-block bg-teal-500 hover:bg-teal-600 transition text-white font-semibold px-8 py-3 rounded-xl">
                            {t("pay_go_enrollments")}
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
