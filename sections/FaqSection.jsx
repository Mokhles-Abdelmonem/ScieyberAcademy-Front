"use client";
import SectionTitle from "@/components/SectionTitle";
import { useLocale } from "@/context/LocaleContext";
import { useThemeContext } from "@/context/ThemeContext";
import { faqsData } from "@/data/faqsData";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export const FaqSection = () => {
    const { theme } = useThemeContext();
    const { t, locale } = useLocale();
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="relative max-w-2xl mx-auto flex flex-col items-center justify-center px-4 md:px-0">
            <Image
                className="absolute -mb-120 -left-40 -z-10 pointer-events-none"
                src={theme === "dark" ? "/assets/color-splash.svg" : "/assets/color-splash-light.svg"}
                alt="color-splash"
                width={1000}
                height={1000}
                priority
                fetchPriority="high"
            />
            <SectionTitle
                text1={t("section_faq_label")}
                text2={t("section_faq_title")}
                text3={t("section_faq_subtitle")}
            />
            <div className="mt-8 w-full">
                {faqsData.map((faq, index) => (
                    <div
                        className="border-b border-slate-300 dark:border-teal-800 py-4 cursor-pointer w-full"
                        key={index}
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium">{faq.question[locale]}</h3>
                            <ChevronDown
                                size={18}
                                className={`${openIndex === index && "rotate-180"} transition-all duration-500 ease-in-out shrink-0 ms-3`}
                            />
                        </div>
                        <p className={`text-sm text-slate-600 dark:text-slate-300 transition-all duration-500 ease-in-out max-w-xl ${openIndex === index ? "opacity-100 max-h-[500px] translate-y-0 pt-4" : "opacity-0 max-h-0 overflow-hidden -translate-y-2"}`}>
                            {faq.answer[locale]}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
