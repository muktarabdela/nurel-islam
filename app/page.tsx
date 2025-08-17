"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { redirect, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Home() {
    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header Section */}
            <div className="space-y-3">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard Overview</h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md w-full sm:w-auto text-center sm:text-left">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                    <span className="text-sm text-muted-foreground text-center sm:text-right">
                        Week {Math.ceil((new Date().getDate() + new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7)}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            Average Lateness
                        </CardTitle>
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <svg
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-2xl sm:text-3xl font-bold">5.2 <span className="text-xs sm:text-sm text-muted-foreground">min</span></div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-amber-600">+0.5%</span> from last week
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            Weekly Punishments
                        </CardTitle>
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <svg
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-2xl sm:text-3xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">-2</span> from last week
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            Total Students
                        </CardTitle>
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-2xl sm:text-3xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">+2</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                            Avg. Ḥifẓ Completion
                        </CardTitle>
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <svg
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-2xl sm:text-3xl font-bold">78<span className="text-xs sm:text-sm">%</span></div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">+12%</span> from last week
                        </p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
