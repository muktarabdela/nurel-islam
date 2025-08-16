import { supabase } from '@/lib/supabase';
import { StudentModel } from '@/models/Student';

export type CreateStudentInput = Omit<StudentModel, 'id' | 'created_at'>;
export type UpdateStudentInput = Partial<CreateStudentInput>;

const TABLE_NAME = 'students';

export const studentService = {
    // Create a new ustadh
    async create(student: CreateStudentInput): Promise<StudentModel> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(student)
            .select()
            .single();

        if (error) {
            console.error('Error creating student:', error);
            throw new Error(error.message);
        }

        return data;
    },

    // Get all ustadhs
    async getAll(): Promise<StudentModel[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            console.error('Error fetching students:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    // Get a single ustadh by ID
    async getById(id: string): Promise<StudentModel | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                return null;
            }
            console.error('Error fetching ustadh:', error);
            throw new Error(error.message);
        }

        return data;
    },

    // Update an ustadh
    async update(id: string, updates: UpdateStudentInput): Promise<StudentModel> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update({
                ...updates,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating ustadh:', error);
            throw new Error(error.message);
        }

        return data;
    },

    // Delete an ustadh
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting ustadh:', error);
            throw new Error(error.message);
        }
    },

    // Search ustadhs by name
    async search(query: string): Promise<StudentModel[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .ilike('name', `%${query}%`)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error searching ustadhs:', error);
            throw new Error(error.message);
        }

        return data || [];
    },
};