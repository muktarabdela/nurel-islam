export interface HifzProgress {
    id: string; // UUID
    studentId: string; // Foreign key to students table
    date: string; // YYYY-MM-DD format
    pagesCompleted: number;
    notes: string | null;
}
