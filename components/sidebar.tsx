'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Users, CalendarCheck, BookOpen, ClipboardList, AlertTriangle, ListChecks } from 'lucide-react';
import { useNav } from "@/context/nav-context";
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from './auth/LogoutButton';

const sidebarItems = [
    { name: 'Dashboard', href: '/', icon: <Menu className="h-4 w-4" /> },
    { name: 'Students', href: '/students', icon: <Users className="h-4 w-4" /> },
    { name: 'Attendance', href: '/attendance', icon: <CalendarCheck className="h-4 w-4" /> },
    { name: 'Ḥifẓ Progress', href: '/progress', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Weekly Tests', href: '/tests', icon: <ClipboardList className="h-4 w-4" /> },
    { name: 'Punishments', href: '/punishments', icon: <AlertTriangle className="h-4 w-4" /> },
    { name: 'Rules', href: '/rules', icon: <ListChecks className="h-4 w-4" /> },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isSidebarOpen, toggleSidebar, closeSidebar } = useNav();

    const { isAuthenticated } = useAuth();

    // Close sidebar when a navigation item is clicked (mobile)
    const handleNavClick = () => {
        if (window.innerWidth < 1024) { // lg breakpoint
            closeSidebar();
        }
    };

    // Mobile sidebar trigger
    const mobileTrigger = (
        <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon" className="shrink-0 ml-4 mt-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
        </SheetTrigger>
    );

    // Sidebar content
    const sidebarContent = (
        <div className="space-y-4 py-4">
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Qur'an Ḥifẓ — Ustaz
                </h2>
                <div className="space-y-1">
                    {sidebarItems.map((item) => (
                        <Button
                            key={item.href}
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            asChild
                            onClick={handleNavClick}
                        >
                            <Link href={item.href} className="flex items-center gap-2">
                                {item.icon}
                                {item.name}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
            <div className="px-6 py-2 text-sm text-muted-foreground">
                <div>Class time: <span className="font-medium">20:30</span> daily</div>
                <div>Today: <span className="font-medium">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span></div>
            </div>
            {isAuthenticated && (
                <LogoutButton />
            )}
        </div>
    );

    return (
        <>
            {/* Mobile sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={toggleSidebar}>
                {mobileTrigger}
                <SheetContent side="left" className="w-[280px] p-0">
                    {sidebarContent}
                </SheetContent>
            </Sheet>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:w-[280px] lg:fixed lg:inset-y-0 lg:z-50 border-r bg-background">
                <div className="flex h-full flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                    {sidebarContent}
                </div>
            </div>
        </>
    );
}
