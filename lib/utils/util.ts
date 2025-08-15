import { DersModel } from '@/model/Ders';
import { UserAudioPartProgressModel } from '@/model/UserAudioPartProgress';
import { UserDersProgressModel } from '@/model/UserDersProgress';
import { AudioPartModel } from '@/model/AudioPart';
import { UserModel } from '@/model/user';

// Types
type DersWithProgress = DersModel & {
    progress: number;
    completedParts: number;
    totalParts: number;
    isActive: boolean;
    isCompleted: boolean;
    lastAccessed?: Date;
};

type DersProgress = {
    ders: DersModel;
    progress: number;
    completedParts: number;
    totalParts: number;
    isActive: boolean;
    isCompleted: boolean;
    lastAccessed?: Date;
};

export function getUserData(users: UserModel[], userId: string) {
    const user = users?.find((user) => Number(user.telegram_user_id) === Number(userId));
    return user;
}

/**
 * Get active courses for a user
 */
export function getActiveCourses(
    derses: DersModel[],
    userDersProgress: UserDersProgressModel[],
    userId: string
): DersModel[] {
    if (!derses || !userDersProgress) return [];

    return derses.filter(ders => {
        const progress = userDersProgress.find(
            p => p.ders_id === ders.id && p.user_id === userId && p.status === 'IN_PROGRESS'
        );
        return !!progress;
    });
}

/**
 * Get completed courses for a user
 */
export function getCompletedCourses(
    derses: DersModel[],
    userDersProgress: UserDersProgressModel[],
    userId: string
): DersModel[] {
    if (!derses || !userDersProgress) return [];

    return derses.filter(ders => {
        const progress = userDersProgress.find(
            p => p.ders_id === ders.id && p.user_id === userId && p.status === 'COMPLETED'
        );
        return !!progress;
    });
}

/**
 * Get all courses with progress information
 */
export function getAllCoursesWithProgress(
    derses: DersModel[],
    userDersProgress: UserDersProgressModel[],
    userAudioProgress: UserAudioPartProgressModel[],
    audioParts: AudioPartModel[],
    userId: string
): DersWithProgress[] {
    if (!derses || !userDersProgress || !userAudioProgress || !audioParts) return [];

    return derses.map(ders => {
        const dersProgress = userDersProgress.find(
            p => p.ders_id === ders.id && p.user_id === userId
        );

        const dersAudioParts = audioParts.filter(ap => ap.ders_id === ders.id);
        const totalParts = dersAudioParts.length;

        const completedParts = userAudioProgress.filter(
            progress =>
                dersAudioParts.some(ap => ap.id === progress.audio_part_id) &&
                progress.is_completed
        ).length;

        const progress = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

        return {
            ...ders,
            progress,
            completedParts,
            totalParts,
            isActive: dersProgress?.status === 'IN_PROGRESS',
            isCompleted: dersProgress?.status === 'COMPLETED',
            lastAccessed: dersProgress?.updatedAt
        };
    });
}

/**
 * Get course progress details
 */
export function getCourseProgress(
    ders: DersModel,
    userDersProgress: UserDersProgressModel[],
    userAudioProgress: UserAudioPartProgressModel[],
    audioParts: AudioPartModel[],
    userId: string
): DersProgress | null {
    if (!ders || !userDersProgress || !userAudioProgress || !audioParts) return null;

    const dersProgress = userDersProgress.find(
        p => p.ders_id === ders.id && p.user_id === userId
    );

    const dersAudioParts = audioParts.filter(ap => ap.ders_id === ders.id);
    const totalParts = dersAudioParts.length;

    const completedParts = userAudioProgress.filter(
        progress =>
            dersAudioParts.some(ap => ap.id === progress.audio_part_id) &&
            progress.is_completed
    ).length;

    const progress = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

    return {
        ders,
        progress,
        completedParts,
        totalParts,
        isActive: dersProgress?.status === 'IN_PROGRESS',
        isCompleted: dersProgress?.status === 'COMPLETED',
        lastAccessed: dersProgress?.updatedAt
    };
}

/**
 * Get recently accessed courses
 */
export function getRecentlyAccessedCourses(
    derses: DersModel[],
    userDersProgress: UserDersProgressModel[],
    limit: number = 5
): DersModel[] {
    if (!derses || !userDersProgress) return [];

    return derses
        .map(ders => ({
            ders,
            progress: userDersProgress.find(p => p.ders_id === ders.id)
        }))
        .filter(item => item.progress)
        .sort((a, b) => {
            const dateA = a.progress?.updatedAt ? new Date(a.progress.updatedAt).getTime() : 0;
            const dateB = b.progress?.updatedAt ? new Date(b.progress.updatedAt).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, limit)
        .map(item => item.ders);
}

/**
 * Get recommended courses based on user's progress
 */
export function getRecommendedCourses(
    derses: DersModel[],
    userDersProgress: UserDersProgressModel[],
    userId: string,
    limit: number = 3
): DersModel[] {
    if (!derses || !userDersProgress) return [];

    // Get IDs of courses the user has already started or completed
    const userCourseIds = userDersProgress
        .filter(p => p.user_id === userId)
        .map(p => p.ders_id);

    // Filter out courses the user has already started
    const availableCourses = derses.filter(ders => !userCourseIds.includes(ders.id));

    // Sort by order field (assuming lower order numbers should be recommended first)
    return availableCourses
        .sort((a, b) => a.order - b.order)
        .slice(0, limit);
}

/**
 * Calculate overall learning statistics
 */
export function getLearningStats(
    derses: DersModel[],
    userDersProgress: UserDersProgressModel[],
    userAudioProgress: UserAudioPartProgressModel[],
    audioParts: AudioPartModel[],
    userId: string
) {
    if (!derses || !userDersProgress || !userAudioProgress || !audioParts) {
        return {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalPartsCompleted: 0,
            totalParts: 0,
            overallProgress: 0
        };
    }

    const totalCourses = derses.length;
    const completedCourses = userDersProgress.filter(
        p => p.user_id === userId && p.status === 'completed'
    ).length;

    const inProgressCourses = userDersProgress.filter(
        p => p.user_id === userId && p.status === 'in_progress'
    ).length;

    const totalParts = audioParts.length;
    const totalPartsCompleted = userAudioProgress.filter(
        p => p.user_id === userId && p.is_completed
    ).length;

    const overallProgress = totalParts > 0
        ? Math.round((totalPartsCompleted / totalParts) * 100)
        : 0;

    return {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalPartsCompleted,
        totalParts,
        overallProgress
    };
}

/**
 * Get courses by category
 */
export function getCoursesByCategory(
    derses: DersModel[],
    categoryId: string
): DersModel[] {
    if (!derses) return [];
    return derses.filter(ders => ders.category_id === categoryId);
}

/**
 * Get next recommended part for a course
 */
export function getNextRecommendedPart(
    dersId: string,
    audioParts: AudioPartModel[],
    userAudioProgress: UserAudioPartProgressModel[],
    userId: string
): AudioPartModel | null {
    if (!audioParts || !userAudioProgress) return null;

    const dersAudioParts = audioParts
        .filter(ap => ap.ders_id === dersId)
        .sort((a, b) => a.order - b.order);

    for (const part of dersAudioParts) {
        const progress = userAudioProgress.find(
            p => p.audio_part_id === part.id && p.user_id === userId
        );

        if (!progress || !progress.is_completed) {
            return part;
        }
    }

    return null;
}