'use client';

import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StudentModel } from '@/models/Student';
import { Attendance } from '@/models/Attendance'; // Assuming you have this model

interface DetailedAttendanceProps {
    students: StudentModel[];
    attendance: Attendance[];
}

type FilterType = 'last7' | 'last14' | 'last30';

export function DetailedAttendance({ students, attendance }: DetailedAttendanceProps) {
    const [filter, setFilter] = useState<FilterType>('last7');

    const filteredAttendance = useMemo(() => {
        const daysToFilter = parseInt(filter.replace('last', ''), 10);
        const cutOffDate = subDays(new Date(), daysToFilter);

        return attendance
            .filter(a => new Date(a.date) >= cutOffDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, filter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Present':
                return <Badge variant="default" className="bg-green-500">Present</Badge>;
            case 'Absent':
                return <Badge variant="destructive">Absent</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.full_name])), [students]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Detailed Attendance View</CardTitle>
                        <CardDescription>
                            Review student attendance records for different periods.
                        </CardDescription>
                    </div>
                    <Select onValueChange={(value: FilterType) => setFilter(value)} defaultValue={filter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="last7">Last 7 Days</SelectItem>
                            <SelectItem value="last14">Last 14 Days</SelectItem>
                            <SelectItem value="last30">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Arrival Time</TableHead>
                                <TableHead>Lateness (min)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{studentMap.get(record.student_id) || 'Unknown'}</TableCell>
                                        <TableCell>{format(new Date(record.date), 'MMMM dd, yyyy')}</TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell>{record.arrival_time || 'N/A'}</TableCell>
                                        <TableCell>{record.lateness_in_minutes != null ? `${record.lateness_in_minutes} min` : 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No attendance records found for the selected period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}