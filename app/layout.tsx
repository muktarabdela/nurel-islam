import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DataProvider } from "@/context/dataContext";
import { NavProvider } from "@/context/nav-context";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";

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
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <DataProvider>
                    <NavProvider>
                        <ProtectedRoute>
                            <AuthenticatedLayout>
                                {children}
                                <Toaster />
                            </AuthenticatedLayout>
                        </ProtectedRoute>
                    </NavProvider>
                </DataProvider>
            </body>
        </html>
    );
}
