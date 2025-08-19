'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { EthDateTime } from 'ethiopian-calendar-date-converter';
import { useData } from '@/context/dataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Icons
import { CheckCircle, Loader2, RefreshCw, Trash2, Users, XCircle, Clock } from 'lucide-react';

// Models
import { AttendanceStatus, StudentModel } from '@/models/Student';
import { attendanceService } from '@/lib/servies/attendace';

// Components

export default function AttendancePage() {
    const { students, attendance, loading, refreshData } = useData();

    // State for managing the "Mark Absent" dialog
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentModel | null>(null);
    const [absenceExcuse, setAbsenceExcuse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ethiopianMonths = [
        'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት',
        'ሚያዝያ', 'ግንቦት', 'ሰናይ', 'ሐምሌ', 'ነሐሴ'
    ];
    const todayGregorian = new Date();

    const todayEthiopian = EthDateTime.fromEuropeanDate(todayGregorian);

    const todayEthiopianForDisplay = `${ethiopianMonths[todayEthiopian.month - 1]} ${todayEthiopian.date}, ${todayEthiopian.year}`;
    const todayGregorianForDB = format(todayGregorian, 'yyyy-MM-dd');


    const CLASS_START_TIME = "08:30"; // 24h safe for calculation

    // arrivalTime should be in "HH:mm" (24h) format
    const calculateLateness = (arrivalTime: string): number => {
        const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number);
        const [classHours, classMinutes] = CLASS_START_TIME.split(":").map(Number);

        const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes;
        const classTotalMinutes = classHours * 60 + classMinutes;

        const lateness = arrivalTotalMinutes - classTotalMinutes;


        return lateness;
    };


    // --- Data Preparation ---
    const todaysAttendance = useMemo(() => {
        const attendanceMap = new Map(
            attendance.filter(a => a.date === todayGregorianForDB).map(record => [record.student_id, record])
        );
        return students.map(student => {
            const existingRecord = attendanceMap.get(student.id);
            if (existingRecord) {
                return existingRecord;
            }
            return {
                id: '',
                student_id: student.id,
                date: todayGregorianForDB,
                status: 'Not Marked' as AttendanceStatus,
                arrival_time: null,
                lateness_in_minutes: null,
                excuse: null,
                punishment_id: null,
            };
        });
    }, [attendance, students, todayGregorianForDB]);

    // --- UI Helpers ---
    const getStatusBadge = (status: AttendanceStatus) => {
        switch (status) {
            case 'Present':
                return <Badge variant="default" className="bg-green-500 capitalize">{status}</Badge>;
            case 'Absent':
                return <Badge variant="destructive" className="capitalize">{status}</Badge>;
            default:
                return <Badge variant="secondary" className="capitalize">{status.replace('_', ' ')}</Badge>;
        }
    };

    const handleMarkPresent = async (studentId: string) => {
        setIsSubmitting(true);
        try {
            const now = new Date();

            // store DB-friendly 24h timestamp
            const arrivalTime = format(now, "HH:mm:ss");

            // for lateness calculation
            const lateness = calculateLateness(format(now, "HH:mm"));

            await attendanceService.markAttendance({
                student_id: studentId,
                date: todayGregorianForDB,
                status: "Present",
                arrival_time: arrivalTime,
                lateness_in_minutes: lateness, // can be negative
                excuse: null,
                punishment_id: null,
            });

            await refreshData();
        } catch (error) {
            console.error("Failed to mark present:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenAbsenceModal = (student: StudentModel) => {
        setSelectedStudent(student);
        setIsAbsenceModalOpen(true);
        setAbsenceExcuse('');
    };

    const handleMarkAbsent = async () => {
        if (!selectedStudent) return;
        setIsSubmitting(true);
        try {
            await attendanceService.markAttendance({
                student_id: selectedStudent.id,
                date: todayGregorianForDB,
                status: 'Absent',
                arrival_time: null,
                lateness_in_minutes: null,
                excuse: absenceExcuse || null,
                punishment_id: null,
            });
            await refreshData();
            setIsAbsenceModalOpen(false);
        } catch (error) {
            console.error("Failed to mark absent:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAttendance = async (id: string) => {
        setIsSubmitting(true);
        try {
            await attendanceService.deleteAttendance(id);
            await refreshData();
        } catch (error) {
            console.error("Failed to delete attendance:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const presentCount = todaysAttendance.filter(a => a.status === 'Present').length;
    const absentCount = todaysAttendance.filter(a => a.status === 'Absent').length;
    const totalStudents = students.length;

    const renderActions = (record: any, student: StudentModel) => {
        if (record.status === 'Not Marked') {
            return (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkPresent(student.id)}
                        disabled={isSubmitting}
                        className="hover:primary hover:text-white"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" /> ተግኝቷል
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleOpenAbsenceModal(student)}
                        disabled={isSubmitting}
                        className="bg-red-500 hover:text-white"
                    >
                        <XCircle className="mr-2 h-4 w-4" /> አልመጣም
                    </Button>
                </div>
            );
        }
        return (
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAttendance(record.id)}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            </div>
        );
    };


    return (
        <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 md:px-6">
            <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Attendance Management</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    {todayEthiopianForDisplay}
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">አጠማሪ የጠቃሚ በትክክል</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ዛሪ የቀሩ</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ዛሪ የተገኙ</CardTitle>
                        <XCircle className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance List */}
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Today's Attendance</CardTitle>
                            <CardDescription className="mt-1">
                                Lateness is calculated based on a start time of {CLASS_START_TIME}.
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={refreshData} disabled={loading} className="w-full sm:w-auto">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-60"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table className="hidden sm:table">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>የተማሪ ስም</TableHead>
                                            <TableHead>ሁኔታ</TableHead>
                                            <TableHead>ያረፈደው (ደቂቃ)</TableHead>
                                            <TableHead className="text-right">ተግባሮች</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todaysAttendance.map(record => {
                                            const student = students.find(s => s.id === record.student_id);
                                            if (!student) return null;
                                            return (
                                                <TableRow key={record.student_id}>
                                                    <TableCell>{student.full_name}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {record.lateness_in_minutes != null ? (
                                                            record.lateness_in_minutes > 0 ? (
                                                                `${record.lateness_in_minutes} ደቂቃ አርፍዷል`
                                                            ) : record.lateness_in_minutes < 0 ? (
                                                                `${Math.abs(record.lateness_in_minutes)} ደቂቃ ቀድሟል`
                                                            ) : (
                                                                "On time"
                                                            )
                                                        ) : (
                                                            <span className="text-muted-foreground">N/A</span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-right">{renderActions(record, student)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {/* Mobile stacked version */}
                                <div className="sm:hidden space-y-3">
                                    {todaysAttendance.map(record => {
                                        const student = students.find(s => s.id === record.student_id);
                                        if (!student) return null;
                                        return (
                                            <div
                                                key={record.student_id}
                                                className="border rounded-lg p-3 shadow-sm bg-white"
                                            >
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">የተማሪ ስም</span>
                                                    <span>{student.full_name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">ሁኔታ</span>
                                                    <span>{record.status}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">ያረፈደው</span>
                                                    <span>
                                                        {record.lateness_in_minutes != null ? (
                                                            record.lateness_in_minutes > 0 ? (
                                                                `${record.lateness_in_minutes} ደቂቃ አርፍዷል`
                                                            ) : record.lateness_in_minutes < 0 ? (
                                                                `${Math.abs(record.lateness_in_minutes)} ደቂቃ ቀድሟል`
                                                            ) : (
                                                                "On time"
                                                            )
                                                        ) : (
                                                            <span className="text-muted-foreground">N/A</span>
                                                        )}

                                                    </span>
                                                </div>
                                                <div className="mt-2 flex justify-end">{renderActions(record, student)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>


                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Attendance Section */}
            {/* <div className="mt-8">
                <DetailedAttendance students={students} attendance={attendance} />
            </div> */}

            {/* Absence Reason Dialog */}
            <Dialog open={isAbsenceModalOpen} onOpenChange={setIsAbsenceModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark {selectedStudent?.full_name} as Absent</DialogTitle>
                        <DialogDescription>
                            Provide an optional reason for the student's absence. This can be helpful for tracking patterns.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Family emergency, sick leave..."
                            value={absenceExcuse}
                            onChange={(e) => setAbsenceExcuse(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAbsenceModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleMarkAbsent} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Absent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

