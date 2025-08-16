import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_Ethiopic } from 'next/font/google';
import { DataProvider } from "@/context/dataContext";
import { NavProvider } from "@/context/nav-context";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";

const noto = Noto_Sans_Ethiopic({
    subsets: ['ethiopic'],
    weight: ['600', '700'],
    variable: '--font-noto',
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
                className={`${noto.className} antialiased bg-background text-foreground`}
                style={{
                    WebkitTextSizeAdjust: '100%',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                }}
            >
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
