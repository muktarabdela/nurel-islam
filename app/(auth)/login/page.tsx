'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ustathService } from '@/lib/servies/ustath';
import Link from 'next/link';

export default function UstathLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams?.get('redirect') || '/';

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('ustathToken');
        if (token) {
            router.push(redirectTo);
        }
    }, [router, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const ustath = await ustathService.loginUstath(username, password);
            if (ustath) {
                // Store ustath session
                localStorage.setItem('ustathToken', 'authenticated');
                localStorage.setItem('ustathData', JSON.stringify(ustath));

                // Force a full page reload to ensure all auth state is properly set
                window.location.href = redirectTo;
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to your ustath account
                    </p>
                </div>

                <div className={cn(
                    "bg-card text-card-foreground rounded-xl p-8 shadow-sm",
                    "border border-border"
                )}>
                    {error && (
                        <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-foreground mb-1.5"
                                >
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                                        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                                        "placeholder:text-muted-foreground/60",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        "disabled:cursor-not-allowed disabled:opacity-50",
                                        "transition-colors duration-200"
                                    )}
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                    autoComplete="username"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        Password
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-input bg-background pr-10 py-2 pl-3 text-sm ring-offset-background",
                                            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                                            "placeholder:text-muted-foreground/60",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                            "disabled:cursor-not-allowed disabled:opacity-50",
                                            "transition-colors duration-200"
                                        )}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                                <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
                                                <path d="m4 4 16 16" />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                        <span className="sr-only">
                                            {showPassword ? 'Hide password' : 'Show password'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                "disabled:pointer-events-none disabled:opacity-50",
                                "h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
                                "shadow-sm"
                            )}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                        href="/register"
                        className="font-medium text-foreground hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
