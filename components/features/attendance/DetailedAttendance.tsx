'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, Search, User, X } from 'lucide-react';

// ShadCN UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Models
import { AttendanceStatus, StudentModel } from '@/models/Student';
import { AttendanceModel } from '@/app/attendance/page';

interface DetailedAttendanceProps {
    students: StudentModel[];
    attendance: AttendanceModel[];
}

// Helper function to get status badge styling
const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
        case 'ተገኝቷል':
            return <Badge variant="default" className="bg-green-500 capitalize">ተገኝቷል</Badge>;
        case 'አልመጣም':
            return <Badge variant="destructive" className="capitalize">አልመጣም</Badge>;
        default:
            return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
};

export function DetailedAttendance({ students, attendance }: DetailedAttendanceProps) {
    // State for all filters
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Create a map for quick student name lookup
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.full_name])), [students]);

    // Main filtering logic, memoized for performance
    const filteredAttendance = useMemo(() => {
        let filtered = [...attendance];

        // 1. Filter by the selected date range
        if (dateRange?.from) {
            filtered = filtered.filter(a => {
                const recordDate = new Date(a.date);
                recordDate.setHours(0, 0, 0, 0); // Normalize date to prevent timezone issues
                const fromDate = new Date(dateRange.from!);
                fromDate.setHours(0, 0, 0, 0);

                if (dateRange.to) {
                    const toDate = new Date(dateRange.to);
                    toDate.setHours(0, 0, 0, 0);
                    return recordDate >= fromDate && recordDate <= toDate;
                }
                return recordDate.getTime() === fromDate.getTime();
            });
        }

        // 2. Filter by the selected student from the dropdown
        if (selectedStudentId !== 'all') {
            filtered = filtered.filter(a => a.student_id === selectedStudentId);
        }

        // 3. Filter by the text search on student name
        if (studentSearch) {
            const searchTerm = studentSearch.toLowerCase();
            filtered = filtered.filter(a =>
                studentMap.get(a.student_id)?.toLowerCase().includes(searchTerm)
            );
        }

        // Sort the final result by date, newest first
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, dateRange, selectedStudentId, studentSearch, studentMap]);

    // Clear all filters at once
    const clearFilters = () => {
        setStudentSearch('');
        setSelectedStudentId('all');
        setDateRange(undefined);
    };

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow border-0 mt-8">
            <CardHeader>
                <CardTitle>Detailed Attendance History</CardTitle>
                <CardDescription>
                    Search, filter, and review all historical attendance records.
                </CardDescription>

                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    {/* Student Search Input */}
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Student Select Dropdown */}
                    <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <User className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Students</SelectItem>
                            {students.map(student => (
                                <SelectItem key={student.id} value={student.id}>
                                    {student.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Date Range Picker */}
                    {/* <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal sm:w-[240px]",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd, y")}`
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover> */}

                    {/* Clear Filters Button */}
                    <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
                        <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
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
                            {filteredAttendance.map((record: AttendanceModel) => {
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
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {/* Mobile stacked version */}
                    <div className="sm:hidden space-y-3 p-4">
                        {filteredAttendance.map((record: AttendanceModel) => {
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    {filteredAttendance.length > 0 ? (
                        filteredAttendance.map(record => (
                            <div key={record.student_id} className="border rounded-lg p-3 shadow-sm bg-card">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-card-foreground">{students.find(s => s.id === record.student_id)?.full_name}</span>
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
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            <p>No records found.</p>
                            <p className="text-sm">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}