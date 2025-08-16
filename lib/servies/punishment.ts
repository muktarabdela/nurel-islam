import { supabase } from '@/lib/supabase';
import { PunishmentModel } from '@/models/Punishment';

const TABLE_NAME = 'punishments';

export const punishmentService = {
    // Create a new punishment
    async create(punishment: PunishmentModel): Promise<PunishmentModel> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(punishment)
            .select()
            .single();

        if (error) {
            console.error('Error creating punishment:', error);
            throw new Error(error.message);
        }

        return data;
    },
    // Get all punishments
    async getAll(): Promise<PunishmentModel[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching punishments:', error);
            throw new Error(error.message);
        }

        return data || [];
    },
    // Get a single punishment by ID
    async getById(id: string): Promise<PunishmentModel | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                return null;
            }
            console.error('Error fetching punishment:', error);
            throw new Error(error.message);
        }

        return data;
    },
    // Update a punishment
    async update(id: string, updates: Partial<PunishmentModel>): Promise<PunishmentModel> {
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
            console.error('Error updating punishment:', error);
            throw new Error(error.message);
        }

        return data;
    },
    // Delete a punishment
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting punishment:', error);
            throw new Error(error.message);
        }
    },

};