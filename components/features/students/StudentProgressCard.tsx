import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { HifzWeeklyProgress } from "@/models/HifzProgress";
import { hifzProgressService } from "@/lib/servies/hifz-progress";

interface StudentProgressCardProps {
    student: { id: string; full_name: string }; // Adjust student type as needed
    weeklyProgress: HifzWeeklyProgress | undefined;
    weekRange: { startDate: string; endDate: string };
    onUpdate: () => void; // A function to trigger data refetch
}

export function StudentProgressCard({ student, weeklyProgress, weekRange, onUpdate }: StudentProgressCardProps) {
    const [currentPosition, setCurrentPosition] = useState(weeklyProgress?.current_position || "");
    const [expectedPosition, setExpectedPosition] = useState(weeklyProgress?.expected_position || "");

    const [isSavingAchieved, setIsSavingAchieved] = useState(false);
    const [isSavingNotAchieved, setIsSavingNotAchieved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSetGoal = async () => {
        if (!currentPosition || !expectedPosition) {
            setError("Start and Target points are required.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await hifzProgressService.recordProgress({
                student_id: student.id,
                start_date: weekRange.startDate,
                end_date: weekRange.endDate,
                current_position: currentPosition,
                expected_position: expectedPosition,
                achieved: null,
            });
            onUpdate(); // Refetch data to show the new record
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };
    // Update the handleUpdateStatus function
    const handleUpdateStatus = async (achieved: boolean) => {
        if (!weeklyProgress) return;

        if (achieved) {
            setIsSavingAchieved(true);
        } else {
            setIsSavingNotAchieved(true);
        }

        setError(null);
        try {
            await hifzProgressService.updateProgressStatus(weeklyProgress.id, {
                achieved,
            });
            onUpdate();
        } catch (err: any) {
            setError(err.message);
        } finally {
            if (achieved) {
                setIsSavingAchieved(false);
            } else {
                setIsSavingNotAchieved(false);
            }
        }
    };

    const StatusBadge = ({ achieved }: { achieved: boolean | null }) => {
        if (achieved === true) return <Badge className="bg-green-500 hover:bg-green-600">Achieved</Badge>;
        if (achieved === false) return <Badge variant="destructive">Not Achieved</Badge>;
        return <Badge variant="secondary">Pending</Badge>;
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-lg">{student.full_name}</p>
                    {weeklyProgress && <StatusBadge achieved={weeklyProgress.achieved} />}
                </div>

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                {!weeklyProgress ? (
                    // Form to SET the weekly goal
                    <div className="mt-4 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input className="border-gray-500 outline-primary" placeholder="Start Point (e.g., Surah Baqarah Ayah 10)" value={currentPosition} onChange={e => setCurrentPosition(e.target.value)} />
                            <Input className="border-gray-500 outline-primary" placeholder="Target Point (e.g., Surah Baqarah Ayah 20)" value={expectedPosition} onChange={e => setExpectedPosition(e.target.value)} />
                        </div>
                        <Button onClick={handleSetGoal} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set Weekly Goal
                        </Button>
                    </div>
                ) : (
                    // Display progress and allow UPDATES
                    <div className="mt-4 space-y-4">
                        <div className="text-sm text-muted-foreground grid sm:grid-cols-2 gap-x-4 gap-y-1">
                            <p><span className="font-medium text-primary">Start:</span> {weeklyProgress.current_position}</p>
                            <p><span className="font-medium text-primary">Target:</span> {weeklyProgress.expected_position}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button size="sm" onClick={() => handleUpdateStatus(true)} disabled={isSavingAchieved || weeklyProgress.achieved === true} variant="default" className="bg-green-700">
                                {isSavingAchieved && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Mark as Achieved
                            </Button>
                            <Button size="sm" onClick={() => handleUpdateStatus(false)} disabled={isSavingNotAchieved || weeklyProgress.achieved === false} className="bg-red-500">
                                {isSavingNotAchieved && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Not Achieved
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}