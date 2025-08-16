"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Square } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useData } from "@/context/dataContext";
import { HifzProgress } from "@/models/HifzProgress";

// Get today's date in YYYY-MM-DD format
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = today.toISOString().split('T')[0];

// Get week range for the weekly report
const getWeekRange = () => {
    const firstDay = new Date(today);
    const lastDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    lastDay.setDate(firstDay.getDate() + 6); // Sunday

    const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(firstDay)} - ${format(lastDay)}`;
};

export default function ProgressPage() {
    const {
        students,
        hifzProgress,
        loading,
        recordHifzProgress,
        getStudentHifzProgress,
        getWeeklyHifzProgress,
        refreshData
    } = useData();

    const [weeklyBaseline, setWeeklyBaseline] = useState<Record<string, number>>({});
    const [weeklyProgress, setWeeklyProgress] = useState<Record<string, HifzProgress[]>>({});

    // Get today's progress for a student
    const getTodaysProgress = useCallback((studentId: string): HifzProgress | undefined => {
        return hifzProgress.find(p => p.student_id === studentId && p.date === todayStr);
    }, [hifzProgress, todayStr]);

    // Toggle done status for today
    const toggleDoneToday = async (studentId: string) => {
        const todaysProgress = getTodaysProgress(studentId);
        const student = students.find(s => s.id === studentId);

        if (!student) return;

        if (todaysProgress) {
            // If already marked for today, delete the progress
            await recordHifzProgress({
                ...todaysProgress,
                pages_completed: 0
            });
        } else {
            // Mark as completed for today (1 page)
            await recordHifzProgress({
                student_id: studentId,
                date: todayStr,
                pages_completed: 1,
                notes: null
            });

            // Set weekly baseline if not set
            if (!weeklyBaseline[studentId]) {
                setWeeklyBaseline(prev => ({
                    ...prev,
                    [studentId]: student.current_hifz_page
                }));
            }
        }

        await refreshData();
    };

    // Check if student has completed today
    const isDoneToday = (studentId: string) => {
        return !!getTodaysProgress(studentId)?.pages_completed;
    };

    // Calculate weekly target page (current page + 7 pages for the week)
    const weeklyTargetPageForStudent = (studentId: string) => {
        const base = weeklyBaseline[studentId] || students.find(s => s.id === studentId)?.current_hifz_page || 0;
        return base + 7;
    };

    // Calculate pages completed this week
    const weeklyCompletedForStudent = (studentId: string) => {
        const studentProgress = weeklyProgress[studentId] || [];
        return studentProgress.reduce((sum, p) => sum + (p.pages_completed || 0), 0);
    };

    // Load weekly progress for all students
    useEffect(() => {
        const loadWeeklyProgress = async () => {
            const firstDay = new Date(today);
            firstDay.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
            const lastDay = new Date(firstDay);
            lastDay.setDate(firstDay.getDate() + 6);

            const startDate = firstDay.toISOString().split('T')[0];
            const endDate = lastDay.toISOString().split('T')[0];

            const progressMap: Record<string, HifzProgress[]> = {};

            for (const student of students) {
                const progress = await getStudentHifzProgress(student.id);
                progressMap[student.id] = progress.filter(p =>
                    p.date >= startDate && p.date <= endDate && p.pages_completed > 0
                );
            }

            setWeeklyProgress(progressMap);
        };

        if (students.length > 0) {
            loadWeeklyProgress();
        }
    }, [students, getStudentHifzProgress]);

    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Daily Ḥifẓ Progress — {todayStr}</h2>
                <span className="text-sm text-muted-foreground">Weekly plan: 1 page/day</span>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Current Page</TableHead>
                                    <TableHead>Mark Done (today)</TableHead>
                                    <TableHead>Done Today?</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={`prog-${student.id}`}>
                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                        <TableCell>{student.current_hifz_page}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant={isDoneToday(student.id) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleDoneToday(student.id)}
                                                className="gap-2"
                                                disabled={loading}
                                            >
                                                {isDoneToday(student.id) ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Square className="h-4 w-4" />
                                                )}
                                                {isDoneToday(student.id) ? 'Completed' : 'Mark Done'}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {isDoneToday(student.id) ? (
                                                <Badge variant="default">Yes</Badge>
                                            ) : (
                                                <Badge variant="secondary">No</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Report ({getWeekRange()})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Start Page</TableHead>
                                    <TableHead>Current Page</TableHead>
                                    <TableHead>Target Page</TableHead>
                                    <TableHead>Pages This Week</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => {
                                    const startPage = weeklyBaseline[student.id] || student.current_hifz_page;
                                    const progress = weeklyProgress[student.id] || [];
                                    const pagesThisWeek = progress.reduce((sum, p) => sum + (p.pages_completed || 0), 0);

                                    return (
                                        <TableRow key={`wr-${student.id}`}>
                                            <TableCell className="font-medium">{student.full_name}</TableCell>
                                            <TableCell>{startPage}</TableCell>
                                            <TableCell>{student.current_hifz_page}</TableCell>
                                            <TableCell>{startPage + 7}</TableCell>
                                            <TableCell>{pagesThisWeek}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}