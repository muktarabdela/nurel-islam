export interface WeeklyTest {
    id: string; // UUID
    ustazh_id: string; // Foreign key to the teachers/ustazhs table
    date: string;
    notes: string | null;
    total_value: number; // The total possible points for the test, e.g., 20
}

export interface TestEvaluation {
    id: string; // UUID
    test_id: string; // Foreign key to the WeeklyTest table
    name: string; // The name of the evaluation, e.g., "Tajweed", "Hifz", "Tarteel"
    max_value: number; // The maximum value for this specific evaluation, e.g., 5 for Tajweed
}

export interface TestResult {
    id: string; // UUID
    test_id: string; // Foreign key to the WeeklyTest table
    student_id: string; // Foreign key to the students table
    total_score: number; // The calculated total score for the student in this test
}

/**
 * Represents the score a student received for a specific
 * evaluation criterion within a single test.
 */
export interface StudentTestEvaluation {
    id: string; // UUID
    test_result_id: string; // Foreign key to the TestResult table
    test_evaluation_id: string; // Foreign key to the TestEvaluation table
    score: number; // The score the student received for this evaluation
}