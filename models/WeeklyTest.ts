export interface WeeklyTest {
    id: string; // UUID
    userId: string; // Foreign key to users table
    date: string; // YYYY-MM-DD format
    notes: string | null;
}
