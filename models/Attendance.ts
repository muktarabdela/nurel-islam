export interface Attendance {
    id: string; // UUID
    studentId: string; // Foreign key to students table
    date: string; // YYYY-MM-DD format
    status: AttendanceStatus;
    arrivalTime: string | null; // HH:MM:SS format
    latenessInMinutes: number | null;
    excuse: string | null;
    punishmentId: string | null; // Foreign key to punishments table
}
