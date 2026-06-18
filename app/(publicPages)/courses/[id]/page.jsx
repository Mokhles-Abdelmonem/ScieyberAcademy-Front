import { coursesData } from "@/data/coursesData";
import { notFound } from "next/navigation";
import StaticCourseDetailContent from "./StaticCourseDetailContent";

export async function generateStaticParams() {
    return coursesData.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const course = coursesData.find((c) => c.id === id);
    if (!course) return {};
    return { title: `${course.title.en} — Scieyber Academy` };
}

export default async function StaticCourseDetailPage({ params }) {
    const { id } = await params;
    const course = coursesData.find((c) => c.id === id);
    if (!course) notFound();

    const savePct = Math.round(((course.price - course.discountedPrice) / course.price) * 100);

    return <StaticCourseDetailContent courseId={id} savePct={savePct} />;
}
