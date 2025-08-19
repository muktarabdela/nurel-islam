export interface HifzWeeklyProgress {
    id: string;
    student_id: string;
    start_date: string;   // start of the week
    end_date: string;     // end of the week

    current_position: string;   // e.g. "Page 120" or "Surah Yasin ayah 10"
    expected_position: string;  // e.g. "Page 126" or "Surah Yasin ayah 20"

    achieved: boolean | null;   // true = achieved, false = not achieved, null = not checked yet
}
