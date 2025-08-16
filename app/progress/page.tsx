"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Square } from "lucide-react";
import { useState } from "react";

// Mock data
const mockStudents = [
    { id: 1, fullName: "Ahmed Mohammed", currentHifzPage: 12 },
    { id: 2, fullName: "Aisha Ali", currentHifzPage: 15 },
    { id: 3, fullName: "Omar Hassan", currentHifzPage: 8 },
    { id: 4, fullName: "Fatima Ibrahim", currentHifzPage: 20 },
];

// Get today's date in YYYY-MM-DD format
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// Get week range for the weekly report
const getWeekRange = () => {
    const firstDay = new Date(today);
    const lastDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    lastDay.setDate(firstDay.getDate() + 6); // Sunday

    const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(firstDay)} - ${format(lastDay)}`;
};

export default function ProgressPage() {
    const [doneToday, setDoneToday] = useState<Record<number, boolean>>({});
    const [weeklyBaseline, setWeeklyBaseline] = useState<Record<number, number>>({});

    // Toggle done status for today
    const toggleDoneToday = (studentId: number) => {
        setDoneToday(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));

        // Set weekly baseline if not set
        if (!weeklyBaseline[studentId]) {
            const student = mockStudents.find(s => s.id === studentId);
            if (student) {
                setWeeklyBaseline(prev => ({
                    ...prev,
                    [studentId]: student.currentHifzPage
                }));
            }
        }
    };

    // Check if student has completed today
    const isDoneToday = (studentId: number) => {
        return !!doneToday[studentId];
    };

    // Calculate weekly target page (current page + 7 pages for the week)
    const weeklyTargetPageForStudent = (studentId: number) => {
        const base = weeklyBaseline[studentId] || mockStudents.find(s => s.id === studentId)?.currentHifzPage || 0;
        return base + 7;
    };

    // Calculate pages completed this week
    const weeklyCompletedForStudent = (studentId: number) => {
        const student = mockStudents.find(s => s.id === studentId);
        if (!student) return 0;

        const base = weeklyBaseline[studentId];
        if (!base) return 0;

        return Math.max(0, student.currentHifzPage - base);
    };

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
                                    <TableHead>Mark Done (today)</TableHead>
                                    <TableHead>Done Today?</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockStudents.map((student) => (
                                    <TableRow key={`prog-${student.id}`}>
                                        <TableCell className="font-medium">{student.fullName}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant={isDoneToday(student.id) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleDoneToday(student.id)}
                                                className="gap-2"
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
                                    <TableHead>Target Page</TableHead>
                                    <TableHead>Actual Pages Completed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockStudents.map((student) => (
                                    <TableRow key={`wr-${student.id}`}>
                                        <TableCell className="font-medium">{student.fullName}</TableCell>
                                        <TableCell>{weeklyBaseline[student.id] ?? student.currentHifzPage}</TableCell>
                                        <TableCell>{weeklyTargetPageForStudent(student.id)}</TableCell>
                                        <TableCell>{weeklyCompletedForStudent(student.id)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}