"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SectionTitle from "@/components/SectionTitle";
import { useLocale } from "@/context/LocaleContext";
import { fetchPublicTestimonials } from "@/utils/academyApi";
import { testimonialsData } from "@/data/testimonialsData";
import { Star } from "lucide-react";

function StarRating({ rating }) {
    if (!rating) return null;
    return (
        <div className="flex items-center justify-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={13}
                    fill={i <= rating ? "#f59e0b" : "none"}
                    strokeWidth={1.5}
                    className={i <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}
                />
            ))}
        </div>
    );
}

function TestimonialCard({ name, role, text, image, rating, profilePicture }) {
    const imgSrc = profilePicture || image;

    return (
        <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-80 w-full flex flex-col items-center text-center shadow-sm">
            <div className="size-20 rounded-full overflow-hidden ring-2 ring-teal-400/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 mb-4 shrink-0">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 text-white font-bold text-xl">
                        {name?.[0]?.toUpperCase() ?? "S"}
                    </div>
                )}
            </div>

            <StarRating rating={rating} />

            <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed italic mb-5 flex-1">
                &ldquo;{text}&rdquo;
            </p>

            <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{name}</p>
                {role && <p className="text-teal-500 text-xs font-medium mt-0.5">{role}</p>}
            </div>
        </div>
    );
}

export default function TestimonialsSection() {
    const { t, locale } = useLocale();
    const [items, setItems] = useState(null);

    useEffect(() => {
        fetchPublicTestimonials(6)
            .then(data => setItems(data?.length ? data : null))
            .catch(() => setItems(null));
    }, []);

    const cards = items
        ? items.map(item => ({
              id:             item.id,
              name:           item.author ? `${item.author.first_name} ${item.author.last_name}` : "Anonymous",
              role:           item.author?.title ?? null,
              text:           item.content,
              rating:         item.rating,
              profilePicture: item.author?.profile_picture_url ?? null,
              image:          null,
          }))
        : testimonialsData.map((t, i) => ({
              id:             i,
              name:           t.name,
              role:           t.role[locale],
              text:           t.text[locale],
              rating:         null,
              profilePicture: null,
              image:          t.image,
          }));

    return (
        <div id="testimonials">
            <SectionTitle
                text1={t("section_testimonials_label")}
                text2={t("section_testimonials_title")}
                text3={t("section_testimonials_subtitle")}
            />
            <div className="flex flex-wrap items-stretch justify-center gap-6 mt-12 px-6 md:px-16 lg:px-24 xl:px-32">
                {cards.map(card => (
                    <TestimonialCard key={card.id} {...card} />
                ))}
            </div>
        </div>
    );
}
