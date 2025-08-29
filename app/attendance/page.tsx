'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { EthDateTime } from 'ethiopian-calendar-date-converter';
import { useData } from '@/context/dataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Icons
import { CheckCircle, Loader2, RefreshCw, Trash2, Users, XCircle, Pencil } from 'lucide-react';

// Models
import { AttendanceStatus, StudentModel } from '@/models/Student';
import { attendanceService } from '@/lib/servies/attendace';
import { DetailedAttendance } from '@/components/features/attendance/DetailedAttendance';

// Assuming you have a similar model for Attendance
export interface AttendanceModel {
    id: string;
    student_id: string;
    date: string;
    status: AttendanceStatus;
    arrival_time: string | null;
    lateness_in_minutes: number | null;
    excuse: string | null;
    punishment_id: string | null;
}


export default function AttendancePage() {
    const { students, attendance, loading, refreshData } = useData();

    // State for managing the "Mark Absent" dialog
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentModel | null>(null);
    const [absenceExcuse, setAbsenceExcuse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New state for time input modal
    const [isTimeInputModalOpen, setIsTimeInputModalOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<Partial<AttendanceModel> | null>(null);
    const [manualTime, setManualTime] = useState('');
    const [timeError, setTimeError] = useState('');

    const ethiopianMonths = [
        'መስከረም', 'ጥቅምት', 'ህዳר', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት',
        'ሚያዝያ', 'ግንቦት', 'ሰናይ', 'ሐምሌ', 'ነሐሴ'
    ];
    const todayGregorian = new Date();
    const todayEthiopian = EthDateTime.fromEuropeanDate(todayGregorian);
    const todayEthiopianForDisplay = `${ethiopianMonths[todayEthiopian.month - 1]} ${todayEthiopian.date}, ${todayEthiopian.year}`;
    const todayGregorianForDB = format(todayGregorian, 'yyyy-MM-dd');


    const CLASS_START_TIME = "02:30";

    const calculateLateness = (arrivalTime: string): number => {
        const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number);
        const [classHours, classMinutes] = CLASS_START_TIME.split(":").map(Number);
        const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes;
        const classTotalMinutes = classHours * 60 + classMinutes;
        const lateness = arrivalTotalMinutes - classTotalMinutes;
        return lateness;
    };

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
                status: 'አይታወቅም' as AttendanceStatus,
                arrival_time: null,
                lateness_in_minutes: null,
                excuse: null,
                punishment_id: null,
            };
        });
    }, [attendance, students, todayGregorianForDB]);

    const getStatusBadge = (status: AttendanceStatus) => {
        switch (status) {
            case 'ተገኝቷል':
                return <Badge variant="default" className="bg-green-500 capitalize">{status}</Badge>;
            case 'አልመጣም':
                return <Badge variant="destructive" className="capitalize">{status}</Badge>;
            default:
                return <Badge variant="secondary" className="capitalize">{status.replace('_', ' ')}</Badge>;
        }
    };

    const handleOpenTimeInputModal = (studentId: string, existingTime: string | null = null) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const existingRecord = todaysAttendance.find(a => a.student_id === studentId && a.status !== 'አይታወቅም');

        setSelectedAttendance({
            id: existingRecord?.id || '',
            student_id: student.id,
        });

        setManualTime(existingTime ? existingTime.substring(0, 5) : '');
        setTimeError('');
        setIsTimeInputModalOpen(true);
    };

    const handleTimeSubmit = async () => {
        if (!manualTime) {
            setTimeError("Time cannot be empty.");
            return;
        }

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(manualTime)) {
            // Only set the inline error message, no need for an extra toast notification.
            setTimeError("Invalid time format. Please use HH:mm (24-hour).");
            return;
        }

        // Clear the error if validation passes
        setTimeError('');
        setIsSubmitting(true);

        const arrivalTimeForDB = `${manualTime}:00`;
        const lateness = calculateLateness(manualTime);

        try {
            if (selectedAttendance?.id) {
                // This is an update to an existing record
                await attendanceService.updateAttendance(selectedAttendance.id, {
                    arrival_time: arrivalTimeForDB,
                    lateness_in_minutes: lateness,
                });
                toast.success("Attendance updated successfully!");
            } else {
                // This is a new "Present" mark
                await attendanceService.markAttendance({
                    student_id: selectedAttendance!.student_id!,
                    date: todayGregorianForDB,
                    status: "ተገኝቷል",
                    arrival_time: arrivalTimeForDB,
                    lateness_in_minutes: lateness,
                    excuse: null,
                    punishment_id: null,
                });
                toast.success("Attendance marked successfully!");
            }

            await refreshData();
            setIsTimeInputModalOpen(false);
        } catch (error) {
            console.error("Failed to save attendance:", error);
            toast.error("Operation Failed", {
                style: { color: "#333" },
                description: (
                    <span style={{ color: "#333" }}>
                        Could not save the attendance record. Please try again.
                    </span>
                ),
            });
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
                status: 'አልመጣም',
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

    const presentCount = todaysAttendance.filter(a => a.status === 'ተገኝቷል').length;
    const absentCount = todaysAttendance.filter(a => a.status === 'አልመጣም').length;
    const totalStudents = students.length;

    const renderActions = (record: AttendanceModel, student: StudentModel) => {
        if (record.status === 'አይታወቅም') {
            return (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenTimeInputModal(student.id)}
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
            <div className="flex items-center justify-end gap-2">
                {record.status === 'ተገኝቷል' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenTimeInputModal(student.id, record.arrival_time)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-primary"
                    >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                )}
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">የተማሪዎች መቆጣጠሪያ</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    {todayEthiopianForDisplay}
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">አጠቃላይ የተማሪ ብዛት</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ዛሬ የቀሩ</CardTitle>
                        <XCircle className="h-5 w-5 text-red-500" />

                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{absentCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ዛሬ የተገኙ</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentCount}</div>
                    </CardContent>
                </Card>
            </div>


            {/* Attendance List */}
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>የዛሬ  ({todayEthiopianForDisplay})</CardTitle>
                            <CardDescription className="mt-1">
                                የመግቢያ ሰአት {CLASS_START_TIME}.
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
                                            <TableHead>የገባበት ሰዐት</TableHead>
                                            <TableHead>ያረፈደው (ደቂቃ)</TableHead>
                                            <TableHead>ሁኔታ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todaysAttendance.map(record => {
                                            const student = students.find(s => s.id === record.student_id);
                                            if (!student) return null;
                                            return (
                                                <TableRow key={record.student_id}>
                                                    <TableCell>{student.full_name}</TableCell>
                                                    <TableCell>{record.arrival_time || 'N/A'}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {record.lateness_in_minutes != null ? (
                                                            record.lateness_in_minutes > 0 ? (
                                                                `${record.lateness_in_minutes} ደቂቃ አርፍዷል`
                                                            ) : record.lateness_in_minutes < 0 ? (
                                                                `${Math.abs(record.lateness_in_minutes)} ደቂቃ ቀድሟል`
                                                            ) : (
                                                                "በሰዐቱ ተገኝቷል"
                                                            )
                                                        ) : (
                                                            <span className="text-muted-foreground">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{record.status}</TableCell>
                                                    <TableCell className="text-right">{renderActions(record, student)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {/* Mobile stacked version */}
                                <div className="sm:hidden space-y-3 p-4">
                                    {todaysAttendance.map(record => {
                                        const student = students.find(s => s.id === record.student_id);
                                        if (!student) return null;
                                        return (
                                            <div key={record.student_id} className="border rounded-lg p-3 shadow-sm bg-card">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-card-foreground">{student.full_name}</span>
                                                    {getStatusBadge(record.status)}
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>የገባበት ሰዐት:</span>
                                                        <span>{record.arrival_time ? format(new Date(`1970-01-01T${record.arrival_time}`), 'hh:mm a') : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>ያረፈደው (ደቂቃ):</span>
                                                        <span>
                                                            {record.lateness_in_minutes != null ? (
                                                                record.lateness_in_minutes > 0 ? (
                                                                    `${record.lateness_in_minutes} ደቂቃ አርፍዷል`
                                                                ) : record.lateness_in_minutes < 0 ? (
                                                                    `${Math.abs(record.lateness_in_minutes)} ደቂቃ ቀድሟል`
                                                                ) : (
                                                                    "በሰዐቱ ተገኝቷል"
                                                                )
                                                            ) : (
                                                                <span className="text-muted-foreground">N/A</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t flex justify-end">
                                                    {renderActions(record, student)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8">
                <DetailedAttendance students={students} attendance={attendance} />
            </div>
            {/* Time Input Dialog */}
            <Dialog open={isTimeInputModalOpen} onOpenChange={setIsTimeInputModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>የመግቢያ ሰዐት ያስገቡ</DialogTitle>
                        <DialogDescription>
                            (e.g., 02:40)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="text"
                            placeholder="HH:mm"
                            maxLength={5}
                            value={manualTime}
                            onChange={(e) => setManualTime(e.target.value)}
                            className="text-lg"
                        />
                        {timeError && <p className="text-red-500 text-sm mt-2">{timeError}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleTimeSubmit} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {selectedAttendance?.id ? 'Update Time' : 'Mark Present'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Absence Reason Dialog */}
            <Dialog open={isAbsenceModalOpen} onOpenChange={setIsAbsenceModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark {selectedStudent?.full_name} as Absent</DialogTitle>
                        <DialogDescription>
                            Provide an optional reason for the student's absence.
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