'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function LogoutButton() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        logout();
        router.push('/login');
    };

    return (
        <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
            Sign Out
        </Button>
    );
}
