// lib/servies/attendance.ts
import { supabase } from '@/lib/supabase';
import { Attendance } from '@/models/Attendance';

export const attendanceService = {
    async markAttendance(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
        const formattedAttendance = {
            ...attendance,
            arrival_time: attendance.arrival_time
                ? attendance.arrival_time.split('T')[1]?.split('.')[0] || attendance.arrival_time
                : null
        };

        const { data, error } = await supabase
            .from('attendance')
            .upsert(formattedAttendance, {
                onConflict: 'student_id,date',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error marking attendance:', error);
            throw new Error(error.message);
        }

        return data;
    },
    async updateAttendance(attendanceId: string, updates: { arrival_time?: string; lateness_in_minutes?: number; }) {
        try {
            const { data, error } = await supabase
                .from('attendance')
                .update(updates)
                .eq('id', attendanceId)
                .select();

            if (error) {
                throw new Error(error.message);
            }
            return data;
        } catch (error) {
            console.error("Error updating attendance:", error);
            throw error;
        }
    },
    async getAttendanceForDate(date: string): Promise<Attendance[]> {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                students:student_id (id, full_name)
            `)
            .eq('date', date);

        if (error) {
            console.error('Error fetching attendance:', error);
            throw new Error(error.message);
        }

        return data || [];
    },
    async getAll(): Promise<Attendance[]> {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                students:student_id (id, full_name)
            `);

        if (error) {
            console.error('Error fetching attendance:', error);
            throw new Error(error.message);
        }

        return data || [];
    },
    async deleteAttendance(id: string): Promise<void> {
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting attendance:', error);
            throw new Error(error.message);
        }
    },
}