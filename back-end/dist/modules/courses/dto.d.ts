export declare class CreateCourseDto {
    providerId: string;
    title: string;
    description: string;
    lessons: number;
    duration?: string;
    skillPoints: number;
    category: string;
    difficulty?: string;
    status?: string;
}
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    lessons?: number;
    duration?: string;
    skillPoints?: number;
    category?: string;
    difficulty?: string;
    status?: string;
    providerId?: string;
}
