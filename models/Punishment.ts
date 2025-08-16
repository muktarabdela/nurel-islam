export interface PunishmentModel {
    id: string; // UUID
    name: string;
    created_by: string; // Foreign key to users table
    created_at: string; // ISO 8601 timestamp string
}