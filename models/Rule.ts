export interface Rule {
    id: string; // UUID
    userId: string; // Foreign key to users table
    description: string;
    createdAt: string; // ISO 8601 timestamp string
}
