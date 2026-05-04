import { DataStore } from '../../store/data.store';
export declare class ReportsController {
    private readonly db;
    constructor(db: DataStore);
    platform(): {
        success: boolean;
        data: {
            users: number;
            learners: number;
            courses: number;
            trades: number;
            sessions: number;
            assignments: number;
            generatedAt: string;
        };
    };
    learner(id: string): {
        success: boolean;
        data: {
            learnerId: string;
            totalTrades: number;
            portfolioValue: any;
            virtualBalance: any;
            skillPoints: any;
            generatedAt: string;
        };
    };
    course(id: string): {
        success: boolean;
        data: {
            course: any;
            enrollmentCount: number;
            averageProgress: number;
        };
    };
}
