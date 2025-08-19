'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/sidebar";
import Link from 'next/link';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:pl-[280px] min-h-screen bg-muted/40">
                <header className="h-16 border-b bg-background flex items-center justify-between px-4">
                    <div className="flex-1">
                        {/* Left side of header - can be used for page title or breadcrumbs */}
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <Link
                                href="/profile"
                                className="p-2 rounded-full hover:bg-accent transition-colors"
                                title="Profile"
                            >
                                <User className="h-5 w-5" />
                                <span className="sr-only">Profile</span>
                            </Link>
                        )}
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
