import { CheckCircleIcon } from "lucide-react";

export const coursesData = [
    {
        id: "frontend",
        title: {
            en: "Front End Development",
            ar: "تطوير الواجهات الأمامية",
        },
        instructor: "Eng. Eslam Abdelsattar",
        duration: {
            en: "4 Months",
            ar: "4 أشهر",
        },
        level: {
            en: "Beginner to Pro",
            ar: "من المبتدئ إلى المحترف",
        },
        students: "10+",
        rating: "4.9",
        description: {
            en: "Master HTML, CSS, JavaScript, jQuery, Bootstrap, and React JS to become a professional Frontend Developer.",
            ar: "أتقن HTML وCSS وJavaScript وjQuery وBootstrap وReact JS لتصبح مطور واجهات أمامية احترافياً.",
        },
        curriculum: [
            {
                title: { en: "HTML & CSS: Building Modern Layouts", ar: "HTML & CSS: بناء التخطيطات الحديثة" },
                weeks: 3,
            },
            {
                title: { en: "JavaScript Essentials: Logic and DOM", ar: "أساسيات JavaScript: المنطق والـ DOM" },
                weeks: 3,
            },
            {
                title: { en: "Interactive UI with jQuery", ar: "واجهات تفاعلية باستخدام jQuery" },
                weeks: 2,
            },
            {
                title: { en: "Responsive Design with Bootstrap", ar: "التصميم المتجاوب باستخدام Bootstrap" },
                weeks: 2,
            },
            {
                title: { en: "Version Control with Git", ar: "إدارة الإصدارات باستخدام Git" },
                weeks: 1,
            },
            {
                title: { en: "Modern Web Apps with React JS", ar: "تطبيقات الويب الحديثة باستخدام React JS" },
                weeks: 4,
            },
        ],
        skills: {
            en: ["HTML & CSS", "JavaScript", "jQuery", "Bootstrap", "Git", "React JS"],
            ar: ["HTML & CSS", "JavaScript", "jQuery", "Bootstrap", "Git", "React JS"],
        },
        includes: {
            en: ["Live Interactive Sessions", "Recorded Lectures Access", "Real-world Projects", "Career Mentorship"],
            ar: ["جلسات تفاعلية مباشرة", "وصول للمحاضرات المسجلة", "مشاريع عملية حقيقية", "توجيه مهني"],
        },
        price: 2000,
        discountedPrice: 1200,
        monthlyPrice: 500,
        discountedMonthlyPrice: 300,
        currency: "EGP",
        buttonText: {
            en: "Enroll in Frontend",
            ar: "سجل في الواجهات الأمامية",
        },
        icon: CheckCircleIcon,
        featured: false,
    },
    {
        id: "backend",
        title: {
            en: "Back End Development",
            ar: "تطوير الواجهات الخلفية",
        },
        instructor: "Eng. Mokhles Abdelmonem",
        duration: {
            en: "4 Months",
            ar: "4 أشهر",
        },
        level: {
            en: "Beginner to Pro",
            ar: "من المبتدئ إلى المحترف",
        },
        students: "10+",
        rating: "4.9",
        description: {
            en: "Master Python, SQL Databases, and Django to build powerful and scalable backend systems.",
            ar: "أتقن Python وقواعد بيانات SQL وDjango لبناء أنظمة خلفية قوية وقابلة للتوسع.",
        },
        curriculum: [
            {
                title: { en: "Python Fundamentals & Logic", ar: "أساسيات Python والمنطق البرمجي" },
                weeks: 3,
            },
            {
                title: { en: "SQL & Relational Database Design", ar: "SQL وتصميم قواعد البيانات العلائقية" },
                weeks: 3,
            },
            {
                title: { en: "Django Web Framework", ar: "إطار عمل Django للويب" },
                weeks: 3,
            },
            {
                title: { en: "RESTful APIs with Django REST Framework", ar: "واجهات RESTful مع Django REST Framework" },
                weeks: 3,
            },
            {
                title: { en: "APIs Integration", ar: "تكامل الـ APIs" },
                weeks: 2,
            },
            {
                title: { en: "Production Deployment & Security", ar: "النشر على الإنتاج والأمان" },
                weeks: 2,
            },
        ],
        skills: {
            en: ["Python", "SQL Database", "Django", "REST APIs", "Git", "Deployment"],
            ar: ["Python", "قواعد بيانات SQL", "Django", "REST APIs", "Git", "النشر"],
        },
        includes: {
            en: ["Live Interactive Sessions", "Recorded Lectures Access", "Real-world Projects", "Career Mentorship"],
            ar: ["جلسات تفاعلية مباشرة", "وصول للمحاضرات المسجلة", "مشاريع عملية حقيقية", "توجيه مهني"],
        },
        price: 3000,
        discountedPrice: 2000,
        monthlyPrice: 750,
        discountedMonthlyPrice: 500,
        currency: "EGP",
        buttonText: {
            en: "Enroll in Backend",
            ar: "سجل في الواجهات الخلفية",
        },
        icon: CheckCircleIcon,
        featured: true,
    },
    {
        id: "datascience",
        title: {
            en: "Data Science (Introduction)",
            ar: "علم البيانات (مقدمة)",
        },
        instructor: "Eng. Mokhles Abdelmonem",
        duration: {
            en: "4 Months",
            ar: "4 أشهر",
        },
        level: {
            en: "Beginner",
            ar: "مبتدئ",
        },
        students: "8+",
        rating: "4.9",
        description: {
            en: "Learn how to analyze data, extract insights, and build the foundation of Data Science using Python and Machine Learning basics with hands-on practice.",
            ar: "تعلم كيفية تحليل البيانات واستخراج الرؤى وبناء أساسيات علم البيانات باستخدام Python ومبادئ تعلم الآلة مع تدريب عملي.",
        },
        curriculum: [
            {
                title: { en: "Introduction to Data Science & Python", ar: "مقدمة في علم البيانات وPython" },
                weeks: 3,
            },
            {
                title: { en: "Data Analysis with Pandas", ar: "تحليل البيانات باستخدام Pandas" },
                weeks: 3,
            },
            {
                title: { en: "Data Visualization with Matplotlib / Seaborn", ar: "تمثيل البيانات باستخدام Matplotlib / Seaborn" },
                weeks: 3,
            },
            {
                title: { en: "Machine Learning Basics", ar: "أساسيات تعلم الآلة" },
                weeks: 3,
            },
            {
                title: { en: "Practical Project", ar: "مشروع تطبيقي" },
                weeks: 4,
            },
        ],
        skills: {
            en: ["Python", "Data Analysis", "Pandas", "Visualization", "ML Basics", "Practical Apps"],
            ar: ["Python", "تحليل البيانات", "Pandas", "التمثيل البياني", "أساسيات ML", "تطبيقات عملية"],
        },
        includes: {
            en: ["Live Interactive Sessions", "Recorded Lectures Access", "Real-world Projects", "Career Mentorship"],
            ar: ["جلسات تفاعلية مباشرة", "وصول للمحاضرات المسجلة", "مشاريع عملية حقيقية", "توجيه مهني"],
        },
        price: 3000,
        discountedPrice: 2000,
        monthlyPrice: 750,
        discountedMonthlyPrice: 500,
        currency: "EGP",
        buttonText: {
            en: "Enroll in Data Science",
            ar: "سجل في علم البيانات",
        },
        icon: CheckCircleIcon,
        featured: false,
    },
];
