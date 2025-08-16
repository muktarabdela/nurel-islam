export interface UstathModel {
    id?: string;
    fullName: string | null;
    userName: string;
    password: string;
    role: string;
    createdAt?: Date;
}