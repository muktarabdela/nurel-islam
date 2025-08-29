"use client"
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useData } from "@/context/dataContext";
import { useEffect, useState, useMemo } from "react";
import { HifzWeeklyProgress } from "@/models/HifzProgress";
import { Loader2, Users, Award, AlertTriangle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { StudentProgressCard } from "@/components/features/students/StudentProgressCard";

// Helper to get the start and end dates of the week for a given date
const getWeekRange = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
    };
};

export default function HifzWeeklyProgressPage() {
    const { students, hifzProgress, loading, error, refreshData } = useData();

    // State for filtering
    const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
    const [currentDate, setCurrentDate] = useState(new Date());

    const [stats, setStats] = useState({
        totalTracked: 0,
        achieved: 0,
        notAchieved: 0,
        pending: 0,
    });

    // Memoize the currently viewed week's range
    const currentWeekRange = useMemo(() => getWeekRange(currentDate), [currentDate]);

    // Filter progress records for the selected week
    const weeklyProgress = useMemo(() => {
        return hifzProgress.filter(p => p.start_date === currentWeekRange.startDate);
    }, [hifzProgress, currentWeekRange]);

    // Filter students based on the dropdown selection
    const filteredStudents = useMemo(() => {
        if (selectedStudentId === 'all') {
            return students;
        }
        return students.filter(s => s.id === selectedStudentId);
    }, [students, selectedStudentId]);

    // Re-calculate stats when the filtered weekly progress changes
    useEffect(() => {
        if (weeklyProgress.length > 0) {
            const achievedCount = weeklyProgress.filter(p => p.achieved === true).length;
            const notAchievedCount = weeklyProgress.filter(p => p.achieved === false).length;
            const pendingCount = weeklyProgress.filter(p => p.achieved === null).length;

            setStats({
                totalTracked: weeklyProgress.length,
                achieved: achievedCount,
                notAchieved: notAchievedCount,
                pending: pendingCount,
            });
        } else {
            setStats({ totalTracked: 0, achieved: 0, notAchieved: 0, pending: 0 });
        }
    }, [weeklyProgress]);

    // Handlers for week navigation
    const handleWeekChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        const dayOffset = direction === 'prev' ? -7 : 7;
        newDate.setDate(newDate.getDate() + dayOffset);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-red-600">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold">Error loading data</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 md:px-6">
            {/* Header and Filters Section */}
            <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Weekly Hifz Progress</h1>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    {/* Student Dropdown Filter */}
                    <div className="w-full sm:max-w-xs">
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            <SelectTrigger>
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
                    </div>

                    {/* Week Navigation */}
                    <div className="flex items-center gap-2 justify-center">
                        <Button variant="outline" size="icon" onClick={() => handleWeekChange('prev')}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium text-muted-foreground text-center w-48 bg-muted/40 px-3 py-1.5 rounded-md">
                            {new Date(currentWeekRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentWeekRange.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <Button variant="outline" size="icon" onClick={() => handleWeekChange('next')}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="ml-2" onClick={goToToday}>Today</Button>
                    </div>
                </div>
            </div>



            {/* Student Progress List - reflects filters */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Student Records</h2>
                {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                    const progress = weeklyProgress.find(p => p.student_id === student.id);
                    return (
                        <StudentProgressCard
                            key={student.id}
                            student={student}
                            weeklyProgress={progress}
                            weekRange={currentWeekRange}
                            onUpdate={refreshData}
                        />
                    );
                }) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="mt-1 text-sm text-gray-500">No student selected.</p>
                    </div>
                )}
            </div>
        </div>
    );
}