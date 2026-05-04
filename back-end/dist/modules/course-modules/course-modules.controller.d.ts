import { DataStore } from '../../store/data.store';
import { CreateCourseModuleDto, UpdateCourseModuleDto } from './dto';
export declare class CourseModulesController {
    private readonly db;
    constructor(db: DataStore);
    list(courseId: string): {
        success: boolean;
        data: any[];
    };
    create(courseId: string, b: CreateCourseModuleDto): {
        success: boolean;
        data: {
            title: string;
            createdAt: string;
            type?: string;
            duration?: string;
            order: number;
            url?: string;
            description?: string;
            id: string;
            courseId: string;
        };
    };
    update(id: string, b: UpdateCourseModuleDto): {
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
