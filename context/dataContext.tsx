"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { studentService } from '@/lib/servies/student';
import { StudentModel } from '@/models/Student';

type DataContextType = {
    students: StudentModel[];

    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [students, setStudents] = useState<StudentModel[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [studentsData] = await Promise.all([
                studentService.getAll(),
            ]);

            setStudents(studentsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    return (
        <DataContext.Provider
            value={{
                students,
                loading,
                error,
                refreshData: fetchAllData,
            }}
        >
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