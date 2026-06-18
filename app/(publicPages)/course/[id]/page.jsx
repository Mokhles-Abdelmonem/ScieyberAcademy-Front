import CourseDetailContent from "./CourseDetailContent";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchCourseSSR(id) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/courses/${id}`, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const course = await fetchCourseSSR(id);
    if (!course) return {};
    return { title: `${course.title} — Scieyber Academy` };
}

export default async function CourseDetailPage({ params }) {
    const { id } = await params;
    return <CourseDetailContent courseId={id} />;
}
