export interface StudentModel {
    id: string; // UUID
    userId: string; // Foreign key to users table
    createdAt: string; // ISO 8601 timestamp string
    fullName: string;
    familyName: string | null;
    familyPhone: string | null;
    currentHifzPage: number;
    isActive: boolean;
}


export type AttendanceStatus = 'Present' | 'Absent';

/**
 * Corresponds to the 'feedback_rating' enum in the database.
 */
export type FeedbackRating = 'Excellent' | 'Good' | 'Needs Improvement';
