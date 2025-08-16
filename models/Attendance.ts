import { AttendanceStatus } from "./Student";

export interface Attendance {
    id: string;
    student_id: string;
    date: string;
    status: AttendanceStatus;
    arrival_time: string | null;
    lateness_in_minutes: number | null;
    excuse: string | null;
    punishment_id: string | null;
}
