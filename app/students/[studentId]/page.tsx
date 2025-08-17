"use client";

import { useData } from "@/context/dataContext";
import { StudentModel } from "@/models/Student";
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BookOpen, CalendarCheck, ClipboardList, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { weeklyTestService } from "@/lib/servies/test";
import { toast } from "sonner";

export default function StudentPage({ params }: { params: { studentId: string } }) {
    const { studentId } = params;
    const { students, attendance, hifzProgress, weeklyTests, punishments, loading } = useData();

    const student = students?.find((s) => s.id === studentId);
    const studentAttendance = attendance?.filter(a => a.student_id === studentId) || [];
    const studentHifzProgress = hifzProgress?.filter(h => h.student_id === studentId) || [];

    // This filter now works correctly because weeklyTests includes test_results
    const studentTests = weeklyTests?.filter(t => t.test_results?.some(r => r.student_id === studentId)) || [];

    const studentPunishments = punishments?.filter(p => p.student_id === studentId) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!student) {
        return <div>Student not found</div>;
    }

    const attendanceSummary = {
        present: studentAttendance.filter(a => a.status === 'Present').length,
        absent: studentAttendance.filter(a => a.status === 'Absent').length,
        total: studentAttendance.length,
        percentage: studentAttendance.length > 0
            ? Math.round((studentAttendance.filter(a => a.status === 'Present').length / studentAttendance.length) * 100)
            : 0
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{student.full_name}</h1>
                    <p className="text-muted-foreground">
                        {student.family_name && `Family: ${student.family_name}`}
                        {student.family_phone && `• ${student.family_phone}`}
                    </p>
                </div>
                <Badge variant={student.is_active ? 'default' : 'secondary'}>
                    {student.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="hifz">Hifz Progress</TabsTrigger>
                    <TabsTrigger value="tests">Weekly Tests</TabsTrigger>
                    <TabsTrigger value="punishments">Punishments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Current Hifz Page</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{student.current_hifz_page}</div>
                                <p className="text-xs text-muted-foreground">
                                    Started on {format(new Date(student.created_at), 'MMM d, yyyy')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{attendanceSummary.percentage}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {attendanceSummary.present} present • {attendanceSummary.absent} absent
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{studentTests.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {studentTests.filter(t => t.test_results.some(r => r.student_id === studentId && r.score >= 50)).length} passed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Punishments</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{studentPunishments.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {studentPunishments.filter(p => p.status === 'Active').length} active
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance History</CardTitle>
                            <CardDescription>Recent attendance records for {student.full_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {studentAttendance.length > 0 ? (
                                <div className="space-y-2">
                                    {studentAttendance.slice(0, 10).map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <p className="font-medium">
                                                    {format(new Date(record.date), 'MMMM d, yyyy')}
                                                </p>
                                                {record.arrival_time && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Arrived at {record.arrival_time}
                                                        {record.lateness_in_minutes ? ` (${record.lateness_in_minutes} min late)` : ''}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                                                {record.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No attendance records found.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hifz">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hifz Progress</CardTitle>
                            <CardDescription>Quran memorization progress for {student.full_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {studentHifzProgress.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Current Page: {student.current_hifz_page}</span>
                                            <span className="text-sm text-muted-foreground">
                                                Total Pages: {studentHifzProgress.reduce((sum, p) => sum + (p.pages_completed || 0), 0)}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{
                                                    width: `${(student.current_hifz_page / 604) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <ScrollArea className="h-[300px] pr-4">
                                        <div className="space-y-2">
                                            {studentHifzProgress
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((progress, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                                                        <div>
                                                            <p className="font-medium">
                                                                {progress.pages_completed} page{progress.pages_completed !== 1 ? 's' : ''} completed
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(new Date(progress.date), 'MMMM d, yyyy')}
                                                            </p>
                                                        </div>
                                                        {progress.notes && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {progress.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No Hifz progress records found.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Tests</CardTitle>
                            <CardDescription>Test results for {student.full_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {studentTests.length > 0 ? (
                                <div className="space-y-4">
                                    {studentTests
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((test) => {
                                            // Find the specific result for this student
                                            const testResult = test.test_results.find(
                                                (result) => result.student_id === studentId
                                            );

                                            if (!testResult) return null;

                                            const percentageScore = Math.round(
                                                (testResult.total_score / test.total_value) * 100
                                            );

                                            return (
                                                <div key={test.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">
                                                                Test on {format(new Date(test.date), 'MMMM d, yyyy')}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Total Score: {testResult.total_score} / {test.total_value}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant={percentageScore >= 50 ? 'default' : 'destructive'}
                                                            className="text-sm"
                                                        >
                                                            {percentageScore}%
                                                        </Badge>
                                                    </div>

                                                    {test.test_evaluations?.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            <p className="text-sm font-medium">Evaluation Criteria:</p>
                                                            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                                                {test.test_evaluations.map((evaluation) => {
                                                                    const studentEval = testResult.student_test_evaluations?.find(
                                                                        (e) => e.test_evaluation_id === evaluation.id
                                                                    );

                                                                    return (
                                                                        <div key={evaluation.id} className="flex justify-between items-center text-sm">
                                                                            <span className="text-muted-foreground">{evaluation.name}:</span>
                                                                            <span>
                                                                                {studentEval ? studentEval.score : 0} / {evaluation.max_value}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {test.notes && (
                                                        <div className="mt-2 pt-2 border-t">
                                                            <p className="text-sm text-muted-foreground">
                                                                <span className="font-medium">Notes:</span> {test.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No test results found.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="punishments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Punishments</CardTitle>
                            <CardDescription>Punishment records for {student.full_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {studentPunishments.length > 0 ? (
                                <div className="space-y-2">
                                    {studentPunishments
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .map((punishment) => (
                                            <div key={punishment.id} className="p-4 border rounded">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">
                                                            {punishment.reason}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(punishment.created_at), 'MMMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={punishment.status === 'Active' ? 'destructive' : 'secondary'}
                                                        className="text-sm"
                                                    >
                                                        {punishment.status}
                                                    </Badge>
                                                </div>
                                                {punishment.notes && (
                                                    <p className="mt-2 text-sm">
                                                        <span className="font-medium">Notes:</span> {punishment.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No punishment records found.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}