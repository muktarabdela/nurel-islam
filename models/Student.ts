export interface StudentModel {
    id: string;
    added_by: string;
    full_name: string;
    family_name: string | null;
    family_phone: string | null;
    current_hifz_page: number;
    is_active: boolean;
    created_at: string;
}


export type AttendanceStatus = 'Present' | 'Absent';

/**
 * Corresponds to the 'feedback_rating' enum in the database.
 */
export type FeedbackRating = 'Excellent' | 'Good' | 'Needs Improvement';
