import { DataStore } from '../../store/data.store';
import { CreateQuizDto, SubmitQuizDto, UpdateQuizDto } from './dto';
export declare class QuizzesController {
    private readonly db;
    constructor(db: DataStore);
    all(): {
        success: boolean;
        data: any[];
    };
    one(id: string): {
        success: boolean;
        data: any;
    };
    create(b: CreateQuizDto): {
        success: boolean;
        data: {
            createdAt: string;
            courseId?: string;
            providerId?: string;
            title: string;
            questions: any;
            questionCount?: number;
            status?: string;
            id: string;
        };
    };
    update(id: string, b: UpdateQuizDto): {
        success: boolean;
        data: any;
    };
    remove(id: string): {
        success: boolean;
        data: {
            id: string;
        };
    };
    submit(id: string, b: SubmitQuizDto): {
        success: boolean;
        data: {
            quizId: string;
            learnerId: string;
            score: any;
            total: any;
        };
    };
}
