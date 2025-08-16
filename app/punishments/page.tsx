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
import { PunishmentModel } from '@/models/Punishment';
import { useData } from '@/context/dataContext';
import { punishmentService } from '@/lib/servies/punishment';
import { PunishmentsFormDialog } from '@/components/features/punishments-form';


export default function UstadhsPage() {
    const { punishments, ustaths, refreshData, loading } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPunishment, setEditingPunishment] = useState<PunishmentModel | null>(null);



    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            setIsDeleting(id);
            await punishmentService.delete(id);
            refreshData();
            toast.success('Student deleted successfully');
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Failed to delete student');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEdit = (punishment: PunishmentModel) => {
        setEditingPunishment(punishment);
        setIsDialogOpen(true);
    };

    const handleAddStudent = () => {
        setEditingPunishment(null);
        setIsDialogOpen(true);
    };

    const handleSuccess = async () => {
        try {
            refreshData();
            setIsDialogOpen(false);
            setEditingPunishment(null);
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

    const filteredPunishments = punishments?.filter((punishment) =>
        punishment.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Punishments</h1>
                    <p className="text-muted-foreground">Manage punishments</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search punishments..."
                            className="pl-8 sm:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddStudent}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Punishment
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Add by</TableHead>

                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPunishments?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? 'No matching punishments found' : 'No punishments found'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPunishments?.map((punishment) => (
                                <TableRow key={punishment.id}>
                                    <TableCell className="font-medium">
                                        <span>{punishment.name}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {ustaths.find((ustath) => punishment.created_by === ustath.id)?.fullName || 'No ustath available'}
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
                                                <DropdownMenuItem onClick={() => handleEdit(punishment)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(punishment.id)}
                                                    disabled={isDeleting === punishment.id}
                                                >
                                                    {isDeleting === punishment.id ? (
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
                    Showing <strong>1-{punishments.length}</strong> of <strong>{punishments.length}</strong> punishments
                </div>
            </div>
            <PunishmentsFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                punishment={editingPunishment}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
