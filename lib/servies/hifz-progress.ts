// lib/servies/hifz-progress.ts
import { supabase } from '@/lib/supabase';
import { HifzProgress } from '@/models/HifzProgress';

export const hifzProgressService = {
    async recordProgress(progress: Omit<HifzProgress, 'id'>): Promise<HifzProgress> {
        const { data, error } = await supabase
            .from('hifz_progress')
            .upsert(progress, {
                onConflict: 'student_id,date',
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

    async getProgressForDate(date: string): Promise<HifzProgress[]> {
        const { data, error } = await supabase
            .from('hifz_progress')
            .select(`
                *,
                students:student_id (id, full_name, current_hifz_page)
            `)
            .eq('date', date);

        if (error) {
            console.error('Error fetching Hifz progress:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    async getStudentProgress(studentId: string): Promise<HifzProgress[]> {
        const { data, error } = await supabase
            .from('hifz_progress')
            .select('*')
            .eq('student_id', studentId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching student Hifz progress:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    async getWeeklyProgress(studentId: string, startDate: string, endDate: string): Promise<HifzProgress[]> {
        const { data, error } = await supabase
            .from('hifz_progress')
            .select('*')
            .eq('student_id', studentId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching weekly Hifz progress:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    async deleteProgress(progressId: string): Promise<void> {
        const { error } = await supabase
            .from('hifz_progress')
            .delete()
            .eq('id', progressId);

        if (error) {
            console.error('Error deleting Hifz progress:', error);
            throw new Error(error.message);
        }
    }
};