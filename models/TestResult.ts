import { FeedbackRating } from "./Student";

export interface TestResult {
    id: string; // UUID
    testId: string; // Foreign key to weekly_tests table
    studentId: string; // Foreign key to students table
    score: number;
    tajweedErrors: number;
    fluency: FeedbackRating | null;
    presentation: FeedbackRating | null;
}