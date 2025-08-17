// pages/tests.tsx
'use client'; // Required for hooks like useState and useEffect

import { LoadingScreen } from "@/components/shared/loading";
import { useData } from "@/context/dataContext";
import { useAuth } from "@/hooks/useAuth";
import { weeklyTestService, CreateWeeklyTestParams, AddStudentTestResultParams, WeeklyTestDetails } from "@/lib/servies/test";
import { StudentModel } from "@/models/Student";
import { TestEvaluation, WeeklyTest } from "@/models/WeeklyTest";
import { ChevronLeftIcon, LoaderIcon, PlusIcon, SaveIcon, TrashIcon } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";


// --- Main Page Component ---
export default function TestsPage() {
    const { weeklyTests, students, refreshData } = useData();

    const { user } = useAuth();
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [detailedTest, setDetailedTest] = useState<WeeklyTestDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<WeeklyTest | null>(null);

    const handleDeleteTest = async (testId: string) => {
        try {
            await weeklyTestService.deleteWeeklyTest(testId);
            refreshData();
        } catch (error) {
            console.error('Error deleting test:', error);
            throw error;
        }
    };

    const handleTestUpdated = () => {
        refreshData();
        setEditingTest(null);
    };

    useEffect(() => {

        if (!selectedTestId) {
            setDetailedTest(null);
            return;
        }

        const fetchDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const details = await weeklyTestService.getWeeklyTestDetails(selectedTestId);

                if (details) {
                    setDetailedTest(details);
                } else {
                    setDetailedTest(null);
                    toast.error('Test details not found');
                }
            } catch (error) {
                console.error("Failed to fetch test details:", error);
                toast.error("Failed to fetch test details");
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [selectedTestId]);

    const handleEditTest = (test: WeeklyTest) => {
        setEditingTest(test);
    };

    const handleTestCreated = () => {
        refreshData(); // Refresh the list from context
        setCreateModalOpen(false);
    };

    const handleBackToList = () => {
        setSelectedTestId(null);
    };

    const handleResultsUpdated = async () => {
        if (selectedTestId) {
            // Refetch details to show the latest results
            const details = await weeklyTestService.getWeeklyTestDetails(selectedTestId);
            if (details) {
                setDetailedTest(details);
            } else {
                setDetailedTest(null);
                toast.error('Test details not found');
            }
            toast.success("Results updated successfully");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            {isCreateModalOpen && (
                <CreateTestModal
                    onClose={() => setCreateModalOpen(false)}
                    onTestCreated={handleTestCreated}
                    user={user}
                />
            )}

            {detailedTest ? (
                <TestDetailsView
                    test={detailedTest}
                    students={students}
                    onBack={handleBackToList}
                    onResultsUpdated={handleResultsUpdated}

                />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Weekly Tests</h1>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-colors"
                        >
                            <PlusIcon />
                            Create New Test
                        </button>
                    </div>
                    <TestListView tests={weeklyTests} onSelectTest={setSelectedTestId} onEditTest={handleEditTest} onDeleteTest={handleDeleteTest} />
                    {editingTest && (
                        <EditTestModal
                            test={editingTest}
                            onClose={() => setEditingTest(null)}
                            onTestUpdated={handleTestUpdated}
                        />
                    )}
                </>
            )}
        </div>
    );
}


// --- Component for Listing Tests ---
function TestListView({ tests, onSelectTest, onEditTest, onDeleteTest }: {
    tests: WeeklyTest[],
    onSelectTest: (testId: string) => void,
    onEditTest: (test: WeeklyTest) => void,
    onDeleteTest: (testId: string) => Promise<void>
}) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (testId: string) => {
        if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
            setDeletingId(testId);
            try {
                await onDeleteTest(testId);
                toast.success('Test deleted successfully');
            } catch (error) {
                console.error('Error deleting test:', error);
                toast.error('Failed to delete test');
            } finally {
                setDeletingId(null);
            }
        }
    };
    if (!tests || tests.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-card border border-border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-card-foreground">No tests found</h3>
                <p className="mt-2 text-muted-foreground">Click "Create New Test" to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
                <div key={test.id} className="bg-card border border-border rounded-lg shadow-sm p-5 flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{new Date(test.date).toLocaleDateString()}</p>
                        <h2 className="text-lg font-semibold text-card-foreground mt-1 truncate">{test.notes || 'General Test'}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Total Value: <span className="font-medium text-primary">{test.total_value}</span></p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <button
                            onClick={() => onSelectTest(test.id)}
                            className="w-full py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent transition-colors"
                        >
                            View Details
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEditTest(test)}
                                className="flex-1 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-accent transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(test.id)}
                                disabled={deletingId === test.id}
                                className="flex-1 py-2 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors disabled:opacity-50"
                            >
                                {deletingId === test.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
// --- Edit Test Modal ---
function EditTestModal({ test, onClose, onTestUpdated }: {
    test: WeeklyTest,
    onClose: () => void,
    onTestUpdated: () => void
}) {
    const [testData, setTestData] = useState({
        date: test.date.split('T')[0],
        notes: test.notes || '',
        total_value: test.total_value
    });
    const [evaluations, setEvaluations] = useState<TestEvaluation[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvaluations = async () => {
            try {
                const details = await weeklyTestService.getWeeklyTestDetails(test.id);
                if (details) {
                    setEvaluations(details.test_evaluations);
                } else {
                    setEvaluations([]);
                    toast.error('Test details not found');
                }
            } catch (error) {
                console.error('Error fetching evaluations:', error);
                toast.error('Failed to load test details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvaluations();
    }, [test.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // First update the test
            await weeklyTestService.updateWeeklyTest(test.id, {
                ustazh_id: test.ustazh_id,
                date: testData.date,
                notes: testData.notes,
                total_value: testData.total_value
            });

            // Then update evaluations
            for (const evalItem of evaluations) {
                await weeklyTestService.updateTestEvaluation(evalItem.id, {
                    name: evalItem.name,
                    max_value: evalItem.max_value
                });
            }

            onTestUpdated();
            toast.success('Test updated successfully');
        } catch (error) {
            console.error('Error updating test:', error);
            toast.error('Failed to update test');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                <div className="bg-card p-6 rounded-lg">
                    <p>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
            <div
                className="bg-card rounded-lg shadow-2xl w-full max-w-2xl border border-border animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-card-foreground">Edit Test</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={testData.date}
                                    onChange={e => setTestData({ ...testData, date: e.target.value })}
                                    className="w-full bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label htmlFor="total_value" className="block text-sm font-medium text-muted-foreground mb-1">Total Value</label>
                                <input
                                    type="number"
                                    id="total_value"
                                    value={testData.total_value}
                                    onChange={e => setTestData({ ...testData, total_value: Number(e.target.value) })}
                                    className="w-full bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                            <input
                                type="text"
                                id="notes"
                                value={testData.notes}
                                onChange={e => setTestData({ ...testData, notes: e.target.value })}
                                className="w-full bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div className="border-t border-border pt-6">
                            <h3 className="font-semibold text-foreground mb-4">Evaluation Criteria</h3>
                            <div className="space-y-4">
                                {evaluations.map((evalItem, index) => (
                                    <div key={evalItem.id} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={evalItem.name}
                                            onChange={(e) => {
                                                const newEvals = [...evaluations];
                                                newEvals[index].name = e.target.value;
                                                setEvaluations(newEvals);
                                            }}
                                            className="flex-1 bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring"
                                        />
                                        <input
                                            type="number"
                                            value={evalItem.max_value}
                                            onChange={(e) => {
                                                const newEvals = [...evaluations];
                                                newEvals[index].max_value = Number(e.target.value);
                                                setEvaluations(newEvals);
                                            }}
                                            className="w-24 bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-secondary/30 flex justify-end gap-4 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Component for Viewing Test Details and Managing Results ---
function TestDetailsView({ test, students, onBack, onResultsUpdated }: { test: WeeklyTestDetails, students: StudentModel[], onBack: () => void, onResultsUpdated: () => void }) {
    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 mb-6 text-sm font-medium text-foreground hover:text-primary">
                <ChevronLeftIcon />
                Back to Test List
            </button>

            <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h1 className="text-2xl font-bold text-card-foreground">{test.notes || 'Test Details'}</h1>
                <p className="text-muted-foreground mt-1">
                    {new Date(test.date).toLocaleDateString()} • Total Value: <span className="font-semibold text-primary">{test.total_value}</span>
                </p>
            </div>

            <StudentResultsTable
                test={test}
                students={students}
                onResultsUpdated={onResultsUpdated}
            />
        </div>
    );
}

// --- Table for Student Results ---
function StudentResultsTable({ test, students, onResultsUpdated }: { test: WeeklyTestDetails, students: StudentModel[], onResultsUpdated: () => void }) {
    const sortedStudents = useMemo(() => [...students].sort((a, b) => a.full_name.localeCompare(b.full_name)), [students]);

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="px-6 py-3 font-medium text-secondary-foreground">Student</th>
                            {test.test_evaluations.map(ev => (
                                <th key={ev.id} className="px-6 py-3 font-medium text-secondary-foreground text-center">{ev.name} ({ev.max_value})</th>
                            ))}
                            <th className="px-6 py-3 font-medium text-secondary-foreground text-center">Total</th>
                            <th className="px-6 py-3 font-medium text-secondary-foreground text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedStudents.map(student => (
                            <StudentResultRow
                                key={student.id}
                                student={student}
                                test={test}
                                onResultsUpdated={onResultsUpdated}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Row for Each Student's Results ---
function StudentResultRow({ student, test, onResultsUpdated }: { student: StudentModel, test: WeeklyTestDetails, onResultsUpdated: () => void }) {
    const existingResult = useMemo(() => test.test_results.find(r => r.student_id === student.id), [test.test_results, student.id]);

    const [scores, setScores] = useState<Record<string, number>>(() => {
        const initialScores: Record<string, number> = {};
        if (existingResult) {
            test.test_evaluations.forEach(ev => {
                const studentEval = existingResult.student_test_evaluations.find(se => se.test_evaluation_id === ev.id);
                initialScores[ev.id] = studentEval ? studentEval.score : 0;
            });
        }
        return initialScores;
    });

    const [isEditing, setIsEditing] = useState(!existingResult);
    const [isSaving, setIsSaving] = useState(false);

    const totalScore = useMemo(() => {
        return Object.values(scores).reduce((sum, score) => sum + (Number(score) || 0), 0);
    }, [scores]);

    const handleScoreChange = (evaluationId: string, value: string, maxValue: number) => {
        const numericValue = Number(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= maxValue) {
            setScores(prev => ({ ...prev, [evaluationId]: numericValue }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const resultData: Omit<AddStudentTestResultParams['resultData'], 'id'> = {
                test_id: test.id,
                student_id: student.id,
                total_score: totalScore,
            };

            const evaluationScores: AddStudentTestResultParams['evaluationScores'] = test.test_evaluations.map(ev => ({
                test_evaluation_id: ev.id,
                score: scores[ev.id] || 0,
            }));

            await weeklyTestService.addStudentTestResult({ resultData, evaluationScores });

            await onResultsUpdated();
            setIsEditing(false);
            toast.success("Result saved successfully");
        } catch (error) {
            console.error("Failed to save result:", error);
            toast.error("Failed to save result");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <tr className="hover:bg-accent/50 transition-colors">
            <td className="px-6 py-4 font-medium text-foreground">{student.full_name}</td>
            {test.test_evaluations.map(ev => (
                <td key={ev.id} className="px-6 py-4 text-center">
                    {isEditing ? (
                        <input
                            type="number"
                            value={scores[ev.id] || ''}
                            onChange={(e) => handleScoreChange(e.target.id, e.target.value, ev.max_value)}
                            id={ev.id}
                            className="w-16 p-1 text-center bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring"
                            max={ev.max_value}
                            min="0"
                        />
                    ) : (
                        <span>{scores[ev.id] ?? 'N/A'}</span>
                    )}
                </td>
            ))}
            <td className="px-6 py-4 font-semibold text-center text-primary">{totalScore} / {test.total_value}</td>
            <td className="px-6 py-4 text-center">
                {isEditing ? (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-2 text-primary hover:bg-primary/10 rounded-md disabled:opacity-50"
                        >
                            {isSaving ? <LoaderIcon /> : <SaveIcon />}
                        </button>
                        {existingResult && (
                            <button onClick={() => setIsEditing(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                        )}
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-primary hover:underline">Edit</button>
                )}
            </td>
        </tr>
    );
}

// --- Modal Component for Creating a New Test ---
function CreateTestModal({ onClose, onTestCreated, user }: { onClose: () => void, onTestCreated: () => void, user: any }) {
    const [testData, setTestData] = useState({ date: new Date().toISOString().split('T')[0], notes: '', total_value: 20 });
    const [evaluations, setEvaluations] = useState<Partial<TestEvaluation>[]>([{ name: 'Tajweed', max_value: 5 }, { name: 'Hifz', max_value: 15 }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddEvaluation = () => {
        setEvaluations([...evaluations, { name: '', max_value: 0 }]);
    };

    const handleRemoveEvaluation = (index: number) => {
        setEvaluations(evaluations.filter((_, i) => i !== index));
    };

    const handleEvaluationChange = (index: number, field: 'name' | 'max_value', value: string) => {
        const newEvaluations = [...evaluations];
        if (field === 'max_value') {
            newEvaluations[index] = {
                ...newEvaluations[index],
                [field]: Number(value)
            };
        } else {
            newEvaluations[index] = {
                ...newEvaluations[index],
                [field]: value
            };
        }
        setEvaluations(newEvaluations);
    };

    const evaluationsTotal = useMemo(() => {
        return evaluations.reduce((sum, ev) => sum + (ev.max_value || 0), 0);
    }, [evaluations]);

    const isTotalMismatch = evaluationsTotal !== testData.total_value;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isTotalMismatch) {
            // TODO: Add toast notification
            alert("The sum of evaluation values must match the test's total value.");
            return;
        }

        setIsSubmitting(true);
        try {
            // !! IMPORTANT: Replace with your actual method of getting the logged-in user's ID
            const ustazh_id = user.id; // <-- REPLACE THIS

            const params: CreateWeeklyTestParams = {
                testData: { ...testData, ustazh_id },
                evaluations: evaluations as Omit<TestEvaluation, 'id' | 'test_id'>[]
            };
            await weeklyTestService.createWeeklyTest(params);
            onTestCreated();
            toast.success("Test created successfully");
        } catch (error) {
            console.error("Failed to create test:", error);
            toast.error("Failed to create test");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
            <div
                className="bg-card rounded-lg shadow-2xl w-full max-w-2xl border border-border animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-card-foreground">Create New Weekly Test</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Main Test Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                                <input type="date" id="date" value={testData.date} onChange={e => setTestData({ ...testData, date: e.target.value })} className="w-full bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring" />
                            </div>
                            <div>
                                <label htmlFor="total_value" className="block text-sm font-medium text-muted-foreground mb-1">Total Value</label>
                                <input type="number" id="total_value" value={testData.total_value} onChange={e => setTestData({ ...testData, total_value: Number(e.target.value) })} className="w-full bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground mb-1">Notes (e.g., Surah Name)</label>
                            <input type="text" id="notes" value={testData.notes} onChange={e => setTestData({ ...testData, notes: e.target.value })} placeholder="e.g., Surah Al-Fatiha" className="w-full bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring" />
                        </div>

                        {/* Dynamic Evaluations */}
                        <div className="border-t border-border pt-6">
                            <h3 className="font-semibold text-foreground mb-2">Evaluation Criteria</h3>
                            <div className="space-y-3">
                                {evaluations.map((ev, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" placeholder="Criteria Name" value={ev.name} onChange={e => handleEvaluationChange(index, 'name', e.target.value)} className="flex-grow bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring" />
                                        <input type="number" placeholder="Max" value={ev.max_value} onChange={e => handleEvaluationChange(index, 'max_value', e.target.value)} className="w-24 bg-input border border-border rounded-md p-2 text-foreground focus:ring-2 focus:ring-ring" />
                                        <button type="button" onClick={() => handleRemoveEvaluation(index)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={handleAddEvaluation} className="mt-4 text-sm font-medium text-primary hover:underline">
                                + Add Criterion
                            </button>
                        </div>
                        {isTotalMismatch && (
                            <div className="p-3 text-sm text-destructive-foreground bg-destructive/80 rounded-md">
                                The sum of criteria values ({evaluationsTotal}) does not match the total value ({testData.total_value}).
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-secondary/30 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent">Cancel</button>
                        <button type="submit" disabled={isSubmitting || isTotalMismatch} className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSubmitting ? "Creating..." : "Create Test"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}