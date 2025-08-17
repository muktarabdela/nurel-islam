'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { EthDateTime, limits } from 'ethiopian-calendar-date-converter'
import { useData } from '@/context/dataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Icons
import { CheckCircle, Loader2, RefreshCw, Trash2, Users, XCircle } from 'lucide-react';

// Models
import { AttendanceStatus, StudentModel } from '@/models/Student';
import { attendanceService } from '@/lib/servies/attendace';
import { LoadingScreen } from '@/components/shared/loading';


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

    const CLASS_START_TIME = '08:30';

    const calculateLateness = (arrivalTime: string): number => {
        const [arrivalHours, arrivalMinutes] = arrivalTime.split(':').map(Number);
        const [classHours, classMinutes] = CLASS_START_TIME.split(':').map(Number);
        const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes;
        const classTotalMinutes = classHours * 60 + classMinutes;
        return Math.max(0, arrivalTotalMinutes - classTotalMinutes);
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
                return <Badge variant="default" className="bg-green-500">Present</Badge>;
            case 'Absent':
                return <Badge variant="destructive">Absent</Badge>;
            default:
                return <Badge variant="secondary">Not Marked</Badge>;
        }
    };

    const handleMarkPresent = async (studentId: string) => {
        setIsSubmitting(true);
        try {
            const now = new Date();
            const arrivalTime = format(now, 'HH:mm:ss');
            const lateness = calculateLateness(format(now, 'HH:mm'));

            const attendance = await attendanceService.markAttendance({
                student_id: studentId,
                date: todayGregorianForDB,
                status: 'Present',
                arrival_time: arrivalTime,
                lateness_in_minutes: lateness,
                excuse: null,
                punishment_id: null,
            });

            console.log("Attendance marked:", attendance);
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
        setAbsenceExcuse(''); // Reset excuse field
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

    // if (loading) {
    //     return <LoadingScreen />;
    // }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
                <p className="text-muted-foreground">
                    Manage and track student attendance for {todayEthiopianForDisplay}
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Today's Attendance</CardTitle>
                            <CardDescription>
                                Lateness is calculated based on a start time of {CLASS_START_TIME}.
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={refreshData} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Lateness (minutes)</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {todaysAttendance.map(record => {
                                        const student = students.find(s => s.id === record.student_id);
                                        if (!student) return null; // Should not happen

                                        return (
                                            <TableRow key={record.student_id}>
                                                <TableCell className="font-medium">{student.full_name}</TableCell>
                                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                                <TableCell>
                                                    {record.lateness_in_minutes != null ? `${record.lateness_in_minutes} min` : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleMarkPresent(student.id)}
                                                        disabled={isSubmitting || record.status === 'Present'}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Present
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenAbsenceModal(student)}
                                                        disabled={isSubmitting || record.status === 'Absent'}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" /> Absent
                                                    </Button>
                                                    {record.status !== 'Not Marked' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteAttendance(record.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Absence Reason Dialog */}
            <Dialog open={isAbsenceModalOpen} onOpenChange={setIsAbsenceModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark {selectedStudent?.full_name} as Absent</DialogTitle>
                        <DialogDescription>
                            You can provide an optional reason for the student's absence.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter reason for absence..."
                            value={absenceExcuse}
                            onChange={(e) => setAbsenceExcuse(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAbsenceModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleMarkAbsent} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Absent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}