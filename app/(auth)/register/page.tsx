'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ustathService } from '@/lib/servies/ustath';
import { UstathModel } from '@/models/ustath';
import { toast } from "sonner";


export default function UstathRegister() {
    const [formData, setFormData] = useState({
        fullName: '',
        userName: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        const isUserNameUnique = await ustathService.isUserNameUnique(formData.userName);
        if (!isUserNameUnique) {
            toast.error("Username already exists");
            setLoading(false);
            return;
        }
        try {
            const data = await ustathService.upsertUstath(formData);
            console.log("data", data);
            if (data) {
                // Store ustath session
                localStorage.setItem('ustathToken', 'authenticated');
                localStorage.setItem('ustathData', JSON.stringify(data));

                toast.success("Registration successful");
                router.push('/');
            }
        } catch (err) {
            console.error('Registration error:', err);
            toast.error("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Create an account
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Register as a new Ustazh
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
                                    htmlFor="fullName"
                                    className="block text-sm font-medium text-foreground mb-1.5"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
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
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="userName"
                                    className="block text-sm font-medium text-foreground mb-1.5"
                                >
                                    Username
                                </label>
                                <input
                                    id="userName"
                                    name="userName"
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
                                    placeholder="Choose a username"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-foreground mb-1.5"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                                        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                                        "placeholder:text-muted-foreground/60",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        "disabled:cursor-not-allowed disabled:opacity-50",
                                        "transition-colors duration-200"
                                    )}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-foreground mb-1.5"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                                        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                                        "placeholder:text-muted-foreground/60",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        "disabled:cursor-not-allowed disabled:opacity-50",
                                        "transition-colors duration-200"
                                    )}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
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
                                    Creating account...
                                </>
                            ) : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
