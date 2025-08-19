import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    username: string;
    full_name: string;
    // Add other user properties as needed
} | null;

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const checkAuth = useCallback(() => {
        const token = localStorage.getItem('ustathToken');
        const userData = localStorage.getItem('ustathData');

        const isAuth = !!token;
        setIsAuthenticated(isAuth);
        setUser(userData ? JSON.parse(userData) : null);
        setLoading(false);

        return isAuth;
    }, []);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback((userData: User) => {
        if (!userData) return;

        localStorage.setItem('ustathToken', 'authenticated');
        localStorage.setItem('ustathData', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('ustathToken');
        localStorage.removeItem('ustathData');
        setIsAuthenticated(false);
        setUser(null);
        router.push('/login');
    }, [router]);

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuth,
    };
};
