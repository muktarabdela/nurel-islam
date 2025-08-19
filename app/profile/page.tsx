"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { ustathService } from '@/lib/servies/ustath';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const profileSchema = z.object({
    userName: z.string().min(1, 'Username is required'),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional()
}).refine(data => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "New passwords don't match",
    path: ['confirmPassword']
});

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            userName: user?.username || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                userName: user.username,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [user, reset]);


    const onSubmit = async (data: any) => {
        try {
            // Verify current password first
            // @ts-ignore
            const isValidPassword = await ustathService.verifyAdmin(user?.id, data.currentPassword);
            if (!isValidPassword) {
                toast.error('Invalid current password');
                return;
            }

            // Check if username is being changed and if the new one is unique
            if (data.userName !== user?.username) {
                const isUnique = await ustathService.isUserNameUnique(data.userName);
                if (!isUnique) {
                    toast.error('Username is already taken');
                    return;
                }
            }

            // Update username
            await ustathService.upsertUstath({
                id: user?.id,
                userName: data.userName,
                password: data.newPassword || data.currentPassword
            });

            // Update password if a new one is provided
            if (data.newPassword) {
                // @ts-ignore
                await ustathService.changeAdminPassword(user?.id, data.newPassword);
            }

            // Update auth context
            // @ts-ignore
            login({
                ...user,
                username: data.userName
            });

            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            // @ts-ignore
            toast.error('Error updating profile', error.message);
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>

                {!isEditing ? (
                    <div>
                        <div className="space-y-4">
                            <div>
                                <Label>Username</Label>
                                <p className="text-gray-700">{user?.username}</p>
                            </div>
                            <div>
                                <Label>Full Name</Label>
                                <p className="text-gray-700">{user?.full_name}</p>
                            </div>
                            <div>
                                <Label>Role</Label>
                                <p className="text-gray-700">Administrator</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="mt-6"
                        >
                            Edit Profile
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="userName">Username</Label>
                            <Input
                                id="userName"
                                {...register('userName')}
                            />
                            {errors.userName && <p className="text-red-500 text-sm">{errors.userName.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPassword ? "text" : "password"}
                                    id="currentPassword"
                                    {...register('currentPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="newPassword">New Password (leave blank to keep current)</Label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword"
                                    {...register('newPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    reset();
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}