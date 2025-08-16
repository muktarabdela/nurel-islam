"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreVertical, User, BookOpen, Loader2, Edit, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { toast } from 'sonner';
import { studentService } from '@/lib/servies/student';
import { format } from 'date-fns';
import { StudentModel } from '@/models/Student';
import { useData } from '@/context/dataContext';
import { StudentFormDialog } from '@/components/features/students/student-form';


export default function UstadhsPage() {
    const { students, error, refreshData, loading } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentModel | null>(null);



    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            setIsDeleting(id);
            await studentService.delete(id);
            refreshData();
            toast.success('Student deleted successfully');
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Failed to delete student');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEdit = (student: StudentModel) => {
        setEditingStudent(student);
        setIsDialogOpen(true);
    };

    const handleAddStudent = () => {
        setEditingStudent(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = async () => {
        try {
            refreshData();
            setIsDialogOpen(false);
            setEditingStudent(null);
        } catch (error) {
            console.error('Error refreshing students:', error);
            toast.error('Failed to refresh students list');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const filteredStudents = students?.filter((student) =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Students</h1>
                    <p className="text-muted-foreground">Manage hifz students</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search students..."
                            className="pl-8 sm:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddStudent}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Family Name</TableHead>
                            <TableHead>Family Phone</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? 'No matching students found' : 'No students found'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents?.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">
                                        <span>{student.full_name}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {student.family_name || 'No family name available'}
                                    </TableCell>
                                    <TableCell>
                                        {student.family_phone || 'No family phone available'}
                                    </TableCell>
                                    <TableCell>
                                        {student.created_at ? format(new Date(student.created_at), 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(student)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(student.id)}
                                                    disabled={isDeleting === student.id}
                                                >
                                                    {isDeleting === student.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    )}
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Showing <strong>1-{students.length}</strong> of <strong>{students.length}</strong> students
                </div>
            </div>
            <StudentFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                student={editingStudent}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
