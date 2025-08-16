import { supabase } from "../supabase";
import { UstathModel } from "@/models/ustath";
import { hashPassword, verifyPassword } from "../utils/auth-utils";

const TABLE_NAME = "ustazs";

type CreateUstathInput = Omit<UstathModel, 'id' | 'createdAt'> & {
    confirmPassword?: string;
};

export const ustathService = {
    // Register new ustath
    async upsertUstath({
        id,
        userName,
        fullName,
        password,
        // role = 'ustaz',
    }: Partial<UstathModel> & { password: string }) {
        try {
            // Check if username already exists
            const { data: existingUser } = await supabase
                .from(TABLE_NAME)
                .select('id')
                .eq('user_name', userName)
                .single();

            if (existingUser && !id) {
                throw new Error('Username already exists');
            }

            const hashedPassword = await hashPassword(password);
            const now = new Date();

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .upsert(
                    {
                        id: id || undefined, // Let Supabase auto-generate ID if not provided
                        user_name: userName,
                        full_name: fullName,
                        password: hashedPassword,
                        // role,
                        createdAt: now,
                    },
                    { onConflict: 'id' }
                )
                .select()
                .single();

            if (error) {
                console.error("Supabase Upsert Error:", error);
                throw new Error(`Ustath registration failed: ${error.message}`);
            }

            // Don't return the password hash
            const { password: _, ...userWithoutPassword } = data;
            return userWithoutPassword as UstathModel;
        } catch (err) {
            console.error("Error during ustath registration:", err);
            throw err;
        }
    },
    // login 
    async loginUstath(user_name: string, password: string): Promise<UstathModel | null> {
        try {
            const { data: admin, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .eq('user_name', user_name)
                .single();

            if (error || !admin) {
                console.error("Admin not found:", error);
                return null;
            }

            // Verify the password
            const isPasswordValid = await verifyPassword(password, admin.password);

            if (!isPasswordValid) {
                return null;
            }

            // Don't return the password hash
            const { password: _, ...adminWithoutPassword } = admin;
            return adminWithoutPassword as UstathModel;
        } catch (error) {
            console.error("Error during admin login:", error);
            return null;
        }
    },

    // Add a method to verify admin credentials
    async verifyAdmin(email: string, password: string): Promise<UstathModel | null> {
        try {
            // First, find the admin by email (you'll need to add email to your AdminModel and table)
            const { data: admin, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .eq('email', email)
                .single();

            if (error || !admin) {
                console.error("Admin not found:", error);
                return null;
            }

            // Verify the password
            const isPasswordValid = await verifyPassword(password, admin.password);

            if (!isPasswordValid) {
                return null;
            }

            // Don't return the password hash
            const { password: _, ...adminWithoutPassword } = admin;
            return adminWithoutPassword as UstathModel;
        } catch (error) {
            console.error("Error during admin verification:", error);
            return null;
        }
    },

    // isUserNameUnique
    async isUserNameUnique(user_name: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('id')
                .eq('user_name', user_name);

            if (error) {
                console.error("Supabase Select Error:", error);
                throw new Error(`Username check failed: ${error.message}`);
            }
            return !data || data.length === 0;
        } catch (err) {
            console.error("Error during username check:", err);
            throw err;
        }
    },
    // changer admin password
    async changeAdminPassword(id: string, newPassword: string) {
        try {
            const hashedPassword = await hashPassword(newPassword);
            const { error } = await supabase
                .from(TABLE_NAME)
                .update({ password: hashedPassword })
                .eq("id", id);

            if (error) {
                console.error("Supabase Update Error:", error);
                throw new Error(`Admin password change failed: ${error.message}`);
            }
            return true;
        } catch (err) {
            console.error("Error during admin password change:", err);
            throw err;
        }
    },

}