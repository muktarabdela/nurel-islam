import { supabase } from '../lib/supabase';
import { hashPassword } from '../lib/utils/auth-utils';

interface UstathSeed {
    id: string;
    user_name: string;
    full_name: string;
    password: string;
    role: string;
}

const MOCK_USTATHS: UstathSeed[] = [
    {
        id: '1',
        user_name: 'admin',
        full_name: 'Admin User',
        password: 'admin123',
        role: 'admin',
    },
    {
        id: '2',
        user_name: 'teacher1',
        full_name: 'Teacher One',
        password: 'teacher123',
        role: 'teacher',
    },
    {
        id: '3',
        user_name: 'teacher2',
        full_name: 'Teacher Two',
        password: 'teacher123',
        role: 'teacher',
    },
    {
        id: '4',
        user_name: 'assistant1',
        full_name: 'Assistant One',
        password: 'assistant123',
        role: 'assistant',
    },
];

async function seedUstazs() {
    console.log('🌱 Starting to seed ustazs...');

    for (const user of MOCK_USTATHS) {
        try {
            // Hash the password if it's not already hashed
            const hashedPassword = user.password.includes('$')
                ? user.password
                : await hashPassword(user.password);

            const { data, error } = await supabase
                .from('ustazs')
                .upsert(
                    {
                        id: user.id,
                        user_name: user.user_name,
                        full_name: user.full_name,
                        password: hashedPassword,
                        role: user.role,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'id' }
                )
                .select();

            if (error) {
                console.error(`❌ Error seeding user ${user.user_name}:`, error);
            } else {
                console.log(`✅ Successfully seeded user: ${user.user_name} (ID: ${user.id})`);
            }
        } catch (error) {
            console.error(`❌ Unexpected error seeding user ${user.user_name}:`, error);
        }
    }

    console.log('🎉 Finished seeding ustazs!');
}

// Run the seed function
seedUstazs()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
