// lib/services/hifz-progress.ts
import { supabase } from '@/lib/supabase';
import { HifzWeeklyProgress } from '@/models/HifzProgress';

export const hifzProgressService = {
    /**
     * Records or updates a student's weekly Hifz progress.
     * It uses upsert to avoid duplicate entries for the same student and start_date.
     */
    async recordProgress(progress: Omit<HifzWeeklyProgress, 'id'>): Promise<HifzWeeklyProgress> {
        const { data, error } = await supabase
            .from('hifzweeklyprogress') // It's good practice to name the table according to the model
            .upsert(progress, {
                onConflict: 'student_id,start_date', // A student can only have one record per week start date
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error recording Hifz progress:', error);
            throw new Error(error.message);
        }

        return data;
    },

    /**
     * Fetches all weekly progress records for a specific week by providing any date within that week.
     * This is useful for displaying the weekly status for all students.
     * @param date - Any date string (e.g., "YYYY-MM-DD") within the desired week.
     */
    async getProgressForWeek(date: string): Promise<HifzWeeklyProgress[]> {
        const { data, error } = await supabase
            .from('hifzweeklyprogress')
            .select(`
                *,
                students:student_id (id, full_name)
            `)
            .lte('start_date', date)
            .gte('end_date', date);

        if (error) {
            console.error('Error fetching Hifz progress for the week:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * Fetches all Hifz progress records for a specific student within a given date range.
     * @param studentId - The ID of the student.
     * @param startDate - The start of the date range.
     * @param endDate - The end of the date range.
     */
    async getStudentProgressInRange(studentId: string, startDate: string, endDate: string): Promise<HifzWeeklyProgress[]> {
        const { data, error } = await supabase
            .from('hifzweeklyprogress')
            .select('*')
            .eq('student_id', studentId)
            .gte('start_date', startDate)
            .lte('end_date', endDate)
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Error fetching weekly Hifz progress for student:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * Retrieves all Hifz progress records from the database.
     */
    async getAll(): Promise<HifzWeeklyProgress[]> {
        const { data, error } = await supabase
            .from('hifzweeklyprogress')
            .select('*');

        if (error) {
            console.error('Error fetching all Hifz progress:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * Deletes a specific Hifz progress record by its ID.
     * @param progressId - The unique identifier of the progress record.
     */
    async deleteProgress(progressId: string): Promise<void> {
        const { error } = await supabase
            .from('hifzweeklyprogress')
            .delete()
            .eq('id', progressId);

        if (error) {
            console.error('Error deleting Hifz progress:', error);
            throw new Error(error.message);
        }
    },

    /**
     * Updates the status (achieved, ustaz_notes) of a weekly progress record.
     * This is intended to be used at the end of the week.
     * @param progressId - The ID of the weekly progress record to update.
     * @param status - An object containing the fields to update.
     */
    async updateProgressStatus(progressId: string, status: { achieved: boolean | null; ustaz_notes?: string | null }): Promise<HifzWeeklyProgress> {
        const { data, error } = await supabase
            .from('hifzweeklyprogress')
            .update({
                achieved: status.achieved,
                ustaz_notes: status.ustaz_notes,
            })
            .eq('id', progressId)
            .select()
            .single();

        if (error) {
            console.error('Error updating Hifz progress status:', error);
            throw new Error(error.message);
        }

        return data;
    }
};