"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { studentService } from '@/lib/servies/student';
import { StudentModel } from '@/models/Student';
import { Attendance } from '@/models/Attendance';
import { attendanceService } from '@/lib/servies/attendace';
import { HifzProgress } from '@/models/HifzProgress';
import { hifzProgressService } from '@/lib/servies/hifz-progress';
import { PunishmentModel } from '@/models/Punishment';
import { punishmentService } from '@/lib/servies/punishment';
import { UstathModel } from '@/models/ustath';
import { ustathService } from '@/lib/servies/ustath';

type DataContextType = {
    students: StudentModel[];
    attendance: Attendance[];
    hifzProgress: HifzProgress[];
    punishments: PunishmentModel[];
    ustaths: UstathModel[];
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
    recordHifzProgress: (progress: Omit<HifzProgress, 'id'>) => Promise<HifzProgress>;
    getStudentHifzProgress: (studentId: string) => Promise<HifzProgress[]>;
    getWeeklyHifzProgress: (studentId: string, startDate: string, endDate: string) => Promise<HifzProgress[]>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [students, setStudents] = useState<StudentModel[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [hifzProgress, setHifzProgress] = useState<HifzProgress[]>([]);
    const [punishments, setPunishments] = useState<PunishmentModel[]>([]);
    const [ustaths, setUstaths] = useState<UstathModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [studentsData, attendanceData, progressData, punishmentsData, ustathsData] = await Promise.all([
                studentService.getAll(),
                attendanceService.getAll(),
                hifzProgressService.getProgressForDate(new Date().toISOString().split('T')[0]),
                punishmentService.getAll(),
                ustathService.getAll()
            ]);

            setStudents(studentsData);
            setAttendance(attendanceData);
            setHifzProgress(progressData);
            setPunishments(punishmentsData);
            setUstaths(ustathsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const recordHifzProgress = async (progress: Omit<HifzProgress, 'id'>) => {
        try {
            const newProgress = await hifzProgressService.recordProgress(progress);
            await fetchAllData(); // Refresh all data
            return newProgress;
        } catch (err) {
            console.error('Error recording Hifz progress:', err);
            throw err;
        }
    };

    const getStudentHifzProgress = async (studentId: string) => {
        try {
            return await hifzProgressService.getStudentProgress(studentId);
        } catch (err) {
            console.error('Error fetching student Hifz progress:', err);
            throw err;
        }
    };

    const getWeeklyHifzProgress = async (studentId: string, startDate: string, endDate: string) => {
        try {
            return await hifzProgressService.getWeeklyProgress(studentId, startDate, endDate);
        } catch (err) {
            console.error('Error fetching weekly Hifz progress:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const value = {
        students,
        attendance,
        hifzProgress,
        punishments,
        ustaths,
        loading,
        error,
        refreshData: fetchAllData,
        recordHifzProgress,
        getStudentHifzProgress,
        getWeeklyHifzProgress,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

// Export a hook that can be used to directly access the context
export default DataContext;