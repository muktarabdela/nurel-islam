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

            {/* Quick Links Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Quick Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Students Card */}
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <CardTitle className="text-lg">Students</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Manage student records, profiles, and information
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Attendance Card */}
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <CardTitle className="text-lg">Attendance</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Track and manage student attendance records
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Progress Card */}
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <CardTitle className="text-lg">Progress</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Monitor and track student learning progress
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    );
}
