import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DataProvider } from "@/context/dataContext";
import { NavProvider } from "@/context/nav-context";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Quran Hifz Management",
    description: "Manage your Quran Hifz class efficiently",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <DataProvider>
                    <NavProvider>
                        <div className="flex min-h-screen">
                            <Sidebar />
                            <main className="flex-1 lg:pl-[280px] min-h-screen bg-muted/40">
                                <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </NavProvider>
                </DataProvider>
            </body>
        </html>
    );
}
