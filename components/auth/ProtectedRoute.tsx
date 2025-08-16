'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '../shared/loading';



export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    console.log(isAuthenticated, loading);
    const router = useRouter();
    useEffect(() => {
        if (loading) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);


    if (loading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}