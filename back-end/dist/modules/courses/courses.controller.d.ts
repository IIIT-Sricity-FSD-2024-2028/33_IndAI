import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
export declare class CoursesController {
    private readonly service;
    constructor(service: CoursesService);
    all(): {
        success: boolean;
        data: any[];
    };
    published(): {
        success: boolean;
        data: any[];
    };
    byProvider(providerId: string): {
        success: boolean;
        data: any[];
    };
    one(id: string): {
        success: boolean;
        data: any;
    };
    create(b: CreateCourseDto): {
        success: boolean;
        data: {
            title: string;
            description: string;
            createdAt: string;
            providerId: string;
            lessons: number;
            duration?: string;
            skillPoints: number;
            category: string;
            difficulty?: string;
            status: string;
            id: string;
            enrolledCount: number;
            completedCount: number;
            rating: number;
        };
    };
    update(id: string, b: UpdateCourseDto): {
        success: boolean;
        data: any;
    };
    remove(id: string): {
        success: boolean;
        data: {
            id: string;
        };
    };
}
