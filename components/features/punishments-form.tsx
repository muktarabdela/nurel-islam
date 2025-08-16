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
import { useAuth } from "@/hooks/useAuth";
import { PunishmentModel } from "@/models/Punishment";
import { punishmentService } from "@/lib/servies/punishment";


interface PunishmentsFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    punishment?: PunishmentModel | null;
    onSuccess: () => void;
}

export function PunishmentsFormDialog({
    open,
    onOpenChange,
    punishment,
    onSuccess,
}: PunishmentsFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const { user } = useAuth();
    console.log("user", user);
    const form = useForm<PunishmentModel>({
        defaultValues: {
            name: "",
            created_by: "",
            created_at: "",
        },
    });

    const validateForm = (data: PunishmentModel) => {
        const errors: Record<string, string> = {};

        if (!data.name || data.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        if (punishment) {
            form.reset({
                name: punishment.name,
                created_by: punishment.created_by,
                created_at: punishment.created_at,
            });
        } else {
            form.reset({
                name: "",
                created_by: "",
                created_at: "",
            });
        }
        setFormErrors({});
    }, [punishment, open, form]);

    async function onSubmit(data: PunishmentModel) {
        if (!validateForm(data)) {
            return;
        }

        try {
            setIsSubmitting(true);
            if (punishment) {
                await punishmentService.update(punishment.id, data);
            } else {
                const newPunishment: PunishmentModel = {
                    ...data,
                    created_by: user?.id || "",
                    created_at: new Date().toISOString(),
                };
                console.log("newPunishment", newPunishment);
                await punishmentService.create(newPunishment);
            }

            onSuccess();
            toast.success(`Punishment ${punishment ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving punishment:', error);
            toast.error(`Failed to ${punishment ? 'update' : 'create'} punishment`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{punishment ? "Edit Punishment" : "Add New Punishment"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
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
                                {punishment ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}