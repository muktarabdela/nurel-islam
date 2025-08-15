export interface Punishment {
    id: string; // UUID
    userId: string; // Foreign key to users table
    name: string;
    createdAt: string; // ISO 8601 timestamp string
}