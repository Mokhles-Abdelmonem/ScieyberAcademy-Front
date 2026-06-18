import { Cairo, Poppins } from "next/font/google";
import "./globals.css";
import { LocaleContextProvider } from "@/context/LocaleContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { UserContextProvider } from "@/context/UserContext";
import LenisScroll from "@/components/Lenis";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const cairo = Cairo({
    variable: "--font-cairo",
    subsets: ["arabic", "latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata = {
    title: "Scieyber Academy",
    description: "Scieyber Academy — learn, build, and grow with cutting-edge courses and resources.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning className={`${poppins.variable} ${cairo.variable}`}>
            <body>
                <LocaleContextProvider>
                    <ThemeContextProvider>
                        <UserContextProvider>
                            <LenisScroll />
                            {children}
                        </UserContextProvider>
                    </ThemeContextProvider>
                </LocaleContextProvider>
            </body>
        </html>
    );
}
