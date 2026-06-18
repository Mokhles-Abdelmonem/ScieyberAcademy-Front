"use client";
import { useLocale } from "@/context/LocaleContext";
import Marquee from "react-fast-marquee";
import Image from "next/image";

const techStack = [
    { name: "Python",     logo: "/assets/software-logos/python-svgrepo-com.svg" },
    { name: "FastAPI",    logo: "/assets/software-logos/fastapi-svgrepo-com.svg" },
    { name: "JavaScript", logo: "/assets/software-logos/javascript-svgrepo-com.svg" },
    { name: "React",      logo: "/assets/software-logos/react-logo-programming-2-svgrepo-com.svg" },
    { name: "Pandas",     logo: "/assets/software-logos/pandas-svgrepo-com.svg" },
];

const maskStyle = {
    WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
    maskImage:        "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
};

export default function TechStackMarquee() {
    const { t } = useLocale();

    return (
        <div className="w-full mt-20">
            <p className="text-base text-center text-slate-400 dark:text-slate-500 font-medium pb-8">
                {t("tech_stack_label")} —
            </p>

            {/*
             * Responsive width: full on mobile (with side padding), ~50% of screen on md+.
             * CSS mask replaces react-fast-marquee's built-in gradient so the fade works
             * regardless of what background colour the hero uses at this point.
             */}
            <div
                dir="ltr"
                className="w-full px-6 sm:px-10 md:w-1/2 md:px-0 mx-auto overflow-hidden"
                style={maskStyle}
            >
                <Marquee gradient={false} speed={30} pauseOnHover>
                    {[...techStack, ...techStack].map((tech, index) => (
                        <div key={index} className="flex items-center gap-3 mx-10">
                            <Image
                                src={tech.logo}
                                alt={tech.name}
                                width={36}
                                height={36}
                                className="object-contain"
                            />
                            <span className="text-base font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </Marquee>
            </div>
        </div>
    );
}
