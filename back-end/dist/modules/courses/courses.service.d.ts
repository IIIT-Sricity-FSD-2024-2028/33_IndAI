import { DataStore } from '../../store/data.store';
import { CreateCourseDto, UpdateCourseDto } from './dto';
export declare class CoursesService {
    private readonly db;
    constructor(db: DataStore);
    findAll(): any[];
    findPublished(): any[];
    findByProvider(providerId: string): any[];
    findOne(id: string): any;
    create(body: CreateCourseDto): {
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
    update(id: string, body: UpdateCourseDto): any;
    remove(id: string): {
        id: string;
    };
}
