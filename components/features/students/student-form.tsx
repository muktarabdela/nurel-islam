// src/components/admin/ustadh-form-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { studentService } from "@/lib/servies/student";
import { StudentModel } from "@/models/Student";
import { useAuth } from "@/hooks/useAuth";


interface StudentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: StudentModel | null;
    onSuccess: () => void;
}

export function StudentFormDialog({
    open,
    onOpenChange,
    student,
    onSuccess,
}: StudentFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const { user } = useAuth();
    console.log("user", user);
    const form = useForm<StudentModel>({
        defaultValues: {
            full_name: "",
            family_name: "",
            family_phone: "",
            current_hifz_page: 0,
            is_active: true,
            added_by: "",
        },
    });

    const validateForm = (data: StudentModel) => {
        const errors: Record<string, string> = {};

        if (!data.full_name || data.full_name.trim().length < 2) {
            errors.full_name = "Name must be at least 2 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        if (student) {
            form.reset({
                full_name: student.full_name,
                family_name: student.family_name || "",
                family_phone: student.family_phone || "",
                current_hifz_page: student.current_hifz_page || 0,
                is_active: student.is_active || true,
                added_by: student.added_by || "",
            });
        } else {
            form.reset({
                full_name: "",
                family_name: "",
                family_phone: "",
                current_hifz_page: 0,
                is_active: true,
                added_by: "",
            });
        }
        setFormErrors({});
    }, [student, open, form]);

    async function onSubmit(data: StudentModel) {
        if (!validateForm(data)) {
            return;
        }

        try {
            setIsSubmitting(true);
            if (student) {
                await studentService.update(student.id, data);
            } else {
                const newStudet: StudentModel = {
                    ...data,
                    added_by: user?.id || "",
                    created_at: new Date().toISOString(),
                };
                console.log("newStudet", newStudet);
                await studentService.create(newStudet);
            }

            onSuccess();
            toast.success(`Student ${student ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving student:', error);
            toast.error(`Failed to ${student ? 'update' : 'create'} student`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{student ? "Edit Student" : "Add New Student"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter student name"
                                            {...field}
                                            className={formErrors.fullName ? "border-destructive" : ""}
                                        />
                                    </FormControl>
                                    {formErrors.fullName && (
                                        <p className="text-sm font-medium text-destructive">
                                            {formErrors.fullName}
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="family_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Family Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter family name"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    {formErrors.familyName && (
                                        <p className="text-sm font-medium text-destructive">
                                            {formErrors.familyName}
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="family_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Family Phone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter family phone"
                                            {...field}
                                            value={field.value || ""}
                                            className={formErrors.familyPhone ? "border-destructive" : ""}
                                        />
                                    </FormControl>
                                    {formErrors.familyPhone && (
                                        <p className="text-sm font-medium text-destructive">
                                            {formErrors.familyPhone}
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {student ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}