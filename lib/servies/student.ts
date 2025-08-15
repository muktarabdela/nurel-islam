import { StudentModel } from "@/models/Student";
import { supabase } from "../supabase";

const TABLE_NAME = "students";

export const studentService = {
    // add new user
    async addStudent(student: StudentModel) {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([student])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    },

    // get all users
    async getAll(): Promise<StudentModel[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('first_name', { ascending: true });

        if (error) {
            console.error('Error fetching users:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    // get user by id
    async getById(id: string): Promise<StudentModel | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }

        return data || null;
    },
    // update user
    async updateUser(user: StudentModel) {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(user)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    },
    // delete user
    async delete(id: string) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Error deleting user:', error);
                throw new Error(error.message);
            }
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

}
