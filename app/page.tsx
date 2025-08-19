"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/dataContext";
import { useEffect, useState } from "react";
import { Loader2, Users, Clock, BookOpen, Award, AlertTriangle } from "lucide-react";

export default function Home() {
    const { students, attendance, loading, error } = useData();
    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        averageAttendance: 0,
    });

    useEffect(() => {
        if (students.length > 0 && attendance.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const todayAttendance = attendance.filter(a => a.date.startsWith(today));
            const presentCount = todayAttendance.filter(a => a.status === 'Present').length;

            const totalAttendance = attendance.filter(a => a.status === 'Present').length;
            const totalAttendanceDays = [...new Set(attendance.map(a => a.date))].length;
            const averageAttendance = totalAttendanceDays > 0
                ? Math.round((totalAttendance / (students.length * totalAttendanceDays)) * 100)
                : 0;

            setStats({
                totalStudents: students.length,
                presentToday: presentCount,
                averageAttendance,
            });
        }
    }, [students, attendance]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading data: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header Section */}
            <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard Overview</h1>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                    <span className="text-sm text-muted-foreground">
                        Week {Math.ceil((new Date().getDate() + new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7)}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Students */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <div className="p-2 rounded-full bg-blue-100">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Registered students</p>
                    </CardContent>
                </Card>

                {/* Present Today */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <div className="p-2 rounded-full bg-green-100">
                            <Clock className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.presentToday}/{stats.totalStudents || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">Students present</p>
                    </CardContent>
                </Card>

                {/* Average Attendance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                        <div className="p-2 rounded-full bg-purple-100">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
                        <p className="text-xs text-muted-foreground">Overall attendance rate</p>
                    </CardContent>
                </Card>


            </div>
        </div>
    );
}