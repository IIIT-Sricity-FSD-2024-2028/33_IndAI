import { DataStore } from '../../store/data.store';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto';
export declare class FeedbackController {
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
    create(b: CreateFeedbackDto): {
        success: boolean;
        data: {
            message: string;
            createdAt: string;
            instructorId: string;
            learnerId: string;
            rating: number;
            id: string;
        };
    };
    update(id: string, b: UpdateFeedbackDto): {
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
