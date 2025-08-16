'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/sidebar";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:pl-[280px] min-h-screen bg-muted/40">
                <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
