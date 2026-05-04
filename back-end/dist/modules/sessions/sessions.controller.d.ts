import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto } from './dto';
export declare class SessionsController {
    private readonly service;
    constructor(service: SessionsService);
    all(): {
        success: boolean;
        data: any[];
    };
    byLearner(learnerId: string): {
        success: boolean;
        data: any[];
    };
    one(id: string): {
        success: boolean;
        data: any;
    };
    create(b: CreateSessionDto): {
        success: boolean;
        data: {
            title: string;
            createdAt: string;
            instructorId: string;
            description?: string;
            date: string;
            time: string;
            studentIds?: string[];
            duration?: number;
            status: string;
            type?: string;
            id: string;
        };
    };
    update(id: string, b: UpdateSessionDto): {
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
