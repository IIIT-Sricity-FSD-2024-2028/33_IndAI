import { DataStore } from '../../store/data.store';
import { CreateEnrollmentDto, UpdateProgressDto } from './dto';
export declare class EnrollmentsController {
    private readonly db;
    constructor(db: DataStore);
    all(): {
        success: boolean;
        data: any[];
    };
    learner(id: string): {
        success: boolean;
        data: any[];
    };
    create(b: CreateEnrollmentDto): {
        success: boolean;
        data: {
            id: string;
            learnerId: string;
            courseId: string;
            progress: number;
            status: string;
            enrolledAt: string;
        };
    };
    update(id: string, b: UpdateProgressDto): {
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
