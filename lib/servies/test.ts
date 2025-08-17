import { supabase } from '@/lib/supabase';
import { WeeklyTest, TestEvaluation, TestResult, StudentTestEvaluation } from '@/models/WeeklyTest';
export type CreateWeeklyTestParams = {
    testData: Omit<WeeklyTest, 'id'>;
    evaluations: Omit<TestEvaluation, 'id' | 'test_id'>[];
};

export type AddStudentTestResultParams = {
    resultData: Omit<TestResult, 'id'>;
    evaluationScores: Omit<StudentTestEvaluation, 'id' | 'test_result_id' | 'test_evaluation_id'> & { test_evaluation_id: string }[];
};


export interface WeeklyTestDetails extends WeeklyTest {
    test_evaluations: TestEvaluation[];
    test_results: (TestResult & {
        students: { id: string; full_name: string; };
        student_test_evaluations: StudentTestEvaluation[];
    })[];
}

export interface WeeklyTestWithDetails extends WeeklyTest {
    test_evaluations: TestEvaluation[];
    test_results: (TestResult & {
        student_test_evaluations: StudentTestEvaluation[];
    })[];
}


export const weeklyTestService = {


    async createWeeklyTest({ testData, evaluations }: CreateWeeklyTestParams): Promise<WeeklyTest> {
        const { data: newTest, error: testError } = await supabase
            .from('weekly_tests')
            .insert({
                ...testData,
                date: new Date(testData.date).toISOString(),
            })
            .select()
            .single();

        if (testError) {
            console.error('Error creating weekly test:', testError);
            throw new Error(testError.message);
        }
        if (!newTest) {
            throw new Error('Failed to create weekly test, no data returned.');
        }

        const evaluationsWithTestId = evaluations.map(evaluation => ({
            ...evaluation,
            test_id: newTest.id,
        }));

        const { error: evaluationsError } = await supabase
            .from('test_evaluations')
            .insert(evaluationsWithTestId);

        if (evaluationsError) {
            console.error('Error adding test evaluations:', evaluationsError);
            throw new Error(evaluationsError.message);
        }
        return newTest;
    },

    async addStudentTestResult({ resultData, evaluationScores }: AddStudentTestResultParams): Promise<TestResult> {
        const { data: newResult, error: resultError } = await supabase
            .from('test_results')
            .insert(resultData)
            .select()
            .single();

        if (resultError) {
            console.error('Error creating student test result:', resultError);
            throw new Error(resultError.message);
        }
        if (!newResult) {
            throw new Error('Failed to create student test result.');
        }

        const scoresWithResultId = evaluationScores.map(score => ({
            ...score,
            test_result_id: newResult.id,
        }));

        const { error: scoresError } = await supabase
            .from('student_test_evaluations')
            .insert(scoresWithResultId);

        if (scoresError) {
            console.error('Error adding student evaluation scores:', scoresError);
            throw new Error(scoresError.message);
        }

        return newResult;
    },

    async updateWeeklyTest(testId: string, testData: Omit<WeeklyTest, 'id' | 'date'>): Promise<void> {
        const { error } = await supabase
            .from('weekly_tests')
            .update(testData)
            .eq('id', testId);

        if (error) {
            console.error('Error updating weekly test:', error);
            throw new Error(error.message);
        }
    },

    async updateTestEvaluation(evaluationId: string, evaluationData: Omit<TestEvaluation, 'id' | 'test_id'>): Promise<void> {
        const { error } = await supabase
            .from('test_evaluations')
            .update(evaluationData)
            .eq('id', evaluationId);

        if (error) {
            console.error('Error updating test evaluation:', error);
            throw new Error(error.message);
        }
    },

    async getWeeklyTests(): Promise<WeeklyTestWithDetails[]> {
        const { data, error } = await supabase
            .from('weekly_tests')
            .select(`
            *,
            test_evaluations (*),
            test_results (
                *,
                student_test_evaluations (*)
            )
        `)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching weekly tests with details:', error);
            throw new Error(error.message);
        }

        return data || [];
    },



    async getWeeklyTestDetails(testId: string): Promise<WeeklyTestDetails | null> {
        const { data, error } = await supabase
            .from('weekly_tests')
            .select(`
                *,
                test_evaluations (*),
                test_results (
                    *,
                    students:student_id (id, full_name),
                    student_test_evaluations (*) 
                )
            `)
            .eq('id', testId)
            .single();

        if (error) {

            console.error('Error fetching weekly test details:', error);
            throw new Error(error.message);
        }

        return data;
    },


    async deleteWeeklyTest(testId: string): Promise<void> {
        const { error } = await supabase
            .from('weekly_tests')
            .delete()
            .eq('id', testId);

        if (error) {
            console.error('Error deleting weekly test:', error);
            throw new Error(error.message);
        }
    },


    async deleteStudentTestResult(resultId: string): Promise<void> {
        const { error } = await supabase
            .from('test_results')
            .delete()
            .eq('id', resultId);

        if (error) {
            console.error('Error deleting student test result:', error);
            throw new Error(error.message);
        }
    }
};